
import React from 'react'
import { BasinData, Season } from '../types'
import { ACCESSIBLE_RISK_STYLES } from '../utils/accessibleTheme'
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'

interface PilotSidebarProps {
  basins: BasinData[]
  selectedBasin: BasinData | null
  onSelectBasin: (basin: BasinData) => void
  season: Season
  isCollapsed: boolean
  onToggleCollapse: () => void
}

/**
 * Generador de curvas suaves cúbicas monótonas (Fritsch-Carlson).
 * Evita sobrepasos ficticios y nunca inventa picos de datos.
 */
function createMonotoneCubicPath(dataPoints: { x: number; y: number }[]): string {
  const n = dataPoints.length

  if (n === 0) return ''
  if (n === 1) return `M ${dataPoints[0].x},${dataPoints[0].y}`
  if (n === 2) {
    return `M ${dataPoints[0].x},${dataPoints[0].y} L ${dataPoints[1].x},${dataPoints[1].y}`
  }

  const deltas: number[] = []
  const slopes: number[] = []

  for (let i = 0; i < n - 1; i++) {
    const dx = dataPoints[i + 1].x - dataPoints[i].x
    const dy = dataPoints[i + 1].y - dataPoints[i].y

    deltas.push(dx)
    slopes.push(dy / (dx || 1))
  }

  const tangents: number[] = [slopes[0]]

  for (let i = 1; i < n - 1; i++) {
    if (slopes[i - 1] * slopes[i] <= 0) {
      tangents.push(0)
    } else {
      tangents.push((slopes[i - 1] + slopes[i]) / 2)
    }
  }

  tangents.push(slopes[n - 2])

  for (let i = 0; i < n - 1; i++) {
    if (slopes[i] === 0) {
      tangents[i] = 0
      tangents[i + 1] = 0
    } else {
      const alpha = tangents[i] / slopes[i]
      const beta = tangents[i + 1] / slopes[i]
      const s = alpha * alpha + beta * beta

      if (s > 9) {
        const tau = 3 / Math.sqrt(s)
        tangents[i] = tau * alpha * slopes[i]
        tangents[i + 1] = tau * beta * slopes[i]
      }
    }
  }

  let path = `M ${dataPoints[0].x.toFixed(1)},${dataPoints[0].y.toFixed(1)}`

  for (let i = 0; i < n - 1; i++) {
    const dx = deltas[i] / 3
    const p0 = dataPoints[i]
    const p1 = dataPoints[i + 1]

    const cp1x = p0.x + dx
    const cp1y = p0.y + tangents[i] * dx
    const cp2x = p1.x - dx
    const cp2y = p1.y - tangents[i + 1] * dx

    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`
  }

  return path
}

export const PilotSidebar: React.FC<PilotSidebarProps> = ({
  basins,
  selectedBasin,
  onSelectBasin,
  season,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { t } = useI18n()

  // Traducción del nivel de riesgo
  const getRiskLabel = (risk: BasinData['nivelRiesgo']['seca']) => {
    switch (risk) {
      case 'Alto':
        return t('risk_alto')
      case 'Medio':
        return t('risk_medio')
      default:
        return t('risk_bajo')
    }
  }

  // Traducción de las recomendaciones
  const getRiskAdvice = (risk: BasinData['nivelRiesgo']['seca']) => {
    switch (risk) {
      case 'Alto':
        return t('sidebar_avoid_water')
      case 'Medio':
        return t('sidebar_water_observation')
      default:
        return t('sidebar_lower_acidity_risk')
    }
  }

  // Traducción de los tonos del agua
  const getWaterTone = (risk: BasinData['nivelRiesgo']['seca']) => {
    switch (risk) {
      case 'Alto':
        return t('water_tone_rust')
      case 'Medio':
        return t('water_tone_ochre')
      default:
        return t('water_tone_clear')
    }
  }

  // Traducción de metales y parámetros de medición
  const getDominantMetalLabel = (value: string) => {
    const normalized = value.toLowerCase()

    if (normalized.includes('parámetros normales')) {
      return t('sidebar_normal_parameters')
    }

    if (normalized.includes('hierro')) {
      return t('metal_iron')
    }

    if (normalized.includes('aluminio')) {
      return t('metal_aluminum')
    }

    if (normalized.includes('manganeso')) {
      return t('metal_manganese')
    }

    if (normalized.includes('plomo')) {
      return t('metal_lead')
    }

    return value.split('(')[0].trim()
  }

  // Vista lateral contraída
  if (isCollapsed) {
    return (
      <aside className="w-16 bg-[#f8fafc] border-r border-[#cbd5e1] flex flex-col items-center py-4 select-none shrink-0 transition-all z-20">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="touch-target w-10 h-10 rounded-2xl bg-white hover:bg-[#eff6ff] text-[#1e3a8a] border border-[#cbd5e1] flex items-center justify-center transition-colors shadow-xs mb-4"
          title={t('sidebar_expand_title')}
          aria-label={t('sidebar_expand_aria')}
        >
          <ChevronRight size={20} />
        </button>

        <div className="space-y-3 flex-1 flex flex-col items-center">
          {basins.map((basin) => {
            const risk = basin.nivelRiesgo[season]
            const isSelected = selectedBasin?.id === basin.id
            const styling = ACCESSIBLE_RISK_STYLES[risk]
            const riskLabel = getRiskLabel(risk)

            return (
              <button
                type="button"
                key={basin.id}
                onClick={() => onSelectBasin(basin)}
                className={`touch-target w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all relative ${
                  isSelected
                    ? 'bg-white shadow-md border-3 border-[#1e3a8a]'
                    : 'bg-white/90 hover:bg-white border border-[#cbd5e1]'
                }`}
                title={`${basin.nombre} - ${riskLabel}`}
                aria-label={`${basin.nombre} - ${riskLabel}`}
              >
                <span className="text-xs font-black text-[#0f172a]">
                  {basin.nombre.substring(0, 2).toUpperCase()}
                </span>

                <span
                  className="w-3 h-3 rounded-full absolute -top-1 -right-1 border-2 border-white"
                  style={{ backgroundColor: styling.dotHex }}
                />
              </button>
            )
          })}
        </div>
      </aside>
    )
  }

  // Vista lateral expandida
  return (
    <aside className="w-84 bg-[#f8fafc] border-r border-[#cbd5e1] flex flex-col h-full shrink-0 select-none transition-all z-20">
      {/* Encabezado */}
      <div className="p-4 border-b border-[#cbd5e1] bg-white flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-xl font-black text-[#0f172a] whitespace-nowrap">
            {t('sidebar_basins_title')}
          </h2>

          <span className="shrink-0 whitespace-nowrap text-[10px] font-black uppercase tracking-wide text-[#1e3a8a] bg-[#eff6ff] px-3 py-1.5 rounded-full border border-blue-200">
            {t('sidebar_basins_count').replace(
              '{count}',
              String(basins.length),
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="touch-target w-9 h-9 rounded-xl bg-[#f8fafc] hover:bg-[#eff6ff] text-[#64748b] hover:text-[#1e3a8a] border border-[#cbd5e1] flex items-center justify-center transition-colors shadow-2xs shrink-0"
          title={t('sidebar_collapse_title')}
          aria-label={t('sidebar_collapse_aria')}
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Tarjetas de microcuencas */}
      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        {basins.map((basin) => {
          const currentRisk = basin.nivelRiesgo[season]
          const isSelected = selectedBasin?.id === basin.id
          const styling = ACCESSIBLE_RISK_STYLES[currentRisk]

          const scores = basin.historialTemporadas.map((h) => h.score)
          const minScore = 15
          const maxScore = 100

          const normalizeY = (s: number) =>
            24 - ((s - minScore) / (maxScore - minScore)) * 20

          const dataPoints = scores.map((s, idx) => ({
            x: idx * 22 + 5,
            y: normalizeY(s),
          }))

          const smoothCurvePath = createMonotoneCubicPath(dataPoints)

          return (
            <button
              type="button"
              key={basin.id}
              onClick={() => onSelectBasin(basin)}
              className={`w-full p-4 rounded-3xl text-left bg-white border-2 transition-all ${
                isSelected
                  ? 'border-[#1e3a8a] ring-3 ring-[#1e3a8a]/20 shadow-md bg-white'
                  : 'border-[#cbd5e1] hover:border-slate-400 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#0f172a]">
                      {basin.nombre}
                    </h3>

                    <span
                      className="w-3 h-3 rounded-full inline-block shadow-2xs shrink-0"
                      style={{ backgroundColor: styling.dotHex }}
                      title={getRiskLabel(currentRisk)}
                    />
                  </div>

                  <p className="text-sm text-[#475569] font-semibold leading-snug line-clamp-1 mt-0.5">
                    {basin.distrito} · {basin.quebradasPrincipales[0]}
                  </p>
                </div>

                {/* Nivel de riesgo */}
                <span
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-black border ${styling.bgSoft} ${styling.borderSoft} ${styling.textDark} shrink-0`}
                >
                  {currentRisk === 'Alto' && <AlertOctagon size={14} />}
                  {currentRisk === 'Medio' && <AlertTriangle size={14} />}
                  {currentRisk === 'Bajo' && <CheckCircle2 size={14} />}

                  {getRiskLabel(currentRisk)}
                </span>
              </div>

              {/* Indicadores y curva de temporadas */}
              <div className="mt-3 pt-2.5 border-t border-[#f1f5f9] flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-sm font-black ${
                        basin.ultimaMedicion.ph < 6.5
                          ? 'bg-red-50 text-[#991b1b] border border-red-200'
                          : 'bg-green-50 text-[#166534] border border-green-200'
                      }`}
                    >
                      pH {basin.ultimaMedicion.ph.toFixed(1)}
                    </span>

                    <span className="text-sm text-[#475569] font-bold">
                      {basin.areaKm2} km²
                    </span>
                  </div>

                  <span className="text-xs text-[#334155] font-semibold block truncate max-w-[160px] mt-1">
                    {getDominantMetalLabel(
                      basin.ultimaMedicion.metalDominante,
                    )}
                  </span>
                </div>

                {/* Mini gráfico */}
                <div className="flex flex-col items-end shrink-0">
                  <div className="w-20 h-7 flex items-center">
                    <svg
                      viewBox="0 0 76 28"
                      className="w-full h-full overflow-visible"
                    >
                      <path
                        d={smoothCurvePath}
                        fill="none"
                        stroke={styling.dotHex}
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {dataPoints.map((pt, idx) => (
                        <circle
                          key={idx}
                          cx={pt.x}
                          cy={pt.y}
                          r={idx === dataPoints.length - 1 ? 3 : 2}
                          fill={
                            idx === dataPoints.length - 1
                              ? styling.dotHex
                              : 'white'
                          }
                          stroke={styling.dotHex}
                          strokeWidth="1.6"
                        />
                      ))}
                    </svg>
                  </div>

                  <span className="text-[10px] text-[#64748b] font-bold">
                    {t('sidebar_seasons_count').replace(
                      '{count}',
                      String(basin.historialTemporadas.length),
                    )}
                  </span>
                </div>
              </div>

              {/* Recomendación y tono del agua */}
              <div className="mt-2.5 pt-2 border-t border-dashed border-[#e2e8f0] flex items-center justify-between gap-2 text-sm">
                <span
                  className={`font-black flex items-center gap-1 min-w-0 ${styling.textDark}`}
                >
                  {getRiskAdvice(currentRisk)}
                </span>

                <span className="text-xs text-[#475569] font-bold shrink-0">
                  {getWaterTone(currentRisk)}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Aviso permanente */}
      <div className="p-3.5 border-t border-[#cbd5e1] bg-white text-xs text-[#475569] flex items-center gap-2">
        <Shield size={18} className="text-[#1e3a8a] shrink-0" />

        <span className="font-medium leading-tight">
          {t('disclaimer')}
        </span>
      </div>
    </aside>
  )
}
