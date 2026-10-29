# GlaciAgua - API del modelo de riesgo de agua ácida

Servicio REST (FastAPI) que, dada una microcuenca y una temporada, estima el **pH mínimo** en su salida y lo clasifica en un **nivel de riesgo** (Alto / Medio / Bajo).

> **Aviso sobre datos simulados:**
> Por ahora el modelo base incluye entrenamiento con datos simulados (`glaciagua/simulacion.py`) o datos históricos para desarrollo. La API incluye en cada respuesta el campo `modelo_demo: true/false` para transparencia del sistema.

---

## Estructura

```
api/
  requirements.txt
  Dockerfile
  glaciagua/
    config.py          Variables, umbrales de riesgo, rutas
    simulacion.py      Generación de datos sintéticos controlados
    entrenamiento.py   Entrena, valida (GroupKFold) y guarda el modelo
    modelo.py          Carga el ensamble Random Forest y predice con incertidumbre
    api.py             Servidor FastAPI y endpoints REST
  tests/
    test_api.py        Pruebas automáticas unitarias
```

---

## Cómo Correrlo Localmente

### En Windows (PowerShell)

1. Entra a la carpeta:
   ```powershell
   cd api
   ```
2. Crea y activa el entorno virtual:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
3. Instala las dependencias:
   ```powershell
   pip install -r requirements.txt
   ```
4. Entrena el modelo (genera `modelo/modelo.joblib` y `modelo/metadata.json`):
   ```powershell
   python -m glaciagua.entrenamiento
   ```
5. Inicia la API en el puerto 8001:
   ```powershell
   python -m uvicorn glaciagua.api:app --reload --port 8001
   ```
   Abre http://localhost:8001/docs para explorar la documentación interactiva Swagger UI.

6. Ejecutar pruebas automáticas:
   ```powershell
   pytest
   ```

---

## Rutas y Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/salud` | Estado del servicio y confirmación de modelo cargado |
| GET | `/modelo` | Metadatos, métricas de validación cruzada y pesos de variables |
| POST | `/predecir` | Inferencia predictiva para un lote de 1 a 500 microcuencas |

### Ejemplo de petición a `/predecir`:

```json
{
  "microcuencas": [
    {
      "id": "quillcay-2026-seca",
      "temporada": "seca",
      "area_km2": 249.5,
      "roca_expuesta_km2": 35.2,
      "pct_sulfuros": 48.0,
      "pct_carbonatos": 10.0,
      "lluvia_mm": 110.0,
      "pct_bofedal": 2.5,
      "pct_veg_humeda_est": 8.0
    }
  ]
}
```

### Respuesta del Ensamble:

```json
{
  "modelo_demo": true,
  "aviso": "Modelo entrenado con datos de desarrollo.",
  "version_modelo": "20261028-rf-300",
  "resultados": [
    {
      "id": "quillcay-2026-seca",
      "ph_estimado": 4.01,
      "incertidumbre_ph": 0.43,
      "nivel_riesgo": "Alto",
      "acuerdo_arboles": 0.99,
      "advertencias": []
    }
  ]
}
```

- `incertidumbre_ph`: Desviación estándar entre los 300 árboles del bosque.
- `acuerdo_arboles`: Fracción de estimadores que coinciden con la categorización final de riesgo.

---

## Configuración por Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|---|---|---|
| `GLACIAGUA_MODELO` | Carpeta contenedora del modelo serializado | `./modelo` |
| `GLACIAGUA_CORS` | Orígenes web permitidos para peticiones CORS | `http://localhost:5173,http://localhost:8000,*` |
| `GLACIAGUA_API_KEY` | Clave de seguridad opcional para proteger las rutas de inferencia | Ninguna (abierto para desarrollo) |
