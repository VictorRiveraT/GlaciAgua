export type RiskLevel = 'Alto' | 'Medio' | 'Bajo'

export type Season = 'seca' | 'humeda'

export interface BasinFactor {
  label: string
  key: 'rocaExpuesta' | 'potencialAcido' | 'lluvia' | 'bofedalDepuracion'
  value: number // percentage 0 - 100
  tone: 'high' | 'medium' | 'low' | 'cleaning'
  description: string
}

export interface RealMeasurement {
  id: string
  quebrada: string
  cuencaId: string
  punto: string
  lat: number
  lng: number
  fecha: string
  temporada: Season
  fuente: 'INAIGEM 2023' | 'UPCH 2021' | 'ANA / OEFA'
  ph: number
  conductividad: number // uS/cm
  hierro: number // mg/L (ECA limite 1.0)
  aluminio: number // mg/L (ECA limite 0.9)
  manganeso: number // mg/L (ECA limite 0.4)
  plomo: number // mg/L (ECA limite 0.01)
  sulfatos?: number // mg/L
  cumpleECA: boolean
  notas: string
}

export interface BasinData {
  id: string
  slug: string
  nombre: string
  provincia: string
  distrito: string
  areaKm2: number
  glaciaresCabecera: string[]
  quebradasPrincipales: string[]
  poblacionDependiente: string
  nivelRiesgo: {
    seca: RiskLevel
    humeda: RiskLevel
  }
  scoreRiesgo: {
    seca: number // 0 - 100
    humeda: number
  }
  factores: {
    seca: {
      rocaExpuesta: number // 0 - 100
      potencialAcido: number // 0 - 100
      lluvia: number // 0 - 100
      bofedalDepuracion: number // 0 - 100
    }
    humeda: {
      rocaExpuesta: number
      potencialAcido: number
      lluvia: number
      bofedalDepuracion: number
    }
  }
  resumenDiagnostico: string
  historialTemporadas: {
    temporada: string
    score: number
    nivel: RiskLevel
  }[]
  ultimaMedicion: {
    ph: number
    conductividad: number
    metalDominante: string
    fecha: string
    fuente: string
  }
  // Coordenadas aproximadas para polígono y centroide en mapa
  centroide: {
    lat: number
    lng: number
  }
  poligonoPuntos: [number, number][] // [x, y] coordenadas normalizadas para mapa vectorial
  poligonoGeo: [number, number][] // [lat, lng] coordenadas geográficas reales para Leaflet
}

export interface CommunityReport {
  id: string
  cuencaId: string
  quebrada: string
  coordenadas: {
    lat: number
    lng: number
    precisionM: number
  }
  fecha: string
  colorAgua: string
  olorSabor: string
  usosAfectados: string[]
  phMedido?: number | null
  tieneFoto: boolean
  fotoUrl?: string
  comentarios: string
  sincronizado: boolean
  simulado?: boolean
}
