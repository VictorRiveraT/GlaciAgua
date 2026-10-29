# GlaciAgua - API del modelo de riesgo de agua ácida

Servicio REST (FastAPI) que, dada una microcuenca y una temporada, estima el **pH mínimo**
en su salida y lo convierte en un **nivel de riesgo** (Alto / Medio / Bajo).

> **ATENCIÓN: por ahora el modelo se entrena con datos SIMULADOS.**
> Los coeficientes del simulador (`glaciagua/simulacion.py`) están inventados. El modelo solo
> aprende esas reglas, así que sus predicciones NO representan la realidad. Sirve para
> desarrollar y probar el sistema completo. La API lo avisa en cada respuesta con
> `modelo_demo: true` para que el frontend muestre un aviso visible.

## Estructura

```
glaciagua_api/
  requirements.txt
  glaciagua/
    config.py          variables, umbrales de riesgo, rutas
    simulacion.py      datos simulados (mismo formato que la tabla maestra)
    entrenamiento.py   entrena, valida y guarda el modelo (datos simulados o reales)
    modelo.py          carga el modelo y predice con incertidumbre
    api.py             API FastAPI
  tests/test_api.py    pruebas automáticas
```

## Cómo correrlo en Windows (PowerShell)

Todos los comandos se escriben en una ventana de PowerShell (o en la terminal de VS Code,
que es PowerShell). Sirve con Python 3.10 o superior.

1. Descomprime el zip y entra a la carpeta (cambia la ruta por la tuya):
   ```powershell
   cd C:\ruta\a\glaciagua_api
   ```
2. Crea y activa un entorno virtual (se hace una sola vez; la segunda línea se repite cada vez
   que abras una ventana nueva):
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
   Si PowerShell dice que los scripts están bloqueados, corre antes
   `Set-ExecutionPolicy -Scope Process Bypass` y vuelve a activar.
3. Instala las dependencias:
   ```powershell
   pip install -r requirements.txt
   ```
4. Entrena el modelo con datos simulados (crea la carpeta `modelo/`):
   ```powershell
   python -m glaciagua.entrenamiento
   ```
5. Levanta la API y deja esa ventana abierta:
   ```powershell
   uvicorn glaciagua.api:app --reload --port 8000
   ```
   Abre http://localhost:8000/docs en el navegador: ahí puedes probar todas las rutas.
6. Pruebas automáticas (en otra ventana de PowerShell, con el entorno activado):
   ```powershell
   pytest
   ```

## Rutas

| Método | Ruta | Para qué |
|---|---|---|
| GET | `/salud` | ¿Está el servicio vivo y con modelo cargado? (no pide clave) |
| GET | `/modelo` | Versión, fuente de datos, métricas, importancia de variables, rangos y umbrales |
| POST | `/predecir` | Predice una o hasta 500 microcuencas |

Ejemplo de petición a `/predecir` (los números pueden omitirse; se usa la mediana del entrenamiento y
la respuesta lo advierte):

```json
{
  "microcuencas": [
    {"id": "quillcay-2024-seca", "temporada": "seca", "area_km2": 249.5,
     "roca_expuesta_km2": 12.0, "pct_sulfuros": 30, "pct_carbonatos": 10,
     "lluvia_mm": 110, "pct_bofedal": 2.5, "pct_veg_humeda_est": 8}
  ]
}
```

Respuesta:

```json
{
  "modelo_demo": true,
  "aviso": "Modelo entrenado con datos SIMULADOS. ...",
  "version_modelo": "20261028-234444",
  "resultados": [
    {"id": "quillcay-2024-seca", "ph_estimado": 6.1, "incertidumbre_ph": 0.4,
     "nivel_riesgo": "Medio", "acuerdo_arboles": 0.82, "advertencias": []}
  ]
}
```

- `incertidumbre_ph`: desviación estándar entre los árboles del bosque (no es un intervalo de confianza).
- `acuerdo_arboles`: fracción de árboles que coinciden con el nivel de riesgo final (no es una probabilidad calibrada).
- `advertencias`: datos faltantes o valores fuera del rango visto en el entrenamiento.

Llamada desde el backend de la web (JavaScript):

```js
const r = await fetch('http://localhost:8000/predecir', {
  method: 'POST',
  headers: {'Content-Type': 'application/json' /* , 'X-API-Key': process.env.GLACIAGUA_API_KEY */},
  body: JSON.stringify({microcuencas: [{temporada: 'seca', pct_sulfuros: 30}]}),
});
const datos = await r.json();
```

## Configuración (variables de entorno, opcionales)

| Variable | Efecto |
|---|---|
| `GLACIAGUA_MODELO` | Carpeta del modelo (por defecto `./modelo`) |
| `GLACIAGUA_CORS` | Orígenes del frontend permitidos, separados por coma |
| `GLACIAGUA_API_KEY` | Si se define, `/modelo` y `/predecir` exigen el encabezado `X-API-Key` |

## Pasar de datos simulados a datos reales

Cuando existan las tablas reales (`tabla_maestra.csv` y `etiquetas_cuenca_periodo.csv`, con las
columnas de `config.py` y `ph_min`):

```powershell
python -m glaciagua.entrenamiento --tabla tabla_maestra.csv --etiquetas etiquetas_cuenca_periodo.csv
```

- El script se **niega a entrenar con menos de 30 filas reales** (`MIN_FILAS_REALES` en `config.py`).
  Ese mínimo es solo un filtro de cordura: para conclusiones sólidas hacen falta bastantes más
  microcuencas medidas en distintas temporadas.
- La validación agrupa por microcuenca, así que una misma microcuenca nunca está a la vez en
  entrenamiento y en prueba.
- El modelo guardado queda con `fuente_datos: "real"` y la API deja de marcarlo como demo.

## Pendiente de definir con el profesor

- Cortes del nivel de riesgo (`UMBRAL_ALTO` y `UMBRAL_MEDIO` en `config.py`; hoy 5,0 y 6,5, sin validar).
- Si el producto predice pH, un nivel categórico o ambos.
- Qué variables entran de verdad al modelo (hoy las columnas de la tabla maestra).
