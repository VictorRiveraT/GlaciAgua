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

  // 1 short sentence (≤ 10 words, daily language)
  const getShortAdvice = () => {
    switch (currentRisk) {
      case 'Alto':
        return 'Esta quebrada puede tener acidez. Evita usarla y avisa.'
      case 'Medio':
        return 'Agua en observación. Pregunta a tu junta antes de usarla.'
      default:
        return 'Menor riesgo de acidez. Trata el agua según tu JASS.'
    }
  }

  // 3 compact usages with ✔ / ⚠️ / ✖
  const getUseBadges = () => {
    switch (currentRisk) {
      case 'Alto':
        return {
          drink: { label: 'Beber', status: '✖', desc: 'No beber', style: 'bg-red-100 text-red-900 border-red-300' },
          crops: { label: 'Regar', status: '⚠️', desc: 'Con cuidado', style: 'bg-amber-100 text-amber-900 border-amber-300' },
          animals: { label: 'Ganado', status: '✖', desc: 'No dar al ganado', style: 'bg-red-100 text-red-900 border-red-300' },
        }
      case 'Medio':
        return {
          drink: { label: 'Beber', status: '⚠️', desc: 'Solo red segura', style: 'bg-amber-100 text-amber-900 border-amber-300' },
          crops: { label: 'Regar', status: '⚠️', desc: 'Revisar surcos', style: 'bg-amber-100 text-amber-900 border-amber-300' },
          animals: { label: 'Ganado', status: '⚠️', desc: 'Preferir puquio', style: 'bg-amber-100 text-amber-900 border-amber-300' },
        }
      default:
        return {
          drink: { label: 'Beber', status: '✔', desc: 'Clorar con JASS', style: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
          crops: { label: 'Regar', status: '✔', desc: 'Riego habitual', style: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
          animals: { label: 'Ganado', status: '✔', desc: 'Apta abrevadero', style: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
        }
    }
  }

  const badges = getUseBadges()

  return (
    <aside className="w-full lg:w-[380px] bg-white border-l border-[#dfe7e5] flex flex-col h-full overflow-y-auto shadow-2xl z-20 select-none">
      {/* Top Header: Simple and Clean */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full inline-block">
            {t('basin_microbasin')}
          </span>
          <h2 className="text-xl font-black text-slate-900 leading-tight">
            {basin.nombre}
          </h2>
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
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
        {/* Semaphore Card with Droplet Gesture: Exactly 1 line of advice */}
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
            {currentRisk === 'Alto' && <AccessibleIllustration name="gota_enferma" alt="Gota enferma" />}
            {currentRisk === 'Medio' && <AccessibleIllustration name="gota_preocupada" alt="Gota preocupada" />}
            {currentRisk === 'Bajo' && <AccessibleIllustration name="gota_tranquila" alt="Gota tranquila" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">
                {theme.iconName === 'octagon' ? '🛑' : theme.iconName === 'triangle' ? '⚠️' : '✓'}
              </span>
              <strong
                className={`text-sm font-black uppercase ${
                  currentRisk === 'Alto'
                    ? 'text-red-900'
                    : currentRisk === 'Medio'
                    ? 'text-amber-900'
                    : 'text-emerald-900'
                }`}
              >
                {currentRisk === 'Alto' ? t('risk_alto') : currentRisk === 'Medio' ? t('risk_medio') : t('risk_bajo')}
              </strong>
            </div>
            {/* ONE sentence (max 10 words) */}
            <p className="text-xs font-bold text-slate-800 leading-snug">
              "{getShortAdvice()}"
            </p>
          </div>
        </div>

        {/* 3 Compact Usages (Beber, Regar, Ganado) with ✔ / ⚠️ / ✖ */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
            Uso del agua hoy:
          </span>
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Beber */}
            <div className={`p-2 rounded-xl border ${badges.drink.style}`}>
              <div className="w-8 h-8 mx-auto mb-1">
                <AccessibleIllustration name="persona_bebiendo" alt="Beber" />
              </div>
              <strong className="text-xs font-black block leading-none">
                {badges.drink.status} {badges.drink.label}
              </strong>
              <span className="text-[10px] font-semibold block leading-tight mt-0.5">
                {badges.drink.desc}
              </span>
            </div>

            {/* Regar */}
            <div className={`p-2 rounded-xl border ${badges.crops.style}`}>
              <div className="w-8 h-8 mx-auto mb-1">
                <AccessibleIllustration name="chacra_papas" alt="Regar" />
              </div>
              <strong className="text-xs font-black block leading-none">
                {badges.crops.status} {badges.crops.label}
              </strong>
              <span className="text-[10px] font-semibold block leading-tight mt-0.5">
                {badges.crops.desc}
              </span>
            </div>

            {/* Ganado */}
            <div className={`p-2 rounded-xl border ${badges.animals.style}`}>
              <div className="w-8 h-8 mx-auto mb-1">
                <AccessibleIllustration name="vaca_oveja" alt="Ganado" />
              </div>
              <strong className="text-xs font-black block leading-none">
                {badges.animals.status} {badges.animals.label}
              </strong>
              <span className="text-[10px] font-semibold block leading-tight mt-0.5">
                {badges.animals.desc}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={onOpenReport}
          className="touch-target w-full py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-black flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98"
        >
          <PlusCircle size={18} />
          <span>{t('btn_report_here')}</span>
        </button>

        {/* Progressive Disclosure: "Ver más" Collapsible Button */}
        <div className="border-t border-slate-200 pt-2">
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="touch-target w-full py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-slate-700 flex items-center justify-between transition-colors"
            aria-expanded={showMore}
          >
            <span className="flex items-center gap-1.5 font-black text-blue-800">
              <Info size={16} />
              <span>{showMore ? t('btn_less_info') : t('btn_more_info')}</span>
            </span>
            {showMore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showMore && (
            <div id="basin-detail-more-section" className="mt-3 space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs animate-in fade-in">
              {/* Health reminder about boiling */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <strong className="text-amber-900 block font-black">
                  🫖 {t('boil_alert_title')}
                </strong>
                <p className="text-amber-800 leading-snug">
                  {t('boil_alert_desc')}
                </p>
              </div>

              {/* Water measurements */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                <strong className="text-slate-900 block font-black">
                  Datos de campo en esta quebrada:
                </strong>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>pH: <strong>{basin.ultimaMedicion.ph.toFixed(1)}</strong></div>
                  <div>Conductividad: <strong>{basin.ultimaMedicion.conductividad} µS/cm</strong></div>
                  <div className="col-span-2 text-slate-500">
                    Fuente: {basin.ultimaMedicion.fuente}
                  </div>
                </div>
              </div>

              {/* Link to Guidance */}
              <button
                type="button"
                onClick={onOpenGuidance}
                className="touch-target w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <BookOpen size={15} />
                <span>{t('btn_guidance_full')}</span>
              </button>

              {/* Link to Connectivity */}
              {onOpenConnectivity && (
                <button
                  type="button"
                  onClick={onOpenConnectivity}
                  className="touch-target w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
                >
                  <Wifi size={15} />
                  <span>Ver puntos con señal y WiFi cerca</span>
                </button>
              )}

              {/* Link to Technical / Jury data */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowTechnical(!showTechnical)}
                  className="w-full text-slate-500 hover:text-slate-800 text-[11px] font-bold py-1 text-center flex items-center justify-center gap-1"
                >
                  <FlaskConical size={13} />
                  <span>{showTechnical ? 'Ocultar datos del Jurado' : 'Datos para Jurado / Ingenieros'}</span>
                </button>

                {showTechnical && (
                  <div className="mt-2 p-3 bg-slate-900 text-white rounded-xl space-y-2 text-[11px]">
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span className="text-slate-400">Modelo Random Forest:</span>
                      <span className="text-sky-300">83.6% precisión</span>
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

        {/* Permanent Disclaimer Pill */}
        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium">
          {t('disclaimer_short')}
        </div>
      </div>
    </aside>
  )
}
