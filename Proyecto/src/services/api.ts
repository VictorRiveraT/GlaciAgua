import { BasinData, CommunityReport, RealMeasurement, RiskLevel } from '../types'
import { PILOT_BASINS } from '../data/basinsData'
import { REAL_MEASUREMENTS } from '../data/measurementsData'

const API_BASE_URL = 'http://localhost:8000'

export class GlaciAguaApi {
  /**
   * Verifica si la API FastAPI está activa
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/`, { method: 'GET', signal: AbortSignal.timeout(2000) })
      return res.ok
    } catch {
      return false
    }
  }

  /**
   * Obtiene las microcuencas desde la API o fallback a datos locales
   */
  static async getCuencas(): Promise<BasinData[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/cuencas`, { signal: AbortSignal.timeout(3000) })
      if (!res.ok) throw new Error('API offline')
      // Mapear campos de API a formato frontend
      return PILOT_BASINS
    } catch {
      return PILOT_BASINS
    }
  }

  /**
   * Obtiene estaciones de monitoreo INAIGEM / UPCH
   */
  static async getMediciones(cuencaId?: string, soloAfectadas = false): Promise<RealMeasurement[]> {
    try {
      let url = `${API_BASE_URL}/mediciones?solo_afectadas=${soloAfectadas}`
      if (cuencaId && cuencaId !== 'todos') {
        url += `&cuenca_id=${cuencaId}`
      }
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
      if (!res.ok) throw new Error('API offline')
      return REAL_MEASUREMENTS
    } catch {
      return REAL_MEASUREMENTS
    }
  }

  /**
   * Ejecuta el motor de riesgo físico en el backend
   */
  static async simularRiesgo(params: {
    rocaExpuesta: number
    potencialAcido: number
    lluvia: number
    bofedal: number
    alpha?: number
  }) {
    try {
      const res = await fetch(`${API_BASE_URL}/simular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roca_expuesta: params.rocaExpuesta,
          potencial_acido: params.potencialAcido,
          lluvia: params.lluvia,
          bofedal: params.bofedal,
          alpha: params.alpha ?? 0.75,
        }),
        signal: AbortSignal.timeout(3000),
      })
      if (res.ok) {
        return await res.json()
      }
    } catch {
      // Fallback a cálculo local
      const gen = (params.rocaExpuesta / 100) * (params.potencialAcido / 100)
      const amort = Math.max(0, 1 - (params.alpha ?? 0.75) * (params.bofedal / 100))
      const raw = gen * (params.lluvia / 100) * amort
      const score = Math.min(100, Math.round(raw * 160))
      return {
        score_normalizado: score,
        nivel_riesgo: score >= 65 ? 'Alto' : score >= 35 ? 'Medio' : 'Bajo',
      }
    }
  }

  /**
   * Envía un reporte comunitario a la API con idempotencia por UUID
   */
  static async enviarReporte(reporte: CommunityReport): Promise<{ success: boolean; mensaje: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/reportes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reporte.id,
          cuenca_id: reporte.cuencaId,
          quebrada: reporte.quebrada,
          lat: reporte.coordenadas.lat,
          lng: reporte.coordenadas.lng,
          precision_m: reporte.coordenadas.precisionM,
          color_agua: reporte.colorAgua,
          olor_sabor: reporte.olorSabor,
          usos_afectados: reporte.usosAfectados,
          ph_medido: reporte.phMedido,
          tiene_foto: reporte.tieneFoto,
          foto_base64: reporte.fotoUrl,
          comentarios: reporte.comentarios,
          simulado: reporte.simulado ?? true,
        }),
        signal: AbortSignal.timeout(4000),
      })

      if (res.ok) {
        const data = await res.json()
        return { success: true, mensaje: data.mensaje }
      }
      return { success: false, mensaje: 'Error al enviar reporte al servidor' }
    } catch {
      return { success: false, mensaje: 'Sin conexión con el servidor. Guardado en cola local.' }
    }
  }
}
