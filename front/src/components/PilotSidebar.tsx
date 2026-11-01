import React from 'react'
import { BasinData, Season } from '../types'
import { ACCESSIBLE_RISK_STYLES, DISCLAIMER_NOTE_ES } from '../utils/accessibleTheme'
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Droplet,
} from 'lucide-react'

interface PilotSidebarProps {
  basins: BasinData[]
  selectedBasin: BasinData | null
  onSelectBasin: (basin: BasinData) => void
  season: Season
  isCollapsed: boolean
  onToggleCollapse: () => void
}

/**
 * Generador de curvas suaves cúbicas monótonas (Fritsch-Carlson)
 * Evita sobrepasos ficticios y nunca inventa picos de datos.
 */
function createMonotoneCubicPath(dataPoints: { x: number; y: number }[]): string {
  const n = dataPoints.length
  if (n === 0) return ''
  if (n === 1) return `M ${dataPoints[0].x},${dataPoints[0].y}`
  if (n === 2) return `M ${dataPoints[0].x},${dataPoints[0].y} L ${dataPoints[1].x},${dataPoints[1].y}`

  // 1. Calcular pendientes de secantes
  const deltas: number[] = []
  const slopes: number[] = []
  for (let i = 0; i < n - 1; i++) {
    const dx = dataPoints[i + 1].x - dataPoints[i].x
    const dy = dataPoints[i + 1].y - dataPoints[i].y
    deltas.push(dx)
    slopes.push(dy / (dx || 1))
  }

  // 2. Calcular tangentes iniciales
  const tangents: number[] = [slopes[0]]
  for (let i = 1; i < n - 1; i++) {
    if (slopes[i - 1] * slopes[i] <= 0) {
      tangents.push(0)
    } else {
      tangents.push((slopes[i - 1] + slopes[i]) / 2)
    }
  }
  tangents.push(slopes[n - 2])

  // 3. Ajuste Fritsch-Carlson para garantizar monotonicidad
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

  // 4. Construir trayectoria Bézier cúbica SVG
  let path = `M ${dataPoints[0].x.toFixed(1)},${dataPoints[0].y.toFixed(1)}`
  for (let i = 0; i < n - 1; i++) {
    const dx = deltas[i] / 3
    const p0 = dataPoints[i]
    const p1 = dataPoints[i + 1]
    const cp1x = p0.x + dx
    const cp1y = p0.y + (tangents[i] * dx)
    const cp2x = p1.x - dx
    const cp2y = p1.y - (tangents[i + 1] * dx)
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
  // Collapsed Rail View
  if (isCollapsed) {
    return (
      <aside className="w-16 bg-[#f8fafc] border-r border-[#cbd5e1] flex flex-col items-center py-4 select-none shrink-0 transition-all z-20">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="touch-target w-10 h-10 rounded-2xl bg-white hover:bg-[#eff6ff] text-[#1e3a8a] border border-[#cbd5e1] flex items-center justify-center transition-colors shadow-xs mb-4"
          title="Expandir barra de microcuencas"
          aria-label="Expandir barra lateral"
        >
          <ChevronRight size={20} />
        </button>

        <div className="space-y-3 flex-1 flex flex-col items-center">
          {basins.map((basin) => {
            const risk = basin.nivelRiesgo[season]
            const isSelected = selectedBasin?.id === basin.id
            const styling = ACCESSIBLE_RISK_STYLES[risk]

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
                title={`${basin.nombre} - ${styling.labelEs}`}
                aria-label={`${basin.nombre} - ${styling.labelEs}`}
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

  // Full Expanded Sidebar View
  return (
    <aside className="w-84 bg-[#f8fafc] border-r border-[#cbd5e1] flex flex-col h-full shrink-0 select-none transition-all z-20">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#cbd5e1] bg-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black text-[#0f172a]">Quebradas</h2>
          <span className="text-[11px] font-black uppercase text-[#1e3a8a] bg-[#eff6ff] px-2.5 py-0.5 rounded-full border border-blue-200">
            4 Cuencas
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="touch-target w-9 h-9 rounded-xl bg-[#f8fafc] hover:bg-[#eff6ff] text-[#64748b] hover:text-[#1e3a8a] border border-[#cbd5e1] flex items-center justify-center transition-colors shadow-2xs"
          title="Colapsar barra lateral"
          aria-label="Colapsar barra lateral"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Basin Cards List with Monotone Curves */}
      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        {basins.map((basin) => {
          const currentRisk = basin.nivelRiesgo[season]
          const isSelected = selectedBasin?.id === basin.id
          const styling = ACCESSIBLE_RISK_STYLES[currentRisk]

          // Datos para curva monótona suave SVG
          const scores = basin.historialTemporadas.map((h) => h.score)
          const minScore = 15
          const maxScore = 100
          const normalizeY = (s: number) => 24 - ((s - minScore) / (maxScore - minScore)) * 20
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
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-[#0f172a]">{basin.nombre}</h3>
                    <span
                      className="w-3 h-3 rounded-full inline-block shadow-2xs"
                      style={{ backgroundColor: styling.dotHex }}
                      title={styling.shapeNameEs}
                    />
                  </div>
                  <p className="text-xs text-[#64748b] font-medium leading-snug line-clamp-1 mt-0.5">
                    {basin.distrito} · {basin.quebradasPrincipales[0]}
                  </p>
                </div>

                {/* Badge con ícono distintivo según forma de semáforo */}
                <span
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black border ${styling.bgSoft} ${styling.borderSoft} ${styling.textDark} shrink-0`}
                >
                  {currentRisk === 'Alto' && <AlertOctagon size={14} />}
                  {currentRisk === 'Medio' && <AlertTriangle size={14} />}
                  {currentRisk === 'Bajo' && <CheckCircle2 size={14} />}
                  {styling.labelEs}
                </span>
              </div>

              {/* Fila Central: Mini Curva Suave Monótona + Indicadores Claros */}
              <div className="mt-3 pt-2.5 border-t border-[#f1f5f9] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                        basin.ultimaMedicion.ph < 6.5
                          ? 'bg-red-50 text-[#991b1b] border border-red-200'
                          : 'bg-green-50 text-[#166534] border border-green-200'
                      }`}
                    >
                      pH {basin.ultimaMedicion.ph.toFixed(1)}
                    </span>
                    <span className="text-xs text-[#64748b] font-bold">
                      {basin.areaKm2} km²
                    </span>
                  </div>
                  <span className="text-[11px] text-[#475569] font-medium block truncate max-w-[150px] mt-1">
                    {basin.ultimaMedicion.metalDominante.split('(')[0]}
                  </span>
                </div>

                {/* Mini Gráfico Monótono Suave */}
                <div className="flex flex-col items-end">
                  <div className="w-20 h-7 flex items-center">
                    <svg viewBox="0 0 76 28" className="w-full h-full overflow-visible">
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
                          fill={idx === dataPoints.length - 1 ? styling.dotHex : 'white'}
                          stroke={styling.dotHex}
                          strokeWidth="1.6"
                        />
                      ))}
                    </svg>
                  </div>
                  <span className="text-[10px] text-[#64748b] font-bold">4 temporadas</span>
                </div>
              </div>

              {/* Estado de Precaución (Regla N° 4) */}
              <div className="mt-2.5 pt-2 border-t border-dashed border-[#e2e8f0] flex items-center justify-between text-xs">
                <span className={`font-black flex items-center gap-1 ${styling.textDark}`}>
                  {currentRisk === 'Alto'
                    ? 'Evita usar esta agua'
                    : currentRisk === 'Medio'
                    ? 'Agua en observación'
                    : 'Menor riesgo de acidez'}
                </span>
                <span className="text-[11px] text-[#64748b] font-semibold">
                  {currentRisk === 'Alto'
                    ? 'Tono óxido'
                    : currentRisk === 'Medio'
                    ? 'Tono ocre'
                    : 'Cristalina'}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Bottom Permanent Disclaimer */}
      <div className="p-3.5 border-t border-[#cbd5e1] bg-white text-xs text-[#475569] flex items-center gap-2">
        <Shield size={18} className="text-[#1e3a8a] shrink-0" />
        <span className="font-medium leading-tight">
          {DISCLAIMER_NOTE_ES}
        </span>
      </div>
    </aside>
  )
}
