import React, { useState } from 'react'
import { BasinData, Season } from '../types'
import { ACCESSIBLE_RISK_STYLES, DISCLAIMER_NOTE_ES, DISCLAIMER_NOTE_QU } from '../utils/accessibleTheme'
import { AudioPlayButton } from './AudioPlayButton'
import { useI18n } from '../i18n/I18nContext'
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Droplet,
  Flame,
  Sprout,
  Users,
  ShieldAlert,
  Info,
  Sliders,
  MapPin,
  PlusCircle,
  BookOpen,
} from 'lucide-react'

interface SimpleWaterStatusCardProps {
  basins: BasinData[]
  selectedBasin: BasinData
  onSelectBasin: (basin: BasinData) => void
  season: Season
  onOpenReport: () => void
  onOpenGuidance: () => void
  onOpenScientific?: () => void
}

export const SimpleWaterStatusCard: React.FC<SimpleWaterStatusCardProps> = ({
  basins,
  selectedBasin,
  onSelectBasin,
  season,
  onOpenReport,
  onOpenGuidance,
  onOpenScientific,
}) => {
  const { t, isQuechua } = useI18n()
  const [showDetails, setShowDetails] = useState(false)

  const currentRisk = selectedBasin.nivelRiesgo[season]
  const riskStyle = ACCESSIBLE_RISK_STYLES[currentRisk]

  // Texto para audio
  const spokenText = `${selectedBasin.nombre}. ${
    isQuechua ? riskStyle.labelQu : riskStyle.labelEs
  }. ${isQuechua ? riskStyle.shortAdviceQu : riskStyle.shortAdviceEs}. Recuerda: hervir el agua no quita los metales pesados.`

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 text-[#0f172a] select-none">
      {/* 1. Selector de Quebrada */}
      <div className="bg-white p-4 rounded-3xl border border-[#cbd5e1] shadow-xs">
        <label
          htmlFor="basin-select"
          className="block text-sm font-black text-[#475569] mb-1.5 flex items-center gap-1.5"
        >
          <MapPin size={18} className="text-[#1e3a8a]" />
          <span>{t('choose_basin')}</span>
        </label>
        <select
          id="basin-select"
          value={selectedBasin.id}
          onChange={(e) => {
            const found = basins.find((b) => b.id === e.target.value)
            if (found) onSelectBasin(found)
          }}
          className="touch-target w-full px-4 py-3 bg-[#f8fafc] border-2 border-[#94a3b8] rounded-2xl text-base sm:text-lg font-black text-[#0f172a] focus:border-[#1e3a8a] focus:bg-white transition-colors"
        >
          {basins.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nombre} ({b.distrito} - {b.quebradasPrincipales[0]})
            </option>
          ))}
        </select>
      </div>

      {/* 2. Semáforo Principal Grande con Forma Única para Daltónicos */}
      <div
        className={`p-6 rounded-3xl border-3 shadow-md flex flex-col items-center text-center transition-all ${riskStyle.bgSoft} ${riskStyle.borderSoft}`}
        role="region"
        aria-label={`Estado del agua para ${selectedBasin.nombre}: ${
          isQuechua ? riskStyle.labelQu : riskStyle.labelEs
        }`}
      >
        {/* Cabecera con audio accesible */}
        <div className="w-full flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-[#475569]">
            {isQuechua ? riskStyle.shapeNameQu : riskStyle.shapeNameEs}
          </span>
          <AudioPlayButton
            audioKey={`quebrada_${selectedBasin.id}`}
            textToSpeak={spokenText}
            className="shadow-sm"
          />
        </div>

        {/* Ícono de Forma Distintiva (No solo color) */}
        <div
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-white shadow-lg mb-4 ${riskStyle.bgSolid}`}
          aria-hidden="true"
        >
          {currentRisk === 'Alto' && <AlertOctagon size={48} className="sm:w-14 sm:h-14" />}
          {currentRisk === 'Medio' && <AlertTriangle size={48} className="sm:w-14 sm:h-14" />}
          {currentRisk === 'Bajo' && <CheckCircle2 size={48} className="sm:w-14 sm:h-14" />}
        </div>

        {/* Nombre de la Quebrada y Nivel de Riesgo */}
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f172a]">
          {selectedBasin.nombre}
        </h2>

        <div
          className={`mt-1.5 px-4 py-1 rounded-full text-base sm:text-lg font-black text-white ${riskStyle.bgSolid}`}
        >
          {isQuechua ? riskStyle.labelQu : riskStyle.labelEs}
        </div>

        {/* Frase corta de 1 sola línea (sin jerga técnica) */}
        <p className="mt-3 text-base sm:text-lg font-bold text-[#0f172a] max-w-lg leading-snug">
          "{isQuechua ? riskStyle.shortAdviceQu : riskStyle.shortAdviceEs}"
        </p>
      </div>

      {/* 3. Pictogramas de Uso Cotidiano del Agua */}
      <div className="bg-white p-5 rounded-3xl border border-[#cbd5e1] shadow-xs space-y-3">
        <h3 className="text-base sm:text-lg font-black text-[#0f172a] border-b border-[#e2e8f0] pb-2">
          {t('usage_title')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Para Beber */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] flex items-start gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                currentRisk === 'Alto'
                  ? 'bg-red-100 text-[#991b1b]'
                  : currentRisk === 'Medio'
                  ? 'bg-amber-100 text-[#92400e]'
                  : 'bg-green-100 text-[#166534]'
              }`}
            >
              <Droplet size={24} />
            </div>
            <div>
              <strong className="text-sm font-black block text-[#0f172a]">
                {t('usage_drink')}
              </strong>
              <p className="text-xs text-[#334155] font-medium leading-relaxed mt-0.5">
                {currentRisk === 'Alto'
                  ? t('usage_drink_alto')
                  : currentRisk === 'Medio'
                  ? t('usage_drink_medio')
                  : t('usage_drink_bajo')}
              </p>
            </div>
          </div>

          {/* Para Regar Chacra */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] flex items-start gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                currentRisk === 'Alto'
                  ? 'bg-amber-100 text-[#92400e]'
                  : 'bg-green-100 text-[#166534]'
              }`}
            >
              <Sprout size={24} />
            </div>
            <div>
              <strong className="text-sm font-black block text-[#0f172a]">
                {t('usage_crops')}
              </strong>
              <p className="text-xs text-[#334155] font-medium leading-relaxed mt-0.5">
                {currentRisk === 'Alto'
                  ? t('usage_crops_alto')
                  : currentRisk === 'Medio'
                  ? t('usage_crops_medio')
                  : t('usage_crops_bajo')}
              </p>
            </div>
          </div>

          {/* Para Animales */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] flex items-start gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                currentRisk === 'Alto'
                  ? 'bg-red-100 text-[#991b1b]'
                  : currentRisk === 'Medio'
                  ? 'bg-amber-100 text-[#92400e]'
                  : 'bg-green-100 text-[#166534]'
              }`}
            >
              <Users size={24} />
            </div>
            <div>
              <strong className="text-sm font-black block text-[#0f172a]">
                {t('usage_animals')}
              </strong>
              <p className="text-xs text-[#334155] font-medium leading-relaxed mt-0.5">
                {currentRisk === 'Alto'
                  ? t('usage_animals_alto')
                  : currentRisk === 'Medio'
                  ? t('usage_animals_medio')
                  : t('usage_animals_bajo')}
              </p>
            </div>
          </div>

          {/* Advertencia Crítica de Hervido */}
          <div className="p-3.5 rounded-2xl bg-[#fff7ed] border-2 border-[#fdba74] flex items-start gap-3 sm:col-span-2">
            <div className="w-11 h-11 rounded-2xl bg-[#fed7aa] text-[#9a3412] flex items-center justify-center shrink-0">
              <Flame size={24} />
            </div>
            <div>
              <strong className="text-sm font-black text-[#9a3412] block">
                {t('usage_boil')}
              </strong>
              <p className="text-xs text-[#7c2d12] font-semibold leading-relaxed mt-0.5">
                {t('usage_boil_alert')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Acciones Principales (Máximo 3 botones grandes) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onOpenReport}
          className="touch-target p-4 rounded-2xl bg-[#1e3a8a] hover:bg-[#172554] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-colors"
        >
          <PlusCircle size={20} />
          <span>{t('btn_report_water')}</span>
        </button>

        <button
          type="button"
          onClick={onOpenGuidance}
          className="touch-target p-4 rounded-2xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0f172a] border-2 border-[#cbd5e1] font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-colors"
        >
          <BookOpen size={20} />
          <span>{t('btn_guidance')}</span>
        </button>
      </div>

      {/* 5. Divulgación Progresiva: Botón "Ver Datos y Números" */}
      <div className="bg-white rounded-3xl border border-[#cbd5e1] overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="touch-target w-full px-5 py-3.5 flex items-center justify-between text-left font-black text-sm text-[#1e3a8a] hover:bg-[#f8fafc] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sliders size={18} />
            {showDetails ? t('hide_details') : t('view_details')}
          </span>
          {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showDetails && (
          <div className="p-5 border-t border-[#e2e8f0] space-y-4 bg-[#f8fafc] animate-in fade-in duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-2xl border border-[#cbd5e1]">
                <span className="text-[#64748b] font-bold block">pH Medido</span>
                <strong className="text-xl font-black text-[#0f172a]">
                  {selectedBasin.ultimaMedicion.ph.toFixed(1)}
                </strong>
                <span className="text-[10px] text-[#64748b] block mt-0.5">
                  {selectedBasin.ultimaMedicion.fuente}
                </span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#cbd5e1]">
                <span className="text-[#64748b] font-bold block">Conductividad</span>
                <strong className="text-xl font-black text-[#0f172a]">
                  {selectedBasin.ultimaMedicion.conductividad}
                </strong>
                <span className="text-[10px] text-[#64748b] block mt-0.5">µS/cm</span>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#cbd5e1] col-span-2 sm:col-span-1">
                <span className="text-[#64748b] font-bold block">Área de Cuenca</span>
                <strong className="text-xl font-black text-[#0f172a]">
                  {selectedBasin.areaKm2}
                </strong>
                <span className="text-[10px] text-[#64748b] block mt-0.5">km² de cuenca</span>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-[#cbd5e1] text-xs">
              <strong className="text-[#0f172a] block font-bold mb-1">Metales observados:</strong>
              <p className="text-[#334155] leading-relaxed">
                {selectedBasin.ultimaMedicion.metalDominante}
              </p>
            </div>

            {onOpenScientific && (
              <button
                type="button"
                onClick={onOpenScientific}
                className="touch-target w-full py-2.5 px-4 rounded-xl bg-[#1e3a8a] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#172554] transition-colors"
              >
                <span>{t('scientific_panel')}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 6. Aviso Permanente de No Potabilidad (Regla N° 4) */}
      <div className="p-3.5 rounded-2xl bg-[#f1f5f9] border border-[#cbd5e1] text-xs text-[#334155] flex items-center gap-2.5">
        <Info size={18} className="text-[#1e3a8a] shrink-0" />
        <span className="font-semibold leading-relaxed">
          {isQuechua ? DISCLAIMER_NOTE_QU : DISCLAIMER_NOTE_ES}
        </span>
      </div>
    </div>
  )
}
