
import React, { useState } from 'react'
import {
  HelpCircle,
  Wifi,
  RefreshCw,
  Phone,
  PhoneCall,
  Copy,
  Check,
  Sliders,
  FlaskConical,
  Cpu,
  FileText,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { EMERGENCY_CONTACTS } from '../constants/contacts'

interface MoreOptionsViewProps {
  onOpenOnboarding: () => void
  onOpenConnectivity: () => void
  onOpenSync: () => void
  pendingReportsCount: number
  onOpenSimulator: () => void
  onOpenScientific: () => void
  onOpenAdmin?: () => void
  onOpenOficio?: () => void
}

export const MoreOptionsView: React.FC<MoreOptionsViewProps> = ({
  onOpenOnboarding,
  onOpenConnectivity,
  onOpenSync,
  pendingReportsCount,
  onOpenSimulator,
  onOpenScientific,
  onOpenAdmin,
  onOpenOficio,
}) => {
  const { t } = useI18n()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyNumber = (id: string, rawPhone: string) => {
    navigator.clipboard?.writeText(rawPhone)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const contactTranslationKeys: Record<string, { name: string; role: string }> = {
    'contact-jass': {
      name: 'contact_jass',
      role: 'contact_jass_role',
    },
    'contact-diresa': {
      name: 'contact_diresa',
      role: 'contact_diresa_role',
    },
    'contact-municipio': {
      name: 'contact_municipio',
      role: 'contact_municipio_role',
    },
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 text-[#0f172a] select-none">

      {/* Título */}
      <div className="bg-white p-5 rounded-3xl border border-[#cbd5e1] shadow-xs">
        <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">
          {t('more_options_title')}
        </h1>
        <p className="text-sm text-[#475569] font-medium mt-1">
          {t('app_tagline')}
        </p>
      </div>

      {/* Opciones comunitarias */}
      <div className="bg-white rounded-3xl border border-[#cbd5e1] shadow-xs overflow-hidden divide-y divide-[#e2e8f0]">

        {/* Guía de uso */}
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

        {/* Oficio para autoridades */}
        {onOpenOficio && (
          <button
            type="button"
            onClick={onOpenOficio}
            className="touch-target w-full p-4 flex items-center justify-between text-left hover:bg-[#f8fafc] transition-colors"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#eff6ff] text-[#1e3a8a] flex items-center justify-center shrink-0">
                <FileText size={22} />
              </div>
              <div>
                <strong className="text-sm font-black block text-[#0f172a]">
                  {t('oficio_modal_title')}
                </strong>
                <span className="text-xs text-[#64748b]">
                  {t('more_officio_desc')}
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="text-[#94a3b8]" />
          </button>
        )}

        {/* Conectividad */}
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
                {t('more_connectivity_desc')}
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#94a3b8]" />
        </button>

        {/* Sincronización */}
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
                  ? t('more_sync_pending').replace(
                      '{count}',
                      String(pendingReportsCount)
                    )
                  : t('more_sync_complete')}
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#94a3b8]" />
        </button>
      </div>

      {/* Contactos de emergencia */}
      <div className="bg-white p-5 rounded-3xl border border-[#cbd5e1] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase text-[#475569] tracking-wider flex items-center gap-2">
            <Phone size={16} className="text-[#1e3a8a]" />
            <span>{t('more_contacts')}</span>
          </h2>
          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <AlertCircle size={10} />
            {t('contact_unconfirmed')}
          </span>
        </div>

        <div className="space-y-3">
          {EMERGENCY_CONTACTS.map((contact) => {
            const keys = contactTranslationKeys[contact.id]

            return (
              <div
                key={contact.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-black text-[#0f172a]">
                      {keys ? t(keys.name) : contact.name}
                    </strong>
                  </div>

                  <p className="text-xs text-[#64748b] leading-tight font-medium">
                    {keys ? t(keys.role) : contact.role}
                  </p>

                  <div className="pt-1">
                    <span className="font-mono text-lg sm:text-xl font-black text-[#0f172a] tracking-wider">
                      {contact.displayPhone}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 pt-1 sm:pt-0">
                  <a
                    href={`tel:${contact.rawPhone}`}
                    className="touch-target flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-[#1e3a8a] hover:bg-[#172554] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
                    aria-label={`${t('btn_call')} ${keys ? t(keys.name) : contact.name} ${contact.displayPhone}`}
                  >
                    <PhoneCall size={16} />
                    <span>{t('btn_call')}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => copyNumber(contact.id, contact.rawPhone)}
                    className="touch-target px-3.5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-transform active:scale-95"
                    aria-label={`${t('btn_copy')} ${keys ? t(keys.name) : contact.name}`}
                  >
                    {copiedId === contact.id ? (
                      <>
                        <Check size={16} className="text-[#166534]" />
                        <span className="text-[#166534] font-black">
                          {t('btn_copied')}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>{t('btn_copy')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Datos técnicos y evaluación */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-sm space-y-3">
        <h2 className="text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-2">
          <FlaskConical size={16} />
          <span>{t('more_scientific')}</span>
        </h2>

        <p className="text-xs text-slate-300">
          {t('more_scientific_desc')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">

          {/* Portal de ingeniería */}
          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="touch-target col-span-1 sm:col-span-2 p-3.5 rounded-2xl bg-blue-900/90 hover:bg-blue-800 border border-blue-500/50 text-left flex items-center justify-between transition-colors shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                  <Cpu size={20} />
                </div>
                <div>
                  <strong className="text-xs font-black block text-white">
                    {t('more_admin_title')}
                  </strong>
                  <span className="text-[11px] text-blue-200">
                    {t('more_admin_desc')}
                  </span>
                </div>
              </div>
              <ChevronRight size={18} className="text-blue-300 shrink-0" />
            </button>
          )}

          {/* Simulador */}
          <button
            type="button"
            onClick={onOpenSimulator}
            className="touch-target p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex items-center justify-between transition-colors"
          >
            <div>
              <strong className="text-xs font-black block text-white">
                {t('more_simulator')}
              </strong>
              <span className="text-[11px] text-slate-400">
                {t('more_simulator_desc')}
              </span>
            </div>
            <Sliders size={16} className="text-sky-400" />
          </button>

          {/* Datos científicos */}
          <button
            type="button"
            onClick={onOpenScientific}
            className="touch-target p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left flex items-center justify-between transition-colors"
          >
            <div>
              <strong className="text-xs font-black block text-white">
                {t('more_scientific_data')}
              </strong>
              <span className="text-[11px] text-slate-400">
                {t('more_scientific_validation')}
              </span>
            </div>
            <FlaskConical size={16} className="text-sky-400" />
          </button>
        </div>
      </div>

      {/* Aviso permanente */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 font-medium">
        {t('disclaimer')}
      </div>
    </div>
  )
}
