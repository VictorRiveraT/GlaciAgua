"""Mediciones aportadas por investigadores, sin aprobación administrativa.

Conserva las tablas y revisiones anteriores como historial. No entrena modelos.
"""
import json
from contextlib import closing
from datetime import date
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from auth import exigir_investigador, sesion_actual
from services.data_service import DataService
from services.db import get_connection

# Se conserva la ruta existente para evitar cambios innecesarios en la integración.
router = APIRouter(prefix="/admin/mediciones", tags=["Mediciones de campo"])
Estado = Literal["registrado", "excluido"]


def init_mediciones_db():
    with closing(get_connection()) as conn, conn:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("BEGIN IMMEDIATE")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS mediciones_campo (
                id TEXT PRIMARY KEY,
                cuenca_id TEXT NOT NULL,
                periodo TEXT NOT NULL,
                datos_json TEXT NOT NULL,
                creado_por INTEGER NOT NULL REFERENCES usuarios(id),
                estado TEXT NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
                creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                revisado_por INTEGER REFERENCES usuarios(id),
                revisado_en TEXT,
                observacion_revision TEXT
            )
        """)
        columnas = {fila["name"] for fila in conn.execute("PRAGMA table_info(mediciones_campo)")}
        if "estado_registro" not in columnas:
            conn.execute("ALTER TABLE mediciones_campo ADD COLUMN estado_registro TEXT NOT NULL DEFAULT 'registrado' CHECK (estado_registro IN ('registrado', 'excluido'))")
            # Conservar la exclusión de los datos rechazados anteriormente; no rehabilitarlos.
            conn.execute("UPDATE mediciones_campo SET estado_registro='excluido' WHERE estado='rechazado'")
        if "es_prueba" not in columnas:
            conn.execute("ALTER TABLE mediciones_campo ADD COLUMN es_prueba INTEGER NOT NULL DEFAULT 0 CHECK (es_prueba IN (0, 1))")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_mediciones_autor ON mediciones_campo(creado_por)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_mediciones_registro ON mediciones_campo(estado_registro, cuenca_id, periodo)")
        # La tabla anterior se conserva para auditoría, sin exponer una operación de aprobación.
        conn.execute("""
            CREATE TABLE IF NOT EXISTS revisiones_mediciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                medicion_id TEXT NOT NULL UNIQUE REFERENCES mediciones_campo(id),
                revisor_id INTEGER NOT NULL REFERENCES usuarios(id),
                estado TEXT NOT NULL CHECK (estado IN ('aprobado', 'rechazado')),
                observacion TEXT,
                creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)


class MedicionCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False)
    cuenca_id: str = Field(min_length=1, max_length=100)
    quebrada: str = Field(min_length=1, max_length=200)
    periodo: str = Field(pattern=r"^\d{4}-(seca|humeda)$")
    temporada: Literal["seca", "humeda"]
    fecha_medicion: date
    fuente: str = Field(min_length=3, max_length=500)
    metodo: str = Field(min_length=3, max_length=500)
    area_km2: float = Field(gt=0)
    roca_expuesta_km2: float = Field(ge=0)
    pct_sulfuros: float = Field(ge=0, le=100)
    pct_carbonatos: float = Field(ge=0, le=100)
    lluvia_mm: float = Field(ge=0)
    pct_bofedal: float = Field(ge=0, le=100)
    pct_veg_humeda_est: float = Field(ge=0, le=100)
    ph_min: float = Field(ge=0, le=14)
    conductividad: float | None = Field(default=None, ge=0, description="Conductividad en µS/cm; solo si fue medida.")
    metales_texto: str | None = Field(default=None, max_length=2000)
    responsable: str | None = Field(default=None, max_length=200)
    es_prueba: bool = Field(default=False, description="Marcar los datos ficticios o de pruebas; no utilizarlos para entrenamiento.")

    @field_validator("cuenca_id", "quebrada", "periodo", "fuente", "metodo", "responsable", "metales_texto", mode="before")
    @classmethod
    def limpiar_texto(cls, valor):
        return valor.strip() if isinstance(valor, str) else valor

    @model_validator(mode="after")
    def validar_coherencia(self):
        if self.periodo.rsplit("-", 1)[1] != self.temporada:
            raise ValueError("El periodo debe terminar con la temporada indicada.")
        if self.roca_expuesta_km2 > self.area_km2:
            raise ValueError("La roca expuesta no puede superar el área de la cuenca.")
        if self.fecha_medicion > date.today():
            raise ValueError("La fecha de medición no puede ser futura.")
        if self.pct_sulfuros + self.pct_carbonatos > 100.0:
            raise ValueError("La suma de porcentajes de sulfuros y carbonatos no puede exceder el 100% de la litología.")
        return self


