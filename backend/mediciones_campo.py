"""Registro privado y revisión de mediciones; no ejecuta entrenamientos."""
import json
from contextlib import closing
from datetime import date
from typing import Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from auth import exigir_admin, sesion_actual
from services.data_service import DataService
from services.db import get_connection

router = APIRouter(prefix="/admin/mediciones", tags=["Mediciones de campo"])
Estado = Literal["pendiente", "aprobado", "rechazado"]


def init_mediciones_db():
    with closing(get_connection()) as conn, conn:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.executescript("""
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
            );
            CREATE INDEX IF NOT EXISTS idx_mediciones_autor ON mediciones_campo(creado_por);
            CREATE INDEX IF NOT EXISTS idx_mediciones_filtros ON mediciones_campo(estado, cuenca_id, periodo);
            CREATE TABLE IF NOT EXISTS revisiones_mediciones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                medicion_id TEXT NOT NULL UNIQUE REFERENCES mediciones_campo(id),
                revisor_id INTEGER NOT NULL REFERENCES usuarios(id),
                estado TEXT NOT NULL CHECK (estado IN ('aprobado', 'rechazado')),
                observacion TEXT,
                creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
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
        return self


class MedicionResponse(MedicionCreate):
    id: str
    creado_por: int
    estado: Estado
    creado_en: str
    revisado_por: int | None = None
    revisado_en: str | None = None
    observacion_revision: str | None = None


class MedicionesPagina(BaseModel):
    total: int
    pagina: int
    por_pagina: int
    mediciones: list[MedicionResponse]


class RevisionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    estado: Literal["aprobado", "rechazado"]
    observacion: str | None = Field(default=None, max_length=2000)

    @field_validator("observacion", mode="before")
    @classmethod
    def limpiar_observacion(cls, valor):
        return valor.strip() if isinstance(valor, str) else valor

    @model_validator(mode="after")
    def motivo_rechazo(self):
        if self.estado == "rechazado" and len(self.observacion or "") < 3:
            raise ValueError("Para rechazar, indica una observación de al menos 3 caracteres.")
        return self


def respuesta(fila):
    datos = json.loads(fila["datos_json"])
    datos.update({campo: fila[campo] for campo in (
        "id", "cuenca_id", "periodo", "creado_por", "estado", "creado_en",
        "revisado_por", "revisado_en", "observacion_revision",
    )})
    return MedicionResponse(**datos)


@router.post("", response_model=MedicionResponse, status_code=201)
def registrar_medicion(datos: MedicionCreate, usuario=Depends(sesion_actual)):
    """Registra una medición pendiente. La autoría proviene del token."""
    if DataService.obtener_cuenca(datos.cuenca_id) is None:
        raise HTTPException(404, "Cuenca no encontrada en el catálogo actual.")
    medicion_id = str(uuid4())
    valores = datos.model_dump(mode="json")
    cuenca_id = valores.pop("cuenca_id")
    periodo = valores.pop("periodo")
    with closing(get_connection()) as conn, conn:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("""
            INSERT INTO mediciones_campo (id, cuenca_id, periodo, datos_json, creado_por)
            VALUES (?, ?, ?, ?, ?)
        """, (medicion_id, cuenca_id, periodo, json.dumps(valores, ensure_ascii=False, allow_nan=False), usuario["id"]))
        fila = conn.execute("SELECT * FROM mediciones_campo WHERE id = ?", (medicion_id,)).fetchone()
    return respuesta(fila)


@router.get("", response_model=MedicionesPagina)
def listar_mediciones(
    pagina: int = Query(1, ge=1), por_pagina: int = Query(20, ge=1, le=100),
    estado: Estado | None = None, cuenca_id: str | None = Query(None, max_length=100),
    periodo: str | None = Query(None, pattern=r"^\d{4}-(seca|humeda)$"),
    usuario=Depends(sesion_actual),
):
    """El investigador ve sus cargas; el administrador ve todas."""
    condiciones, parametros = [], []
    if usuario["rol"] != "admin":
        condiciones.append("creado_por = ?")
        parametros.append(usuario["id"])
    for campo, valor in (("estado", estado), ("cuenca_id", cuenca_id), ("periodo", periodo)):
        if valor is not None:
            condiciones.append(f"{campo} = ?")
            parametros.append(valor)
    where = " WHERE " + " AND ".join(condiciones) if condiciones else ""
    with closing(get_connection()) as conn:
        conn.execute("BEGIN")
        total = conn.execute("SELECT COUNT(*) FROM mediciones_campo" + where, parametros).fetchone()[0]
        filas = conn.execute("SELECT * FROM mediciones_campo" + where + " ORDER BY creado_en DESC, id DESC LIMIT ? OFFSET ?",
                             [*parametros, por_pagina, (pagina - 1) * por_pagina]).fetchall()
    return MedicionesPagina(total=total, pagina=pagina, por_pagina=por_pagina,
                            mediciones=[respuesta(fila) for fila in filas])


@router.get("/{medicion_id}", response_model=MedicionResponse)
def detalle_medicion(medicion_id: str, usuario=Depends(sesion_actual)):
    with closing(get_connection()) as conn:
        fila = conn.execute("SELECT * FROM mediciones_campo WHERE id = ?", (medicion_id,)).fetchone()
    # No revelar la existencia de cargas ajenas a otro investigador.
    if fila is None or (usuario["rol"] != "admin" and fila["creado_por"] != usuario["id"]):
        raise HTTPException(404, "Medición no encontrada.")
    return respuesta(fila)


@router.patch("/{medicion_id}/revision", response_model=MedicionResponse)
def revisar_medicion(medicion_id: str, datos: RevisionRequest, admin=Depends(exigir_admin)):
    """Revisa una carga pendiente. No incorpora datos ni activa modelos automáticamente."""
    with closing(get_connection()) as conn, conn:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("BEGIN IMMEDIATE")
        fila = conn.execute("SELECT * FROM mediciones_campo WHERE id = ?", (medicion_id,)).fetchone()
        if fila is None:
            raise HTTPException(404, "Medición no encontrada.")
        if fila["estado"] != "pendiente":
            raise HTTPException(409, "La medición ya fue revisada.")
        conn.execute("""
            INSERT INTO revisiones_mediciones (medicion_id, revisor_id, estado, observacion)
            VALUES (?, ?, ?, ?)
        """, (medicion_id, admin["id"], datos.estado, datos.observacion))
        conn.execute("""
            UPDATE mediciones_campo SET estado = ?, revisado_por = ?,
                revisado_en = CURRENT_TIMESTAMP, observacion_revision = ? WHERE id = ?
        """, (datos.estado, admin["id"], datos.observacion, medicion_id))
        fila = conn.execute("SELECT * FROM mediciones_campo WHERE id = ?", (medicion_id,)).fetchone()
    return respuesta(fila)
