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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-2 backdrop-blur-xs animate-in fade-in select-none sm:items-center sm:p-4"
    >
      <div className="relative my-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-md flex-col overflow-y-auto overscroll-contain rounded-3xl border border-[#cbd5e1] bg-white p-4 shadow-2xl sm:max-h-[92dvh] sm:p-8">
        {/* Header con botón de audio y cerrar */}
        <div className="flex w-full shrink-0 items-center justify-between pb-1 sm:pb-2">
          <AudioPlayButton
            audioKey="bienvenida_inicio"
            textToSpeak={`${t('welcome_title')}. ${t('welcome_desc')}. ${t('welcome_help_hint')}`}
            compact
          />

          <button
            type="button"
            onClick={handleDismiss}
            className="touch-target flex h-9 w-9 items-center justify-center rounded-full text-[#64748b] transition-colors hover:bg-[#f1f5f9] hover:text-[#0f172a] sm:h-10 sm:w-10"
            aria-label="Cerrar bienvenida"
          >
            <X size={22} />
          </button>
        </div>

        {/* Ilustración amigable de bienvenida */}
        <div className="my-1 flex shrink-0 justify-center sm:my-2">
          <div className="flex h-20 w-20 items-center justify-center sm:h-28 sm:w-28">
            <AccessibleIllustration
              name="guia_ayuda"
              alt="Comunero andino saludando y ofreciendo ayuda"
              className="h-full w-full drop-shadow-md"
            />
          </div>
        </div>

        {/* Título y subtítulo */}
        <div className="mt-1 shrink-0 text-center">
          <h2
            id="welcome-modal-title"
            className="text-xl font-black leading-tight tracking-tight text-[#0f172a] sm:text-3xl"
          >
            {t('welcome_title')}
          </h2>

          <p className="mt-1 text-[11px] font-bold uppercase leading-snug tracking-wide text-[#1e3a8a] sm:text-sm">
            {t('welcome_subtitle')}
          </p>
        </div>

        {/* Mensaje principal */}
        <p className="mt-2 shrink-0 text-center text-sm font-medium leading-relaxed text-[#334155] sm:mt-3 sm:text-base">
          {t('welcome_desc')}
        </p>

        {/* Indicación visual hacia el botón de ayuda (?) */}
        <div className="mt-3 flex w-full shrink-0 flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[#93c5fd] bg-[#eff6ff] p-3 text-center sm:mt-4 sm:gap-2 sm:p-4">
          <p className="text-xs font-bold leading-snug text-[#1e3a8a] sm:text-sm">
            {t('welcome_help_hint')}
          </p>

          <div className="my-0.5 flex items-center gap-3 sm:my-1">
            <div className="animate-bounce text-[#1e3a8a]">
              <ArrowDown size={22} className="stroke-[3]" />
            </div>

            <button
              type="button"
              onClick={handleHelpClick}
              className="touch-target flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-[#1e3a8a] text-2xl font-black text-white shadow-md ring-2 ring-blue-300 transition-transform hover:scale-105 active:scale-95 sm:h-12 sm:w-12"
              title="Abrir guía"
              aria-label="Botón de ayuda con signo de interrogación"
            >
              ?
            </button>
          </div>

          <span className="text-xs font-medium leading-snug text-[#475569]">
            {t('welcome_help_badge')}
          </span>
        </div>

        {/* Botón grande para empezar */}
        <button
          type="button"
          onClick={handleDismiss}
          className="touch-target mt-3 flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#1e3a8a] px-4 py-3.5 text-sm font-black text-white shadow-lg transition-transform hover:bg-[#172554] active:scale-98 sm:mt-6 sm:px-6 sm:py-4 sm:text-base"
        >
          <CheckCircle2 size={22} />
          <span>{t('welcome_btn_start')}</span>
        </button>
      </div>
    </div>
  )
}