class MedicionResponse(MedicionCreate):
    id: str
    creado_por: int
    cientifico_nombre: str
    cientifico_institucion: str | None
    estado: Estado
    creado_en: str


class MedicionesPagina(BaseModel):
    total: int
    pagina: int
    por_pagina: int
    mediciones: list[MedicionResponse]


CONSULTA = """
    SELECT m.*, u.nombre AS cientifico_nombre,
        u.institucion AS cientifico_institucion
    FROM mediciones_campo m JOIN usuarios u ON u.id=m.creado_por
"""


def respuesta(fila):
    datos = json.loads(fila["datos_json"])
    datos.update({campo: fila[campo] for campo in (
        "id", "cuenca_id", "periodo", "creado_por", "creado_en",
        "cientifico_nombre", "cientifico_institucion",
    )})
    datos["estado"] = fila["estado_registro"]
    datos["es_prueba"] = bool(fila["es_prueba"])
    return MedicionResponse(**datos)


@router.post("", response_model=MedicionResponse, status_code=201)
def registrar_medicion(datos: MedicionCreate, usuario=Depends(exigir_investigador)):
    """El científico registra sus datos; el autor se obtiene del token.

    'registrado' confirma almacenamiento, no certificación científica ni entrenamiento.
    """
    if DataService.obtener_cuenca(datos.cuenca_id) is None:
        raise HTTPException(404, "Cuenca no encontrada en el catálogo actual.")
    medicion_id = str(uuid4())
    valores = datos.model_dump(mode="json")
    cuenca_id = valores.pop("cuenca_id")
    periodo = valores.pop("periodo")
    es_prueba = valores.pop("es_prueba")
    with closing(get_connection()) as conn, conn:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("""
            INSERT INTO mediciones_campo
                (id, cuenca_id, periodo, datos_json, creado_por, estado_registro, es_prueba)
            VALUES (?, ?, ?, ?, ?, 'registrado', ?)
        """, (medicion_id, cuenca_id, periodo, json.dumps(valores, ensure_ascii=False, allow_nan=False), usuario["id"], int(es_prueba)))
        fila = conn.execute(CONSULTA + " WHERE m.id=?", (medicion_id,)).fetchone()
    return respuesta(fila)


@router.get("", response_model=MedicionesPagina)
def listar_mediciones(
    pagina: int = Query(1, ge=1), por_pagina: int = Query(20, ge=1, le=100),
    estado: Estado | None = None, cuenca_id: str | None = Query(None, max_length=100),
    periodo: str | None = Query(None, pattern=r"^\d{4}-(seca|humeda)$"),
    es_prueba: bool | None = None, usuario=Depends(sesion_actual),
):
    """Investigador: sus cargas; administrador: consulta general sin revisión técnica."""
    condiciones, parametros = [], []
    if usuario["rol"] != "admin":
        condiciones.append("m.creado_por=?")
        parametros.append(usuario["id"])
    for campo, valor in (("estado_registro", estado), ("cuenca_id", cuenca_id), ("periodo", periodo), ("es_prueba", es_prueba)):
        if valor is not None:
            condiciones.append(f"m.{campo}=?")
            parametros.append(valor)
    where = " WHERE " + " AND ".join(condiciones) if condiciones else ""
    with closing(get_connection()) as conn:
        total = conn.execute("SELECT COUNT(*) FROM mediciones_campo m" + where, parametros).fetchone()[0]
        filas = conn.execute(CONSULTA + where + " ORDER BY m.creado_en DESC, m.id DESC LIMIT ? OFFSET ?",
                             [*parametros, por_pagina, (pagina - 1) * por_pagina]).fetchall()
    return MedicionesPagina(total=total, pagina=pagina, por_pagina=por_pagina,
                            mediciones=[respuesta(fila) for fila in filas])


@router.get("/{medicion_id}", response_model=MedicionResponse)
def detalle_medicion(medicion_id: str, usuario=Depends(sesion_actual)):
    with closing(get_connection()) as conn:
        fila = conn.execute(CONSULTA + " WHERE m.id=?", (medicion_id,)).fetchone()
    if fila is None or (usuario["rol"] != "admin" and fila["creado_por"] != usuario["id"]):
        raise HTTPException(404, "Medición no encontrada.")
    return respuesta(fila)
