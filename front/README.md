# GlaciAgua - Frontend PWA

> **Sistema de Alerta Temprana Comunitaria de Drenaje Ácido de Roca (DAR) y Metales Pesados en la Cordillera Blanca (Huaraz, Áncash)**

Desarrollado para el monitoreo geoquímico participativo, combinando diseño cartográfico de alto contraste con requerimientos científicos de validación física y predictiva.

---

## Cómo Iniciar el Proyecto

```bash
# Entrar a la carpeta
cd front

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en vivo
npm run dev

# Compilar para producción (genera carpeta dist/)
npm run build
```

---

## Módulos y Componentes Implementados

1. **Mapa Interactivo de Alta Visibilidad (`InteractiveMap.tsx`)**
   - Lienzo cartográfico interactivo de alta resolución en Leaflet.
   - Polígonos de microcuencas con **relleno semitransparente dinámico** calibrado según el nivel de riesgo para evitar vacíos visuales sobre el mapa topográfico.
   - Enfoque cinemático automático (`flyToBounds`): centra y ajusta el zoom al límite geográfico exacto de la cuenca seleccionada.
   - Corredores fluviales con halo de alta visibilidad (12px), talweg continuo (4.5px) y pulso de flujo dinámico (línea discontinua blanca).
   - Capas conmutables con contadores de elementos: divisoria de cuencas, corredores fluviales, focos de morrena reactiva, bofedales amortiguadores y estaciones de monitoreo.
   - Selector de mapas base: Relieve Topográfico, Satélite Real y Curvas de Nivel.

2. **Panel de Explicabilidad y Machine Learning (`BasinDetailPanel.tsx`)**
   - **Tarjeta predictiva Random Forest:** Despliega en vivo el pH estimado, la incertidumbre (+/- sigma) y el consenso de los 300 estimadores del ensamble.
   - **Validación dual explicable:** Banner de contraste científico que compara el modelo físico analítico (Score sobre 100) contra el regresor de Machine Learning entrenado sobre las 8 variables HydroBASINS.
   - **Matriz de variables geomorfológicas:** Desglose expandible con los valores y ponderaciones de área de roca expuesta, sulfuros, carbonatos, precipitación y bofedales.
   - Acceso directo al Simulador del Modelo con parámetros precargados.

3. **Panel Lateral de Microcuencas (`PilotSidebar.tsx`)**
   - Filtros rápidos por nivel de riesgo con botones tipo chip (`Todos`, `Alto`, `Medio`, `Bajo`) y conteo dinámico de cuencas.
   - Tarjetas informativas con badge predictivo de Machine Learning (`RF ML: pH 4.01 +/-0.43`), pH de campo, área de cuenca y sparkline SVG de 4 temporadas.
   - Buscador por nombre de microcuenca, distrito o quebrada.

4. **Monitoreo de Microservicios (`Navbar.tsx`)**
   - Barra superior con insignias de estado activo para el backend (`Backend :8000`) y el servicio de Machine Learning (`ML :8001`).
   - Selector de estacionalidad (Seca / Húmeda).
   - Indicador de estado de conexión PWA (En línea / Sin conexión con caché local).
   - Alternador de vista entre modo Escritorio Completo y Simulador Móvil PWA.

5. **Simulador del Motor de Riesgo (`RiskSimulator.tsx`)**
   - Laboratorio interactivo para evaluación técnica ante jurados y evaluadores ambientales.
   - Sliders en vivo para simular retroceso glaciar, variaciones pluviométricas y pérdida de bofedales.
   - Presets directos para cuencas piloto (Quillcay, Pachacoto, Río Blanco).

6. **Base de Datos Científica (`ScientificDataView.tsx`)**
   - Tabla interactiva con estaciones hidroquímicas oficiales de INAIGEM y UPCH.
   - Comparación contra los ECA Agua (D.S. 004-2017-MINAM) en pH, Hierro (Fe), Aluminio (Al) y Manganeso (Mn).
   - Exportación a formato CSV.

7. **Reportes Comunitarios Offline (`ReportModal.tsx`)**
   - Captura de coordenadas GPS con indicador de precisión en metros.
   - Carga de fotografía del afluente con vista previa.
   - Selección visual de coloración del agua y usos afectados.
   - Cola de almacenamiento local con UUIDs únicos para transmisión diferida.

8. **Guía Comunitaria y Generador de Oficios (`GuidanceView.tsx`)**
   - Medidas preventivas según el semáforo de riesgo.
   - Advertencia médica sobre la concentración de metales por ebullición.
   - Redactor automático de oficios formales para juntas de regantes y JASS.

9. **Gestor Offline y Sincronización (`OfflineSyncModal.tsx`)**
   - Panel de administración de datos en almacenamiento local (18.4 MB cacheados).
   - Sincronización masiva de reportes pendientes con el servidor central.
