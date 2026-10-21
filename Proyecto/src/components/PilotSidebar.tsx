import React from 'react'
import { BasinData, Season } from '../types'
import {
  AlertTriangle,
  Droplet,
  CheckCircle2,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react'

interface PilotSidebarProps {
  basins: BasinData[]
  selectedBasin: BasinData | null
  onSelectBasin: (basin: BasinData) => void
  season: Season
  searchTerm: string
  onSearchChange: (val: string) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export const PilotSidebar: React.FC<PilotSidebarProps> = ({
  basins,
  selectedBasin,
  onSelectBasin,
  season,
  searchTerm,
  onSearchChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  const filteredBasins = basins.filter(
    (b) =>
      b.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.distrito.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.quebradasPrincipales.some((q) => q.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Alto':
        return {
          border: 'border-l-4 border-l-[#bd3f3a]',
          badge: 'bg-red-50 text-[#bd3f3a] border-red-200',
          dot: '#bd3f3a',
          waterColor: '#ea580c', // anaranjado óxido
          icon: <AlertTriangle size={13} />,
        }
      case 'Medio':
        return {
          border: 'border-l-4 border-l-[#a86408]',
          badge: 'bg-amber-50 text-[#a86408] border-amber-200',
          dot: '#a86408',
          waterColor: '#ca8a04', // ocre
          icon: <Droplet size={13} />,
        }
      default:
        return {
          border: 'border-l-4 border-l-[#21835b]',
          badge: 'bg-green-50 text-[#21835b] border-green-200',
          dot: '#21835b',
          waterColor: '#0ea5e9', // celeste glaciar
          icon: <CheckCircle2 size={13} />,
        }
    }
  }

  // Collapsed Rail View
  if (isCollapsed) {
    return (
      <aside className="w-14 bg-[#f7f9f8] border-r border-[#dfe7e5] flex flex-col items-center py-3 select-none shrink-0 transition-all z-20">
        <button
          onClick={onToggleCollapse}
          className="w-9 h-9 rounded-xl bg-white hover:bg-[#edf0ff] text-[#3346a8] border border-[#dfe7e5] flex items-center justify-center transition-colors shadow-xs mb-4"
          title="Expandir barra de microcuencas"
        >
          <ChevronRight size={18} />
        </button>

        <div className="space-y-3 flex-1 flex flex-col items-center">
          {basins.map((basin) => {
            const risk = basin.nivelRiesgo[season]
            const isSelected = selectedBasin?.id === basin.id
            const styling = getRiskColor(risk)

            return (
              <button
                key={basin.id}
                onClick={() => onSelectBasin(basin)}
                className={`w-10 h-10 rounded-2xl flex flex-col items-center justify-center transition-all relative ${
                  isSelected
                    ? 'bg-white shadow-md border-2 border-[#3346a8]'
                    : 'bg-white/80 hover:bg-white border border-[#dfe7e5]'
                }`}
                title={`${basin.nombre} - Riesgo ${risk}`}
              >
                <span className="text-[11px] font-black text-[#172726]">
                  {basin.nombre.substring(0, 2).toUpperCase()}
                </span>
                <span
                  className="w-2 h-2 rounded-full absolute -top-1 -right-1 border border-white"
                  style={{ backgroundColor: styling.dot }}
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
    <aside className="w-80 lg:w-84 bg-[#f7f9f8] border-r border-[#dfe7e5] flex flex-col h-full shrink-0 select-none transition-all z-20">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#dfe7e5] bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3346a8] block">
              Piloto Cordillera Blanca
            </span>
            <h2 className="text-xl font-black text-[#172726]">Microcuencas</h2>
          </div>

          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 rounded-xl bg-[#fafbfb] hover:bg-[#edf0ff] text-[#667573] hover:text-[#3346a8] border border-[#dfe7e5] flex items-center justify-center transition-colors shadow-xs"
            title="Colapsar barra lateral (modo mapa cinemático)"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-[#667573]" />
          <input
            type="text"
            placeholder="Buscar quebrada o cuenca..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#dfe7e5] bg-[#fafbfb] text-xs text-[#172726] focus:outline-[#3346a8] transition-all"
          />
        </div>
      </div>

      {/* Basin Cards List with Sparklines & Heavy Metal Tags */}
      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        {filteredBasins.map((basin) => {
          const currentRisk = basin.nivelRiesgo[season]
          const isSelected = selectedBasin?.id === basin.id
          const styling = getRiskColor(currentRisk)

          // 4-point SVG sparkline
          const scores = basin.historialTemporadas.map((h) => h.score)
          const minScore = 15
          const maxScore = 100
          const normalizeY = (s: number) => 24 - ((s - minScore) / (maxScore - minScore)) * 20
          const points = scores.map((s, idx) => `${idx * 20 + 4},${normalizeY(s)}`).join(' ')

          return (
            <button
              key={basin.id}
              onClick={() => onSelectBasin(basin)}
              className={`w-full p-3.5 rounded-2xl text-left bg-white border transition-all ${
                styling.border
              } ${
                isSelected
                  ? 'border-[#3346a8] ring-2 ring-[#3346a8]/20 shadow-md bg-white'
                  : 'border-[#dfe7e5] hover:border-gray-300 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black text-[#172726]">{basin.nombre}</h3>
                    {/* Simulated water color droplet */}
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block shadow-xs"
                      style={{ backgroundColor: styling.waterColor }}
                      title={`Tonalidad típica del agua: ${styling.waterColor}`}
                    />
                  </div>
                  <p className="text-[11px] text-[#667573] leading-snug line-clamp-1 mt-0.5">
                    {basin.quebradasPrincipales.join(' · ')}
                  </p>
                </div>

                <span
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black border ${styling.badge} shrink-0`}
                >
                  {styling.icon}
                  {currentRisk}
                </span>
              </div>

              {/* Middle Row: Sparkline + Key Indicators */}
              <div className="mt-2.5 pt-2 border-t border-[#f0f3f2] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-black text-[#172726]">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        basin.ultimaMedicion.ph < 6.5
                          ? 'bg-red-50 text-[#bd3f3a]'
                          : 'bg-green-50 text-[#21835b]'
                      }`}
                    >
                      pH {basin.ultimaMedicion.ph.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-[#667573] font-semibold">
                      {basin.areaKm2} km²
                    </span>
                  </div>
                  <span className="text-[9.5px] text-[#667573] block truncate max-w-[150px] mt-0.5">
                    {basin.ultimaMedicion.metalDominante.split('(')[0]}
                  </span>
                </div>

                {/* Mini 4-Season Trend Sparkline */}
                <div className="flex flex-col items-end">
                  <div className="w-16 h-7 flex items-center">
                    <svg viewBox="0 0 68 28" className="w-full h-full overflow-visible">
                      <polyline
                        fill="none"
                        stroke={styling.dot}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                      />
                      {scores.map((s, idx) => (
                        <circle
                          key={idx}
                          cx={idx * 20 + 4}
                          cy={normalizeY(s)}
                          r={idx === scores.length - 1 ? 2.5 : 1.8}
                          fill={idx === scores.length - 1 ? styling.dot : 'white'}
                          stroke={styling.dot}
                          strokeWidth="1.5"
                        />
                      ))}
                    </svg>
                  </div>
                  <span className="text-[8.5px] text-[#667573] font-bold">4 temporadas</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Bottom Disclaimer */}
      <div className="p-3 border-t border-[#dfe7e5] bg-white text-[11px] text-[#667573] flex items-center gap-2">
        <Shield size={16} className="text-[#3346a8] shrink-0" />
        <span>Priorización y alerta temprana. No certifica potabilidad.</span>
      </div>
    </aside>
  )
}
