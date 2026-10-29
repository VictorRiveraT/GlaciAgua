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

# Variables geoquímicas e hidrológicas derivadas por ingeniería de características
FEATURES_DERIVADAS = [
    'carga_sulfuros',
    'balance_geoquimico',
    'ratio_neutralizacion',
    'roca_relativa',
    'bofedal_relativo',
    'activacion_lluvia',
    'depuracion_bofedal',
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


def agregar_features_geoquimicas(X):
    """Enriquece el DataFrame con variables derivadas basadas en principios de Acid-Base Accounting."""
    df = X.copy()
    for col in FEATURES_NUM:
        if col not in df.columns:
            df[col] = np.nan

    roca = df['roca_expuesta_km2'].fillna(0.0)
    sulfuros = df['pct_sulfuros'].fillna(0.0)
    carbonatos = df['pct_carbonatos'].fillna(0.0)
    lluvia = df['lluvia_mm'].fillna(0.0)
    bofedal = df['pct_bofedal'].fillna(0.0)
    veg_humeda = df['pct_veg_humeda_est'].fillna(0.0)
    area = df['area_km2'].fillna(10.0)

    # 1. Carga neta de roca reactiva expuesta
    df['carga_sulfuros'] = roca * (sulfuros / 100.0)
    # 2. Balance geoquímico neutralización vs generación ácida (ABA)
    df['balance_geoquimico'] = carbonatos - sulfuros
    # 3. Ratio de neutralización
    df['ratio_neutralizacion'] = (carbonatos + 1.0) / (sulfuros + 1.0)
    # 4. Proporción de roca expuesta respecto a cuenca total
    df['roca_relativa'] = roca / (area + 0.1)
    # 5. Densidad de bofedales por área
    df['bofedal_relativo'] = bofedal / (area + 0.1)
    # 6. Activación por transporte de lluvia
    df['activacion_lluvia'] = df['carga_sulfuros'] * (lluvia / 100.0)
    # 7. Capacidad de depuración biológica frente a la carga ácida
    df['depuracion_bofedal'] = (bofedal + veg_humeda) / (df['carga_sulfuros'] + 0.1)

    return df


def nivel_desde_ph(ph):
    """Convierte pH (número o arreglo) en 'Alto' / 'Medio' / 'Bajo'."""
    ph = np.asarray(ph, dtype=float)
    return np.where(ph < UMBRAL_ALTO, 'Alto', np.where(ph < UMBRAL_MEDIO, 'Medio', 'Bajo'))
