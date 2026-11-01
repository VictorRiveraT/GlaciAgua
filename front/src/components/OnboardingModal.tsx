import React, { useState } from 'react'
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Mountain,
  AlertOctagon,
  Camera,
  Volume2,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { AudioPlayButton } from './AudioPlayButton'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { t, isQuechua } = useI18n()
  const [step, setStep] = useState(1)

  if (!isOpen) return null

  const steps = [
    {
      step: 1,
      title: t('onboarding_step1_title'),
      desc: t('onboarding_step1_desc'),
      icon: <Mountain size={48} className="text-[#1e3a8a]" />,
      bg: 'bg-blue-50',
      audioKey: 'bienvenida_paso1',
    },
    {
      step: 2,
      title: t('onboarding_step2_title'),
      desc: t('onboarding_step2_desc'),
      icon: <AlertOctagon size={48} className="text-[#991b1b]" />,
      bg: 'bg-red-50',
      audioKey: 'bienvenida_paso2',
    },
    {
      step: 3,
      title: t('onboarding_step3_title'),
      desc: t('onboarding_step3_desc'),
      icon: <Camera size={48} className="text-[#166534]" />,
      bg: 'bg-green-50',
      audioKey: 'bienvenida_paso3',
    },
  ]

  const current = steps[step - 1]

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-[#1e3a8a] bg-[#eff6ff] px-3 py-1 rounded-full">
              Paso {step} de 3
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AudioPlayButton
              audioKey={current.audioKey}
              textToSpeak={`${current.title}. ${current.desc}`}
              compact
            />
            <button
              type="button"
              onClick={onClose}
              className="touch-target w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              aria-label="Cerrar guía"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
          <div
            className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-inner ${current.bg}`}
          >
            {current.icon}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight">
            {current.title}
          </h2>

          <p className="text-base text-[#334155] leading-relaxed max-w-md font-medium">
            {current.desc}
          </p>

          {/* Dots Indicator */}
          <div className="flex items-center gap-2 pt-2">
            {[1, 2, 3].map((dot) => (
              <span
                key={dot}
                className={`w-3 h-3 rounded-full transition-all ${
                  step === dot ? 'w-8 bg-[#1e3a8a]' : 'bg-[#cbd5e1]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="touch-target px-4 py-3 rounded-2xl font-bold text-sm text-[#475569] hover:bg-[#e2e8f0] flex items-center gap-1"
            >
              <ChevronLeft size={18} />
              Atrás
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="touch-target px-6 py-3 rounded-2xl bg-[#1e3a8a] hover:bg-[#172554] text-white font-black text-sm flex items-center gap-1.5 shadow-md ml-auto"
          >
            <span>{step === 3 ? t('btn_understood') : 'Siguiente'}</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
