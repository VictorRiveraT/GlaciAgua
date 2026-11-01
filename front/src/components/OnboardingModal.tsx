import React from 'react'
import { X, CheckCircle2, ArrowDown } from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { AudioPlayButton } from './AudioPlayButton'
import { AccessibleIllustration } from './AccessibleIllustration'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenHelp?: () => void
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onOpenHelp,
}) => {
  const { t } = useI18n()

  if (!isOpen) return null

  const handleDismiss = () => {
    try {
      localStorage.setItem('glaciagua_welcome_seen', 'true')
      localStorage.setItem('glaciagua_onboarding_seen_v1', 'true')
    } catch {
      // LocalStorage deshabilitado o modo incógnito
    }
    onClose()
  }

  const handleHelpClick = () => {
    handleDismiss()
    if (onOpenHelp) {
      onOpenHelp()
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none"
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col p-6 sm:p-8 relative">
        {/* Header con botón de audio y cerrar */}
        <div className="flex items-center justify-between w-full pb-2">
          <AudioPlayButton
            audioKey="bienvenida_inicio"
            textToSpeak={`${t('welcome_title')}. ${t('welcome_desc')}. ${t('welcome_help_hint')}`}
            compact
          />
          <button
            type="button"
            onClick={handleDismiss}
            className="touch-target w-10 h-10 rounded-full flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors"
            aria-label="Cerrar bienvenida"
          >
            <X size={22} />
          </button>
        </div>

        {/* Ilustración amigable */}
        <div className="flex justify-center my-2">
          <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
            <AccessibleIllustration
              name="gota_tranquila"
              alt="Gota de agua sonriente y amigable"
              className="w-full h-full filter drop-shadow-md"
            />
          </div>
        </div>

        {/* Título y subtítulo */}
        <div className="text-center mt-1">
          <h2
            id="welcome-modal-title"
            className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight"
          >
            {t('welcome_title')}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-[#1e3a8a] uppercase tracking-wide mt-1">
            {t('welcome_subtitle')}
          </p>
        </div>

        {/* Mensaje principal corto */}
        <p className="text-sm sm:text-base text-[#334155] font-medium text-center mt-3 leading-relaxed">
          {t('welcome_desc')}
        </p>

        {/* Indicación visual hacia el botón de ayuda (?) */}
        <div className="mt-4 p-4 rounded-2xl bg-[#eff6ff] border-2 border-dashed border-[#93c5fd] w-full flex flex-col items-center gap-2 text-center">
          <p className="text-xs sm:text-sm font-bold text-[#1e3a8a]">
            {t('welcome_help_hint')}
          </p>

          <div className="flex items-center gap-3 my-1">
            <div className="animate-bounce text-[#1e3a8a]">
              <ArrowDown size={22} className="stroke-[3]" />
            </div>
            <button
              type="button"
              onClick={handleHelpClick}
              className="touch-target w-12 h-12 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-white ring-2 ring-blue-300 hover:scale-105 active:scale-95 transition-transform"
              title="Abrir guía"
              aria-label="Botón de ayuda con signo de interrogación"
            >
              ?
            </button>
          </div>

          <span className="text-xs text-[#475569] font-medium">
            {t('welcome_help_badge')}
          </span>
        </div>

        {/* Botón grande para empezar */}
        <button
          type="button"
          onClick={handleDismiss}
          className="touch-target w-full mt-6 py-4 px-6 rounded-2xl bg-[#1e3a8a] hover:bg-[#172554] text-white font-black text-base shadow-lg transition-transform active:scale-98 flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={22} />
          <span>{t('welcome_btn_start')}</span>
        </button>
      </div>
    </div>
  )
}
