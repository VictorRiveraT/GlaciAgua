import React, { useState } from 'react'
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Droplet,
  Users,
  Camera,
  Layers,
  Send,
  Smartphone,
  ShieldCheck,
  Wifi,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { AudioPlayButton } from './AudioPlayButton'
import { AccessibleIllustration } from './AccessibleIllustration'

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
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header con contador de pasos, audio y cerrar */}
        <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-[#1e3a8a] bg-[#eff6ff] px-3 py-1 rounded-full border border-blue-200">
              {stepCounterText}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {step === 1 && (
              <AudioPlayButton
                audioKey="ayuda_paso1_semaforo"
                textToSpeak={`${t('help_step1_title')}. ${t('help_step1_desc')}. ${t('help_step1_green')}. ${t('help_step1_yellow')}. ${t('help_step1_red')}`}
                compact
              />
            )}
            {step === 2 && (
              <AudioPlayButton
                audioKey="ayuda_paso2_nohervir"
                textToSpeak={`${t('help_step2_title')}. ${t('help_step2_desc')}. ${t('help_step2_rule1')}. ${t('help_step2_rule2')}. ${t('help_step2_rule3')}`}
                compact
              />
            )}
            {step === 3 && (
              <AudioPlayButton
                audioKey="ayuda_paso3_avisar"
                textToSpeak={`${t('help_step3_title')}. ${t('help_step3_desc')}. ${t('help_step3_point1')}. ${t('help_step3_point2')}. ${t('help_step3_point3')}`}
                compact
              />
            )}
            {step === 4 && (
              <AudioPlayButton
                audioKey="ayuda_paso4_offline"
                textToSpeak={`${t('help_step4_title')}. ${t('help_step4_desc')}. ${t('help_step4_point1')}. ${t('help_step4_point2')}. ${t('help_step4_point3')}`}
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

        {/* Contenido del paso actual (con scroll si la pantalla es muy pequeña) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* PASO 1: SEMÁFORO Y GOTAS */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center">
                <h2
                  id="help-modal-title"
                  className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight"
                >
                  {t('help_step1_title')}
                </h2>
                <p className="text-sm text-[#475569] font-medium mt-1">
                  {t('help_step1_desc')}
                </p>
              </div>

              <div className="space-y-2.5">
                {/* Verde */}
                <div className="p-3 rounded-2xl bg-[#f0fdf4] border-2 border-[#bbf7d0] flex items-center gap-3">
                  <div className="w-12 h-12 shrink-0">
                    <AccessibleIllustration
                      name="gota_tranquila"
                      alt="Gota tranquila sonriendo"
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-[#166534] block">
                      Verde (Círculo)
                    </span>
                    <p className="text-xs sm:text-sm text-[#14532d] font-medium leading-snug">
                      {t('help_step1_green')}
                    </p>
                  </div>
                </div>

                {/* Amarillo */}
                <div className="p-3 rounded-2xl bg-[#fefce8] border-2 border-[#fef08a] flex items-center gap-3">
                  <div className="w-12 h-12 shrink-0">
                    <AccessibleIllustration
                      name="gota_preocupada"
                      alt="Gota preocupada con cejas de alerta"
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-[#854d0e] block">
                      Amarillo (Triángulo)
                    </span>
                    <p className="text-xs sm:text-sm text-[#713f12] font-medium leading-snug">
                      {t('help_step1_yellow')}
                    </p>
                  </div>
                </div>

                {/* Rojo */}
                <div className="p-3 rounded-2xl bg-[#fef2f2] border-2 border-[#fecaca] flex items-center gap-3">
                  <div className="w-12 h-12 shrink-0">
                    <AccessibleIllustration
                      name="gota_enferma"
                      alt="Gota enferma con curita y espirales"
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-[#991b1b] block">
                      Rojo (Octágono)
                    </span>
                    <p className="text-xs sm:text-sm text-[#7f1d1d] font-medium leading-snug">
                      {t('help_step1_red')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: QUÉ HACER SI ESTÁ ÁCIDA */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center">
                <h2
                  id="help-modal-title"
                  className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight"
                >
                  {t('help_step2_title')}
                </h2>
                <p className="text-sm text-[#475569] font-medium mt-1">
                  {t('help_step2_desc')}
                </p>
              </div>

              <div className="flex justify-center my-1">
                <div className="w-24 h-24 sm:w-28 sm:h-28">
                  <AccessibleIllustration
                    name="persona_nohervir"
                    alt="Persona advirtiendo no hervir agua con metales"
                    className="w-full h-full"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                {/* Regla 1: No hervir */}
                <div className="p-3 rounded-2xl bg-[#fef2f2] border-2 border-[#f87171] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#dc2626] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle size={18} />
                  </div>
                  <p className="text-xs sm:text-sm text-[#7f1d1d] font-bold leading-snug">
                    {t('help_step2_rule1')}
                  </p>
                </div>

                {/* Regla 2: Fuente segura */}
                <div className="p-3 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Droplet size={18} />
                  </div>
                  <p className="text-xs sm:text-sm text-[#1e3a8a] font-medium leading-snug">
                    {t('help_step2_rule2')}
                  </p>
                </div>

                {/* Regla 3: Avisar */}
                <div className="p-3 rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#475569] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Users size={18} />
                  </div>
                  <p className="text-xs sm:text-sm text-[#334155] font-medium leading-snug">
                    {t('help_step2_rule3')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: CÓMO AVISAR */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center">
                <h2
                  id="help-modal-title"
                  className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight"
                >
                  {t('help_step3_title')}
                </h2>
                <p className="text-sm text-[#475569] font-medium mt-1">
                  {t('help_step3_desc')}
                </p>
              </div>

              <div className="flex justify-center my-1">
                <div className="w-24 h-24 sm:w-28 sm:h-28">
                  <AccessibleIllustration
                    name="celular_aviso"
                    alt="Celular con campana de aviso"
                    className="w-full h-full"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center shrink-0">
                    <Camera size={18} />
                  </div>
                  <p className="text-xs sm:text-sm text-[#1e3a8a] font-medium leading-snug">
                    {t('help_step3_point1')}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#fefce8] border border-[#fef08a] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#854d0e] text-white flex items-center justify-center shrink-0">
                    <Layers size={18} />
                  </div>
                  <p className="text-xs sm:text-sm text-[#713f12] font-medium leading-snug">
                    {t('help_step3_point2')}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#166534] text-white flex items-center justify-center shrink-0">
                    <Send size={18} />
                  </div>
                  <p className="text-xs sm:text-sm text-[#14532d] font-bold leading-snug">
                    {t('help_step3_point3')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PASO 4: FUNCIONAMIENTO OFFLINE */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center">
                <h2
                  id="help-modal-title"
                  className="text-xl sm:text-2xl font-black text-[#0f172a] tracking-tight"
                >
                  {t('help_step4_title')}
                </h2>
                <p className="text-sm text-[#475569] font-medium mt-1">
                  {t('help_step4_desc')}
                </p>
              </div>

              <div className="flex justify-center my-1">
                <div className="w-24 h-24 sm:w-28 sm:h-28">
                  <AccessibleIllustration
                    name="quebrada_limpia"
                    alt="Paisaje andino con glaciar y agua"
                    className="w-full h-full"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center shrink-0">
                    <Smartphone size={18} />
                  </div>
                  <p className="text-xs sm:text-sm text-[#1e3a8a] font-medium leading-snug">
                    {t('help_step4_point1')}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#166534] text-white flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} />
                  </div>
                  <p className="text-xs sm:text-sm text-[#14532d] font-medium leading-snug">
                    {t('help_step4_point2')}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#faf5ff] border border-[#e9d5ff] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#6b21a8] text-white flex items-center justify-center shrink-0">
                    <Wifi size={18} />
                  </div>
                  <p className="text-xs sm:text-sm text-[#581c87] font-bold leading-snug">
                    {t('help_step4_point3')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con indicador de puntos y botones Atrás/Siguiente */}
        <div className="p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between gap-3">
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
