# GlaciAgua

> **Sistema de Alerta Temprana Comunitaria de Drenaje Ácido de Roca (DAR) y Metales Pesados en la Cordillera Blanca (Huaraz, Áncash)**

[![Plataforma en Producción](https://img.shields.io/badge/Producci%C3%B3n-glaciagua.lat-0284c7?style=flat-square&logo=google-chrome&logoColor=white)](https://glaciagua.lat)
[![Hackathon FACI 2026](https://img.shields.io/badge/UPCH-Hackathon%20FACI%202026-b91c1c?style=flat-square)](https://www.cayetano.edu.pe/)
[![Reto 4](https://img.shields.io/badge/Reto%204-Clima%2C%20Agua%20y%20Gesti%C3%B3n%20de%20Riesgos-15803d?style=flat-square)](#)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-gray?style=flat-square)](LICENSE)

---

## Acceso Rápido

* **Plataforma Web en Producción (24/7):** [https://glaciagua.lat](https://glaciagua.lat)
* **Repositorio Oficial:** [https://github.com/VictorRiveraT/GlaciAgua](https://github.com/VictorRiveraT/GlaciAgua)
* **Documentación Técnica de la Ficha:** `docs/Ficha Técnica.docx`

---

## Descripción del Proyecto

El retroceso acelerado de los glaciares tropicales en la Cordillera Blanca expone rocas con alto contenido de sulfuros (principalmente pirita y arsenopirita). Al oxidarse por contacto con agua y oxígeno, generan **Drenaje Ácido de Roca (DAR)** de origen natural, movilizando metales tóxicos (hierro, aluminio, manganeso, arsénico) hacia quebradas y captaciones de agua para consumo humano, agricultura y ganadería.

**GlaciAgua** es una solución integral de base científico-tecnológica diseñada para cerrar la brecha entre los datos satelitales e hidroquímicos y la toma de decisiones en comunidades altoandinas. Combina:

1. **Un Modelo Físico-Analítico Paramétrico (Score 0-100)** que pondera la roca expuesta, el potencial litológico ácido, la precipitación estacional y la atenuación natural de los bofedales.
2. **Un Microservicio Predictivo de Machine Learning (Random Forest)** con 300 árboles de decisión que estima el pH en el talweg de salida, el margen de incertidumbre ($\pm\sigma$) y el consenso del ensamble.
3. **Una Progressive Web App (PWA) Offline-First** con mapa interactivo Leaflet, soporte bilingüe (Castellano y Quechua Áncash) con audio asistido, diseño visual accesible WCAG y redactor automático de oficios formales para JASS y autoridades.
4. **Un Portal de Ingeniería Ambiental y Ciencia Ciudadana** con autenticación segura por roles (PBKDF2), telemetría de muestreo en campo, reentrenamiento continuo del modelo y despacho automatizado de alertas por correo electrónico (Resend API / SMTP) con zona horaria de Perú (America/Lima UTC-5).

---

## Arquitectura del Sistema

El ecosistema GlaciAgua está construido bajo una arquitectura modular de microservicios contenerizados mediante Docker y Docker Compose:

```
                               ┌─────────────────────────────────────────┐
                               │             USUARIO COMUNAL             │
                               │        (Comunero / JASS / Regante)      │
                               └────────────────────┬────────────────────┘
                                                    │
                                                    ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                    FRONTEND PWA                                          │
│  - React 19 + TypeScript + Vite + Tailwind CSS                                           │
│  - Leaflet Map (Capas satelitales, polígonos GeoJSON y corredor del Río Santa)           │
│  - Módulo Bilingüe (Castellano / Quechua Áncash) con sintetizador y audio local          │
│  - Resiliencia Offline: Service Worker (Cache Storage) e IndexedDB con UUIDv4            │
│  - Accesibilidad WCAG: Formas geométricas (círculo, triángulo, octágono) y alto contraste│
│  - Redactor de Oficios Formales prellenados para JASS / ALA / Municipalidades            │
│  - Portal Técnico para Investigadores y Administradores                                  │
└───────────────────────┬────────────────────────────────────────┬─────────────────────────┘
                        │ HTTP / REST                            │ HTTP / REST
                        ▼                                        ▼
┌───────────────────────────────────────────────┐ ┌──────────────────────────────────────┐
│             BACKEND CORE (FastAPI)            │ │      MICROSERVICIO ML (FastAPI)      │
│  - Python 3.11 + FastAPI + Pydantic v2        │ │  - Python 3.11 + scikit-learn        │
│  - SQLite (WAL mode, consultas preparadas)    │ │  - Random Forest Regressor (300 est) │
│  - Autenticación PBKDF2 (Admin / Especialista)│ │  - Validación cruzada GroupKFold     │
│  - Exportación GeoJSON RFC 7946               │ │  - Predicción de pH e incertidumbre  │
│  - Despacho de Correos (Resend API / SMTP)    │ │  - Pipeline de reentrenamiento       │
│  - Zona Horaria Unificada: America/Lima       │ └──────────────────────────────────────┘
└───────────────────────────────────────────────┘
```

---

## Servicios y Puertos

| Servicio | Tecnología | Puerto Contenedor | Puerto Local | Descripción |
|---|---|---|---|---|
| **Frontend PWA** | React 19 + Vite + Nginx | 80 | 5173 | Interfaz de usuario comunitaria, mapas y portal técnico |
| **Backend Core** | FastAPI + Python 3.11 + SQLite | 8000 | 8000 | Gestión de cuencas, reportes, usuarios y alertas por correo |
| **Microservicio ML** | FastAPI + scikit-learn | 8001 | 8001 | Motor predictivo Random Forest y reentrenamiento |

---

## Conjunto de Datos Final (`data/`)

El repositorio incluye el conjunto de datos final y calibrado en la carpeta `data/`:

* **`data/Dataset.xlsx` (Hoja 1):** Matriz histórica multianual con **884 filas** y **20 columnas** que comprende **26 cuencas a nivel nacional** (Río Santa, Pativilca, Huaura, Mantaro, Vilcanota, Rímac, entre otras) entre los años **2010 y 2026** para las temporadas **Húmeda** y **Seca**. Incluye caudales de aforo calibrados, área de desglaciación, precipitación PISCO/SENAMHI, inventario de bofedales INAIGEM, índices satelitales espectrales NDVI y NDMI procesados en Google Earth Engine, y scores de generación y riesgo.
* **`data/microcuencas_modelo.csv`:** 1,680 observaciones hidrogeológicas a nivel de microcuencas utilizadas por el pipeline de entrenamiento del modelo de Machine Learning (`api/glaciagua/entrenamiento.py`).

---

## Formulación del Modelo de Riesgo Físico

El motor analítico evalúa la interacción causal entre la generación ácida en altas cumbres y la amortiguación natural en cabeceras de cuenca:

$$\text{Generación} = \left(\frac{\text{RocaExpuesta}}{100}\right) \times \left(\frac{\text{PotencialÁcido}}{100}\right)$$

$$\text{Atenuación} = 1 - 0.65 \times \left(\frac{\text{Bofedal}}{100}\right)$$

$$\text{Score} = \min\left(100, \max\left(0, 100 \times \text{Generación} \times \left(\frac{\text{Lluvia}}{100}\right) \times \text{Atenuación}\right)\right)$$

* El factor $\alpha = 0.65$ representa la tasa empírica de retención e inmovilización de metales pesados documentada en humedales altoandinos (Sheoran & Sheoran, 2006; Roesel & Zak, 2022).
* **Semáforo de Riesgo:**
  * **Bajo (0 - 35):** Cumplimiento referencial de ECAs de agua; mantener monitoreo preventivo.
  * **Medio (36 - 65):** Indicios de acidez y aporte metálico moderado; restringir uso crudo para consumo.
  * **Alto (66 - 100):** Aguas con pH crítico y alta lixiviación de metales; desviar captaciones y notificar a la autoridad sanitaria.

---

## Cómo Ejecutar el Proyecto

### Opción A: Despliegue con Docker Compose (Recomendado)

Construye y levanta los 3 microservicios con sus redes y volúmenes persistentes:

```bash
docker compose up -d --build
```

Verificar el estado de los contenedores:

```bash
docker compose ps
```

Detener los servicios:

```bash
docker compose down
```

### Opción B: Ejecución Rápida en Windows (1 Clic)

El proyecto incluye ejecutables para el entorno Windows:

* **`iniciar_docker.bat`**: Compila y levanta la infraestructura en Docker.
* **`iniciar_local.bat`**: Crea entornos virtuales de Python, instala dependencias e inicia el Frontend, Backend y ML API en ventanas separadas.

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

#### 2. Backend API Core
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

## Verificación de Calidad y Pruebas (QA)

### Pruebas Unitarias del Microservicio ML
```bash
$env:PYTHONPATH="api"; python -m pytest api/tests
```
* Valida inferencia predictiva, cálculo de incertidumbre inter-árboles, validación cruzada espacial `GroupKFold` y endpoints `/salud`, `/modelo`, `/predecir`.

### Pruebas del Backend y Zona Horaria Perú
```bash
$env:PYTHONPATH="backend"; python -m pytest backend/
```
* Valida autenticación por hash PBKDF2, aislamiento de roles (`admin` vs `investigador`), telemetría de muestreo, sanitización de datos y envío de correos con hora de Perú (America/Lima UTC-5).

### Validación del Frontend e Internacionalización (i18n)
```bash
cd front
npm run build
```
* Compila TypeScript, empaqueta con Vite y valida al 100% la paridad de las 156 claves bilingües entre `es.json` y `qu.json`.

---

## Equipo de Desarrollo

**Universidad Peruana Cayetano Heredia (UPCH)**  
*Facultad de Ciencias e Ingeniería (FACI) — Hackathon FACI 2026*

* **Victor Daniel Rivera Torres** — Ingeniería Informática
* **Vanesa Doris Rioja Cruz** — Ingeniería Informática
* **Luis Martin Valenzuela Valer** — Ingeniería Informática
* **Flavio Francisco Rabanal Bravo** — Ingeniería Ambiental
* **Juan Martin Aquino Paucar** — Ingeniería Informática

* **Docente Asesor:** Mg. Danny Emerson Robles Sanchez
* **Mentor Asignado:** Omar Illesca Cangalaya
