from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

from models.schemas import (
    SimulacionRequest,
    SimulacionResponse,
    ReporteCreate,
    ReporteResponse,
    MedicionResponse,
    CuencaResumen,
    GeoJSONFeatureCollection,
)
from services.risk_engine import RiskEngine
from services.data_service import DataService
from services.db import init_db, insertar_reporte, obtener_reportes

# Inicializar base de datos SQLite
init_db()

app = FastAPI(
    title="GlaciAgua API",
    description="API REST de Alerta Temprana de Drenaje Ácido de Roca (DAR) en la Cordillera Blanca (Huaraz, Áncash)",
    version="1.0.0",
)

# Configuración de CORS para permitir peticiones desde el frontend de Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["General"])
def root():
    return {
        "proyecto": "GlaciAgua",
        "descripcion": "Sistema de alerta temprana comunitaria para agua de deshielo y drenaje ácido",
        "cuencas_piloto": ["Quillcay (Huaraz)", "Pachacoto (Pastoruri)", "Canray Chico", "Río Blanco"],
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "cuencas": "/cuencas",
            "geojson": "/cuencas/geojson",
            "mediciones": "/mediciones",
            "simular": "/simular",
            "reportes": "/reportes"
        }
    }

# 1. Microcuencas
@app.get("/cuencas", response_model=List[Dict[str, Any]], tags=["Microcuencas"])
def listar_cuencas():
    """Retorna la lista de microcuencas piloto con sus factores físicos, niveles de riesgo y mediciones."""
    return DataService.listar_cuencas()

@app.get("/cuencas/{cuenca_id}", response_model=Dict[str, Any], tags=["Microcuencas"])
def obtener_cuenca(cuenca_id: str):
    """Retorna la ficha técnica detallada de una microcuenca por su ID o slug."""
    cuenca = DataService.obtener_cuenca(cuenca_id)
    if not cuenca:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Microcuenca '{cuenca_id}' no encontrada."
        )
    return cuenca

@app.get("/cuencas/exportar/geojson", tags=["Microcuencas"])
def exportar_geojson(temporada: Literal["seca", "humeda"] = "seca"):
    """Exporta las cuencas como FeatureCollection GeoJSON estándar (RFC 7946) para SIG o mapas web."""
    return DataService.generar_geojson(temporada=temporada)

# 2. Mediciones Científicas Reales (Etiquetas de Contraste INAIGEM / UPCH)
@app.get("/mediciones", response_model=List[Dict[str, Any]], tags=["Mediciones Científicas"])
def listar_mediciones(
    cuenca_id: Optional[str] = Query(None, description="Filtrar por cuenca_id (quillcay, pachacoto, etc.)"),
    solo_afectadas: bool = Query(False, description="Filtrar solo mediciones que superan los límites del ECA Agua")
):
    """Retorna las estaciones de monitoreo hidroquímico con datos de pH, conductividad y metales pesados."""
    return DataService.listar_mediciones(cuenca_id=cuenca_id, solo_afectadas=solo_afectadas)

# 3. Motor de Riesgo (Simulador Ambiental)
@app.post("/simular", response_model=SimulacionResponse, tags=["Motor de Riesgo"])
def simular_riesgo(request: SimulacionRequest):
    """
    Calcula el riesgo de agua ácida según la fórmula física consensuada:
    generacion = roca_expuesta × potencial_acido
    riesgo = generacion × lluvia × (1 - alpha × bofedal)
    """
    return RiskEngine.calcular_riesgo(
        roca_expuesta=request.roca_expuesta,
        potencial_acido=request.potencial_acido,
        lluvia=request.lluvia,
        bofedal=request.bofedal,
        alpha=request.alpha,
    )

# 4. Reportes Comunitarios Offline
@app.post("/reportes", response_model=ReporteResponse, status_code=status.HTTP_201_CREATED, tags=["Ciencia Ciudadana"])
def registrar_reporte(reporte: ReporteCreate):
    """
    Recibe reportes comunitarios desde la PWA.
    Implementa idempotencia por UUID para evitar duplicados cuando el cliente reintenta la sincronización offline.
    """
    nuevo = insertar_reporte(reporte.model_dump())

    mensaje = "Reporte guardado exitosamente." if nuevo else "Reporte ya existía previamente (idempotente por UUID)."

    return ReporteResponse(
        id=reporte.id,
        cuenca_id=reporte.cuenca_id,
        quebrada=reporte.quebrada,
        lat=reporte.lat,
        lng=reporte.lng,
        fecha=datetime.now().strftime("%Y-%m-%d %H:%M"),
        color_agua=reporte.color_agua,
        ph_medido=reporte.ph_medido,
        sincronizado=True,
        mensaje=mensaje
    )

@app.get("/reportes", response_model=List[Dict[str, Any]], tags=["Ciencia Ciudadana"])
def listar_reportes_ciudadanos():
    """Retorna todos los reportes comunitarios almacenados en la base de datos."""
    return obtener_reportes()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
