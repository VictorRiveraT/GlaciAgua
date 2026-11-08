"""Bandeja de consulta de avisos ciudadanos para contraste de predicciones.

No aprueba ni rechaza reportes y no incorpora datos ciudadanos al entrenamiento.
El envío de correos se conecta por separado con el servicio del equipo.
"""
import json
from contextlib import closing

from fastapi import APIRouter, Depends, HTTPException, Query

from auth import exigir_investigador
from services.db import get_connection

router = APIRouter(prefix="/investigacion/reportes", tags=["Reportes para científicos"])


def serializar(fila):
    datos = dict(fila)
    datos["usos_afectados"] = json.loads(datos["usos_afectados"] or "[]")
    datos["tiene_foto"] = bool(datos["tiene_foto"])
    datos["simulado"] = bool(datos["simulado"])
    datos["uso"] = "contraste_predicciones"
    return datos


@router.get("")
def listar_reportes(
    pagina: int = Query(1, ge=1), por_pagina: int = Query(20, ge=1, le=100),
    cuenca_id: str | None = Query(None, max_length=100), simulado: bool | None = None,
    cientifico=Depends(exigir_investigador),
):
    condiciones, parametros = [], []
    for campo, valor in (("cuenca_id", cuenca_id), ("simulado", simulado)):
        if valor is not None:
            condiciones.append(f"{campo}=?")
            parametros.append(valor)
    where = " WHERE " + " AND ".join(condiciones) if condiciones else ""
    with closing(get_connection()) as conn:
        total = conn.execute("SELECT COUNT(*) FROM reportes" + where, parametros).fetchone()[0]
        # Las fotos se consultan en el detalle para no cargar todo el listado.
        filas = conn.execute("""
            SELECT id, cuenca_id, quebrada, lat, lng, precision_m, color_agua,
                olor_sabor, usos_afectados, ph_medido, tiene_foto, comentarios,
                simulado, fecha_registro FROM reportes
        """ + where + " ORDER BY fecha_registro DESC, id DESC LIMIT ? OFFSET ?",
                             [*parametros, por_pagina, (pagina - 1) * por_pagina]).fetchall()
    return {"total": total, "pagina": pagina, "por_pagina": por_pagina,
            "reportes": [serializar(fila) for fila in filas]}


@router.get("/{reporte_id}")
def obtener_reporte(reporte_id: str, cientifico=Depends(exigir_investigador)):
    with closing(get_connection()) as conn:
        fila = conn.execute("SELECT * FROM reportes WHERE id=?", (reporte_id,)).fetchone()
    if fila is None:
        raise HTTPException(404, "Reporte no encontrado.")
    return serializar(fila)
