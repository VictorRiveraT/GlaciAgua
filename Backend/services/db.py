import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = "glaciagua.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
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
    conn.commit()
    conn.close()

def insertar_reporte(reporte_data: Dict[str, Any]) -> bool:
    """
    Inserta un reporte ciudadano.
    Usa INSERT OR IGNORE para garantizar idempotencia por UUID (evita duplicados al reintentar sin conexión).
    Retorna True si fue insertado, False si ya existía.
    """
    conn = get_connection()
    cursor = conn.cursor()

    usos_json = json.dumps(reporte_data.get("usos_afectados", []))

    cursor.execute("""
        INSERT OR IGNORE INTO reportes (
            id, cuenca_id, quebrada, lat, lng, precision_m,
            color_agua, olor_sabor, usos_afectados, ph_medido,
            tiene_foto, foto_base64, comentarios, simulado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        reporte_data["id"],
        reporte_data["cuenca_id"],
        reporte_data["quebrada"],
        reporte_data["lat"],
        reporte_data["lng"],
        reporte_data.get("precision_m", 10.0),
        reporte_data["color_agua"],
        reporte_data.get("olor_sabor", ""),
        usos_json,
        reporte_data.get("ph_medido"),
        1 if reporte_data.get("tiene_foto") else 0,
        reporte_data.get("foto_base64", ""),
        reporte_data.get("comentarios", ""),
        1 if reporte_data.get("simulado", True) else 0
    ))

    rows_affected = cursor.rowcount
    conn.commit()
    conn.close()

    return rows_affected > 0

def obtener_reportes() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM reportes ORDER BY fecha_registro DESC")
    rows = cursor.fetchall()
    conn.close()

    result = []
    for row in rows:
        r = dict(row)
        try:
            r["usos_afectados"] = json.loads(r["usos_afectados"])
        except:
            r["usos_afectados"] = []
        result.append(r)

    return result
