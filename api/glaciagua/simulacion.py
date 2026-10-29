"""Datos SIMULADOS para desarrollar el modelo y la API mientras no hay datos reales.

IMPORTANTE: los coeficientes de abajo están INVENTADOS. Un modelo entrenado con esto
solo aprende las reglas de este simulador, no la realidad. Sirve para probar el flujo
completo (entrenar -> guardar -> servir por API), nunca para sacar conclusiones.
"""
import numpy as np
import pandas as pd

COLUMNAS = [
    'cuenca_id', 'cuenca_madre', 'periodo', 'temporada',
    'area_km2', 'roca_expuesta_km2', 'pct_sulfuros', 'pct_carbonatos',
    'lluvia_mm', 'pct_bofedal', 'pct_veg_humeda_est', 'ph_min', 'simulado',
]


def simular(n_microcuencas=120, anios=range(2018, 2025), semilla=7):
    rng = np.random.default_rng(semilla)
    anios = list(anios)
    madres = ['Santa', 'Pativilca', 'Huaura', 'Mantaro']
    base = pd.DataFrame({
        'cuenca_id': [f'SIM-{i:03d}' for i in range(n_microcuencas)],
        'cuenca_madre': rng.choice(madres, n_microcuencas),
        'area_km2': np.clip(rng.lognormal(np.log(60), 0.9, n_microcuencas), 5, 800),
        'frac_roca': rng.beta(2, 5, n_microcuencas),                 # roca expuesta en el año base
        'pct_sulfuros': rng.beta(2, 3, n_microcuencas) * 60,
        'pct_carbonatos': rng.beta(1.5, 3, n_microcuencas) * 60,
        'pct_bofedal': rng.beta(1.2, 10, n_microcuencas) * 100,
    })
    partes = []
    for anio in anios:
        for temporada in ('seca', 'humeda'):
            d = base.copy()
            hum = temporada == 'humeda'
            d['periodo'] = f'{anio}-{temporada}'
            d['temporada'] = temporada
            # el retroceso glaciar deja más roca expuesta cada año
            crecimiento = 1 + 0.05 * (anio - anios[0])
            frac = np.clip(d['frac_roca'] * 0.5 * crecimiento, 0, 0.6)
            d['roca_expuesta_km2'] = d['area_km2'] * frac
            d['lluvia_mm'] = np.clip(rng.normal(600 if hum else 120, 120 if hum else 50, n_microcuencas), 0, None)
            d['pct_veg_humeda_est'] = np.clip(
                d['pct_bofedal'] * 1.5 + rng.normal(5, 3, n_microcuencas) + (3 if hum else 0), 0, 100)
            # --- reglas INVENTADAS para el pH ---
            exposicion = np.clip(frac / 0.12, 0, 1)
            carga_acida = d['pct_sulfuros'] / 60 * exposicion          # 0-1
            neutraliza = d['pct_carbonatos'] / 60                      # 0-1
            ph = (7.4 - 5.5 * carga_acida + 1.4 * neutraliza
                  + 0.02 * d['pct_bofedal'] + (0.25 if hum else 0.0)
                  + rng.normal(0, 0.35, n_microcuencas))
            d['ph_min'] = np.clip(ph, 3.0, 8.6).round(2)
            partes.append(d)
    out = pd.concat(partes, ignore_index=True)
    out['simulado'] = True
    return out[COLUMNAS]
