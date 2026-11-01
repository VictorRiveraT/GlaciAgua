import React, { useState } from 'react'
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Droplet,
  Smartphone,
  Wifi,
  Camera,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { AudioPlayButton } from './AudioPlayButton'
import { Illustration } from './Illustration'

interface CommunityHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export const CommunityHelpModal: React.FC<CommunityHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useI18n()
  const [step, setStep] = useState(1)

  if (!isOpen) return null

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      onClose()
      setStep(1)
    }
  }

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleCloseModal = () => {
    onClose()
    setStep(1)
  }

  const stepCounterText = t('help_step_counter')
    .replace('{current}', String(step))
    .replace('{total}', '4')

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none"
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header con contador de pasos, audio y cerrar */}
        <div className="p-3.5 sm:p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
          <span className="text-xs font-black uppercase text-[#1e3a8a] bg-[#eff6ff] px-3 py-1 rounded-full border border-blue-200">
            {stepCounterText}
          </span>

          <div className="flex items-center gap-2">
            {step === 1 && (
              <AudioPlayButton
                audioKey="ayuda_paso1_semaforo"
                textToSpeak={`${t('help_step1_title')}. ${t('help_step1_green')}. ${t('help_step1_yellow')}. ${t('help_step1_red')}`}
                compact
              />
            )}
            {step === 2 && (
              <AudioPlayButton
                audioKey="ayuda_paso2_nohervir"
                textToSpeak={`${t('help_step2_title')}. ${t('help_step2_rule1')}. ${t('help_step2_rule2')}`}
                compact
              />
            )}
            {step === 3 && (
              <AudioPlayButton
                audioKey="ayuda_paso3_avisar"
                textToSpeak={`${t('help_step3_title')}. ${t('help_step3_point1')}. ${t('help_step3_point3')}`}
                compact
              />
            )}
            {step === 4 && (
              <AudioPlayButton
                audioKey="ayuda_paso4_offline"
                textToSpeak={`${t('help_step4_title')}. ${t('help_step4_point1')}. ${t('help_step4_point3')}`}
                compact
              />
            )}

            <button
              type="button"
              onClick={handleCloseModal}
              className="touch-target w-10 h-10 rounded-full flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] transition-colors"
              aria-label="Cerrar guía"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Contenido del paso actual: Imagen grande + UNA sola frase */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* PASO 1: GUÍA DE AYUDA Y SEMÁFORO */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in flex flex-col items-center text-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                <Illustration
                  name="guia_ayuda"
                  alt="Comunero andino saludando y ofreciendo ayuda"
                  animation="float"
                  className="w-full h-full drop-shadow-md"
                />
              </div>

              <div className="w-full">
                <h2
                  id="help-modal-title"
                  className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight leading-tight"
                >
                  {t('help_step1_title')}
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] font-medium mt-1">
                  {t('help_step1_desc')}
                </p>
              </div>

              {/* 3 Niveles visuales del semáforo */}
              <div className="w-full space-y-2 text-left pt-1">
                <div className="p-2.5 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#16a34a] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                    ✔
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#14532d] leading-tight">
                    {t('help_step1_green')}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#fefce8] border border-[#fef08a] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#d97706] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                    ⚠️
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#713f12] leading-tight">
                    {t('help_step1_yellow')}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#fef2f2] border border-[#fecaca] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#dc2626] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                    ✖
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[#7f1d1d] leading-tight">
                    {t('help_step1_red')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: QUÉ EVITAR (NO HERVIR) */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in flex flex-col items-center text-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                <Illustration
                  name="evitar_hervir"
                  alt="No hervir agua con metales"
                  animation="pulse"
                  className="w-full h-full drop-shadow-md"
                />
              </div>

              <div className="w-full">
                <h2
                  id="help-modal-title"
                  className="text-xl sm:text-2xl font-black text-[#991b1b] tracking-tight leading-tight"
                >
                  {t('help_step2_title')}
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] font-medium mt-1">
                  {t('help_step2_desc')}
                </p>
              </div>

              <div className="w-full space-y-2 text-left pt-1">
                <div className="p-3 rounded-2xl bg-[#fef2f2] border-2 border-[#f87171] flex items-center gap-2.5">
                  <AlertTriangle size={20} className="text-[#dc2626] shrink-0" />
                  <p className="text-xs sm:text-sm font-black text-[#7f1d1d] leading-snug">
                    {t('help_step2_rule1')}
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center gap-2.5">
                  <Droplet size={18} className="text-[#1e3a8a] shrink-0" />
                  <p className="text-xs sm:text-sm font-bold text-[#1e3a8a] leading-snug">
                    {t('help_step2_rule2')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: CÓMO MANDAR UN AVISO */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in flex flex-col items-center text-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                <Illustration
                  name="hacer_avisar"
                  alt="Avisar a la junta comunitaria"
                  animation="pulse"
                  className="w-full h-full drop-shadow-md"
                />
              </div>

              <div className="w-full">
                <h2
                  id="help-modal-title"
                  className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight leading-tight"
                >
                  {t('help_step3_title')}
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] font-medium mt-1">
                  {t('help_step3_desc')}
                </p>
              </div>

              <div className="w-full space-y-2 text-left pt-1">
                <div className="p-3 rounded-2xl bg-[#fefce8] border border-[#fef08a] flex items-center gap-2.5">
                  <Camera size={18} className="text-[#854d0e] shrink-0" />
                  <p className="text-xs sm:text-sm font-bold text-[#713f12] leading-snug">
                    {t('help_step3_point1')}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center gap-2.5">
                  <CheckCircle2 size={18} className="text-[#166534] shrink-0" />
                  <p className="text-xs sm:text-sm font-bold text-[#14532d] leading-snug">
                    {t('help_step3_point3')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PASO 4: FUNCIONAMIENTO OFFLINE */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in flex flex-col items-center text-center">
              <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                <Illustration
                  name="hacer_guardar"
                  alt="Guardar datos seguros"
                  animation="float"
                  className="w-full h-full drop-shadow-md"
                />
              </div>

              <div className="w-full">
                <h2
                  id="help-modal-title"
                  className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight leading-tight"
                >
                  {t('help_step4_title')}
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] font-medium mt-1">
                  {t('help_step4_desc')}
                </p>
              </div>

              <div className="w-full space-y-2 text-left pt-1">
                <div className="p-3 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center gap-2.5">
                  <Smartphone size={18} className="text-[#1e3a8a] shrink-0" />
                  <p className="text-xs sm:text-sm font-bold text-[#1e3a8a] leading-snug">
                    {t('help_step4_point1')}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#faf5ff] border border-[#e9d5ff] flex items-center gap-2.5">
                  <Wifi size={18} className="text-[#6b21a8] shrink-0" />
                  <p className="text-xs sm:text-sm font-bold text-[#581c87] leading-snug">
                    {t('help_step4_point3')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con indicador de puntos y botones Atrás/Siguiente */}
        <div className="p-3.5 sm:p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="touch-target px-4 py-3 rounded-2xl font-bold text-sm text-[#475569] hover:bg-[#e2e8f0] flex items-center gap-1 transition-colors"
            >
              <ChevronLeft size={18} />
              <span>{t('help_btn_prev')}</span>
            </button>
          ) : (
            <div />
          )}

          {/* Dots Indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((dot) => (
              <span
                key={dot}
                className={`h-2.5 rounded-full transition-all ${
                  step === dot ? 'w-7 bg-[#1e3a8a]' : 'w-2.5 bg-[#cbd5e1]'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="touch-target px-5 py-3 rounded-2xl bg-[#1e3a8a] hover:bg-[#172554] text-white font-black text-sm flex items-center gap-1.5 shadow-md ml-auto transition-transform active:scale-95"
          >
            {step === 4 ? (
              <>
                <CheckCircle2 size={18} />
                <span>{t('help_btn_understood')}</span>
              </>
            ) : (
              <>
                <span>{t('help_btn_next')}</span>
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
