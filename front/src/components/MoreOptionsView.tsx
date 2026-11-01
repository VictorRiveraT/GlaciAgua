import React from 'react'
import {
  HelpCircle,
  Wifi,
  RefreshCw,
  Phone,
  Sliders,
  FlaskConical,
  Shield,
  Info,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { DISCLAIMER_NOTE_ES, DISCLAIMER_NOTE_QU } from '../utils/accessibleTheme'

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
  const { t, isQuechua } = useI18n()

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 text-[#0f172a] select-none">
      {/* Title */}
      <div className="bg-white p-5 rounded-3xl border border-[#cbd5e1] shadow-xs">
        <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">
          {t('nav_more')}
        </h1>
        <p className="text-sm text-[#475569] font-medium mt-1">
          Ayuda comunitaria, puntos de internet y herramientas técnicas.
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
                {t('onboarding_title')}
              </strong>
              <span className="text-xs text-[#64748b]">
                Guía rápida en 3 pasos sobre el deshielo y el semáforo
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
                Puntos de Internet y Tambos
              </strong>
              <span className="text-xs text-[#64748b]">
                Lugares con señal y WiFi libre en Huaraz y Recuay
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
            <div className="w-11 h-11 rounded-2xl bg-[#fefce8] text-[#92400e] flex items-center justify-center shrink-0">
              <RefreshCw size={22} />
            </div>
            <div>
              <strong className="text-sm font-black block text-[#0f172a]">
                {t('sync_pending')}
              </strong>
              <span className="text-xs text-[#64748b]">
                {pendingReportsCount > 0
                  ? `Tienes ${pendingReportsCount} reporte(s) guardado(s) en tu celular`
                  : 'Todos tus reportes locales están al día'}
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#94a3b8]" />
        </button>
      </div>

      {/* Emergency Phones */}
      <div className="bg-white p-5 rounded-3xl border border-[#cbd5e1] shadow-xs space-y-3">
        <h2 className="text-base font-black text-[#0f172a] flex items-center gap-2 border-b border-[#e2e8f0] pb-2">
          <Phone size={18} className="text-[#1e3a8a]" />
          <span>{t('emergency_contacts')}</span>
        </h2>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] flex items-center justify-between">
            <div>
              <strong className="text-sm font-black text-[#0f172a] block">
                {t('contact_jass')}
              </strong>
              <span className="text-[#64748b]">Consulta sobre el agua entubada de tu sector</span>
            </div>
            <span className="px-3 py-1 rounded-xl bg-[#eff6ff] text-[#1e3a8a] font-black text-xs">
              Local
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] flex items-center justify-between">
            <div>
              <strong className="text-sm font-black text-[#0f172a] block">
                {t('contact_diresa')}
              </strong>
              <span className="text-[#64748b]">Atención médica y vigilancia sanitaria</span>
            </div>
            <a
              href="tel:043421350"
              className="touch-target px-3 py-1 rounded-xl bg-[#1e3a8a] text-white font-bold text-xs inline-flex items-center"
            >
              (043) 421350
            </a>
          </div>

          <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] flex items-center justify-between">
            <div>
              <strong className="text-sm font-black text-[#0f172a] block">
                {t('contact_municipio')}
              </strong>
              <span className="text-[#64748b]">Gerencia de Medio Ambiente y Servicios Públicos</span>
            </div>
            <a
              href="tel:043426161"
              className="touch-target px-3 py-1 rounded-xl bg-[#1e3a8a] text-white font-bold text-xs inline-flex items-center"
            >
              (043) 426161
            </a>
          </div>
        </div>
      </div>

      {/* Technical / Jurado Section */}
      <div className="bg-[#f8fafc] p-5 rounded-3xl border-2 border-dashed border-[#94a3b8] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#1e3a8a] flex items-center gap-2">
            <Sliders size={18} />
            <span>{t('scientific_panel')}</span>
          </h2>
          <span className="text-[10px] font-black bg-[#e2e8f0] px-2.5 py-0.5 rounded-full text-[#475569]">
            FACI 2026
          </span>
        </div>

        <p className="text-xs text-[#475569]">
          Módulos de contraste científico con datos de campo de INAIGEM / UPCH y motor de Machine Learning:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onOpenSimulator}
            className="touch-target p-3.5 rounded-2xl bg-white border border-[#cbd5e1] hover:border-[#1e3a8a] text-left transition-all shadow-2xs"
          >
            <div className="flex items-center gap-2 text-[#1e3a8a] font-black text-xs mb-1">
              <Sliders size={16} />
              <span>{t('simulator_title')}</span>
            </div>
            <p className="text-[11px] text-[#64748b] leading-snug">
              Simulador físico paramétrico con variables de roca, lluvia y bofedal
            </p>
          </button>

          <button
            type="button"
            onClick={onOpenScientific}
            className="touch-target p-3.5 rounded-2xl bg-white border border-[#cbd5e1] hover:border-[#1e3a8a] text-left transition-all shadow-2xs"
          >
            <div className="flex items-center gap-2 text-[#1e3a8a] font-black text-xs mb-1">
              <FlaskConical size={16} />
              <span>Mediciones de Laboratorio</span>
            </div>
            <p className="text-[11px] text-[#64748b] leading-snug">
              Base hidroquímica INAIGEM / UPCH y contraste contra ECA Agua
            </p>
          </button>
        </div>
      </div>

      {/* Permanent Disclaimer Note */}
      <div className="p-4 rounded-2xl bg-[#f1f5f9] border border-[#cbd5e1] text-xs text-[#334155] flex items-center gap-2.5">
        <Info size={20} className="text-[#1e3a8a] shrink-0" />
        <span className="font-semibold leading-relaxed">
          {isQuechua ? DISCLAIMER_NOTE_QU : DISCLAIMER_NOTE_ES}
        </span>
      </div>
    </div>
  )
}
