
import React, { useState } from 'react'
import { BasinData, Season } from '../types'
import {
  ACCESSIBLE_RISK_STYLES,
  DISCLAIMER_NOTE_ES,
  DISCLAIMER_NOTE_QU,
} from '../utils/accessibleTheme'
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

  // Audio: se mantiene exclusivamente en español.
  const spokenText = `${selectedBasin.nombre}. ${
    riskStyle.labelEs
  }. ${riskStyle.shortAdviceEs}. Recuerda: hervir el agua no quita los metales pesados.`

  const getSeal = (
    highKey: string,
    mediumKey: string,
    lowKey: string
  ) => {
    if (currentRisk === 'Alto') {
      return {
        icon: '✖',
        text: t(highKey),
        badge: 'bg-red-100 text-red-900 border-red-300',
      }
    }

    if (currentRisk === 'Medio') {
      return {
        icon: '⚠️',
        text: t(mediumKey),
        badge: 'bg-amber-100 text-amber-900 border-amber-300',
      }
    }

    return {
      icon: '✔',
      text: t(lowKey),
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    }
  }

  const drinkSeal = getSeal(
    'seal_drink_high',
    'seal_drink_medium',
    'seal_drink_low'
  )

  const cropsSeal = getSeal(
    'seal_crops_high',
    'seal_crops_medium',
    'seal_crops_low'
  )

  const animalsSeal = getSeal(
    'seal_animals_high',
    'seal_animals_medium',
    'seal_animals_low'
  )

  // Traducción de los valores técnicos conocidos.
  const getScientificValue = (value: string) => {
    if (!isQuechua) return value

    const translations: Record<string, string> = {
      'Parámetros normales dentro del ECA':
        t('scientific_normal_parameters'),

      'Estudios de Línea Base ANA':
        t('scientific_source_baseline'),

      'Red de Monitoreo Glaciológico INAIGEM':
        t('scientific_source_inaigem'),

      'Estudio Hidroquímico INAIGEM / UPCH':
        t('scientific_source_hydrochemical'),

      'Evaluación Hidroquímica Canray Chico (INAIGEM)':
        t('scientific_source_canray'),

      'Hierro (Fe: 4.8 mg/L) y Aluminio (Al: 3.2 mg/L)':
        `Fe: 4.8 mg/L · Al: 3.2 mg/L`,

      'Hierro (Fe: 2.1 mg/L) y Manganeso (Mn: 0.6 mg/L)':
        `Fe: 2.1 mg/L · Mn: 0.6 mg/L`,

      'Hierro (Fe: 1.4 mg/L)':
        `Fe: 1.4 mg/L`,
    }

    return translations[value] ?? value
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 text-[#0f172a] select-none">

      {/* 1. Selector de Quebrada */}
      <div className="rounded-3xl border border-[#cbd5e1] bg-white p-4 shadow-xs sm:p-5">
        <label
          htmlFor="basin-select"
          className="mb-1.5 flex items-center gap-1.5 text-sm font-black text-[#475569]"
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
          className="touch-target w-full rounded-2xl border-2 border-[#94a3b8] bg-[#f8fafc] px-4 py-3 text-base font-black text-[#0f172a] transition-colors focus:border-[#1e3a8a] focus:bg-white sm:text-lg"
        >
          {basins.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nombre} ({b.distrito})
            </option>
          ))}
        </select>
      </div>

      {/* 2. Semáforo Principal */}
      <div
        className={`flex flex-col items-center rounded-3xl border-3 p-4 text-center shadow-md transition-all sm:p-6 ${riskStyle.bgSoft} ${riskStyle.borderSoft}`}
        role="region"
        aria-label={`${t('water_status_for')} ${selectedBasin.nombre}: ${
          isQuechua ? riskStyle.labelQu : riskStyle.labelEs
        }`}
      >
        <div className="mb-3 flex w-full flex-col items-center gap-3 sm:mb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <span className="w-full text-center text-xs font-black uppercase tracking-wider text-[#475569] sm:w-auto sm:text-left sm:text-sm">
            {isQuechua ? riskStyle.shapeNameQu : riskStyle.shapeNameEs}
          </span>

          {/* Los audios solo aparecen en español */}
          {!isQuechua && (
            <AudioPlayButton
              audioKey={`quebrada_${selectedBasin.id}`}
              textToSpeak={spokenText}
              className="shrink-0 shadow-sm"
            />
          )}
        </div>

        {/* Ilustración */}
        <div className="my-2 flex h-32 w-32 items-center justify-center sm:my-2 sm:h-40 sm:w-40">
          {currentRisk === 'Alto' && (
            <AccessibleIllustration
              name="gota_enferma"
              alt={t('alt_sick_water_drop')}
              className="h-full w-full"
            />
          )}

          {currentRisk === 'Medio' && (
            <AccessibleIllustration
              name="gota_preocupada"
              alt={t('alt_worried_water_drop')}
              className="h-full w-full"
            />
          )}

          {currentRisk === 'Bajo' && (
            <AccessibleIllustration
              name="gota_tranquila"
              alt={t('alt_calm_water_drop')}
              className="h-full w-full"
            />
          )}
        </div>

        <h2 className="max-w-full break-words text-2xl font-black tracking-tight text-[#0f172a] sm:text-3xl">
          {selectedBasin.nombre}
        </h2>

        <div
          className={`mt-2 rounded-full px-5 py-1.5 text-base font-black text-white shadow-xs sm:text-lg ${riskStyle.bgSolid}`}
        >
          {isQuechua ? riskStyle.labelQu : riskStyle.labelEs}
        </div>

        <p className="mt-3 max-w-lg text-base font-bold leading-snug text-[#0f172a] sm:text-lg">
          "{isQuechua ? riskStyle.shortAdviceQu : riskStyle.shortAdviceEs}"
        </p>
      </div>

      {/* 3. Tarjetas de Uso Cotidiano del Agua */}
      <div className="space-y-3 rounded-3xl border border-[#cbd5e1] bg-white p-4 shadow-xs sm:p-5">
        <h3 className="border-b border-[#e2e8f0] pb-2 text-base font-black text-[#0f172a] sm:text-lg">
          {t('usage_title')}
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          {/* Para Beber */}
          <div className="flex items-center gap-3 rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] p-3.5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center">
              <AccessibleIllustration
                name="persona_bebiendo"
                alt={t('alt_drinking_water')}
                className="h-full w-full"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <strong className="text-base font-black text-[#0f172a]">
                  {t('usage_drink')}
                </strong>
                <span className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-black ${drinkSeal.badge}`}>
                  {drinkSeal.icon}
                </span>
              </div>
              <p className="mt-1 text-xs font-bold leading-tight text-[#334155]">
                {drinkSeal.text}
              </p>
            </div>
          </div>

          {/* Para Regar Chacra */}
          <div className="flex items-center gap-3 rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] p-3.5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center">
              <AccessibleIllustration
                name="chacra_papas"
                alt={t('alt_watering_crops')}
                className="h-full w-full"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <strong className="text-base font-black text-[#0f172a]">
                  {t('usage_crops')}
                </strong>
                <span className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-black ${cropsSeal.badge}`}>
                  {cropsSeal.icon}
                </span>
              </div>
              <p className="mt-1 text-xs font-bold leading-tight text-[#334155]">
                {cropsSeal.text}
              </p>
            </div>
          </div>

          {/* Para Animales */}
          <div className="flex items-center gap-3 rounded-2xl border border-[#cbd5e1] bg-[#f8fafc] p-3.5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center">
              <AccessibleIllustration
                name="vaca_oveja"
                alt={t('alt_livestock')}
                className="h-full w-full"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <strong className="text-base font-black text-[#0f172a]">
                  {t('usage_animals')}
                </strong>
                <span className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-black ${animalsSeal.badge}`}>
                  {animalsSeal.icon}
                </span>
              </div>
              <p className="mt-1 text-xs font-bold leading-tight text-[#334155]">
                {animalsSeal.text}
              </p>
            </div>
          </div>

          {/* Advertencia de Hervido */}
          <div className="flex items-center gap-3 rounded-2xl border-2 border-[#fdba74] bg-[#fff7ed] p-3.5 sm:col-span-2">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center">
              <AccessibleIllustration
                name="persona_nohervir"
                alt={t('alt_boiling_warning')}
                className="h-full w-full"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <strong className="text-sm font-black text-[#9a3412]">
                  {t('usage_boil')}
                </strong>
                <span className="shrink-0 rounded-md border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-black text-red-900">
                  ✖ {t('boil_no_metals_badge')}
                </span>
              </div>
              <p className="mt-1 text-xs font-bold leading-tight text-[#7c2d12]">
                {t('usage_boil_alert')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Acción Inmediata */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onOpenReport}
          className="touch-target flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 px-4 py-3.5 text-sm font-black text-white shadow-md transition-transform hover:bg-blue-800 active:scale-98"
        >
          <PlusCircle size={18} />
          <span>{t('btn_report_here')}</span>
        </button>

        <button
          type="button"
          onClick={onOpenGuidance}
          className="touch-target flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-blue-200 bg-white px-4 py-3.5 text-sm font-black text-blue-900 shadow-xs transition-colors hover:bg-slate-50"
        >
          <BookOpen size={18} className="text-blue-700" />
          <span>{t('btn_guidance_full')}</span>
        </button>
      </div>

      {/* 4. Detalles Científicos */}
      <div className="overflow-hidden rounded-3xl border border-[#cbd5e1] bg-white shadow-xs">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="touch-target flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[#f8fafc]"
          aria-expanded={showDetails}
          aria-controls="scientific-details"
        >
          <span className="flex items-center gap-2 text-sm font-black text-[#1e3a8a]">
            <Info size={18} />
            <span>{showDetails ? t('hide_details') : t('view_details')}</span>
          </span>

          {showDetails ? (
            <ChevronUp size={20} className="text-[#1e3a8a]" />
          ) : (
            <ChevronDown size={20} className="text-[#1e3a8a]" />
          )}
        </button>

        {showDetails && (
          <div
            id="scientific-details"
            className="animate-in space-y-4 border-t border-[#e2e8f0] bg-[#f8fafc] p-4 fade-in sm:p-5"
          >
            <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">

              <div className="rounded-2xl border border-[#cbd5e1] bg-white p-3">
                <span className="block text-[11px] font-bold text-[#64748b]">
                  {t('scientific_ph')}
                </span>
                <strong className="text-lg font-black text-[#0f172a]">
                  {selectedBasin.ultimaMedicion.ph.toFixed(2)}
                </strong>
              </div>

              <div className="rounded-2xl border border-[#cbd5e1] bg-white p-3">
                <span className="block text-[11px] font-bold text-[#64748b]">
                  {t('scientific_conductivity')}
                </span>
                <strong className="text-lg font-black text-[#0f172a]">
                  {selectedBasin.ultimaMedicion.conductividad}
                </strong>
                <span className="block text-[10px] text-[#64748b]">
                  µS/cm
                </span>
              </div>

              <div className="col-span-2 rounded-2xl border border-[#cbd5e1] bg-white p-3">
                <span className="block text-[11px] font-bold text-[#64748b]">
                  {t('scientific_dominant_metal')}
                </span>
                <strong className="text-sm font-black text-[#0f172a]">
                  {getScientificValue(selectedBasin.ultimaMedicion.metalDominante)}
                </strong>
                <span className="block text-[10px] text-[#64748b]">
                  {getScientificValue(selectedBasin.ultimaMedicion.fuente)}
                </span>
              </div>
            </div>

            {onOpenScientific && (
              <div className="flex justify-center pt-2 sm:justify-end">
                <button
                  type="button"
                  onClick={onOpenScientific}
                  className="touch-target flex items-center gap-1.5 rounded-xl bg-blue-100 px-4 py-2 text-xs font-bold text-blue-900 transition-colors hover:bg-blue-200"
                >
                  <Sliders size={14} />
                  <span>{t('scientific_full_panel')}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Aviso Permanente de No Potabilidad */}
      <div className="flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950">
        <Info size={16} className="shrink-0 text-amber-800" />
        <span className="font-semibold">
          {isQuechua ? DISCLAIMER_NOTE_QU : DISCLAIMER_NOTE_ES}
        </span>
      </div>
    </div>
  )
}
