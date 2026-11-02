"""Conecta los reportes ciudadanos con el correo existente del equipo.

No valida científicamente ni incorpora reportes al dataset. No contiene proveedor
de correo propio: delega en EmailService.enviar_oficio_alerta.
"""
import logging
from contextlib import closing
from html import escape

from models.schemas import EmailAlertaRequest
from services.db import get_connection
from services.email_service import EmailService

logger = logging.getLogger(__name__)


def init_avisos_reportes_db():
    with closing(get_connection()) as conn, conn:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS avisos_reportes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reporte_id TEXT NOT NULL REFERENCES reportes(id),
                investigador_id INTEGER NOT NULL REFERENCES usuarios(id),
                destinatario TEXT NOT NULL,
                estado TEXT NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente','en_proceso','enviado','simulado','fallido','cancelado')),
                modo TEXT,
                id_envio TEXT,
                error TEXT,
                creado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                actualizado_en TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(reporte_id, investigador_id)
            )
        """)


def preparar_avisos(reporte_id):
    """Idempotencia por reporte y científico. Retorna los avisos pendientes."""
    with closing(get_connection()) as conn, conn:
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("""
            INSERT INTO avisos_reportes (reporte_id, investigador_id, destinatario)
            SELECT r.id, u.id, u.correo FROM reportes r CROSS JOIN usuarios u
            WHERE r.id=? AND u.rol='investigador' AND u.estado='activo'
            ON CONFLICT(reporte_id, investigador_id) DO NOTHING
        """, (reporte_id,))
        return [fila[0] for fila in conn.execute(
            "SELECT id FROM avisos_reportes WHERE reporte_id=? AND estado='pendiente' ORDER BY id", (reporte_id,))]


def enviar_aviso(aviso_id):
    with closing(get_connection()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        aviso = conn.execute("SELECT * FROM avisos_reportes WHERE id=?", (aviso_id,)).fetchone()
        if aviso is None or aviso["estado"] != "pendiente":
            return
        cientifico = conn.execute("SELECT nombre, rol, estado, correo FROM usuarios WHERE id=?", (aviso["investigador_id"],)).fetchone()
        if cientifico is None or cientifico["rol"] != "investigador" or cientifico["estado"] != "activo" or cientifico["correo"] != aviso["destinatario"]:
            conn.execute("UPDATE avisos_reportes SET estado='cancelado', actualizado_en=CURRENT_TIMESTAMP WHERE id=?", (aviso_id,))
            return
        reporte = conn.execute("SELECT * FROM reportes WHERE id=?", (aviso["reporte_id"],)).fetchone()
        conn.execute("UPDATE avisos_reportes SET estado='en_proceso', actualizado_en=CURRENT_TIMESTAMP WHERE id=?", (aviso_id,))
    # El proveedor existente inserta estos textos en HTML; escapar lo que proviene del público.
    contenido = (
        f"Se recibió el reporte ciudadano {reporte['id']}.\n"
        f"Cuenca: {reporte['cuenca_id']}\nSector: {reporte['quebrada']}\n"
        f"Fecha de registro (UTC): {reporte['fecha_registro']}\n"
        f"Reporte simulado: {'sí' if reporte['simulado'] else 'no'}\n\n"
        "Consulta el detalle en la bandeja de reportes para científicos. "
        "Es una observación ciudadana para contrastar predicciones, no un dato científico validado. "
        "No requiere aprobación del administrador y no se incorpora automáticamente al entrenamiento."
    )
    solicitud = EmailAlertaRequest(
        destinatario=aviso["destinatario"], destinatario_nombre=escape(cientifico["nombre"]),
        remitente_nombre="GlaciAgua - reportes ciudadanos", remitente_rol="Aviso automático",
        cuenca_nombre=escape(reporte["cuenca_id"]), motivo="Nuevo reporte ciudadano para contraste de predicciones",
        cuerpo_texto=escape(contenido), asunto="[GlaciAgua] Nuevo reporte ciudadano para revisión científica",
        nivel_riesgo="Sin determinar",
    )
    modo, id_envio, error = None, None, None
    try:
        resultado = EmailService.enviar_oficio_alerta(solicitud)
        modo, id_envio = resultado.modo, resultado.id_envio
        if modo == "simulado":
            estado = "simulado"
        elif resultado.enviado and modo in ("smtp", "resend"):
            estado = "enviado"
        else:
            estado, error = "fallido", "Respuesta del proveedor sin confirmación de envío"
    except Exception as exc:
        estado, error = "fallido", type(exc).__name__
        logger.warning("No se pudo enviar el aviso de reporte %s: %s", aviso_id, error)
    with closing(get_connection()) as conn, conn:
        conn.execute("""
            UPDATE avisos_reportes SET estado=?, modo=?, id_envio=?, error=?,
                actualizado_en=CURRENT_TIMESTAMP WHERE id=?
        """, (estado, modo, id_envio, error, aviso_id))
