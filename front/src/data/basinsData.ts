import { BasinData } from '../types'
import {
  QUILLCAY_DETAILED_BOUNDARY,
  PACHACOTO_DETAILED_BOUNDARY,
  CANRAY_CHICO_DETAILED_BOUNDARY,
  RIO_BLANCO_DETAILED_BOUNDARY,
  RIO_SANTA_DETAILED_TRACE,
} from './geoBoundaries'

export const PILOT_BASINS: BasinData[] = [
  {
    id: 'quillcay',
    slug: 'quillcay',
    nombre: 'Quillcay',
    provincia: 'Huaraz',
    distrito: 'Huaraz e Independencia',
    areaKm2: 249.5,
    glaciaresCabecera: ['Vallunaraju', 'Ranrapalca', 'Shallap', 'San Juan'],
    quebradasPrincipales: ['Cojup', 'Quilcayhuanca', 'Shallap'],
    poblacionDependiente: '125,000 hab. (Ciudad de Huaraz e Independencia - EPS Chavín capta en Cojup)',
    nivelRiesgo: {
      seca: 'Alto',
      humeda: 'Alto',
    },
    scoreRiesgo: {
      seca: 88,
      humeda: 94,
    },
    factores: {
      seca: {
        rocaExpuesta: 92,
        potencialAcido: 78,
        lluvia: 35,
        bofedalDepuracion: 28,
      },
      humeda: {
        rocaExpuesta: 92,
        potencialAcido: 78,
        lluvia: 86,
        bofedalDepuracion: 32,
      },
    },
    resumenDiagnostico:
      'Alto retroceso glaciar en cabeceras con litología rica en sulfuros (pirita y calcopirita). Al oxidarse y lavarse por escorrentía, genera drenaje ácido de roca con pH crítico (3.9 - 4.6) y metales disueltos que superan el ECA.',
    historialTemporadas: [
      { temporada: 'Seca 2025', score: 72, nivel: 'Medio' },
      { temporada: 'Húmeda 2025', score: 81, nivel: 'Alto' },
      { temporada: 'Seca 2026', score: 84, nivel: 'Alto' },
      { temporada: 'Húmeda 2026', score: 94, nivel: 'Alto' },
    ],
    ultimaMedicion: {
      ph: 4.1,
      conductividad: 540,
      metalDominante: 'Hierro (Fe: 4.8 mg/L) y Aluminio (Al: 3.2 mg/L)',
      fecha: '15 de Octubre 2026',
      fuente: 'Estudio Hidroquímico INAIGEM / UPCH',
    },
    centroide: {
      lat: -9.485,
      lng: -77.420,
    },
    poligonoPuntos: [
      [220, 180],
      [280, 150],
      [330, 175],
      [350, 240],
      [310, 280],
      [240, 265],
      [210, 220],
    ],
    // Coordenadas geográficas reales de alta resolución (divisoria de aguas topográfica)
    poligonoGeo: QUILLCAY_DETAILED_BOUNDARY,
    featuresML: {
      area_km2: 249.5,
      roca_expuesta_km2: 35.2,
      pct_sulfuros: 48.0,
      pct_carbonatos: 10.0,
      lluvia_mm: 120.0,
      pct_bofedal: 28.0,
      pct_veg_humeda_est: 32.0,
    },
    prediccionML: {
      seca: {
        ph_estimado: 3.42,
        incertidumbre_ph: 0.52,
        nivel_riesgo: 'Alto',
        acuerdo_arboles: 0.99,
      },
      humeda: {
        ph_estimado: 3.47,
        incertidumbre_ph: 0.56,
        nivel_riesgo: 'Alto',
        acuerdo_arboles: 1.0,
      },
    },
  },
  {
    id: 'pachacoto',
    slug: 'pachacoto',
    nombre: 'Pachacoto',
    provincia: 'Recuay',
    distrito: 'Cátac',
    areaKm2: 202.8,
    glaciaresCabecera: ['Pastoruri', 'Raria', 'Tuco'],
    quebradasPrincipales: ['Quebrada Pastoruri', 'Pampa de Pumapampa', 'Río Pachacoto'],
    poblacionDependiente: '14,800 hab. (Comunidades campesinas de Cátac, regantes y turismo Pastoruri)',
    nivelRiesgo: {
      seca: 'Medio',
      humeda: 'Alto',
    },
    scoreRiesgo: {
      seca: 58,
      humeda: 74,
    },
    factores: {
      seca: {
        rocaExpuesta: 65,
        potencialAcido: 62,
        lluvia: 30,
        bofedalDepuracion: 45,
      },
      humeda: {
        rocaExpuesta: 65,
        potencialAcido: 62,
        lluvia: 79,
        bofedalDepuracion: 48,
      },
    },
    resumenDiagnostico:
      'El retroceso acelerado del glaciar Pastoruri ha descubierto rocas sedimentarias con pirita. Los bofedales en Pumapampa amortiguan parcialmente la acidez, pero en temporada de lluvias el lavado aumenta el transporte hacia el río Santa.',
    historialTemporadas: [
      { temporada: 'Seca 2025', score: 50, nivel: 'Medio' },
      { temporada: 'Húmeda 2025', score: 68, nivel: 'Medio' },
      { temporada: 'Seca 2026', score: 58, nivel: 'Medio' },
      { temporada: 'Húmeda 2026', score: 74, nivel: 'Alto' },
    ],
    ultimaMedicion: {
      ph: 5.4,
      conductividad: 380,
      metalDominante: 'Hierro (Fe: 2.1 mg/L) y Manganeso (Mn: 0.6 mg/L)',
      fecha: '08 de Octubre 2026',
      fuente: 'Red de Monitoreo Glaciológico INAIGEM',
    },
    centroide: {
      lat: -9.880,
      lng: -77.295,
    },
    poligonoPuntos: [
      [270, 340],
      [340, 310],
      [380, 350],
      [370, 420],
      [300, 440],
      [260, 390],
    ],
    // Coordenadas geográficas reales de alta resolución (divisoria de aguas topográfica)
    poligonoGeo: PACHACOTO_DETAILED_BOUNDARY,
    featuresML: {
      area_km2: 202.8,
      roca_expuesta_km2: 22.4,
      pct_sulfuros: 42.0,
      pct_carbonatos: 12.0,
      lluvia_mm: 110.0,
      pct_bofedal: 45.0,
      pct_veg_humeda_est: 42.0,
    },
    prediccionML: {
      seca: {
        ph_estimado: 3.21,
        incertidumbre_ph: 0.16,
        nivel_riesgo: 'Alto',
        acuerdo_arboles: 1.0,
      },
      humeda: {
        ph_estimado: 3.25,
        incertidumbre_ph: 0.24,
        nivel_riesgo: 'Alto',
        acuerdo_arboles: 1.0,
      },
    },
  },
  {
    id: 'canray-chico',
    slug: 'canray-chico',
    nombre: 'Canray Chico',
    provincia: 'Huaraz',
    distrito: 'Olleros',
    areaKm2: 94.2,
    glaciaresCabecera: ['Rurec', 'Uruashraju'],
    quebradasPrincipales: ['Quebrada Rurec', 'Río Canray Chico'],
    poblacionDependiente: '8,200 hab. (Comunidades de Olleros y regantes del río Santa)',
    nivelRiesgo: {
      seca: 'Medio',
      humeda: 'Medio',
    },
    scoreRiesgo: {
      seca: 46,
      humeda: 60,
    },
    factores: {
      seca: {
        rocaExpuesta: 52,
        potencialAcido: 48,
        lluvia: 33,
        bofedalDepuracion: 42,
      },
      humeda: {
        rocaExpuesta: 52,
        potencialAcido: 48,
        lluvia: 75,
        bofedalDepuracion: 44,
      },
    },
    resumenDiagnostico:
      'Cuenca evaluada hidroquímicamente por INAIGEM. Muestra drenaje ácido moderado en las nacientes de la quebrada Rurec, que se diluye al integrarse con aportes de humedales altoandinos aguas abajo.',
    historialTemporadas: [
      { temporada: 'Seca 2025', score: 42, nivel: 'Medio' },
      { temporada: 'Húmeda 2025', score: 55, nivel: 'Medio' },
      { temporada: 'Seca 2026', score: 46, nivel: 'Medio' },
      { temporada: 'Húmeda 2026', score: 60, nivel: 'Medio' },
    ],
    ultimaMedicion: {
      ph: 5.8,
      conductividad: 290,
      metalDominante: 'Hierro (Fe: 1.4 mg/L)',
      fecha: '28 de Septiembre 2026',
      fuente: 'Evaluación Hidroquímica Canray Chico (INAIGEM)',
    },
    centroide: {
      lat: -9.670,
      lng: -77.400,
    },
    poligonoPuntos: [
      [240, 275],
      [300, 260],
      [330, 300],
      [290, 335],
      [230, 310],
    ],
    // Coordenadas geográficas reales de alta resolución (divisoria de aguas topográfica)
    poligonoGeo: CANRAY_CHICO_DETAILED_BOUNDARY,
    featuresML: {
      area_km2: 94.2,
      roca_expuesta_km2: 11.5,
      pct_sulfuros: 28.0,
      pct_carbonatos: 18.0,
      lluvia_mm: 95.0,
      pct_bofedal: 42.0,
      pct_veg_humeda_est: 38.0,
    },
    prediccionML: {
      seca: {
        ph_estimado: 6.58,
        incertidumbre_ph: 0.46,
        nivel_riesgo: 'Bajo',
        acuerdo_arboles: 0.51,
      },
      humeda: {
        ph_estimado: 6.82,
        incertidumbre_ph: 0.53,
        nivel_riesgo: 'Bajo',
        acuerdo_arboles: 0.72,
      },
    },
  },
  {
    id: 'rio-blanco',
    slug: 'rio-blanco',
    nombre: 'Río Blanco',
    provincia: 'Huaylas',
    distrito: 'Caraz y Santa Cruz',
    areaKm2: 178.4,
    glaciaresCabecera: ['Alpamayo', 'Santa Cruz'],
    quebradasPrincipales: ['Quebrada Santa Cruz', 'Río Blanco'],
    poblacionDependiente: '26,000 hab. (Valle agrícola de Huaylas y caseríos rurales)',
    nivelRiesgo: {
      seca: 'Bajo',
      humeda: 'Bajo',
    },
    scoreRiesgo: {
      seca: 22,
      humeda: 29,
    },
    factores: {
      seca: {
        rocaExpuesta: 24,
        potencialAcido: 18,
        lluvia: 32,
        bofedalDepuracion: 62,
      },
      humeda: {
        rocaExpuesta: 24,
        potencialAcido: 18,
        lluvia: 72,
        bofedalDepuracion: 65,
      },
    },
    resumenDiagnostico:
      'Litología dominada por granodioritas con escasos sulfuros reactivos y gran presencia de bofedales amortiguadores. El agua conserva pH neutro (7.2) y metales dentro de los límites ECA.',
    historialTemporadas: [
      { temporada: 'Seca 2025', score: 20, nivel: 'Bajo' },
      { temporada: 'Húmeda 2025', score: 26, nivel: 'Bajo' },
      { temporada: 'Seca 2026', score: 22, nivel: 'Bajo' },
      { temporada: 'Húmeda 2026', score: 29, nivel: 'Bajo' },
    ],
    ultimaMedicion: {
      ph: 7.2,
      conductividad: 110,
      metalDominante: 'Parámetros normales dentro del ECA',
      fecha: '20 de Septiembre 2026',
      fuente: 'Estudios de Línea Base ANA',
    },
    centroide: {
      lat: -8.960,
      lng: -77.680,
    },
    poligonoPuntos: [
      [140, 70],
      [210, 50],
      [240, 95],
      [200, 140],
      [130, 120],
    ],
    // Coordenadas geográficas reales de alta resolución (divisoria de aguas topográfica)
    poligonoGeo: RIO_BLANCO_DETAILED_BOUNDARY,
    featuresML: {
      area_km2: 178.4,
      roca_expuesta_km2: 6.8,
      pct_sulfuros: 12.0,
      pct_carbonatos: 34.0,
      lluvia_mm: 130.0,
      pct_bofedal: 62.0,
      pct_veg_humeda_est: 58.0,
    },
    prediccionML: {
      seca: {
        ph_estimado: 8.0,
        incertidumbre_ph: 0.37,
        nivel_riesgo: 'Bajo',
        acuerdo_arboles: 1.0,
      },
      humeda: {
        ph_estimado: 8.18,
        incertidumbre_ph: 0.32,
        nivel_riesgo: 'Bajo',
        acuerdo_arboles: 1.0,
      },
    },
  },
]

