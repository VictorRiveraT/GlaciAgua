# GlaciAgua

> **Sistema de Alerta Temprana Comunitaria de Drenaje Ácido de Roca (DAR) y Metales Pesados en la Cordillera Blanca (Huaraz, Áncash)**

Plataforma integral desarrollada para el monitoreo geoquímico, evaluación de riesgo físico por retroceso glaciar, inferencia predictiva con Machine Learning y alerta comunitaria ante la contaminación de aguas por metales pesados en la cuenca del Río Santa.

---

## Arquitectura del Sistema

GlaciAgua opera como una arquitectura de microservicios contenerizada mediante Docker Compose:

1. **Frontend PWA (`front/`)**
   - Interfaz web interactiva y Progressive Web App (PWA) desarrollada en React 19, TypeScript, Vite, Tailwind CSS y Leaflet.
   - Mapa hidrográfico interactivo con polígonos de cuencas de relleno cartográfico semitransparente, enfoque cinemático automático (`flyToBounds`), corredores fluviales de alto contraste y capas conmutables.
   - Tarjeta predictiva de Machine Learning en tiempo real: cálculo de pH estimado, margen de incertidumbre (+/- sigma), acuerdo de consenso entre 300 estimadores y matriz de 8 variables HydroBASINS.
   - Doble validación explicable: contraste simultáneo entre el modelo físico analítico (Score sobre 100) y el modelo de Machine Learning.
   - Filtros dinámicos por nivel de riesgo (Todos, Alto, Medio, Bajo) en el listado de microcuencas.
   - Simulador en vivo del motor físico con sliders interactivos y presets por cuenca.
   - Base de datos interactiva con estaciones hidroquímicas INAIGEM / UPCH y contraste contra ECA Agua (D.S. 004-2017-MINAM).
   - Formulario de reportes comunitarios con soporte offline, cola local y geolocalización GPS.
   - Generador automático de oficios formales para juntas de regantes y JASS.
   - Puerto de servicio: **5173**

2. **Backend API REST (`backend/`)**
   - Servidor desarrollado en Python 3.11 con FastAPI, Pydantic y SQLite.
   - Endpoints para gestión de microcuencas, mediciones hidroquímicas, exportación GeoJSON estándar RFC 7946 y sincronización idempotente por UUID.
   - Cliente proxy integrado hacia el microservicio de Machine Learning (`/ml/salud`, `/ml/modelo`, `/ml/predecir`).
   - Implementación del motor de cálculo de riesgo físico analítico.
   - Puerto de servicio: **8000** (Swagger UI en `/docs`)

3. **Microservicio Predictivo de Machine Learning (`api/`)**
   - Servicio analítico especializado desarrollado en Python 3.11 con FastAPI y scikit-learn.
   - Modelo `RandomForestRegressor` con 300 árboles de decisión entrenado sobre 8 variables hidrogeológicas a nivel HydroBASINS 12:
     - `area_km2`: Superficie total de captación.
     - `roca_expuesta_km2`: Área desglaciada reactiva reciente.
     - `pct_sulfuros`: Concentración litológica de pirita y sulfuros oxidables.
     - `pct_carbonatos`: Capacidad de neutralización natural.
     - `lluvia_mm`: Precipitación acumulada estacional (SENAMHI / PISCO).
     - `pct_bofedal`: Cobertura de bofedales amortiguadores.
     - `pct_veg_humeda_est`: Vegetación de humedales estacionales.
     - `temporada`: Factor estacional (`seca` vs `humeda`).
   - Esquema de validación cruzada espacial `GroupKFold` agrupado por cuenca madre para evitar fuga de datos entre afluentes vecinos.
   - Estimación de incertidumbre mediante la varianza predictiva entre los 300 árboles del ensamble.
   - Puerto de servicio: **8001** (Swagger UI en `/docs`)

---

## Puertos y Servicios

| Servicio | Tecnología | Puerto Local | Documentación / URL |
|---|---|---|---|
| Frontend PWA | React 19 + Vite + Nginx | 5173 | http://localhost:5173 |
| Backend Core | FastAPI + SQLite | 8000 | http://localhost:8000/docs |
| API Machine Learning | FastAPI + scikit-learn | 8001 | http://localhost:8001/docs |

---

## Cómo Ejecutar el Sistema

### Opción A: Despliegue con Docker Compose (Recomendado)

Con un solo comando se compilan y levantan los 3 microservicios en sus respectivos contenedores:

```bash
docker compose up -d --build
```

Para verificar que todos los contenedores estén activos:

```bash
docker compose ps
```

Para detener los servicios:

```bash
docker compose down
```

### Opción B: Ejecución en Windows con 1 Clic

El repositorio incluye scripts ejecutables para Windows:

- **`iniciar_docker.bat`**: Construye e inicia la infraestructura completa en Docker.
- **`iniciar_local.bat`**: Configura entornos virtuales de Python, instala dependencias e inicia los tres procesos localmente en terminales separadas.

### Opción C: Ejecución Manual en Terminales Separadas

#### 1. Microservicio de Machine Learning

```bash
cd api
python -m venv .venv
.\.venv\Scripts\activate    # En Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python -m glaciagua.entrenamiento
python -m uvicorn glaciagua.api:app --reload --port 8001
```

#### 2. Backend API

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate    # En Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

#### 3. Frontend PWA

```bash
cd front
npm install
npm run dev
```

---

## Motor de Riesgo Físico y Validación Dual

GlaciAgua valida el peligro hídrico contrastando dos enfoques complementarios:

### 1. Formulación Físico-Ambiental Analítica

Implementa la hipótesis ambiental consensuada para la Cordillera Blanca:

$$\text{generación} = \text{roca\_expuesta} \times \text{potencial\_ácido}$$
$$\text{amortiguación} = \max(0, 1 - \alpha \times \text{bofedal})$$
$$\text{riesgo} = \text{generación} \times \text{lluvia} \times \text{amortiguación}$$

- **Riesgo Alto:** Score >= 65 (pH < 4.5, alta carga de metales)
- **Riesgo Medio:** Score 35 - 64 (pH 4.5 - 6.0, aporte moderado)
- **Riesgo Bajo:** Score < 35 (pH > 6.5, dentro de estándares ECA)

### 2. Modelo Predictivo Random Forest

El ensamble de 300 árboles toma las 8 variables geomorfológicas y predice el pH resultante en el talweg de salida con su respectivo intervalo de confianza:

$$\hat{\text{pH}} = \frac{1}{B} \sum_{b=1}^{B} T_b(x), \quad \sigma_{\text{pH}} = \sqrt{\frac{1}{B} \sum_{b=1}^{B} (T_b(x) - \hat{\text{pH}})^2}$$

Ambos modelos convergen en la categorización de microcuencas prioritarias como Quillcay y Pachacoto (Nivel Alto / Crítico).

---

## Fuentes de Datos y Validación Científica

- **Topografía e Hidrografía:** OpenStreetMap (OSM), Instituto Geográfico Nacional (IGN), Shuttle Radar Topography Mission (SRTM 30m), HydroBASINS Nivel 12.
- **Parámetros Hidroquímicos:** Estudios de campo publicados por INAIGEM (Instituto Nacional de Investigación en Glaciares y Ecosistemas de Montaña) y UPCH (Universidad Peruana Cayetano Heredia).
- **Estándares Normativos:** Estándares de Calidad Ambiental para Agua (D.S. N° 004-2017-MINAM, Categoría 1-A2 para aguas que pueden ser potabilizadas con tratamiento convencional y Categoría 3 para riego y bebida de animales).
