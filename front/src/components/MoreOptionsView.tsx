import React from 'react'
import {
  HelpCircle,
  Wifi,
  RefreshCw,
  Phone,
  Sliders,
  FlaskConical,
  ChevronRight,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'

interface MoreOptionsViewProps {
  onOpenOnboarding: () => void
  onOpenConnectivity: () => void
  onOpenSync: () => void
  pendingReportsCount: number
  onOpenSimulator: () => void
  onOpenScientific: () => void
}

export const MoreOptionsView: React.FC<MoreOptionsViewProps> = ({
  onOpenOnboarding,
  onOpenConnectivity,
  onOpenSync,
  pendingReportsCount,
  onOpenSimulator,
  onOpenScientific,
}) => {
  const { t } = useI18n()

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 text-[#0f172a] select-none">
      {/* Title */}
      <div className="bg-white p-5 rounded-3xl border border-[#cbd5e1] shadow-xs">
        <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">
          {t('more_options_title')}
        </h1>
        <p className="text-sm text-[#475569] font-medium mt-1">
          {t('app_tagline')}
        </p>
      </div>

      {/* Community Section */}
      <div className="bg-white rounded-3xl border border-[#cbd5e1] shadow-xs overflow-hidden divide-y divide-[#e2e8f0]">
        {/* Onboarding / Cómo funciona */}
        <button
          type="button"
          onClick={onOpenOnboarding}
          className="touch-target w-full p-4 flex items-center justify-between text-left hover:bg-[#f8fafc] transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#eff6ff] text-[#1e3a8a] flex items-center justify-center shrink-0">
              <HelpCircle size={22} />
            </div>
            <div>
              <strong className="text-sm font-black block text-[#0f172a]">
                {t('more_onboarding')}
              </strong>
              <span className="text-xs text-[#64748b]">
                {t('onboarding_title')}
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#94a3b8]" />
        </button>

        {/* Puntos de Internet y Tambos */}
        <button
          type="button"
          onClick={onOpenConnectivity}
          className="touch-target w-full p-4 flex items-center justify-between text-left hover:bg-[#f8fafc] transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#f0fdf4] text-[#166534] flex items-center justify-center shrink-0">
              <Wifi size={22} />
            </div>
            <div>
              <strong className="text-sm font-black block text-[#0f172a]">
                {t('more_connectivity')}
              </strong>
              <span className="text-xs text-[#64748b]">
                Puntos satelitales y WiFi libre en Huaraz y Recuay
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#94a3b8]" />
        </button>

        {/* Sincronización de reportes */}
        <button
          type="button"
          onClick={onOpenSync}
          className="touch-target w-full p-4 flex items-center justify-between text-left hover:bg-[#f8fafc] transition-colors"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#fefce8] text-[#854d0e] flex items-center justify-center shrink-0 relative">
              <RefreshCw size={22} />
              {pendingReportsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#dc2626] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                  {pendingReportsCount}
                </span>
              )}
            </div>
            <div>
              <strong className="text-sm font-black block text-[#0f172a]">
                {t('more_sync')}
              </strong>
              <span className="text-xs text-[#64748b]">
                {pendingReportsCount > 0
                  ? `Tienes ${pendingReportsCount} aviso(s) guardado(s) en tu celular`
                  : 'Todos tus reportes están al día'}
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#94a3b8]" />
        </button>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-white p-5 rounded-3xl border border-[#cbd5e1] shadow-xs space-y-3">
        <h2 className="text-sm font-black uppercase text-[#475569] tracking-wider flex items-center gap-2">
          <Phone size={16} className="text-[#1e3a8a]" />
          <span>{t('more_contacts')}</span>
        </h2>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div>
              <strong className="font-bold block text-[#0f172a]">{t('contact_jass')}</strong>
              <span className="text-[#64748b]">Atención local y control de bocatomas</span>
            </div>
            <a href="tel:043421234" className="touch-target text-xs font-black text-[#1e3a8a] bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
              Llamar
            </a>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div>
              <strong className="font-bold block text-[#0f172a]">{t('contact_diresa')}</strong>
              <span className="text-[#64748b]">Salud ambiental y emergencias</span>
            </div>
            <a href="tel:043422020" className="touch-target text-xs font-black text-[#1e3a8a] bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
              Llamar
            </a>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
            <div>
              <strong className="font-bold block text-[#0f172a]">{t('contact_municipio')}</strong>
              <span className="text-[#64748b]">Defensa Civil y Gestión de Riesgos</span>
            </div>
            <a href="tel:043421661" className="touch-target text-xs font-black text-[#1e3a8a] bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
              Llamar
            </a>
          </div>
        </div>
      </div>

      {/* Technical / Jury Section */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-sm space-y-3">
        <h2 className="text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-2">
          <FlaskConical size={16} />
          <span>{t('more_scientific')}</span>
        </h2>
        <p className="text-xs text-slate-300">
          Acceso especializado a los modelos científicos y parámetros hidroquímicos.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={onOpenSimulator}
            className="touch-target p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex items-center justify-between transition-colors"
          >
            <div>
              <strong className="text-xs font-black block text-white">{t('more_simulator')}</strong>
              <span className="text-[11px] text-slate-400">Parámetros geológicos</span>
            </div>
            <Sliders size={16} className="text-sky-400" />
          </button>

          <button
            type="button"
            onClick={onOpenScientific}
            className="touch-target p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex items-center justify-between transition-colors"
          >
            <div>
              <strong className="text-xs font-black block text-white">Datos Científicos</strong>
              <span className="text-[11px] text-slate-400">Validación de laboratorio</span>
            </div>
            <FlaskConical size={16} className="text-sky-400" />
          </button>
        </div>
      </div>

      {/* Permanent Caution Disclaimer */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 font-medium">
        {t('disclaimer')}
      </div>
    </div>
  )
}
