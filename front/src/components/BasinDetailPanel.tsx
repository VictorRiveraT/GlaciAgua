import React, { useState } from 'react'
import { BasinData, Season } from '../types'
import {
  Droplet,
  Wifi,
  X,
  PlusCircle,
  BookOpen,
  MapPin,
  FlaskConical,
  Cpu,
  Sliders,
  ChevronDown,
  ChevronUp,
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
}

export const BasinDetailPanel: React.FC<BasinDetailPanelProps> = ({
  basin,
  season,
  onClose,
  onOpenReport,
  onOpenGuidance,
  onOpenSimulator,
  onOpenConnectivity,
}) => {
  const { t } = useI18n()
  const [showTechnicalSection, setShowTechnicalSection] = useState(false)

  if (!basin) return null

  const currentRisk = basin.nivelRiesgo[season]
  const mlData = basin.prediccionML ? basin.prediccionML[season] : null
  const theme = getRiskTheme(currentRisk)

  // Guidance with cautious wording (no false claims of potability or pure water)
  const getUsageGuidance = () => {
    switch (currentRisk) {
      case 'Alto':
        return {
          bannerBg: 'bg-[#991b1b] text-white',
          title: t('basin_alert_high'),
          subtitle: t('advice_alto'),
          human: {
            status: t('basin_human_high'),
            badgeBg: 'bg-red-100 text-red-900 border-red-300',
            desc: t('basin_human_high_desc'),
          },
          crops: {
            status: t('basin_crops_high'),
            badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
            desc: t('basin_crops_high_desc'),
          },
          animals: {
            status: t('basin_animals_high'),
            badgeBg: 'bg-red-100 text-red-900 border-red-300',
            desc: t('basin_animals_high_desc'),
          },
        }
      case 'Medio':
        return {
          bannerBg: 'bg-[#92400e] text-white',
          title: t('basin_alert_medium'),
          subtitle: t('advice_medio'),
          human: {
            status: t('basin_human_med'),
            badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
            desc: t('basin_human_med_desc'),
          },
          crops: {
            status: t('basin_crops_med'),
            badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
            desc: t('basin_crops_med_desc'),
          },
          animals: {
            status: t('basin_animals_med'),
            badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
            desc: t('basin_animals_med_desc'),
          },
        }
      default:
        return {
          bannerBg: 'bg-[#166534] text-white',
          title: t('basin_alert_low'),
          subtitle: t('advice_bajo'),
          human: {
            status: t('basin_human_low'),
            badgeBg: 'bg-green-100 text-green-900 border-green-300',
            desc: t('basin_human_low_desc'),
          },
          crops: {
            status: t('basin_crops_low'),
            badgeBg: 'bg-green-100 text-green-900 border-green-300',
            desc: t('basin_crops_low_desc'),
          },
          animals: {
            status: t('basin_animals_low'),
            badgeBg: 'bg-green-100 text-green-900 border-green-300',
            desc: t('basin_animals_low_desc'),
          },
        }
    }
  }

  const usage = getUsageGuidance()

  // Visual appearance
  const getVisualWaterInfo = () => {
    if (basin.id === 'quillcay' || basin.ultimaMedicion.ph < 4.5) {
      return {
        colorName: t('water_color_rust'),
        colorHex: '#ea580c',
        appearance: t('water_color_rust_desc'),
        taste: 'Sabor agrio o a metal oxidado.',
      }
    }
    if (basin.id === 'pachacoto' || basin.ultimaMedicion.ph < 5.6) {
      return {
        colorName: t('water_color_yellow'),
        colorHex: '#d97706',
        appearance: t('water_color_yellow_desc'),
        taste: 'Sabor ligeramente astringente.',
      }
    }
    if (basin.id === 'canray-chico') {
      return {
        colorName: t('water_color_amber'),
        colorHex: '#eab308',
        appearance: t('water_color_amber_desc'),
        taste: 'Sin olor perceptible.',
      }
    }
    return {
      colorName: t('water_color_clear'),
      colorHex: '#0ea5e9',
      appearance: t('water_color_clear_desc'),
      taste: 'Sin sabor metálico.',
    }
  }

  const visual = getVisualWaterInfo()

  return (
    <aside className="w-full lg:w-[440px] bg-white border-l border-[#dfe7e5] flex flex-col h-full overflow-y-auto shadow-xl z-20 transition-all select-none">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[#dfe7e5] bg-[#fafbfb] sticky top-0 z-10 shadow-2xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase text-[#3346a8] bg-[#edf0ff] px-2.5 py-0.5 rounded-full inline-block mb-1">
              {t('basin_microbasin')}
            </span>
            <h2 className="text-2xl font-black text-[#172726]">{basin.nombre}</h2>
            <p className="text-xs text-[#667573] flex items-center gap-1 mt-0.5 font-medium">
              <MapPin size={13} className="text-[#3346a8]" />
              {basin.distrito}, {basin.provincia}
            </p>
            <p className="text-[11px] text-[#475569] font-bold mt-1">
              {t('basin_creeks')}: {basin.quebradasPrincipales.join(' · ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            title={t('btn_close')}
            aria-label={t('btn_close')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Semáforo del Agua con Ilustración Animada */}
        <div className={`mt-3.5 p-3 rounded-2xl ${usage.bannerBg} shadow-sm flex items-center gap-3`}>
          <div className="w-14 h-14 shrink-0 flex items-center justify-center">
            {currentRisk === 'Alto' && <AccessibleIllustration name="gota_enferma" alt="Gota enferma" />}
            {currentRisk === 'Medio' && <AccessibleIllustration name="gota_preocupada" alt="Gota preocupada" />}
            {currentRisk === 'Bajo' && <AccessibleIllustration name="gota_tranquila" alt="Gota tranquila" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black tracking-tight leading-tight">{usage.title}</h3>
            <p className="text-xs opacity-95 mt-0.5 leading-snug font-medium line-clamp-2">
              {usage.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-5 flex-1">
        {/* Usos Cotidianos con Ilustraciones */}
        <section className="space-y-2.5">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#172726] flex items-center gap-1.5">
            <Droplet size={14} className="text-[#3346a8]" />
            {t('usage_title')}
          </h4>

          {/* 1. Beber */}
          <div className="p-3 bg-white rounded-2xl border border-[#dfe7e5] shadow-2xs flex items-center gap-3">
            <div className="w-12 h-12 shrink-0">
              <AccessibleIllustration name="persona_bebiendo" alt="Beber" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-black text-[#172726] truncate">
                  {t('usage_drink')}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0 ${usage.human.badgeBg}`}>
                  {usage.human.status}
                </span>
              </div>
              <p className="text-[11px] text-[#667573] leading-snug mt-0.5">
                {usage.human.desc}
              </p>
            </div>
          </div>

          {/* 2. Riego */}
          <div className="p-3 bg-white rounded-2xl border border-[#dfe7e5] shadow-2xs flex items-center gap-3">
            <div className="w-12 h-12 shrink-0">
              <AccessibleIllustration name="chacra_papas" alt="Chacra" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-black text-[#172726] truncate">
                  {t('usage_crops')}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0 ${usage.crops.badgeBg}`}>
                  {usage.crops.status}
                </span>
              </div>
              <p className="text-[11px] text-[#667573] leading-snug mt-0.5">
                {usage.crops.desc}
              </p>
            </div>
          </div>

          {/* 3. Ganado */}
          <div className="p-3 bg-white rounded-2xl border border-[#dfe7e5] shadow-2xs flex items-center gap-3">
            <div className="w-12 h-12 shrink-0">
              <AccessibleIllustration name="vaca_oveja" alt="Ganado" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-black text-[#172726] truncate">
                  {t('usage_animals')}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0 ${usage.animals.badgeBg}`}>
                  {usage.animals.status}
                </span>
              </div>
              <p className="text-[11px] text-[#667573] leading-snug mt-0.5">
                {usage.animals.desc}
              </p>
            </div>
          </div>
        </section>

        {/* Alerta sobre hervir el agua */}
        {currentRisk !== 'Bajo' && (
          <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-2xl flex items-center gap-3">
            <div className="w-14 h-14 shrink-0">
              <AccessibleIllustration name="persona_nohervir" alt="Hervir no quita metales" />
            </div>
            <div className="flex-1 min-w-0">
              <strong className="text-xs font-black text-[#a86408] block uppercase tracking-tight">
                {t('boil_alert_title')}
              </strong>
              <p className="text-[11.5px] text-[#78350f] mt-0.5 leading-snug">
                {t('boil_alert_desc')}
              </p>
            </div>
          </div>
        )}

        {/* Aspecto Visual del Agua */}
        <section className="bg-[#f8faf9] p-3.5 rounded-2xl border border-[#dfe7e5] space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#667573] block">
            {t('step_color')}
          </span>
          <div className="flex items-center gap-2.5">
            <span
              className="w-4 h-4 rounded-full shadow-xs shrink-0 border border-white"
              style={{ backgroundColor: visual.colorHex }}
            />
            <strong className="text-xs font-black text-[#172726]">
              {visual.colorName}
            </strong>
          </div>
          <p className="text-[11px] text-[#475569] leading-snug">
            {visual.appearance}
          </p>
        </section>

        {/* Botones de Acción */}
        <div className="pt-1 space-y-2">
          <button
            onClick={onOpenReport}
            className="touch-target w-full rounded-2xl bg-[#3346a8] hover:bg-[#25368f] text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <PlusCircle size={16} />
            {t('btn_report_here')}
          </button>

          <button
            onClick={onOpenGuidance}
            className="touch-target w-full rounded-2xl bg-[#f0f4f3] hover:bg-[#e4eae8] text-[#172726] text-xs font-bold flex items-center justify-center gap-2 border border-[#dfe7e5] transition-all"
          >
            <BookOpen size={15} className="text-[#3346a8]" />
            {t('btn_guidance_full')}
          </button>

          {onOpenConnectivity && (
            <button
              onClick={onOpenConnectivity}
              className="touch-target w-full rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] text-xs font-bold flex items-center justify-center gap-2 border border-emerald-200 transition-all shadow-2xs"
            >
              <Wifi size={14} />
              {t('more_connectivity')}
            </button>
          )}
        </div>

        {/* Acordeón Plegable Técnico */}
        <div className="pt-2 border-t border-[#dfe7e5]">
          <button
            onClick={() => setShowTechnicalSection(!showTechnicalSection)}
            className="touch-target w-full py-2.5 px-3 rounded-xl bg-[#f8faf9] hover:bg-[#edf0ff] border border-[#dfe7e5] text-left flex items-center justify-between text-xs font-bold text-[#475569] transition-all"
          >
            <span className="flex items-center gap-1.5 text-[#3346a8]">
              <FlaskConical size={14} />
              <span>{t('scientific_panel')}</span>
            </span>
            {showTechnicalSection ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showTechnicalSection && (
            <div className="mt-3 space-y-3 bg-[#0f172a] text-white p-4 rounded-2xl border border-slate-700 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs">
                  <Cpu size={14} />
                  <span>{t('ml_model_title')}</span>
                </div>
              </div>

              {mlData && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">pH Estimado</span>
                    <strong className="text-base text-white">
                      pH {mlData.ph_estimado.toFixed(2)}
                    </strong>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">Consenso</span>
                    <strong className="text-base text-sky-300">
                      {Math.round(mlData.acuerdo_arboles * 100)}%
                    </strong>
                  </div>
                </div>
              )}

              {/* Botón directo al simulador */}
              {onOpenSimulator && (
                <button
                  onClick={onOpenSimulator}
                  className="touch-target w-full py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sliders size={14} />
                  {t('more_simulator')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
