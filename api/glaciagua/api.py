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
from typing import Literal, Optional

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


def crear_app(dir_modelo=None):
    dir_modelo = dir_modelo or os.getenv('GLACIAGUA_MODELO', str(cfg.DIR_MODELO))
    app = FastAPI(title='GlaciAgua - API de riesgo de agua ácida', version='0.1.0')

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

    return app


app = crear_app()
