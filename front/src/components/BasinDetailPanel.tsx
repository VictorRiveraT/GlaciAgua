import React, { useState } from 'react'
import { BasinData, Season } from '../types'
import {
  X,
  PlusCircle,
  MapPin,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  BookOpen,
  Info,
  Wifi,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { getRiskTheme } from '../utils/accessibleTheme'
import { AccessibleIllustration } from './AccessibleIllustration'

interface BasinDetailPanelProps {
  basin: BasinData | null
  season: Season
  onClose: () => void
  onOpenReport: () => void
  onOpenGuidance: () => void
  onOpenSimulator?: () => void
  onOpenConnectivity?: () => void
  forceShowDetails?: boolean
}

export const BasinDetailPanel: React.FC<BasinDetailPanelProps> = ({
  basin,
  season,
  onClose,
  onOpenReport,
  onOpenGuidance,
  onOpenSimulator,
  onOpenConnectivity,
  forceShowDetails = false,
}) => {
  const { t } = useI18n()
  const [showMore, setShowMore] = useState(forceShowDetails)
  const [showTechnical, setShowTechnical] = useState(false)

  React.useEffect(() => {
    if (forceShowDetails) {
      setShowMore(true)
      setTimeout(() => {
        const el = document.getElementById('basin-detail-more-section')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      }, 60)
    }
  }, [forceShowDetails, basin?.id])

  if (!basin) return null

  const currentRisk = basin.nivelRiesgo[season]
  const theme = getRiskTheme(currentRisk)

  const getShortAdvice = () => {
    switch (currentRisk) {
      case 'Alto':
        return t('basin_panel_advice_high')
      case 'Medio':
        return t('basin_panel_advice_medium')
      default:
        return t('basin_panel_advice_low')
    }
  }

  const getUseBadges = () => {
    switch (currentRisk) {
      case 'Alto':
        return {
          drink: {
            label: t('basin_use_drink'),
            status: '✖',
            desc: t('basin_use_drink_high'),
            style: 'bg-red-100 text-red-900 border-red-300',
          },
          crops: {
            label: t('basin_use_water'),
            status: '⚠️',
            desc: t('basin_use_water_high'),
            style: 'bg-amber-100 text-amber-900 border-amber-300',
          },
          animals: {
            label: t('basin_use_livestock'),
            status: '✖',
            desc: t('basin_use_livestock_high'),
            style: 'bg-red-100 text-red-900 border-red-300',
          },
        }

      case 'Medio':
        return {
          drink: {
            label: t('basin_use_drink'),
            status: '⚠️',
            desc: t('basin_use_drink_medium'),
            style: 'bg-amber-100 text-amber-900 border-amber-300',
          },
          crops: {
            label: t('basin_use_water'),
            status: '⚠️',
            desc: t('basin_use_water_medium'),
            style: 'bg-amber-100 text-amber-900 border-amber-300',
          },
          animals: {
            label: t('basin_use_livestock'),
            status: '⚠️',
            desc: t('basin_use_livestock_medium'),
            style: 'bg-amber-100 text-amber-900 border-amber-300',
          },
        }

      default:
        return {
          drink: {
            label: t('basin_use_drink'),
            status: '✔',
            desc: t('basin_use_drink_low'),
            style: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          },
          crops: {
            label: t('basin_use_water'),
            status: '✔',
            desc: t('basin_use_water_low'),
            style: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          },
          animals: {
            label: t('basin_use_livestock'),
            status: '✔',
            desc: t('basin_use_livestock_low'),
            style: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          },
        }
    }
  }

  const badges = getUseBadges()

  return (
    <aside className="w-full lg:w-[380px] bg-white border-l border-[#dfe7e5] flex flex-col h-auto lg:h-full overflow-visible lg:overflow-y-auto shadow-2xl z-20 select-none">
      {/* Encabezado */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full inline-block">
            {t('basin_microbasin')}
          </span>

          <h2 className="text-2xl font-black text-slate-900 leading-tight">
            {basin.nombre}
          </h2>

          <span className="text-sm text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
            <MapPin size={12} className="text-blue-700" />
            {basin.distrito}
          </span>
        </div>

        <button
          onClick={onClose}
          className="touch-target p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          aria-label={t('btn_close')}
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Tarjeta de riesgo */}
        <div
          className={`p-4 rounded-3xl border-2 flex items-center gap-3.5 shadow-sm ${
            currentRisk === 'Alto'
              ? 'bg-red-50 border-red-300'
              : currentRisk === 'Medio'
                ? 'bg-amber-50 border-amber-300'
                : 'bg-emerald-50 border-emerald-300'
          }`}
        >
          <div className="w-16 h-16 shrink-0 flex items-center justify-center">
            {currentRisk === 'Alto' && (
              <AccessibleIllustration
                name="gota_enferma"
                alt={t('alt_sick_water_drop')}
              />
            )}

            {currentRisk === 'Medio' && (
              <AccessibleIllustration
                name="gota_preocupada"
                alt={t('alt_worried_water_drop')}
              />
            )}

            {currentRisk === 'Bajo' && (
              <AccessibleIllustration
                name="gota_tranquila"
                alt={t('alt_calm_water_drop')}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">
                {theme.iconName === 'octagon'
                  ? '🛑'
                  : theme.iconName === 'triangle'
                    ? '⚠️'
                    : '✓'}
              </span>

              <strong
                className={`text-base font-black uppercase ${
                  currentRisk === 'Alto'
                    ? 'text-red-900'
                    : currentRisk === 'Medio'
                      ? 'text-amber-900'
                      : 'text-emerald-900'
                }`}
              >
                {currentRisk === 'Alto'
                  ? t('risk_alto')
                  : currentRisk === 'Medio'
                    ? t('risk_medio')
                    : t('risk_bajo')}
              </strong>
            </div>

            <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              "{getShortAdvice()}"
            </p>
          </div>
        </div>

        {/* Usos cotidianos del agua */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-600 block">
            {t('basin_usage_today')}
          </span>

          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Beber */}
            <div className={`p-2 rounded-xl border ${badges.drink.style}`}>
              <div className="w-8 h-8 mx-auto mb-1">
                <AccessibleIllustration
                  name="persona_bebiendo"
                  alt={t('alt_drinking_water')}
                />
              </div>

              <strong className="text-sm font-black block leading-none">
                {badges.drink.status} {badges.drink.label}
              </strong>

              <span className="text-xs font-bold block leading-tight mt-1">
                {badges.drink.desc}
              </span>
            </div>

            {/* Regar */}
            <div className={`p-2 rounded-xl border ${badges.crops.style}`}>
              <div className="w-8 h-8 mx-auto mb-1">
                <AccessibleIllustration
                  name="chacra_papas"
                  alt={t('alt_watering_crops')}
                />
              </div>

              <strong className="text-sm font-black block leading-none">
                {badges.crops.status} {badges.crops.label}
              </strong>

              <span className="text-xs font-bold block leading-tight mt-1">
                {badges.crops.desc}
              </span>
            </div>

            {/* Ganado */}
            <div className={`p-2 rounded-xl border ${badges.animals.style}`}>
              <div className="w-8 h-8 mx-auto mb-1">
                <AccessibleIllustration
                  name="vaca_oveja"
                  alt={t('alt_livestock')}
                />
              </div>

              <strong className="text-sm font-black block leading-none">
                {badges.animals.status} {badges.animals.label}
              </strong>

              <span className="text-xs font-bold block leading-tight mt-1">
                {badges.animals.desc}
              </span>
            </div>
          </div>
        </div>

        {/* Botón para reportar */}
        <button
          onClick={onOpenReport}
          className="touch-target w-full py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white text-base font-black flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98"
        >
          <PlusCircle size={18} />
          <span>{t('btn_report_here')}</span>
        </button>

        {/* Detalles desplegables */}
        <div className="border-t border-slate-200 pt-2">
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="touch-target w-full py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-sm font-bold text-slate-700 flex items-center justify-between transition-colors"
            aria-expanded={showMore}
          >
            <span className="flex items-center gap-1.5 font-black text-blue-800">
              <Info size={16} />
              <span>
                {showMore ? t('btn_less_info') : t('btn_more_info')}
              </span>
            </span>

            {showMore ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

          {showMore && (
            <div
              id="basin-detail-more-section"
              className="mt-3 space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs animate-in fade-in"
            >
              {/* Advertencia sobre hervir el agua */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <strong className="text-amber-900 block font-black">
                  🫖 {t('boil_alert_title')}
                </strong>

                <p className="text-amber-800 leading-snug">
                  {t('boil_alert_desc')}
                </p>
              </div>

              {/* Mediciones del agua */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <strong className="text-slate-900 block font-black">
                  {t('basin_field_data_title')}
                </strong>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    pH: <strong>{basin.ultimaMedicion.ph.toFixed(1)}</strong>
                  </div>

                  <div>
                    {t('scientific_conductivity')}:{' '}
                    <strong>
                      {basin.ultimaMedicion.conductividad} µS/cm
                    </strong>
                  </div>

                  <div className="col-span-2 text-slate-500">
                    {t('basin_data_source')}:{' '}
                    {basin.ultimaMedicion.fuente}
                  </div>
                </div>
              </div>

              {/* Consejos de prevención */}
              <button
                type="button"
                onClick={onOpenGuidance}
                className="touch-target w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <BookOpen size={15} />
                <span>{t('btn_guidance_full')}</span>
              </button>

              {/* Puntos de conectividad */}
              {onOpenConnectivity && (
                <button
                  type="button"
                  onClick={onOpenConnectivity}
                  className="touch-target w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
                >
                  <Wifi size={15} />
                  <span>{t('basin_connectivity_points')}</span>
                </button>
              )}

              {/* Información técnica */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowTechnical(!showTechnical)}
                  className="w-full text-slate-500 hover:text-slate-800 text-[11px] font-bold py-1 text-center flex items-center justify-center gap-1"
                >
                  <FlaskConical size={13} />

                  <span>
                    {showTechnical
                      ? t('basin_hide_jury_data')
                      : t('basin_jury_data')}
                  </span>
                </button>

                {showTechnical && (
                  <div className="mt-2 p-3 bg-slate-900 text-white rounded-xl space-y-2 text-[11px]">
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span className="text-slate-400">
                        {t('basin_random_forest')}
                      </span>

                      <span className="text-sky-300">
                        83.6% {t('basin_accuracy')}
                      </span>
                    </div>

                    {onOpenSimulator && (
                      <button
                        onClick={onOpenSimulator}
                        className="w-full py-1.5 bg-sky-600/30 text-sky-200 rounded-lg text-center font-bold"
                      >
                        {t('more_simulator')}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Aviso permanente */}
        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
          {t('disclaimer_short')}
        </div>
      </div>
    </aside>
  )
}