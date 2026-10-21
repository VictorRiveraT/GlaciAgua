# GlaciAgua

> **Sistema de Alerta Temprana Comunitaria de Drenaje Ácido de Roca (DAR) y Metales Pesados en la Cordillera Blanca (Huaraz, Áncash)**

Plataforma integral desarrollada para el monitoreo geoquímico, evaluación de riesgo físico por retroceso glaciar y alerta comunitaria ante la contaminación de aguas por metales pesados en la cuenca del Río Santa.

---

## Componentes del Proyecto

El repositorio está organizado en dos componentes principales:

1. **Frontend PWA (`/Proyecto`)**
   - Interfaz web interactiva y Progressive Web App (PWA) desarrollada en React 19, TypeScript, Vite, Tailwind CSS y Leaflet.
   - Mapa hidrográfico de alta fidelidad con más de 8,700 puntos reales de la red fluvial (Río Santa y quebradas Shallap, Cojup, Quilcayhuanca, Pumapampa, Santa Cruz).
   - Panel de explicabilidad del riesgo según las 4 variables físicas del proyecto.
   - Simulador en vivo del motor de riesgo físico.
   - Base de datos interactiva con estaciones hidroquímicas INAIGEM / UPCH y contraste contra ECA Agua (D.S. 004-2017-MINAM).
   - Formulario de reportes comunitarios con soporte offline y geolocalización GPS.
   - Generador automático de oficios formales para juntas de regantes y JASS.

2. **Backend API REST (`/Backend`)**
   - Servidor desarrollado en Python 3.14 con FastAPI, Pydantic y SQLite.
   - Endpoints para microcuencas, mediciones hidroquímicas, exportación GeoJSON estándar RFC 7946 y sincronización idempotente por UUID.
   - Implementación del motor de cálculo de riesgo físico.

---

## Cómo Ejecutar el Proyecto

### 1. Backend (FastAPI)

```bash
cd Backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

- API activa en: [http://localhost:8000](http://localhost:8000)
- Documentación interactiva (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend (React + Vite)

```bash
cd Proyecto
npm install
npm run dev
```

- Aplicación web activa en: [http://localhost:5173](http://localhost:5173)

---

## Motor de Riesgo Físico

El cálculo del riesgo hídrico implementa la formulación físico-ambiental consensuada para la Cordillera Blanca:

$$\text{generación} = \text{roca\_expuesta} \times \text{potencial\_ácido}$$
$$\text{amortiguación} = \max(0, 1 - \alpha \times \text{bofedal})$$
$$\text{riesgo} = \text{generación} \times \text{lluvia} \times \text{amortiguación}$$

### Escala de Evaluación

- **Riesgo Crítico / Alto:** Score $\ge 65$ (pH $< 4.5$, alta carga de metales)
- **Riesgo Medio:** Score $35 - 64$ (pH $4.5 - 6.0$, aporte moderado)
- **Riesgo Bajo:** Score $< 35$ (pH $> 6.5$, dentro de estándares ECA)

---

## Fuentes de Datos y Validación Científica

- **Topografía e Hidrografía:** OpenStreetMap, Instituto Geográfico Nacional (IGN), Shuttle Radar Topography Mission (SRTM 30m).
- **Parámetros Hidroquímicos:** Estudios publicados por INAIGEM (Instituto Nacional de Investigación en Glaciares y Ecosistemas de Montaña) y UPCH (Universidad Peruana Cayetano Heredia).
- **Estándares Normativos:** Estándares de Calidad Ambiental para Agua (D.S. N° 004-2017-MINAM, Categoría 1-A2 y Categoría 3).
