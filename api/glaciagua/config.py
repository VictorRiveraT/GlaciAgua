"""Configuración central del modelo de riesgo de agua ácida (GlaciAgua)."""
from pathlib import Path

import numpy as np

RAIZ = Path(__file__).resolve().parent.parent
DIR_MODELO = RAIZ / 'modelo'

# Variables de entrada. Los nombres coinciden con tabla_maestra.csv del notebook.
FEATURES_NUM = [
    'area_km2',
    'roca_expuesta_km2',
    'pct_sulfuros',
    'pct_carbonatos',
    'lluvia_mm',
    'pct_bofedal',
    'pct_veg_humeda_est',
]
FEATURE_CAT = 'temporada'
TEMPORADAS = ['seca', 'humeda']
TARGET = 'ph_min'          # variable a predecir (pH mínimo en la salida de la microcuenca)

# Niveles de riesgo a partir del pH estimado.
# PROPUESTA SIN VALIDAR: confirmar los cortes con el profesor / estándares de calidad de agua.
UMBRAL_ALTO = 5.0          # pH menor a esto  -> riesgo Alto
UMBRAL_MEDIO = 6.5         # pH menor a esto  -> riesgo Medio; el resto -> Bajo

# Con menos filas reales que esto no se entrena: el resultado no significaría nada.
MIN_FILAS_REALES = 30


def nivel_desde_ph(ph):
    """Convierte pH (número o arreglo) en 'Alto' / 'Medio' / 'Bajo'."""
    ph = np.asarray(ph, dtype=float)
    return np.where(ph < UMBRAL_ALTO, 'Alto', np.where(ph < UMBRAL_MEDIO, 'Medio', 'Bajo'))
