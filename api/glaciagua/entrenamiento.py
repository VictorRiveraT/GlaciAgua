"""Entrenamiento del modelo. Se puede correr con datos simulados del Excel o con datos reales.

    python -m glaciagua.entrenamiento                      # usa el dataset de data_simulada por defecto
    python -m glaciagua.entrenamiento --excel ruta.xlsx    # especifica ruta del Excel
    python -m glaciagua.entrenamiento --tabla tabla_maestra.csv \
                                      --etiquetas etiquetas_cuenca_periodo.csv   # datos REALES
"""
import argparse
import json
import os
import shutil
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import GroupKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, FunctionTransformer

from . import config as cfg
from .simulacion import simular

AVISO_SIMULADO = (
    'Modelo entrenado con datos SIMULADOS (dataset sintetico para desarrollo). '
    'Sirve para calibracion, integracion de microservicios y pruebas del sistema GlaciAgua; '
    'sus predicciones no representan aun mediciones oficiales en campo.'
)


def safe_read_excel_or_csv(path):
    """Carga un archivo Excel o CSV de forma resiliente en Windows (evita bloqueo si Excel está abierto)."""
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"No se encontró el archivo: {p}")

    if p.suffix.lower() == '.csv':
        return pd.read_csv(p)

    # Si es Excel (.xlsx), usar copia temporal si el archivo estuviera bloqueado por Excel
    try:
        return pd.read_excel(p, sheet_name='Microcuencas (modelo)')
    except PermissionError:
        tmp = Path(tempfile.gettempdir()) / f"glaciagua_tmp_{os.getpid()}.xlsx"
        shutil.copy2(p, tmp)
        try:
            df = pd.read_excel(tmp, sheet_name='Microcuencas (modelo)')
        finally:
            if tmp.exists():
                os.remove(tmp)
        return df


def buscar_dataset_simulado():
    """Busca automáticamente el dataset simulado en las rutas estándar del proyecto."""
    raiz = cfg.RAIZ
    candidatos = [
        raiz.parent / 'data_simulada' / 'Dataset_simulado_completo.xlsx',
        raiz.parent / 'data_simulada' / 'microcuencas_modelo.csv',
        raiz / 'data_simulada' / 'Dataset_simulado_completo.xlsx',
        raiz / 'data_simulada' / 'microcuencas_modelo.csv',
        Path('data_simulada') / 'Dataset_simulado_completo.xlsx',
        Path('data_simulada') / 'microcuencas_modelo.csv',
    ]
    for c in candidatos:
        if c.exists():
            return c
    return None


def construir_pipeline(n_arboles=400, semilla=42):
    features_totales = cfg.FEATURES_NUM + cfg.FEATURES_DERIVADAS
    pre = ColumnTransformer([
        ('num', SimpleImputer(strategy='median'), features_totales),
        ('cat', OneHotEncoder(categories=[cfg.TEMPORADAS], handle_unknown='ignore',
                              sparse_output=False), [cfg.FEATURE_CAT]),
    ])
    rf = RandomForestRegressor(n_estimators=n_arboles, min_samples_leaf=2, max_depth=16,
                               n_jobs=-1, random_state=semilla)
    return Pipeline([
        ('fe', FunctionTransformer(cfg.agregar_features_geoquimicas, validate=False)),
        ('pre', pre),
        ('rf', rf)
    ])


