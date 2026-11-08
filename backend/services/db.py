import os
import sqlite3
import json
from contextlib import closing
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.getenv("GLACIAGUA_DB_PATH", "glaciagua.db")


def get_connection():
    os.makedirs(
        os.path.dirname(os.path.abspath(DB_PATH)),
        exist_ok=True,
    )
    conn = sqlite3.connect(DB_PATH, timeout=30.0)
    conn.execute("PRAGMA foreign_keys = ON")
    # Activación de WAL mode para concurrencia limpia entre lecturas y escrituras
    try:
        conn.execute("PRAGMA journal_mode = WAL")
        conn.execute("PRAGMA busy_timeout = 5000")
        conn.execute("PRAGMA synchronous = NORMAL")
    except Exception:
        pass
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with closing(get_connection()) as conn, conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS reportes (
                id TEXT PRIMARY KEY,
                cuenca_id TEXT NOT NULL,
                quebrada TEXT NOT NULL,
                lat REAL NOT NULL,
                lng REAL NOT NULL,
                precision_m REAL,
                color_agua TEXT NOT NULL,
                olor_sabor TEXT,
                usos_afectados TEXT,
                ph_medido REAL,
                tiene_foto INTEGER DEFAULT 0,
                foto_base64 TEXT,
                comentarios TEXT,
                simulado INTEGER DEFAULT 1,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

def insertar_reporte(reporte_data: Dict[str, Any]) -> bool:
    """
    Inserta un reporte ciudadano.
    Usa INSERT OR IGNORE para garantizar idempotencia por UUID (evita duplicados al reintentar sin conexión).
    Retorna True si fue insertado, False si ya existía.
    """
    usos_json = json.dumps(reporte_data.get("usos_afectados", []))

    with closing(get_connection()) as conn, conn:
        cursor = conn.execute("""
            INSERT OR IGNORE INTO reportes (
                id, cuenca_id, quebrada, lat, lng, precision_m,
                color_agua, olor_sabor, usos_afectados, ph_medido,
                tiene_foto, foto_base64, comentarios, simulado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            reporte_data.get("id"),
            reporte_data.get("cuenca_id"),
            reporte_data.get("quebrada"),
            reporte_data.get("lat"),
            reporte_data.get("lng"),
            reporte_data.get("precision_m", 10.0),
            reporte_data.get("color_agua"),
            reporte_data.get("olor_sabor"),
            usos_json,
            reporte_data.get("ph_medido"),
            1 if reporte_data.get("tiene_foto") else 0,
            reporte_data.get("foto_base64"),
            reporte_data.get("comentarios"),
            1 if reporte_data.get("simulado", True) else 0
        ))
        return cursor.rowcount > 0

def obtener_reportes() -> List[Dict[str, Any]]:
    """
    Retorna la lista histórica de reportes ciudadanos ordenados por fecha descendente.
    """
    with closing(get_connection()) as conn:
        rows = conn.execute("SELECT * FROM reportes ORDER BY fecha_registro DESC").fetchall()

    reportes = []
    for r in rows:
        reportes.append({
            "id": r["id"],
            "cuenca_id": r["cuenca_id"],
            "quebrada": r["quebrada"],
            "lat": r["lat"],
            "lng": r["lng"],
            "precision_m": r["precision_m"],
            "color_agua": r["color_agua"],
            "olor_sabor": r["olor_sabor"],
            "usos_afectados": json.loads(r["usos_afectados"]) if r["usos_afectados"] else [],
            "ph_medido": r["ph_medido"],
            "tiene_foto": bool(r["tiene_foto"]),
            "foto_base64": r["foto_base64"],
            "comentarios": r["comentarios"],
            "simulado": bool(r["simulado"]),
            "fecha": r["fecha_registro"]
        })

    return reportes

def init_auth_db():
    """Crea las tablas de acceso sin eliminar datos existentes."""
    with closing(get_connection()) as conn, conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                correo TEXT NOT NULL COLLATE NOCASE UNIQUE,
                password_hash TEXT NOT NULL,
                rol TEXT NOT NULL
                    CHECK (rol IN ('admin', 'investigador')),
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

            CREATE INDEX IF NOT EXISTS idx_sesiones_usuario
                ON sesiones(usuario_id);

            CREATE TABLE IF NOT EXISTS auditoria (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                actor_id INTEGER REFERENCES usuarios(id),
                accion TEXT NOT NULL,
                entidad TEXT NOT NULL,
                entidad_id TEXT,
                detalles TEXT,
                creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        """)
