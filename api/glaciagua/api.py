"""API REST del modelo de riesgo de agua ácida.

    uvicorn glaciagua.api:app --reload --port 8000
    Documentación interactiva: http://localhost:8000/docs

Variables de entorno (todas opcionales):
    GLACIAGUA_MODELO   carpeta del modelo (por defecto ./modelo)
    GLACIAGUA_CORS     orígenes permitidos del frontend, separados por coma
    GLACIAGUA_API_KEY  si se define, las rutas exigen el encabezado X-API-Key
"""
import os
import secrets
from typing import Literal, Optional, List, Dict, Any

import pandas as pd
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from . import config as cfg
from .modelo import ModeloRiesgo


class MicrocuencaIn(BaseModel):
    id: Optional[str] = Field(None, description='Identificador que tú quieras para reconocer la fila')
    temporada: Literal['seca', 'humeda']
    area_km2: Optional[float] = Field(None, gt=0, le=20000)
    roca_expuesta_km2: Optional[float] = Field(None, ge=0, le=20000)
    pct_sulfuros: Optional[float] = Field(None, ge=0, le=100)
    pct_carbonatos: Optional[float] = Field(None, ge=0, le=100)
    lluvia_mm: Optional[float] = Field(None, ge=0, le=6000)
    pct_bofedal: Optional[float] = Field(None, ge=0, le=100)
    pct_veg_humeda_est: Optional[float] = Field(None, ge=0, le=100)


class PrediccionIn(BaseModel):
    microcuencas: list[MicrocuencaIn] = Field(min_length=1, max_length=500)


class PrediccionOut(BaseModel):
    id: Optional[str]
    ph_estimado: float
    incertidumbre_ph: float
    nivel_riesgo: Literal['Alto', 'Medio', 'Bajo']
    acuerdo_arboles: float
    advertencias: list[str]


class RespuestaPrediccion(BaseModel):
    modelo_demo: bool = Field(description='True si el modelo se entrenó con datos simulados')
    aviso: Optional[str]
    version_modelo: str
    resultados: list[PrediccionOut]


class FilaReentrenamiento(BaseModel):
    cuenca_id: str
    temporada: Literal['seca', 'humeda']
    periodo: Optional[str] = None
    area_km2: Optional[float] = None
    roca_expuesta_km2: Optional[float] = None
    pct_sulfuros: Optional[float] = None
    pct_carbonatos: Optional[float] = None
    lluvia_mm: Optional[float] = None
    pct_bofedal: Optional[float] = None
    pct_veg_humeda_est: Optional[float] = None
    ph_min: float = Field(..., ge=1.0, le=14.0)


class ReentrenarIn(BaseModel):
    filas_reales: Optional[List[FilaReentrenamiento]] = None
    aumentar_con_fisica: bool = True
    n_sinteticos: int = Field(default=80, ge=10, le=500)
    n_arboles: int = Field(default=250, ge=50, le=500)


class ReentrenarOut(BaseModel):
    exito: bool
    mensaje: str
    version_nueva: str
    fuente_datos: str
    n_filas: int
    n_microcuencas: int
    metricas: Dict[str, Any]


def crear_app(dir_modelo=None):
    dir_modelo = dir_modelo or os.getenv('GLACIAGUA_MODELO', str(cfg.DIR_MODELO))
    app = FastAPI(title='GlaciAgua - API de riesgo de agua ácida', version='0.2.0')

    origenes = [o.strip() for o in os.getenv(
        'GLACIAGUA_CORS', 'http://localhost:3000,http://localhost:5173,http://localhost:8000,http://127.0.0.1:8000,*').split(',') if o.strip()]
    app.add_middleware(CORSMiddleware, allow_origins=origenes,
                       allow_methods=['GET', 'POST'], allow_headers=['*'])

    estado = {'modelo': None, 'error': None}
    try:
        estado['modelo'] = ModeloRiesgo.cargar(dir_modelo)
    except FileNotFoundError as e:
        estado['error'] = str(e)
    clave = os.getenv('GLACIAGUA_API_KEY')

    def verificar(x_api_key: Optional[str] = Header(None)):
        if clave and not secrets.compare_digest(x_api_key or '', clave):
            raise HTTPException(status_code=401, detail='API key inválida o ausente.')

    def exigir_modelo():
        if estado['modelo'] is None:
            raise HTTPException(status_code=503, detail=estado['error'])
        return estado['modelo']

    @app.get('/salud')
    def salud():
        m = estado['modelo']
        return {'estado': 'ok' if m else 'sin_modelo',
                'modelo_cargado': m is not None,
                'modelo_demo': None if m is None else m.es_demo,
                'detalle': estado['error']}

    @app.get('/modelo', dependencies=[Depends(verificar)])
    def info_modelo():
        return exigir_modelo().meta

    @app.post('/predecir', response_model=RespuestaPrediccion, dependencies=[Depends(verificar)])
    def predecir(entrada: PrediccionIn):
        m = exigir_modelo()
        filas = [x.model_dump() for x in entrada.microcuencas]
        df = pd.DataFrame(filas)
        for c in cfg.FEATURES_NUM:
            df[c] = pd.to_numeric(df[c], errors='coerce')
        resultados = m.predecir(df)
        for r, f in zip(resultados, filas):
            r['id'] = f['id']
        return {'modelo_demo': m.es_demo, 'aviso': m.meta.get('aviso'),
                'version_modelo': m.meta['version'], 'resultados': resultados}

    @app.post('/reentrenar', response_model=ReentrenarOut, dependencies=[Depends(verificar)])
    def reentrenar(entrada: ReentrenarIn):
        from .entrenamiento import entrenar, guardar
        from .simulacion import simular

        dfs = []
        fuente = 'simulado'

        if entrada.filas_reales and len(entrada.filas_reales) > 0:
            df_reales = pd.DataFrame([f.model_dump() for f in entrada.filas_reales])
            dfs.append(df_reales)
            fuente = 'real' if not entrada.aumentar_con_fisica else 'hibrido'

        if entrada.aumentar_con_fisica or len(dfs) == 0:
            df_sim = simular(n_microcuencas=entrada.n_sinteticos)
            dfs.append(df_sim)

        df_total = pd.concat(dfs, ignore_index=True)
        if len(df_total) < 10:
            raise HTTPException(status_code=400, detail="Cantidad insuficiente de datos para entrenar.")

        pipeline_nuevo, meta_nueva = entrenar(df_total, fuente=fuente, n_arboles=entrada.n_arboles)
        guardar(pipeline_nuevo, meta_nueva, dir_modelo)

        # Recarga inmediata en memoria
        estado['modelo'] = ModeloRiesgo.cargar(dir_modelo)
        estado['error'] = None

        return {
            'exito': True,
            'mensaje': f'Modelo re-entrenado exitosamente con {meta_nueva["n_filas"]} filas (modo: {fuente}).',
            'version_nueva': meta_nueva['version'],
            'fuente_datos': fuente,
            'n_filas': meta_nueva['n_filas'],
            'n_microcuencas': meta_nueva['n_microcuencas'],
            'metricas': meta_nueva['metricas_validacion'],
        }

    return app


app = crear_app()
