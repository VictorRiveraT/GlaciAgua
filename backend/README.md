# GlaciAgua - Backend API (FastAPI)

> **API REST del Sistema de Alerta Temprana de Drenaje Ácido de Roca (DAR) en la Cordillera Blanca**

Desarrollada en **Python 3.14 con FastAPI, Pydantic y SQLite**, siguiendo la arquitectura y las variables físicas del documento del proyecto.

---

## Cómo Ejecutar el Servidor Backend

```bash
# 1. Entrar a la carpeta
cd Backend

# 2. Instalar dependencias (si es necesario)
pip install -r requirements.txt

# 3. Iniciar el servidor con recarga automática
python -m uvicorn main:app --reload --port 8000
```

El servidor estará activo en:
**[http://localhost:8000](http://localhost:8000)**

Documentación interactiva automática (Swagger UI):
**[http://localhost:8000/docs](http://localhost:8000/docs)**

---

## Endpoints Implementados

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | Metadata del proyecto y estado de salud |
| `GET` | `/cuencas` | Lista de microcuencas piloto (*Quillcay, Pachacoto, Canray Chico, Río Blanco*) con indicadores y factores |
| `GET` | `/cuencas/{id}` | Ficha técnica y diagnóstica detallada de una cuenca |
| `GET` | `/cuencas/exportar/geojson` | Exportación estándar RFC 7946 GeoJSON para SIG (QGIS / ArcGIS / Leaflet) |
| `GET` | `/mediciones` | Estaciones científicas de monitoreo publicadas por **INAIGEM** y **UPCH** (con filtro de superación de ECA) |
| `POST` | `/simular` | Motor de riesgo físico: calcula generación, amortiguación y semáforo según las 4 variables |
| `POST` | `/reportes` | Registro de reportes comunitarios desde la PWA con **idempotencia por UUID** |
| `GET` | `/reportes` | Listado de reportes ciudadanos almacenados en la base de datos |

---

## Motor de Riesgo Físico (`services/risk_engine.py`)

Implementa la hipótesis matemática consensuada con el asesor de Ingeniería Ambiental:

$$\text{generación} = \text{roca\_expuesta} \times \text{potencial\_ácido}$$
$$\text{amortiguación} = \max(0, 1 - \alpha \times \text{bofedal})$$
$$\text{riesgo} = \text{generación} \times \text{lluvia} \times \text{amortiguación}$$

- **Riesgo Alto:** Score $\ge 65$
- **Riesgo Medio:** Score $35 - 64$
- **Riesgo Bajo:** Score $< 35$

---

## Resiliencia Offline & Idempotencia (`services/db.py`)

Para garantizar que los reportes generados en campo sin internet se puedan sincronizar sin duplicarse:
- La PWA genera un `UUID` único en el teléfono.
- El endpoint `POST /reportes` utiliza `INSERT OR IGNORE` en SQLite.
- Si la conexión falla a mitad de transmisión y el teléfono reintenta, el servidor reconoce el UUID y no duplica el reporte.
