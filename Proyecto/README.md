# GlaciAgua - Frontend PWA

> **Sistema de Alerta Temprana Comunitaria de Drenaje Ácido de Roca (DAR) y Metales Pesados en la Cordillera Blanca (Huaraz, Áncash)**

Desarrollado para el hackatón, combinando el diseño visual con los requerimientos científicos del documento técnico del proyecto.

---

## Cómo Iniciar el Proyecto

```bash
# Entrar a la carpeta
cd Proyecto

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en vivo
npm run dev

# Compilar para producción (genera carpeta dist/)
npm run build
```

---

## Estructura y Módulos Implementados

1. **Mapa Interactivo de la Cordillera Blanca (`InteractiveMap.tsx`)**
   - Reemplaza el marcador de posición inconcluso con un lienzo geográfico interactivo de alta resolución.
   - Relieve de la Cordillera Blanca, picos nevados (Huascarán 6,768m, Pastoruri 5,240m, Vallunaraju, Ranrapalca), cuenca del Río Santa y quebradas principales (Quillcay, Cojup, Shallap, Quilcayhuanca, Pachacoto, Pumapampa).
   - Capas conmutables:
     - **Microcuencas:** Polígonos interactivos con semáforo de riesgo (Alto, Medio, Bajo).
     - **Bofedales:** Filtros naturales neutralizadores de acidez (Inventario INAIGEM).
     - **Glaciares y Roca Expuesta:** Zonas deglaciadas con sulfuros reactivos.
     - **Red Hídrica:** Río Santa y afluentes con trazado continuo oficial (OSM / IGN).
     - **Puntos de Monitoreo:** Estaciones hidroquímicas INAIGEM / UPCH con tooltip de pH y metales pesados.
   - Zoom, recentrado, rastreo de coordenadas y selector de estilo (Relieve Topográfico / Satélite).

2. **Panel de Explicabilidad del Riesgo (`BasinDetailPanel.tsx`)**
   - Responde científicamente a la pregunta: **¿Por qué este nivel de riesgo?**
   - Desglose de las 4 variables físicas consensuadas con el asesor ambiental:
     1. *Roca recién expuesta* (Gatillo por retroceso glaciar).
     2. *Geología reactiva* (Presencia de sulfuros / pirita).
     3. *Volumen de lluvia* (Activador y transporte estacional).
     4. *Bofedales depuradores* (Efecto amortiguador y filtro biológico).
   - Gráfico SVG histórico de 4 temporadas (Seca 2025 → Húmeda 2026).
   - Última medición real en terreno contrastada con los Estándares de Calidad Ambiental (ECA Agua).

3. **Simulador del Motor de Riesgo (`RiskSimulator.tsx`)**
   - Laboratorio interactivo para la evaluación técnica ante jurados y evaluadores ambientales.
   - Sliders en vivo para probar la hipótesis matemática:
     $$\text{generación} = \text{roca\_expuesta} \times \text{potencial\_ácido}$$
     $$\text{riesgo} = \text{generación} \times \text{lluvia} \times (1 - \alpha \times \text{depuración})$$
   - Botones preset para cargar instantáneamente los valores reales de **Quillcay**, **Pachacoto** o **Río Blanco**.

4. **Base de Datos Científica (`ScientificDataView.tsx`)**
   - Tabla interactiva con las estaciones hidroquímicas publicadas por INAIGEM y UPCH.
   - Comparación automática contra los ECA Agua (D.S. 004-2017-MINAM) en pH, Hierro ($Fe$), Aluminio ($Al$) y Manganeso ($Mn$).
   - Filtros por cuenca, filtro para ver solo superaciones de norma, y exportador a **CSV**.

5. **Reportes Comunitarios Offline (`ReportModal.tsx`)**
   - Formulario de ciencia ciudadana optimizado para trabajo de campo:
     - Detección de coordenadas GPS (con indicador de precisión en metros).
     - Captura o subida de foto del agua con vista previa.
     - Selector visual de coloración (Anaranjada/rojiza, Lechosa, Clara).
     - Registro de usos del agua (humano, agrícola, ganado, truchas).
     - Medición opcional de tira reactiva de pH.
     - Cola local con UUID que se guarda en el navegador sin necesidad de internet.

6. **Guía Comunitaria "Qué Hacer y Qué Evitar" (`GuidanceView.tsx`)**
   - Recomendaciones por nivel de riesgo para proteger a familias, ganado y cultivos.
   - **Alerta médica fundamental:** Advierte que *hervir el agua NO elimina los metales pesados*, sino que los concentra.
   - Generador automático de **Oficio Formal** para la JASS, municipio o junta de regantes.

7. **Gestor Offline y Sincronización (`OfflineSyncModal.tsx`)**
   - Administrador de datos descargados (18.4 MB cacheados).
   - Cola de reportes pendientes con botón de sincronización masiva simulada.
   - Interruptor de *Modo Avión* para demostrar en vivo el funcionamiento sin conexión.

8. **Conmutador de Experiencia Móvil PWA (`MobilePwaShell.tsx`)**
   - Permite alternar con un clic entre el **Escritorio Web Completo** y el **Simulador Móvil PWA** (con marco de teléfono, barra de navegación inferior y vistas adaptadas).
