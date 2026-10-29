"""Cliente HTTP para comunicarse con el microservicio de Machine Learning (glaciagua-ml-api)."""
import os
import logging
from typing import Dict, Any, List, Optional
import httpx

logger = logging.getLogger(__name__)

# URL del servicio de ML (en Docker será 'http://api:8001', en local 'http://127.0.0.1:8001')
ML_API_URL = os.getenv("ML_API_URL", "http://127.0.0.1:8001").rstrip("/")
API_KEY = os.getenv("GLACIAGUA_API_KEY", None)


class MLClient:
    @staticmethod
    def _get_headers() -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if API_KEY:
            headers["X-API-Key"] = API_KEY
        return headers

    @classmethod
    async def verificar_salud(cls) -> Dict[str, Any]:
        """Consulta el estado del microservicio de Machine Learning."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"{ML_API_URL}/salud", headers=cls._get_headers())
                if resp.status_code == 200:
                    return resp.json()
                return {"estado": "error", "codigo": resp.status_code, "detalle": resp.text}
        except Exception as e:
            return {"estado": "desconectado", "error": str(e), "url": ML_API_URL}

    @classmethod
    async def obtener_info_modelo(cls) -> Dict[str, Any]:
        """Obtiene la metadata, métricas de validación e importancia de variables del modelo."""
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(f"{ML_API_URL}/modelo", headers=cls._get_headers())
                if resp.status_code == 200:
                    return resp.json()
                return {"error": f"Error del servicio ML ({resp.status_code}): {resp.text}"}
        except Exception as e:
            return {"error": f"No se pudo conectar al microservicio ML: {str(e)}"}

    @classmethod
    async def predecir_microcuencas(cls, microcuencas: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Envía una lista de microcuencas para predecir su pH mínimo y nivel de riesgo con Random Forest.
        """
        payload = {"microcuencas": microcuencas}
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                resp = await client.post(
                    f"{ML_API_URL}/predecir",
                    json=payload,
                    headers=cls._get_headers()
                )
                if resp.status_code == 200:
                    return resp.json()
                logger.error(f"Error en respuesta de ML API: {resp.status_code} - {resp.text}")
                return {
                    "error": f"Error del servicio ML ({resp.status_code})",
                    "detalle": resp.text,
                    "resultados": []
                }
        except Exception as e:
            logger.warning(f"Microservicio ML no disponible en {ML_API_URL}: {e}")
            return {
                "error": "Microservicio ML no disponible",
                "detalle": str(e),
                "resultados": []
            }
