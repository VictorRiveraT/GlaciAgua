from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from enum import Enum
from datetime import datetime

class SeasonEnum(str, Enum):
    SECA = "seca"
    HUMEDA = "humeda"

class RiskLevelEnum(str, Enum):
    BAJO = "Bajo"
    MEDIO = "Medio"
    ALTO = "Alto"

class FactoresFisicos(BaseModel):
    roca_expuesta: float = Field(..., ge=0, le=100, description="Porcentaje de roca recién expuesta por retroceso glaciar")
    potencial_acido: float = Field(..., ge=0, le=100, description="Porcentaje de litologías con sulfuros oxidables (pirita)")
    lluvia: float = Field(..., ge=0, le=100, description="Volumen relativo de precipitación y escorrentía")
    bofedal_depuracion: float = Field(..., ge=0, le=100, description="Porcentaje de amortiguación natural por bofedales")

class SimulacionRequest(BaseModel):
    roca_expuesta: float = Field(default=85.0, ge=0, le=100)
    potencial_acido: float = Field(default=75.0, ge=0, le=100)
    lluvia: float = Field(default=60.0, ge=0, le=100)
    bofedal: float = Field(default=30.0, ge=0, le=100)
    alpha: float = Field(default=0.75, ge=0.0, le=1.0, description="Factor de eficiencia depuradora del humedal")

class SimulacionResponse(BaseModel):
    generacion_potencial: float
    amortiguacion_factor: float
    riesgo_bruto: float
    score_normalizado: int
    nivel_riesgo: RiskLevelEnum
    formula_desglose: str
    diagnostico: str

class ReporteCreate(BaseModel):
    id: str = Field(..., description="UUID generado en el cliente para garantizar idempotencia offline")
    cuenca_id: str
    quebrada: str
    lat: float
    lng: float
    precision_m: Optional[float] = 10.0
    color_agua: str
    olor_sabor: Optional[str] = None
    usos_afectados: List[str] = Field(default_factory=list)
    ph_medido: Optional[float] = None
    tiene_foto: bool = False
    foto_base64: Optional[str] = None
    comentarios: Optional[str] = ""
    simulado: bool = True

class ReporteResponse(BaseModel):
    id: str
    cuenca_id: str
    quebrada: str
    lat: float
    lng: float
    fecha: str
    color_agua: str
    ph_medido: Optional[float]
    sincronizado: bool
    mensaje: str

class MedicionResponse(BaseModel):
    id: str
    cuenca_id: str
    quebrada: str
    punto: str
    lat: float
    lng: float
    fecha: str
    temporada: str
    fuente: str
    ph: float
    conductividad: float
    hierro: float
    aluminio: float
    manganeso: float
    plomo: float
    cumple_eca: bool
    notas: str

class CuencaResumen(BaseModel):
    id: str
    slug: str
    nombre: str
    provincia: str
    distrito: str
    area_km2: float
    glaciares: List[str]
    quebradas: List[str]
    poblacion_dependiente: str
    nivel_riesgo: Dict[str, str]
    score_riesgo: Dict[str, int]
    factores: Dict[str, Dict[str, float]]
    ultima_medicion: Dict[str, Any]
    centroide: Dict[str, float]

class GeoJSONGeometry(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]]

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    properties: Dict[str, Any]
    geometry: GeoJSONGeometry

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]
