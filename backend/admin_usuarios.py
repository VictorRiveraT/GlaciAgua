"""Gestión de investigadores exclusiva del administrador."""
import json
import sqlite3
from contextlib import closing
from typing import Literal

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field, field_validator

from auth import UsuarioPublico, exigir_admin, hash_password
from services.db import get_connection
from services.email_service import EmailService

router = APIRouter(prefix="/admin/usuarios", tags=["Administración de usuarios"])


def init_admin_db():
    with closing(get_connection()) as conn, conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS auditoria (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                actor_id INTEGER REFERENCES usuarios(id),
                accion TEXT NOT NULL,
                entidad TEXT NOT NULL,
                entidad_id TEXT,
                detalles TEXT,
                creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)


class InvestigadorCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    nombre: str = Field(min_length=1, max_length=150)
    correo: str = Field(min_length=3, max_length=254, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    password: str = Field(min_length=12, max_length=256, repr=False,
                          json_schema_extra={"writeOnly": True})
    institucion: str | None = Field(default=None, max_length=200)

    @field_validator("nombre", "correo", "institucion", mode="before")
    @classmethod
    def limpiar_texto(cls, valor):
        return valor.strip() if isinstance(valor, str) else valor

    @field_validator("correo")
    @classmethod
    def normalizar_correo(cls, valor):
        return valor.lower()

    @field_validator("password")
    @classmethod
    def validar_password(cls, valor):
        if not valor.strip():
            raise ValueError("La contraseña no puede contener solo espacios.")
        return valor


class EstadoUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    estado: Literal["activo", "suspendido"]


class UsuariosPagina(BaseModel):
    total: int
    pagina: int
    por_pagina: int
    usuarios: list[UsuarioPublico]


def auditar(conn, actor_id, accion, entidad_id, detalles):
    # Nunca incluir contraseñas, hashes ni tokens en el historial.
    conn.execute("""
        INSERT INTO auditoria (actor_id, accion, entidad, entidad_id, detalles)
        VALUES (?, ?, 'usuarios', ?, ?)
    """, (actor_id, accion, str(entidad_id), json.dumps(detalles, ensure_ascii=False)))


@router.post("", response_model=UsuarioPublico, status_code=201)
def crear_investigador(
    datos: InvestigadorCreate,
    tareas: BackgroundTasks,
    admin=Depends(exigir_admin),
):
    """Crea investigadores y envía notificación formal con credenciales al correo institucional."""
    password_hash = hash_password(datos.password)
    try:
        with closing(get_connection()) as conn, conn:
            conn.execute("PRAGMA foreign_keys = ON")
            cursor = conn.execute("""
                INSERT INTO usuarios
                    (nombre, correo, password_hash, rol, institucion, creado_por)
                VALUES (?, ?, ?, 'investigador', ?, ?)
            """, (datos.nombre, datos.correo, password_hash, datos.institucion, admin["id"]))
            usuario_id = cursor.lastrowid
            auditar(conn, admin["id"], "investigador_creado", usuario_id, {})
            usuario = conn.execute("SELECT * FROM usuarios WHERE id = ?", (usuario_id,)).fetchone()
    except sqlite3.IntegrityError as error:
        if getattr(error, "sqlite_errorname", "") == "SQLITE_CONSTRAINT_UNIQUE":
            raise HTTPException(409, "Ya existe una cuenta con ese correo.") from None
        raise

    # Envío en segundo plano de credenciales y link de acceso al correo del nuevo investigador
    tareas.add_task(
        EmailService.enviar_bienvenida_investigador,
        nombre=datos.nombre,
        correo=datos.correo,
        password=datos.password,
        institucion=datos.institucion,
        admin_nombre=admin.get("nombre", "Administrador GlaciAgua"),
    )

    return UsuarioPublico(**dict(usuario))


@router.get("", response_model=UsuariosPagina)
def listar_usuarios(
    pagina: int = Query(1, ge=1),
    por_pagina: int = Query(20, ge=1, le=100),
    rol: Literal["admin", "investigador"] | None = None,
    estado: Literal["activo", "suspendido"] | None = None,
    admin=Depends(exigir_admin),
):
    condiciones, parametros = [], []
    for campo, valor in (("rol", rol), ("estado", estado)):
        if valor is not None:
            condiciones.append(f"{campo} = ?")
            parametros.append(valor)
    where = " WHERE " + " AND ".join(condiciones) if condiciones else ""
    with closing(get_connection()) as conn:
        conn.execute("BEGIN")
        total = conn.execute("SELECT COUNT(*) FROM usuarios" + where, parametros).fetchone()[0]
        filas = conn.execute("SELECT * FROM usuarios" + where + " ORDER BY id DESC LIMIT ? OFFSET ?",
                             [*parametros, por_pagina, (pagina - 1) * por_pagina]).fetchall()
    return UsuariosPagina(total=total, pagina=pagina, por_pagina=por_pagina,
                          usuarios=[UsuarioPublico(**dict(fila)) for fila in filas])


@router.get("/{usuario_id}", response_model=UsuarioPublico)
def obtener_usuario(usuario_id: int, admin=Depends(exigir_admin)):
    with closing(get_connection()) as conn:
        fila = conn.execute("SELECT * FROM usuarios WHERE id = ?", (usuario_id,)).fetchone()
    if fila is None:
        raise HTTPException(404, "Usuario no encontrado.")
    return UsuarioPublico(**dict(fila))


@router.patch("/{usuario_id}/estado", response_model=UsuarioPublico)
def actualizar_estado(usuario_id: int, datos: EstadoUpdate, admin=Depends(exigir_admin)):
    with closing(get_connection()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        usuario = conn.execute("SELECT * FROM usuarios WHERE id = ?", (usuario_id,)).fetchone()
        if usuario is None:
            raise HTTPException(404, "Usuario no encontrado.")
        if usuario["rol"] != "investigador":
            raise HTTPException(409, "Esta operación solo modifica cuentas de investigadores.")
        if usuario["estado"] != datos.estado:
            conn.execute("UPDATE usuarios SET estado = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?",
                         (datos.estado, usuario_id))
            if datos.estado == "suspendido":
                conn.execute("""
                    UPDATE sesiones SET revocado_en = CURRENT_TIMESTAMP
                    WHERE usuario_id = ? AND revocado_en IS NULL
                """, (usuario_id,))
            auditar(conn, admin["id"], "estado_investigador_actualizado", usuario_id,
                    {"anterior": usuario["estado"], "nuevo": datos.estado})
        fila = conn.execute("SELECT * FROM usuarios WHERE id = ?", (usuario_id,)).fetchone()
    return UsuarioPublico(**dict(fila))
