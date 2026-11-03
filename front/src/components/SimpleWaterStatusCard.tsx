import React, { useState } from 'react'
import { BasinData, Season } from '../types'
import { ACCESSIBLE_RISK_STYLES, DISCLAIMER_NOTE_ES, DISCLAIMER_NOTE_QU } from '../utils/accessibleTheme'
import { AudioPlayButton } from './AudioPlayButton'
import { AccessibleIllustration } from './AccessibleIllustration'
import { useI18n } from '../i18n/I18nContext'
import {
  ChevronDown,
  ChevronUp,
  Sliders,
  MapPin,
  PlusCircle,
  BookOpen,
  Info,
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

  // Status seals per risk level
  const getDrinkSeal = () => {
    if (currentRisk === 'Alto') return { icon: '✖', text: 'Evitar beber', badge: 'bg-red-100 text-red-900 border-red-300' }
    if (currentRisk === 'Medio') return { icon: '⚠️', text: 'Solo captación autorizada', badge: 'bg-amber-100 text-amber-900 border-amber-300' }
    return { icon: '✔', text: 'Tratar con tu JASS', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' }
  }

  const getCropsSeal = () => {
    if (currentRisk === 'Alto') return { icon: '✖', text: 'Evitar en hortalizas', badge: 'bg-red-100 text-red-900 border-red-300' }
    if (currentRisk === 'Medio') return { icon: '⚠️', text: 'Regar con precaución', badge: 'bg-amber-100 text-amber-900 border-amber-300' }
    return { icon: '✔', text: 'Riego habitual', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' }
  }

  const getAnimalsSeal = () => {
    if (currentRisk === 'Alto') return { icon: '✖', text: 'Evitar que beban', badge: 'bg-red-100 text-red-900 border-red-300' }
    if (currentRisk === 'Medio') return { icon: '⚠️', text: 'Preferir puquios', badge: 'bg-amber-100 text-amber-900 border-amber-300' }
    return { icon: '✔', text: 'Menor riesgo ganado', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' }
  }

  const drinkSeal = getDrinkSeal()
  const cropsSeal = getCropsSeal()
  const animalsSeal = getAnimalsSeal()

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
              {b.nombre} ({b.distrito})
            </option>
          ))}
        </select>
      </div>

      {/* 2. Semáforo Principal Grande con Ilustración Animada + Forma + Color */}
      <div
        className={`p-6 rounded-3xl border-3 shadow-md flex flex-col items-center text-center transition-all ${riskStyle.bgSoft} ${riskStyle.borderSoft}`}
        role="region"
        aria-label={`Estado del agua para ${selectedBasin.nombre}: ${
          isQuechua ? riskStyle.labelQu : riskStyle.labelEs
        }`}
      >
        {/* Cabecera con audio accesible */}
        <div className="w-full flex items-center justify-between gap-2 mb-2">
          <span className="text-sm font-black uppercase tracking-wider text-[#475569]">
            {isQuechua ? riskStyle.shapeNameQu : riskStyle.shapeNameEs}
          </span>
          <AudioPlayButton
            audioKey={`quebrada_${selectedBasin.id}`}
            textToSpeak={spokenText}
            className="shadow-sm"
          />
        </div>

        {/* Ilustración Animada del Gesto de la Gota (Color + Forma + Rostro) */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 my-2 flex items-center justify-center">
          {currentRisk === 'Alto' && (
            <AccessibleIllustration
              name="gota_enferma"
              alt="Gota de agua enferma por acidez (Alerta roja, octágono)"
              className="w-full h-full"
            />
          )}
          {currentRisk === 'Medio' && (
            <AccessibleIllustration
              name="gota_preocupada"
              alt="Gota de agua preocupada (Precaución amarilla, triángulo)"
              className="w-full h-full"
            />
          )}
          {currentRisk === 'Bajo' && (
            <AccessibleIllustration
              name="gota_tranquila"
              alt="Gota de agua tranquila y sonriente (Menor riesgo verde, círculo)"
              className="w-full h-full"
            />
          )}
        </div>

        {/* Nombre de la Quebrada y Nivel de Riesgo */}
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f172a]">
          {selectedBasin.nombre}
        </h2>

        <div
          className={`mt-2 px-5 py-1.5 rounded-full text-base sm:text-lg font-black text-white shadow-xs ${riskStyle.bgSolid}`}
        >
          {isQuechua ? riskStyle.labelQu : riskStyle.labelEs}
        </div>

        {/* Frase corta de 1 sola línea (máx. 10 palabras, sin jerga técnica) */}
        <p className="mt-3 text-base sm:text-lg font-bold text-[#0f172a] max-w-lg leading-snug">
          "{isQuechua ? riskStyle.shortAdviceQu : riskStyle.shortAdviceEs}"
        </p>
      </div>

      {/* 3. Tarjetas Ilustradas de Uso Cotidiano del Agua con Sellos ✔ / ⚠ / ✖ */}
      <div className="bg-white p-5 rounded-3xl border border-[#cbd5e1] shadow-xs space-y-3">
        <h3 className="text-base sm:text-lg font-black text-[#0f172a] border-b border-[#e2e8f0] pb-2">
          {t('usage_title')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Para Beber */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] flex items-center gap-3">
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              <AccessibleIllustration
                name="persona_bebiendo"
                alt="Beber agua"
                className="w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <strong className="text-base font-black text-[#0f172a] truncate">
                  {t('usage_drink')}
                </strong>
                <span className={`text-xs font-black px-2 py-0.5 rounded-md border shrink-0 ${drinkSeal.badge}`}>
                  {drinkSeal.icon}
                </span>
              </div>
              <p className="text-xs font-bold text-[#334155] leading-tight mt-1">
                {drinkSeal.text}
              </p>
            </div>
          </div>

          {/* Para Regar Chacra */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] flex items-center gap-3">
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              <AccessibleIllustration
                name="chacra_papas"
                alt="Regar chacra"
                className="w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <strong className="text-base font-black text-[#0f172a] truncate">
                  {t('usage_crops')}
                </strong>
                <span className={`text-xs font-black px-2 py-0.5 rounded-md border shrink-0 ${cropsSeal.badge}`}>
                  {cropsSeal.icon}
                </span>
              </div>
              <p className="text-xs font-bold text-[#334155] leading-tight mt-1">
                {cropsSeal.text}
              </p>
            </div>
          </div>

          {/* Para Animales */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] flex items-center gap-3">
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              <AccessibleIllustration
                name="vaca_oveja"
                alt="Ganado y truchas"
                className="w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <strong className="text-base font-black text-[#0f172a] truncate">
                  {t('usage_animals')}
                </strong>
                <span className={`text-xs font-black px-2 py-0.5 rounded-md border shrink-0 ${animalsSeal.badge}`}>
                  {animalsSeal.icon}
                </span>
              </div>
              <p className="text-xs font-bold text-[#334155] leading-tight mt-1">
                {animalsSeal.text}
              </p>
            </div>
          </div>

          {/* Advertencia Crítica de Hervido */}
          <div className="p-3.5 rounded-2xl bg-[#fff7ed] border-2 border-[#fdba74] flex items-center gap-3 sm:col-span-2">
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              <AccessibleIllustration
                name="persona_nohervir"
                alt="Hervir no quita metales"
                className="w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <strong className="text-sm font-black text-[#9a3412] truncate">
                  {t('usage_boil')}
                </strong>
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-red-100 text-red-900 border border-red-300 shrink-0">
                  ✖ No quita metales
                </span>
              </div>
              <p className="text-xs text-[#7c2d12] font-bold leading-tight mt-1">
                {t('usage_boil_alert')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Acción Inmediata: Avisar y Recomendaciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onOpenReport}
          className="touch-target w-full py-3.5 px-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98"
        >
          <PlusCircle size={18} />
          <span>{t('btn_report_here')}</span>
        </button>

        <button
          type="button"
          onClick={onOpenGuidance}
          className="touch-target w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-blue-200 text-blue-900 font-black text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <BookOpen size={18} className="text-blue-700" />
          <span>{t('btn_guidance_full')}</span>
        </button>
      </div>

      {/* 4. Divulgación Progresiva: Detalles Científicos Ocultos */}
      <div className="bg-white rounded-3xl border border-[#cbd5e1] shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="touch-target w-full p-4 flex items-center justify-between text-left hover:bg-[#f8fafc] transition-colors"
          aria-expanded={showDetails}
          aria-controls="scientific-details"
        >
          <span className="font-black text-sm text-[#1e3a8a] flex items-center gap-2">
            <Info size={18} />
            <span>{showDetails ? t('hide_details') : t('view_details')}</span>
          </span>
          {showDetails ? <ChevronUp size={20} className="text-[#1e3a8a]" /> : <ChevronDown size={20} className="text-[#1e3a8a]" />}
        </button>

        {showDetails && (
          <div id="scientific-details" className="p-5 border-t border-[#e2e8f0] bg-[#f8fafc] space-y-4 animate-in fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-white p-3 rounded-2xl border border-[#cbd5e1]">
                <span className="text-[11px] font-bold text-[#64748b] block">pH Medido</span>
                <strong className="text-lg font-black text-[#0f172a]">
                  {selectedBasin.ultimaMedicion.ph.toFixed(2)}
                </strong>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-[#cbd5e1]">
                <span className="text-[11px] font-bold text-[#64748b] block">Conductividad</span>
                <strong className="text-lg font-black text-[#0f172a]">
                  {selectedBasin.ultimaMedicion.conductividad}
                </strong>
                <span className="text-[10px] text-[#64748b] block">µS/cm</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-[#cbd5e1] col-span-2">
                <span className="text-[11px] font-bold text-[#64748b] block">Metal Dominante</span>
                <strong className="text-sm font-black text-[#0f172a]">
                  {selectedBasin.ultimaMedicion.metalDominante}
                </strong>
                <span className="text-[10px] text-[#64748b] block">
                  {selectedBasin.ultimaMedicion.fuente}
                </span>
              </div>
            </div>

            {onOpenScientific && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onOpenScientific}
                  className="touch-target px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Sliders size={14} />
                  <span>Ver Panel Científico Completo</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Aviso Permanente de No Potabilidad (Regla Innegociable N° 2) */}
      <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-950 flex items-center gap-2">
        <Info size={16} className="text-amber-800 shrink-0" />
        <span className="font-semibold">
          {isQuechua ? DISCLAIMER_NOTE_QU : DISCLAIMER_NOTE_ES}
        </span>
      </div>
    </div>
  )
}
