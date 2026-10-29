import React from 'react'
import { BasinData, Season } from '../types'
import {
  AlertTriangle,
  CheckCircle2,
  Droplet,
  X,
  Share2,
  PlusCircle,
  BookOpen,
  TrendingUp,
  Shield,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  FlaskConical,
} from 'lucide-react'

interface BasinDetailPanelProps {
  basin: BasinData | null
  season: Season
  onClose: () => void
  onOpenReport: () => void
  onOpenGuidance: () => void
}

export const BasinDetailPanel: React.FC<BasinDetailPanelProps> = ({
  basin,
  season,
  onClose,
  onOpenReport,
  onOpenGuidance,
}) => {
  if (!basin) return null

  const currentFactors = basin.factores[season]
  const currentRisk = basin.nivelRiesgo[season]
  const currentScore = basin.scoreRiesgo[season]

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'Alto':
        return {
          bg: 'bg-red-50 text-[#bd3f3a] border-red-200',
          icon: <AlertTriangle size={15} />,
          badgeClass: 'risk-alto',
        }
      case 'Medio':
        return {
          bg: 'bg-amber-50 text-[#a86408] border-amber-200',
          icon: <Droplet size={15} />,
          badgeClass: 'risk-medio',
        }
      default:
        return {
          bg: 'bg-green-50 text-[#21835b] border-green-200',
          icon: <CheckCircle2 size={15} />,
          badgeClass: 'risk-bajo',
        }
    }
  }

  const badgeInfo = getRiskBadge(currentRisk)

  const getSampleVialInfo = () => {
    if (basin.id === 'quillcay' || basin.ultimaMedicion.ph < 4.5) {
      return {
        liquidColor: '#ea580c',
        colorName: 'Agua Anaranjada - Rojiza (DAR Activo)',
        chemicalReason:
          'Precipitación masiva de hidróxidos férricos Fe(OH)₃ al oxidarse la pirita expuesta en cabecera.',
        turbidity: 'Alta (óxidos en suspensión)',
        safe: false,
      }
    }
    if (basin.id === 'pachacoto' || basin.ultimaMedicion.ph < 5.6) {
      return {
        liquidColor: '#d97706',
        colorName: 'Agua Ocre / Amarillenta',
        chemicalReason:
          'Contenido moderado de sulfatos de hierro y manganeso, parcialmente amortiguados por el bofedal Pumapampa.',
        turbidity: 'Media',
        safe: false,
      }
    }
    if (basin.id === 'canray-chico') {
      return {
        liquidColor: '#f59e0b',
        colorName: 'Tonalidad Ámbar Pálida',
        chemicalReason:
          'Presencia leve de hierro de Quebrada Rurec diluida por aportes subterráneos.',
        turbidity: 'Baja',
        safe: false,
      }
    }
    return {
      liquidColor: '#0ea5e9',
      colorName: 'Agua Cristalina Pura (Línea Base)',
      chemicalReason:
        'Litología de granodiorita neutra sin sulfuros reactivos. Cumple todos los estándares ECA.',
      turbidity: 'Nula (transparente)',
      safe: true,
    }
  }

  const sampleVial = getSampleVialInfo()

  return (
    <aside className="w-full lg:w-[420px] bg-white border-l border-[#dfe7e5] flex flex-col h-full overflow-y-auto shadow-xl z-20 transition-all">
      {/* Top Header */}
      <div className="p-5 border-b border-[#dfe7e5] bg-[#fafbfb] sticky top-0 z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-black tracking-wider uppercase text-[#3346a8] bg-[#edf0ff] px-2.5 py-0.5 rounded-full inline-block mb-1">
              Microcuenca Priorizada
            </span>
            <h2 className="text-2xl font-black text-[#172726]">{basin.nombre}</h2>
            <p className="text-xs text-[#667573] flex items-center gap-1 mt-0.5">
              <MapPin size={12} className="text-[#3346a8]" />
              {basin.distrito}, {basin.provincia} · {basin.areaKm2} km²
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
            aria-label="Cerrar detalle"
          >
            <X size={18} />
          </button>
        </div>

        {/* Big Risk Indicator */}
        <div className="mt-4 flex items-center justify-between p-3.5 rounded-2xl bg-white border border-[#dfe7e5] shadow-xs">
          <div>
            <span className="text-[11px] font-bold text-[#667573] block">Semáforo de Riesgo</span>
            <span className="text-lg font-black text-[#172726]">
              Nivel {currentRisk} ({currentScore} / 100)
            </span>
          </div>
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-black text-sm ${badgeInfo.bg}`}
          >
            {badgeInfo.icon}
            <span>Riesgo {currentRisk}</span>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-5 space-y-6 flex-1">
        {/* Physical Variables Breakdown ("¿Por qué este nivel?") */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#667573]">
                Modelo Físico Explicable
              </span>
              <h3 className="text-base font-black text-[#172726]">¿Por qué este nivel?</h3>
            </div>
            <span className="text-[10px] bg-[#edf0ff] text-[#3346a8] font-bold px-2 py-0.5 rounded-md">
              4 Variables
            </span>
          </div>

          <div className="space-y-3.5 bg-[#fbfcfc] p-4 rounded-2xl border border-[#dfe7e5]">
            {/* Variable 1: Roca Recién Expuesta */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-[#172726] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#bd3f3a]" />
                  1. Roca recién expuesta (Gatillo)
                </span>
                <strong className="text-[#bd3f3a] font-black">{currentFactors.rocaExpuesta}%</strong>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#bd3f3a] transition-all duration-500"
                  style={{ width: `${currentFactors.rocaExpuesta}%` }}
                />
              </div>
              <p className="text-[11px] text-[#667573] mt-1">
                Área deglaciada reciente detectada por satélite (Sentinel-2 e INAIGEM).
              </p>
            </div>

            {/* Variable 2: Geología con Sulfuros */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-[#172726] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#a86408]" />
                  2. Geología reactiva (Potencial ácido)
                </span>
                <strong className="text-[#a86408] font-black">{currentFactors.potencialAcido}%</strong>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#a86408] transition-all duration-500"
                  style={{ width: `${currentFactors.potencialAcido}%` }}
                />
              </div>
              <p className="text-[11px] text-[#667573] mt-1">
                Presencia de pirita y sulfuros oxidables según cartas INGEMMET.
              </p>
            </div>

            {/* Variable 3: Volumen de Lluvia */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-[#172726] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#3346a8]" />
                  3. Volumen de lluvia (Activador y transporte)
                </span>
                <strong className="text-[#3346a8] font-black">{currentFactors.lluvia}%</strong>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#3346a8] transition-all duration-500"
                  style={{ width: `${currentFactors.lluvia}%` }}
                />
              </div>
              <p className="text-[11px] text-[#667573] mt-1">
                Estacionalidad {season === 'seca' ? 'Seca (estiaje)' : 'Húmeda (lluvias intensas)'} (PISCO / SENAMHI).
              </p>
            </div>

            {/* Variable 4: Depuración Natural por Bofedales */}
            <div className="pt-2 border-t border-[#dfe7e5]">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-[#21835b] flex items-center gap-1">
                  <Sparkles size={13} />
                  4. Bofedales (Amortiguador natural)
                </span>
                <strong className="text-[#21835b] font-black">
                  ↓ {currentFactors.bofedalDepuracion}%
                </strong>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#21835b] transition-all duration-500"
                  style={{ width: `${currentFactors.bofedalDepuracion}%` }}
                />
              </div>
              <p className="text-[11px] text-[#21835b] mt-1 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} />
                Actúa como filtro: neutraliza pH y retiene metales pesados.
              </p>
            </div>
          </div>
        </section>

        {/* Diagnostic Summary */}
        <section className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80">
          <span className="text-[10px] font-extrabold uppercase text-[#a86408] block mb-1">
            Diagnóstico Hidrológico
          </span>
          <p className="text-xs text-[#172726] leading-relaxed">{basin.resumenDiagnostico}</p>
        </section>

        {/* Real Ground-Truth Measurement (Etiqueta de Contraste) */}
        <section className="bg-white p-4 rounded-2xl border border-[#dfe7e5] shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-xl bg-[#edf0ff] text-[#3346a8] flex items-center justify-center font-bold">
              <Droplet size={17} />
            </span>
            <div>
              <span className="text-[10px] text-[#667573] block uppercase font-bold">
                Medición Real en Terreno
              </span>
              <h4 className="text-sm font-black text-[#172726]">
                pH {basin.ultimaMedicion.ph.toFixed(1)} · {basin.ultimaMedicion.conductividad} µS/cm
              </h4>
            </div>
          </div>
          <div className="text-xs text-[#667573] space-y-1 mt-2 bg-[#f8faf9] p-2.5 rounded-xl border border-[#dfe7e5]">
            <p>
              <strong className="text-[#172726]">Metales dominantes:</strong>{' '}
              {basin.ultimaMedicion.metalDominante}
            </p>
            <p>
              <strong className="text-[#172726]">Fuente:</strong> {basin.ultimaMedicion.fuente} (
              {basin.ultimaMedicion.fecha})
            </p>
          </div>
        </section>

        {/* Visual Water Sample Flask (Simulación Visual del Agua) */}
        <section className="bg-white p-4 rounded-2xl border border-[#dfe7e5] shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3346a8] flex items-center gap-1.5">
              <FlaskConical size={14} /> Muestra Visual del Agua en Quebrada
            </span>
            <span className="text-[9.5px] font-bold text-[#667573] bg-gray-100 px-2 py-0.5 rounded-full">
              Simulación Geoquímica
            </span>
          </div>

          <div className="flex items-center gap-3.5 bg-[#f8faf9] p-3 rounded-xl border border-[#dfe7e5]">
            {/* Animated Visual Flask */}
            <div className="relative w-12 h-20 bg-white/70 rounded-b-2xl rounded-t-md border-2 border-slate-300 flex flex-col justify-end p-1 overflow-hidden shadow-inner shrink-0">
              {/* Liquid level */}
              <div
                className="w-full rounded-b-xl transition-all duration-700 relative overflow-hidden"
                style={{
                  height: '75%',
                  backgroundColor: sampleVial.liquidColor,
                  opacity: 0.88,
                }}
              >
                {/* Surface liquid wave reflection */}
                <div className="absolute top-0 inset-x-0 h-1 bg-white/40" />
                {/* Precipitate flakes at the bottom if acidic */}
                {basin.ultimaMedicion.ph < 5.0 && (
                  <div className="absolute bottom-0 inset-x-0 h-2 bg-amber-950/40 blur-[1px]" />
                )}
              </div>
              {/* Measurement graduated lines */}
              <div className="absolute top-3 left-1.5 w-1.5 h-[1px] bg-slate-400" />
              <div className="absolute top-6 left-1.5 w-2 h-[1px] bg-slate-400" />
              <div className="absolute top-9 left-1.5 w-1.5 h-[1px] bg-slate-400" />
              <div className="absolute top-12 left-1.5 w-2 h-[1px] bg-slate-400" />
              <div className="absolute top-15 left-1.5 w-1.5 h-[1px] bg-slate-400" />
            </div>

            {/* Chemical Water Explanation */}
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: sampleVial.liquidColor }}
                />
                <strong className="text-sm font-black text-[#172726]">{sampleVial.colorName}</strong>
              </div>
              <p className="text-[11px] text-[#475569] leading-snug">
                {sampleVial.chemicalReason}
              </p>
              <div className="pt-1 text-[10px] font-bold text-[#667573] flex items-center gap-1">
                <span>Turbidez: {sampleVial.turbidity}</span> · 
                <span className={sampleVial.safe ? 'text-[#16a34a]' : 'text-[#dc2626]'}>
                  {sampleVial.safe ? '✓ Cumple ECA natural' : '⚠️ No apta consumo directo'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Seasonal Historical Trend Chart */}
        <section className="bg-white p-4 rounded-2xl border border-[#dfe7e5] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-black text-[#172726]">Evolución por Temporada</h4>
              <span className="text-[11px] text-[#667573]">Últimas 4 temporadas monitoreadas</span>
            </div>
            <TrendingUp size={16} className="text-[#bd3f3a]" />
          </div>

          {/* SVG Trend Line */}
          <div className="w-full h-20 pt-1">
            <svg viewBox="0 0 340 70" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#bd3f3a" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#bd3f3a" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Reference Grid lines */}
              <line x1="10" y1="20" x2="330" y2="20" stroke="#f0f3f2" strokeWidth="1" />
              <line x1="10" y1="50" x2="330" y2="50" stroke="#f0f3f2" strokeWidth="1" />

              {/* Area and Line */}
              <path
                d="M 20 52 L 110 40 L 200 44 L 320 18 L 320 65 L 20 65 Z"
                fill="url(#trendGradient)"
              />
              <path
                d="M 20 52 L 110 40 L 200 44 L 320 18"
                fill="none"
                stroke="#bd3f3a"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Points */}
              <circle cx="20" cy="52" r="4" fill="white" stroke="#bd3f3a" strokeWidth="2" />
              <circle cx="110" cy="40" r="4" fill="white" stroke="#bd3f3a" strokeWidth="2" />
              <circle cx="200" cy="44" r="4" fill="white" stroke="#bd3f3a" strokeWidth="2" />
              <circle cx="320" cy="18" r="4" fill="white" stroke="#bd3f3a" strokeWidth="2" />
            </svg>
          </div>
          <div className="flex justify-between text-[10px] text-[#667573] font-bold px-1 mt-1 border-t border-[#f0f3f2] pt-1.5">
            <span>Seca '25</span>
            <span>Húm '25</span>
            <span>Seca '26</span>
            <span className="text-[#bd3f3a]">Húm '26 (Actual)</span>
          </div>
        </section>

        {/* Affected Population & Tributaries */}
        <section className="text-xs text-[#667573] space-y-2 bg-[#f8faf9] p-3.5 rounded-2xl border border-[#dfe7e5]">
          <div>
            <strong className="text-[#172726] block">Población usuaria del agua:</strong>
            {basin.poblacionDependiente}
          </div>
          <div>
            <strong className="text-[#172726] block">Quebradas tributarias:</strong>
            {basin.quebradasPrincipales.join(' · ')}
          </div>
          <div>
            <strong className="text-[#172726] block">Glaciares de cabecera:</strong>
            {basin.glaciaresCabecera.join(' · ')}
          </div>
        </section>
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-[#dfe7e5] bg-white sticky bottom-0 z-10 flex gap-2">
        <button
          onClick={onOpenReport}
          className="flex-1 min-h-[46px] rounded-xl bg-[#3346a8] hover:bg-[#25368f] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <PlusCircle size={16} />
          Reportar agua en esta cuenca
        </button>
        <button
          onClick={onOpenGuidance}
          className="px-4 min-h-[46px] rounded-xl border border-[#3346a8] text-[#3346a8] hover:bg-[#edf0ff] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <BookOpen size={16} />
          Qué hacer
        </button>
      </div>
    </aside>
  )
}