// Capas geográficas reales adicionales para el mapa
export const REAL_GEOGRAPHIC_FEATURES = {
  // Bofedales reales del Inventario Nacional de Bofedales (INAIGEM)
  bofedales: [
    {
      id: 'bof-01',
      nombre: 'Bofedal de Pumapampa (Pachacoto)',
      descripcion: 'Humedal altoandino clave que retiene >65% de hierro y neutraliza pH',
      coordenadas: [
        [-9.882, -77.298],
        [-9.876, -77.285],
        [-9.888, -77.278],
        [-9.896, -77.289],
        [-9.882, -77.298],
      ] as [number, number][],
    },
    {
      id: 'bof-02',
      nombre: 'Bofedal Quebrada Cojup (Quillcay)',
      descripcion: 'Filtro natural aguas arriba de la bocatoma de EPS Chavín',
      coordenadas: [
        [-9.475, -77.435],
        [-9.465, -77.420],
        [-9.478, -77.412],
        [-9.488, -77.426],
        [-9.475, -77.435],
      ] as [number, number][],
    },
    {
      id: 'bof-03',
      nombre: 'Bofedal Pampa Shallap',
      descripcion: 'Amortiguador de acidez en la microcuenca Shallap',
      coordenadas: [
        [-9.525, -77.410],
        [-9.518, -77.395],
        [-9.530, -77.388],
        [-9.538, -77.402],
        [-9.525, -77.410],
      ] as [number, number][],
    },
  ],

  // Picos emblemáticos de la Cordillera Blanca con altitud real
  picos: [
    { nombre: 'Nev. Huascarán', altitud: '6,768 m', coords: [-9.122, -77.605] as [number, number] },
    { nombre: 'Nev. Huandoy', altitud: '6,395 m', coords: [-9.032, -77.662] as [number, number] },
    { nombre: 'Nev. Ranrapalca', altitud: '6,162 m', coords: [-9.414, -77.416] as [number, number] },
    { nombre: 'Nev. Vallunaraju', altitud: '5,686 m', coords: [-9.422, -77.456] as [number, number] },
    { nombre: 'Nev. Pastoruri', altitud: '5,240 m', coords: [-9.921, -77.195] as [number, number] },
  ],

  // Glaciares y roca con sulfuros expuesta
  glaciaresRocaExpuesta: [
    {
      nombre: 'Zona Deglaciada Pastoruri (Roca Pirítica Expuesta)',
      coords: [
        [-9.915, -77.200],
        [-9.908, -77.185],
        [-9.928, -77.180],
        [-9.935, -77.195],
        [-9.915, -77.200],
      ] as [number, number][],
    },
    {
      nombre: 'Morena Frontal Vallunaraju - Cojup',
      coords: [
        [-9.425, -77.462],
        [-9.415, -77.448],
        [-9.432, -77.442],
        [-9.440, -77.455],
        [-9.425, -77.462],
      ] as [number, number][],
    },
  ],

  // Ciudades principales
  ciudades: [
    { nombre: 'Huaraz (Capital Áncash)', coords: [-9.526, -77.528] as [number, number], principal: true },
    { nombre: 'Cátac', coords: [-9.795, -77.430] as [number, number] },
    { nombre: 'Recuay', coords: [-9.722, -77.455] as [number, number] },
    { nombre: 'Carhuaz', coords: [-9.282, -77.644] as [number, number] },
    { nombre: 'Yungay', coords: [-9.141, -77.745] as [number, number] },
    { nombre: 'Caraz', coords: [-9.048, -77.812] as [number, number] },
  ],

  // Trazado de alta resolución del Río Santa (Cañón del Callejón de Huaylas)
  rioSanta: RIO_SANTA_DETAILED_TRACE,
}