def entrenar(df, fuente, n_arboles=400, semilla=42):
    """Devuelve (pipeline_entrenado, metadata). La validación agrupa por microcuenca:
    una misma microcuenca nunca está a la vez en entrenamiento y en prueba."""
    columnas = cfg.FEATURES_NUM + [cfg.FEATURE_CAT]
    faltan = [c for c in columnas + [cfg.TARGET, 'cuenca_id'] if c not in df.columns]
    if faltan:
        raise ValueError(f'Faltan columnas en los datos: {faltan}')
    df = df.dropna(subset=[cfg.TARGET]).reset_index(drop=True)
    X, y, grupos = df[columnas], df[cfg.TARGET].astype(float), df['cuenca_id']

    k = min(5, grupos.nunique())
    if k < 2:
        raise ValueError('Se necesitan al menos 2 microcuencas distintas para validar el modelo.')
    pred = np.full(len(df), np.nan)
    for tr, te in GroupKFold(n_splits=k).split(X, y, grupos):
        m = construir_pipeline(n_arboles, semilla).fit(X.iloc[tr], y.iloc[tr])
        pred[te] = m.predict(X.iloc[te])

    final = construir_pipeline(n_arboles, semilla).fit(X, y)
    nombres = [n.split('__', 1)[-1] for n in final.named_steps['pre'].get_feature_names_out()]
    importancias = dict(zip(nombres, final.named_steps['rf'].feature_importances_.round(4).tolist()))
    
    mae = float(mean_absolute_error(y, pred))
    rmse = float(np.sqrt(mean_squared_error(y, pred)))
    r2 = float(r2_score(y, pred))
    acierto_nivel = float((cfg.nivel_desde_ph(pred) == cfg.nivel_desde_ph(y)).mean())

    meta = {
        'version': datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S'),
        'fuente_datos': fuente,                       # 'simulado' o 'real'
        'aviso': AVISO_SIMULADO if fuente == 'simulado' else None,
        'n_filas': int(len(df)),
        'n_microcuencas': int(grupos.nunique()),
        'variable_objetivo': cfg.TARGET,
        'features_num': cfg.FEATURES_NUM,
        'features_derivadas': cfg.FEATURES_DERIVADAS,
        'feature_cat': cfg.FEATURE_CAT,
        'umbrales_riesgo': {'alto_menor_que': cfg.UMBRAL_ALTO, 'medio_menor_que': cfg.UMBRAL_MEDIO},
        'metricas_validacion': {
            'mae_ph': round(mae, 3),
            'rmse_ph': round(rmse, 3),
            'r2': round(r2, 3),
            'acierto_nivel': round(acierto_nivel, 3),
            'esquema': f'{k} bloques por microcuenca (GroupKFold)',
        },
        'importancia_variables': importancias,
        'rangos_entrenamiento': {c: [float(df[c].min()), float(df[c].max())] for c in cfg.FEATURES_NUM},
    }
    return final, meta


def guardar(pipeline, meta, dir_salida):
    dir_salida = Path(dir_salida)
    dir_salida.mkdir(parents=True, exist_ok=True)
    joblib.dump(pipeline, dir_salida / 'modelo.joblib')
    (dir_salida / 'metadata.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding='utf-8')


def cargar_reales(ruta_tabla, ruta_etiquetas):
    """Une la tabla maestra con las etiquetas medidas (pH) por cuenca_id y periodo."""
    tabla = pd.read_csv(ruta_tabla)
    et = pd.read_csv(ruta_etiquetas)
    df = tabla.merge(et[['cuenca_id', 'periodo', cfg.TARGET]], on=['cuenca_id', 'periodo'], how='inner')
    df['temporada'] = df['periodo'].astype(str).str.split('-').str[-1].str.replace('húmeda', 'humeda')
    return df.dropna(subset=[cfg.TARGET])


def main(argv=None):
    p = argparse.ArgumentParser(description='Entrena el modelo de riesgo de agua ácida.')
    p.add_argument('--tabla', help='CSV de la tabla maestra (datos reales)')
    p.add_argument('--etiquetas', help='CSV de etiquetas con ph_min (datos reales)')
    p.add_argument('--datos', help='Ruta al archivo Excel o CSV de datos simulados')
    p.add_argument('--salida', default=str(cfg.DIR_MODELO))
    p.add_argument('--arboles', type=int, default=300)
    a = p.parse_args(argv)

    if a.tabla or a.etiquetas:
        if not (a.tabla and a.etiquetas):
            raise SystemExit('Para datos reales hay que dar --tabla y --etiquetas.')
        df, fuente = cargar_reales(a.tabla, a.etiquetas), 'real'
        if len(df) < cfg.MIN_FILAS_REALES:
            raise SystemExit(
                f'Solo hay {len(df)} filas con etiqueta real; se necesitan al menos {cfg.MIN_FILAS_REALES} '
                'para entrenar. Con tan pocos datos usa el índice de riesgo por reglas y valídalo con '
                'las mediciones, o consigue más puntos de monitoreo.')
    else:
        ruta_datos = a.datos or buscar_dataset_simulado()
        if ruta_datos:
            print(f">>> Cargando dataset simulado desde: {ruta_datos}")
            df = safe_read_excel_or_csv(ruta_datos)
            fuente = 'simulado'
        else:
            print('>>> Dataset no encontrado en disco. Generando datos simulados al vuelo.')
            df, fuente = simular(120), 'simulado'

    pipe, meta = entrenar(df, fuente, n_arboles=a.arboles)
    guardar(pipe, meta, a.salida)
    print(f"\n[OK] Modelo guardado en: {a.salida}")
    print(f"     Filas: {meta['n_filas']}, Microcuencas: {meta['n_microcuencas']}, Fuente: {fuente}")
    print('     Metricas validacion:', json.dumps(meta['metricas_validacion'], ensure_ascii=False))
    print('     Importancia variables:', json.dumps(meta['importancia_variables'], ensure_ascii=False))


if __name__ == '__main__':
    main()
