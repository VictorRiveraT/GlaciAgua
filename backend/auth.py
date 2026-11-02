"""Autenticación con contraseñas PBKDF2 y sesiones revocables en SQLite."""
import hashlib
import hmac
import secrets
import time
from contextlib import closing
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

from services.db import get_connection

router = APIRouter(prefix="/auth", tags=["Autenticación"])
bearer = HTTPBearer(auto_error=False)
ITERACIONES = 600_000


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), ITERACIONES)
    return f"pbkdf2_sha256${ITERACIONES}${salt}${digest.hex()}"


def verificar_password(password: str, almacenado: str) -> bool:
    try:
        algoritmo, iteraciones, salt, esperado = almacenado.split("$")
        if algoritmo != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), int(iteraciones))
        return hmac.compare_digest(digest.hex(), esperado)
    except (ValueError, TypeError):
        return False


def init_auth_db():
    with closing(get_connection()) as conn, conn:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                correo TEXT NOT NULL COLLATE NOCASE UNIQUE,
                password_hash TEXT NOT NULL,
                rol TEXT NOT NULL CHECK (rol IN ('admin', 'investigador')),
                estado TEXT NOT NULL DEFAULT 'activo'
                    CHECK (estado IN ('activo', 'suspendido')),
                institucion TEXT,
                creado_por INTEGER REFERENCES usuarios(id),
                creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS sesiones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
                token_hash TEXT NOT NULL UNIQUE,
                creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                expira_en TEXT NOT NULL,
                revocado_en TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones(usuario_id);
            CREATE TABLE IF NOT EXISTS intentos_login (
                correo TEXT PRIMARY KEY COLLATE NOCASE,
                fallos INTEGER NOT NULL DEFAULT 0,
                bloqueado_hasta INTEGER NOT NULL DEFAULT 0
            );
        """)


class LoginRequest(BaseModel):
    correo: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=256)


class UsuarioPublico(BaseModel):
    id: int
    nombre: str
    correo: str
    rol: str
    estado: str
    institucion: str | None = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 28800
    usuario: UsuarioPublico


# Reduce las diferencias de tiempo entre un correo inexistente y uno existente.
DUMMY_HASH = hash_password(secrets.token_urlsafe(32))


@router.post("/login", response_model=LoginResponse)
def login(datos: LoginRequest):
    correo = datos.correo.strip().lower()
    ahora = int(time.time())
    fallo = False
    with closing(get_connection()) as conn, conn:
        # Serializa la comprobación y actualización de intentos concurrentes.
        conn.execute("BEGIN IMMEDIATE")
        intento = conn.execute("SELECT * FROM intentos_login WHERE correo = ?", (correo,)).fetchone()
        if intento and intento["bloqueado_hasta"] > ahora:
            raise HTTPException(429, "Demasiados intentos. Intenta nuevamente más tarde.",
                                headers={"Retry-After": str(intento["bloqueado_hasta"] - ahora)})
        usuario = conn.execute("SELECT * FROM usuarios WHERE correo = ?", (correo,)).fetchone()
        password_valida = verificar_password(datos.password, usuario["password_hash"] if usuario else DUMMY_HASH)
        if not usuario or not password_valida or usuario["estado"] != "activo":
            previos = intento["fallos"] if intento and intento["bloqueado_hasta"] == 0 else 0
            fallos = previos + 1
            conn.execute("""
                INSERT INTO intentos_login (correo, fallos, bloqueado_hasta) VALUES (?, ?, ?)
                ON CONFLICT(correo) DO UPDATE SET
                    fallos=excluded.fallos, bloqueado_hasta=excluded.bloqueado_hasta
            """, (correo, fallos, ahora + 900 if fallos >= 5 else 0))
            fallo = True
        else:
            conn.execute("DELETE FROM intentos_login WHERE correo = ?", (correo,))
            token = secrets.token_urlsafe(32)
            expiracion = (datetime.now(timezone.utc) + timedelta(hours=8)).strftime("%Y-%m-%d %H:%M:%S")
            conn.execute("INSERT INTO sesiones (usuario_id, token_hash, expira_en) VALUES (?, ?, ?)",
                         (usuario["id"], hashlib.sha256(token.encode()).hexdigest(), expiracion))
    if fallo:
        raise HTTPException(401, "Correo o contraseña incorrectos, o cuenta no disponible.")
    return LoginResponse(access_token=token, usuario=UsuarioPublico(**dict(usuario)))


def sesion_actual(credenciales: HTTPAuthorizationCredentials | None = Depends(bearer)):
    error = HTTPException(401, "Sesión inválida o vencida.", headers={"WWW-Authenticate": "Bearer"})
    if credenciales is None or credenciales.scheme.lower() != "bearer":
        raise error
    token_hash = hashlib.sha256(credenciales.credentials.encode()).hexdigest()
    with closing(get_connection()) as conn:
        fila = conn.execute("""
            SELECT u.*, s.id AS sesion_id FROM sesiones s
            JOIN usuarios u ON u.id = s.usuario_id
            WHERE s.token_hash = ? AND s.revocado_en IS NULL
                AND s.expira_en > datetime('now') AND u.estado = 'activo'
        """, (token_hash,)).fetchone()
    if fila is None:
        raise error
    return dict(fila)


def exigir_admin(usuario=Depends(sesion_actual)):
    if usuario["rol"] != "admin":
        raise HTTPException(403, "Se requiere el rol administrador.")
    return usuario


def exigir_investigador(usuario=Depends(sesion_actual)):
    if usuario["rol"] != "investigador":
        raise HTTPException(403, "Se requiere el rol investigador.")
    return usuario


@router.get("/me", response_model=UsuarioPublico)
def me(usuario=Depends(sesion_actual)):
    return UsuarioPublico(**usuario)


@router.post("/logout")
def logout(usuario=Depends(sesion_actual)):
    with closing(get_connection()) as conn, conn:
        conn.execute("UPDATE sesiones SET revocado_en = CURRENT_TIMESTAMP WHERE id = ?",
                     (usuario["sesion_id"],))
    return {"mensaje": "Sesión cerrada correctamente."}
