
import React, { useState } from 'react'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Copy,
  Printer,
  Share2,
  Check,
  Building2,
  Calendar,
  User,
  AlertCircle,
  FileCheck,
  Mail,
  Send,
  Loader2,
} from 'lucide-react'
import { Illustration } from './Illustration'
import { useI18n } from '../i18n/I18nContext'
import { PILOT_BASINS } from '../data/basinsData'
import { GlaciAguaApi } from '../services/api'

interface OfficialLetterModalProps {
  isOpen: boolean
  onClose: () => void
  initialBasinName?: string
}

const COMMON_REASONS = [
  'oficio_reason_color',
  'oficio_reason_metallic',
  'oficio_reason_preventive',
  'oficio_reason_minerals',
] as const

const AUTHORITIES = [
  'oficio_authority_jass',
  'oficio_authority_irrigation',
  'oficio_authority_municipality',
  'oficio_authority_health',
] as const

export const OfficialLetterModal: React.FC<OfficialLetterModalProps> = ({
  isOpen,
  onClose,
  initialBasinName = 'Quillcay',
}) => {
  const { t } = useI18n()
  const [step, setStep] = useState(1)

  const [basinName, setBasinName] = useState(initialBasinName)
  const [reason, setReason] = useState<string>(COMMON_REASONS[0])
  const [recipient, setRecipient] = useState<string>(AUTHORITIES[0])
  const [applicantName, setApplicantName] = useState('')
  const [applicantRole] = useState('oficio_applicant_role')
  const [letterDate, setLetterDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [copied, setCopied] = useState(false)

  const [recipientEmail, setRecipientEmail] = useState('')
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailResult, setEmailResult] = useState<{
    success: boolean
    mensaje: string
  } | null>(null)

  if (!isOpen) return null

  const applicantDisplayName =
    applicantName.trim() || t('oficio_applicant_default')

  const applicantRoleText = t(applicantRole)
  const recipientText = t(recipient)
  const reasonText = t(reason)

  // Carta formal: todo el contenido visible se adapta al idioma activo.
  const letterText = [
    t('oficio_letter_heading'),
    '',
    `${t('oficio_letter_to')}: ${recipientText}`,
    `${t('oficio_letter_from')}: ${applicantDisplayName} (${applicantRoleText})`,
    `${t('oficio_letter_sector')}: ${basinName}`,
    `${t('oficio_letter_date')}: ${letterDate}`,
    '',
    `${t('oficio_letter_subject')}: ${t('oficio_letter_subject_text')}`,
    '',
    t('oficio_letter_greeting'),
    '',
    `${t('oficio_letter_intro_before')} ${basinName}${t('oficio_letter_intro_after')}`,
    '',
    `${t('oficio_letter_reason_heading')}:`,
    `- ${reasonText}.`,
    '',
    `${t('oficio_letter_reference_heading')}:`,
    t('oficio_letter_reference_text'),
    '',
    `${t('oficio_letter_request_heading')}:`,
    `1. ${t('oficio_letter_request_1')}`,
    `2. ${t('oficio_letter_request_2')}`,
    `3. ${t('oficio_letter_request_3')}`,
    '',
    t('oficio_letter_thanks'),
    '',
    t('oficio_letter_farewell'),
    '',
    '',
    '______________________________________',
    applicantName.trim() || t('oficio_letter_signature'),
    `${t('oficio_letter_id_phone')}:`,
  ].join('\n')

  const handleCopy = () => {
    navigator.clipboard?.writeText(letterText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(letterText)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
      setEmailResult({
        success: false,
        mensaje: t('oficio_email_invalid'),
      })
      return
    }

    setIsSendingEmail(true)
    setEmailResult(null)

    try {
      const resp = await GlaciAguaApi.enviarEmailAlerta({
        destinatario: recipientEmail.trim(),
        destinatarioNombre: recipientText,
        remitenteNombre: applicantName.trim() || t('oficio_applicant_default'),
        remitenteRol: applicantRoleText,
        cuencaNombre: basinName,
        motivo: reasonText,
        cuerpoTexto: letterText,
        asunto: `[GlaciAgua] ${t('oficio_email_subject')} - ${basinName}`,
        nivelRiesgo: t('oficio_preventive_attention'),
      })

      setEmailResult({
        success: resp.success,
        mensaje: resp.mensaje,
      })
    } catch {
      setEmailResult({
        success: false,
        mensaje: t('oficio_email_connection_error'),
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handleClose = () => {
    onClose()
    setStep(1)
    setEmailResult(null)
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="oficio-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col max-h-[92vh]">

        {/* Encabezado */}
        <div className="no-print px-3.5 py-3.5 sm:p-4 border-b border-[#e2e8f0] flex items-center gap-2 bg-[#f8fafc] shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[11px] sm:text-xs font-black uppercase text-[#1e3a8a] bg-[#eff6ff] px-2.5 sm:px-3 py-1.5 rounded-full border border-blue-200 whitespace-nowrap shrink-0">
              <span className="sm:hidden">
                {t('oficio_step_short')} {step}/3
              </span>
              <span className="hidden sm:inline">
                {t('oficio_step')} {step} {t('oficio_of')} 3
              </span>
            </span>

            <h2
              id="oficio-modal-title"
              className="text-[13px] sm:text-sm font-black text-[#0f172a] leading-snug min-w-0 flex-1 whitespace-normal break-words"
            >
              {step === 1 && t('oficio_step1_title')}
              {step === 2 && t('oficio_step2_title')}
              {step === 3 && t('oficio_step3_title')}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="touch-target w-10 h-10 rounded-full flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] transition-colors shrink-0"
            aria-label={t('oficio_close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex-1 min-h-0 space-y-4">

          {/* PASO 1 */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="text-xs sm:text-sm font-black text-[#0f172a] block mb-1.5">
                  {t('oficio_label_basin')}
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {PILOT_BASINS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBasinName(b.nombre)}
                      className={`touch-target p-3 rounded-2xl text-xs sm:text-sm font-black border-2 text-left transition-all ${
                        basinName === b.nombre
                          ? 'border-[#1e3a8a] bg-[#eff6ff] text-[#1e3a8a] shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      {b.nombre}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-black text-[#0f172a] block mb-1.5">
                  {t('oficio_label_reason')}
                </label>

                <div className="space-y-2">
                  {COMMON_REASONS.map((reasonKey) => (
                    <button
                      key={reasonKey}
                      type="button"
                      onClick={() => setReason(reasonKey)}
                      className={`touch-target w-full p-3 rounded-2xl text-xs sm:text-sm font-bold border-2 text-left flex items-center justify-between gap-2 transition-all ${
                        reason === reasonKey
                          ? 'border-[#1e3a8a] bg-[#eff6ff] text-[#1e3a8a] shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{t(reasonKey)}</span>
                      {reason === reasonKey && (
                        <Check size={18} className="text-[#1e3a8a] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASO 2 */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="text-xs sm:text-sm font-black text-[#0f172a] block mb-1.5 flex items-center gap-1">
                  <Building2 size={16} className="text-[#1e3a8a]" />
                  {t('oficio_label_to')}
                </label>

                <div className="space-y-2">
                  {AUTHORITIES.map((authorityKey) => (
                    <button
                      key={authorityKey}
                      type="button"
                      onClick={() => setRecipient(authorityKey)}
                      className={`touch-target w-full p-3 rounded-2xl text-xs sm:text-sm font-bold border-2 text-left flex items-center justify-between gap-2 transition-all ${
                        recipient === authorityKey
                          ? 'border-[#1e3a8a] bg-[#eff6ff] text-[#1e3a8a] shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{t(authorityKey)}</span>
                      {recipient === authorityKey && (
                        <Check size={18} className="text-[#1e3a8a] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-black text-[#475569] flex items-center gap-1 mb-1">
                    <User size={14} />
                    {t('oficio_label_name')}
                  </label>

                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder={t('oficio_name_placeholder')}
                    className="touch-target w-full p-3 rounded-2xl border-2 border-slate-300 font-bold text-xs sm:text-sm text-[#0f172a] bg-white focus:outline-hidden focus:border-[#1e3a8a]"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-[#475569] flex items-center gap-1 mb-1">
                    <Calendar size={14} />
                    {t('oficio_label_date')}
                  </label>

                  <input
                    type="date"
                    value={letterDate}
                    onChange={(e) => setLetterDate(e.target.value)}
                    className="touch-target w-full p-3 rounded-2xl border-2 border-slate-300 font-bold text-xs sm:text-sm text-[#0f172a] bg-white focus:outline-hidden focus:border-[#1e3a8a]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 3 */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">

              <div className="no-print flex justify-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24">
                  <Illustration
                    name="oficio_documento"
                    alt={t('oficio_illustration_alt')}
                    animation="float"
                    className="w-full h-full drop-shadow-sm"
                  />
                </div>
              </div>

              {/* Acciones */}
              <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="touch-target py-3.5 px-4 rounded-2xl bg-[#1e3a8a] hover:bg-[#172554] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  <span>
                    {copied ? t('oficio_copied') : t('oficio_btn_copy')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="touch-target py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                >
                  <Printer size={18} />
                  <span>{t('oficio_btn_print')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="touch-target py-3.5 px-4 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                >
                  <Share2 size={18} />
                  <span>{t('oficio_btn_whatsapp')}</span>
                </button>
              </div>

              {/* Correo */}
              <div className="no-print bg-[#eff6ff] p-3.5 sm:p-4 rounded-2xl border border-blue-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-[#1e3a8a] shrink-0" />
                  <h3 className="text-xs sm:text-sm font-black text-[#1e3a8a]">
                    {t('oficio_btn_email')}
                  </h3>
                </div>

                <form
                  onSubmit={handleSendEmail}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => {
                      setRecipientEmail(e.target.value)
                      if (emailResult) setEmailResult(null)
                    }}
                    placeholder={t('oficio_email_placeholder')}
                    className="touch-target flex-1 min-w-0 p-2.5 sm:p-3 rounded-xl border border-blue-300 font-medium text-xs sm:text-sm text-[#0f172a] bg-white focus:outline-hidden focus:border-[#1e3a8a]"
                  />

                  <button
                    type="submit"
                    disabled={isSendingEmail || !recipientEmail.trim()}
                    className="touch-target py-2.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95 shrink-0"
                  >
                    {isSendingEmail ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{t('oficio_email_sending')}</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>{t('oficio_email_send')}</span>
                      </>
                    )}
                  </button>
                </form>

                {emailResult && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      emailResult.success
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {emailResult.success ? (
                      <Check size={16} className="shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="shrink-0" />
                    )}
                    <span>{emailResult.mensaje}</span>
                  </div>
                )}
              </div>

              {/* Vista previa */}
              <div
                id="printable-oficio"
                className="bg-[#f8fafc] p-4 sm:p-6 rounded-2xl border border-slate-300 font-mono text-[11px] sm:text-xs text-[#0f172a] whitespace-pre-wrap leading-relaxed shadow-inner"
              >
                {letterText}
              </div>

              <p className="no-print text-[11px] text-[#475569] flex items-center gap-1.5 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <AlertCircle size={14} className="text-amber-700 shrink-0" />
                <span>{t('oficio_disclaimer')}</span>
              </p>
            </div>
          )}
        </div>

        {/* Pie de navegación */}
        <div className="no-print p-3.5 sm:p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between gap-3 shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="touch-target px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-[#475569] hover:bg-[#e2e8f0] flex items-center gap-1 transition-colors"
            >
              <ChevronLeft size={18} />
              <span>{t('oficio_back')}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="touch-target px-5 py-3 rounded-2xl bg-[#1e3a8a] hover:bg-[#172554] text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md ml-auto transition-transform active:scale-95"
            >
              <span>{t('oficio_next')}</span>
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="touch-target px-5 py-3 rounded-2xl bg-slate-700 hover:bg-slate-800 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md ml-auto"
            >
              <FileCheck size={18} />
              <span>{t('oficio_done')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
