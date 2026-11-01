from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

from models.schemas import (
    AdminLoginRequest,
    MedicionCampoCreate,
    AdminReentrenarRequest,
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
from services.db import init_db, insertar_reporte, obtener_reportes, insertar_medicion_campo, obtener_mediciones_campo
from services.ml_client import MLClient

# Inicializar base de datos SQLite
init_db()

app = FastAPI(
    title="GlaciAgua API",
    description="API REST de Alerta Temprana de Drenaje Ácido de Roca (DAR) en la Cordillera Blanca (Huaraz, Áncash)",
    version="1.1.0",
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
        "descripcion": "Sistema de alerta temprana comunitaria para agua de deshielo y drenaje acido",
        "cuencas_piloto": ["Quillcay (Huaraz)", "Pachacoto (Pastoruri)", "Canray Chico", "Río Blanco"],
        "version": "1.1.0",
        "docs": "/docs",
        "endpoints": {
            "cuencas": "/cuencas",
            "geojson": "/cuencas/exportar/geojson",
            "mediciones": "/mediciones",
            "simular": "/simular",
            "reportes": "/reportes",
            "ml_salud": "/ml/salud",
            "ml_modelo": "/ml/modelo",
            "ml_predecir": "/ml/predecir",
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

# 3. Motor de Riesgo (Simulador Ambiental Físico + Predictivo ML)
@app.post("/simular", response_model=SimulacionResponse, tags=["Motor de Riesgo"])
async def simular_riesgo(request: SimulacionRequest):
    """
    Calcula el riesgo de agua ácida según la fórmula física consensuada:
    generacion = roca_expuesta × potencial_acido
    riesgo = generacion × lluvia × (1 - alpha × bofedal)
    
    Y consulta de forma complementaria el microservicio de Machine Learning
    para contrastar la hipótesis física con la estimación de pH por Random Forest.
    """
    resultado_fisico = RiskEngine.calcular_riesgo(
        roca_expuesta=request.roca_expuesta,
        potencial_acido=request.potencial_acido,
        lluvia=request.lluvia,
        bofedal=request.bofedal,
        alpha=request.alpha,
    )
    
    # Consulta complementaria al microservicio ML
    microcuenca_ml = {
        "id": "simulacion-live",
        "temporada": request.temporada or "seca",
        "area_km2": request.area_km2 or 249.5,
        "roca_expuesta_km2": round((request.roca_expuesta / 100.0) * (request.area_km2 or 249.5) * 0.15, 2),
        "pct_sulfuros": request.potencial_acido,
        "pct_carbonatos": request.pct_carbonatos or 10.0,
        "lluvia_mm": round((request.lluvia / 100.0) * 200.0, 1),
        "pct_bofedal": round((request.bofedal / 100.0) * 15.0, 2),
        "pct_veg_humeda_est": round((request.bofedal / 100.0) * 20.0, 2),
    }

    ml_resp = await MLClient.predecir_microcuencas([microcuenca_ml])
    prediccion_ml = None
    if ml_resp.get("resultados"):
        prediccion_ml = ml_resp["resultados"][0]

    return SimulacionResponse(
        generacion_potencial=resultado_fisico.generacion_potencial,
        amortiguacion_factor=resultado_fisico.amortiguacion_factor,
        riesgo_bruto=resultado_fisico.riesgo_bruto,
        score_normalizado=resultado_fisico.score_normalizado,
        nivel_riesgo=resultado_fisico.nivel_riesgo,
        formula_desglose=resultado_fisico.formula_desglose,
        diagnostico=resultado_fisico.diagnostico,
        prediccion_ml=prediccion_ml,
    )

# 4. Microservicio de Machine Learning (Proxy / Integración)
@app.get("/ml/salud", tags=["Machine Learning"])
async def ml_salud():
    """Verifica si el microservicio de Machine Learning está en línea y con el modelo cargado."""
    return await MLClient.verificar_salud()

@app.get("/ml/modelo", tags=["Machine Learning"])
async def ml_modelo_info():
    """Obtiene metadata, importancia de variables y métricas de validación del Random Forest."""
    return await MLClient.obtener_info_modelo()

@app.post("/ml/predecir", tags=["Machine Learning"])
async def ml_predecir(microcuencas: List[Dict[str, Any]]):
    """Envía un lote de microcuencas al microservicio de ML para estimar pH e incertidumbre."""
    return await MLClient.predecir_microcuencas(microcuencas)

# 5. Reportes Comunitarios Offline
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



# 6. Portal de Administración e Ingeniería Ambiental
@app.post("/admin/login", tags=["Administración"])
def admin_login(creds: AdminLoginRequest):
    """
    Autenticación ligera para especialistas ambientales e ingenieros de monitoreo.
    Credenciales estándar: admin / glaciagua2026
    """
    import os
    admin_user = os.getenv("GLACIAGUA_ADMIN_USER", "admin")
    admin_pass = os.getenv("GLACIAGUA_ADMIN_PASS", "glaciagua2026")

    if creds.username == admin_user and creds.password == admin_pass:
        return {
            "success": True,
            "token": "tok_glaciagua_admin_2026",
            "usuario": {
                "username": admin_user,
                "nombre": "Especialista Ambiental",
                "rol": "Ingeniero(a) de Recursos Hídricos",
                "institucion": "Monitoreo Comunitario e Institucional Áncash"
            }
        }
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales incorrectas. Verifique usuario o contraseña."
    )

@app.get("/admin/mediciones", tags=["Administración"])
def listar_mediciones_campo():
    """Retorna las mediciones hidroquímicas ingresadas por los ingenieros."""
    return obtener_mediciones_campo()

@app.post("/admin/mediciones", status_code=status.HTTP_201_CREATED, tags=["Administración"])
def registrar_medicion_campo(medicion: MedicionCampoCreate):
    """Guarda una nueva medición de campo para el histórico de entrenamiento."""
    import uuid
    data = medicion.model_dump()
    if not data.get("id"):
        data["id"] = f"med-{int(datetime.now().timestamp())}-{uuid.uuid4().hex[:4]}"
    insertar_medicion_campo(data)
    return {
        "success": True,
        "mensaje": "Medición de campo registrada en la base de datos.",
        "id": data["id"]
    }

@app.post("/admin/reentrenar", tags=["Administración"])
async def reentrenar_modelo(req: AdminReentrenarRequest):
    """
    Toma las mediciones de campo guardadas en SQLite (más opcionales del request),
    ejecuta aumento físico de datos si se requiere, y entrena el nuevo modelo.
    """
    mediciones_db = obtener_mediciones_campo()
    filas_reales = []

    for m in mediciones_db:
        filas_reales.append({
            "cuenca_id": m["cuenca_id"],
            "temporada": m["temporada"],
            "periodo": m["periodo"],
            "area_km2": m.get("area_km2"),
            "roca_expuesta_km2": m.get("roca_expuesta_km2"),
            "pct_sulfuros": m.get("pct_sulfuros"),
            "pct_carbonatos": m.get("pct_carbonatos"),
            "lluvia_mm": m.get("lluvia_mm"),
            "pct_bofedal": m.get("pct_bofedal"),
            "pct_veg_humeda_est": m.get("pct_veg_humeda_est"),
            "ph_min": m["ph_min"]
        })

    if req.filas_adicionales:
        for f in req.filas_adicionales:
            if "ph_min" in f and "cuenca_id" in f:
                filas_reales.append(f)

    payload = {
        "filas_reales": filas_reales,
        "aumentar_con_fisica": req.aumentar_con_fisica,
        "n_sinteticos": req.n_sinteticos,
        "n_arboles": req.n_arboles
    }

    resultado = await MLClient.reentrenar(payload)
    return resultado

@app.get("/admin/plantilla-csv", tags=["Administración"])
def descargar_plantilla():
    """Retorna una plantilla CSV con el formato requerido para carga masiva de mediciones."""
    encabezados = "cuenca_id,temporada,periodo,area_km2,roca_expuesta_km2,pct_sulfuros,pct_carbonatos,lluvia_mm,pct_bofedal,pct_veg_humeda_est,ph_min,conductividad,responsable\n"
    ejemplo1 = "quillcay,humeda,2026-humeda,249.5,35.2,55.0,8.0,180.0,28.0,32.0,4.1,540,INAIGEM\n"
    ejemplo2 = "pachacoto,seca,2026-seca,202.8,24.0,45.0,12.0,30.0,18.0,20.0,3.9,610,UPCH\n"
    return {
        "contenido_csv": encabezados + ejemplo1 + ejemplo2,
        "nombre_archivo": "plantilla_glaciagua_mediciones.csv"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
