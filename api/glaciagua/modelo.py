"""Carga del modelo entrenado y predicción con una medida de incertidumbre."""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from . import config as cfg


class ModeloRiesgo:
    def __init__(self, pipeline, meta):
        self.pipeline = pipeline
        self.meta = meta

    @classmethod
    def cargar(cls, dir_modelo):
        d = Path(dir_modelo)
        ruta_m, ruta_j = d / 'modelo.joblib', d / 'metadata.json'
        if not (ruta_m.exists() and ruta_j.exists()):
            raise FileNotFoundError(
                f'No hay un modelo entrenado en {d}. Corre: python -m glaciagua.entrenamiento')
        return cls(joblib.load(ruta_m), json.loads(ruta_j.read_text(encoding='utf-8')))

    @property
    def es_demo(self):
        return self.meta.get('fuente_datos') != 'real'

    def predecir(self, df):
        """df con las columnas FEATURES_NUM + 'temporada' (los números pueden venir vacíos)."""
        X = df[cfg.FEATURES_NUM + [cfg.FEATURE_CAT]]
        pre, rf = self.pipeline.named_steps['pre'], self.pipeline.named_steps['rf']
        Xt = pre.transform(X)
        por_arbol = np.stack([t.predict(Xt) for t in rf.estimators_])     # (árboles, filas)
        ph = por_arbol.mean(axis=0)
        sd = por_arbol.std(axis=0)
        nivel = cfg.nivel_desde_ph(ph)
        acuerdo = (cfg.nivel_desde_ph(por_arbol) == nivel).mean(axis=0)    # % de árboles que coinciden

        rangos = self.meta['rangos_entrenamiento']
        salida = []
        for i in range(len(df)):
            avisos = []
            vacios = [c for c in cfg.FEATURES_NUM if pd.isna(X.iloc[i][c])]
            if vacios:
                avisos.append(f'Faltan datos ({", ".join(vacios)}); se usó la mediana del entrenamiento.')
            for c in cfg.FEATURES_NUM:
                v = X.iloc[i][c]
                if pd.notna(v) and not (rangos[c][0] <= v <= rangos[c][1]):
                    avisos.append(f'{c} está fuera del rango visto en el entrenamiento '
                                  f'({rangos[c][0]:.1f} a {rangos[c][1]:.1f}).')
            salida.append({
                'ph_estimado': round(float(ph[i]), 2),
                'incertidumbre_ph': round(float(sd[i]), 2),
                'nivel_riesgo': str(nivel[i]),
                'acuerdo_arboles': round(float(acuerdo[i]), 2),
                'advertencias': avisos,
            })
        return salida
