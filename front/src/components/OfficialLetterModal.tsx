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
} from 'lucide-react'
import { Illustration } from './Illustration'
import { useI18n } from '../i18n/I18nContext'
import { PILOT_BASINS } from '../data/basinsData'

interface OfficialLetterModalProps {
  isOpen: boolean
  onClose: () => void
  initialBasinName?: string
}

const COMMON_REASONS = [
  'Agua con color anaranjado o turbio en la captación',
  'Sabor u olor metálico en el agua de la quebrada',
  'Inspección preventiva y monitoreo comunitario',
  'Evidencia de posibles minerales y resguardo de animales',
]

const AUTHORITIES = [
  'Junta Administradora de Servicios de Saneamiento (JASS)',
  'Junta de Usuarios / Comisión de Regantes',
  'Municipalidad Provincial / Distrital de la zona',
  'Centro de Salud / DIRESA Huaraz',
]

export const OfficialLetterModal: React.FC<OfficialLetterModalProps> = ({
  isOpen,
  onClose,
  initialBasinName = 'Quillcay',
}) => {
  const { t } = useI18n()
  const [step, setStep] = useState(1)

  // Datos del formulario
  const [basinName, setBasinName] = useState(initialBasinName)
  const [reason, setReason] = useState(COMMON_REASONS[0])
  const [recipient, setRecipient] = useState(AUTHORITIES[0])
  const [applicantName, setApplicantName] = useState('')
  const [applicantRole, setApplicantRole] = useState('Comunero / Usuario de agua')
  const [letterDate, setLetterDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // Texto formal estructurado
  const letterText = `SOLICITUD FORMAL DE INSPECCIÓN Y MONITOREO DE CALIDAD DE AGUA

A: ${recipient}
DE: ${applicantName.trim() || 'Comuneros y Usuarios del Agua'} (${applicantRole})
SECTOR / MICROCUENCA: ${basinName}
FECHA: ${letterDate}

ASUNTO: Solicitud comunitaria de inspección técnica preventiva en fuentes de agua

Estimadas autoridades:

Por medio del presente documento formal, nos dirigimos a su despacho en representación de los usuarios y familias del sector para solicitar una INSPECCIÓN TÉCNICA Y MONITOREO de la calidad del agua en las fuentes, captaciones y canales de la microcuenca ${basinName}.

MOTIVO OBSERVADO EN LA COMUNIDAD:
- ${reason}.

DATO REFERENCIAL COMUNITARIO:
La plataforma comunitaria GlaciAgua registra este sector como zona de atención temprana por drenaje ácido o presencia de minerales de roca. Se deja constancia de que este es un dato referencial preventivo para cuidar la salud de las familias, el ganado y los cultivos; no certifica potabilidad.

PETICIÓN CONCRETA:
1. Inspección presencial de bocatomas y canales de conducción.
2. Orientación técnica a la población sobre fuentes alternativas y tratamiento adecuado según normativa.
3. Coordinación con el puesto de salud y la Autoridad Local del Agua.

Agradecemos su pronta atención en resguardo de la salud de nuestra comunidad.

Atentamente,


______________________________________
${applicantName.trim() || 'Firma de Autoridad Comunal / Solicitante'}
DNI / Teléfono:
`

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

  const handleClose = () => {
    onClose()
    setStep(1)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="oficio-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none"
    >
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header no imprimible */}
        <div className="no-print p-3.5 sm:p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-[#1e3a8a] bg-[#eff6ff] px-3 py-1 rounded-full border border-blue-200">
              Paso {step} de 3
            </span>
            <h2
              id="oficio-modal-title"
              className="text-xs sm:text-sm font-black text-[#0f172a] truncate"
            >
              {step === 1 && t('oficio_step1_title')}
              {step === 2 && t('oficio_step2_title')}
              {step === 3 && t('oficio_step3_title')}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="touch-target w-10 h-10 rounded-full flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] transition-colors"
            aria-label="Cerrar redacción de oficio"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido según paso */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* PASO 1: QUEBRADA Y MOTIVO */}
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
                  {COMMON_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReason(r)}
                      className={`touch-target w-full p-3 rounded-2xl text-xs sm:text-sm font-bold border-2 text-left flex items-center justify-between gap-2 transition-all ${
                        reason === r
                          ? 'border-[#1e3a8a] bg-[#eff6ff] text-[#1e3a8a] shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{r}</span>
                      {reason === r && <Check size={18} className="text-[#1e3a8a] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: DATOS DEL SOLICITANTE Y DESTINATARIO */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="text-xs sm:text-sm font-black text-[#0f172a] flex items-center gap-1.5 mb-1.5">
                  <Building2 size={16} className="text-[#1e3a8a]" />
                  {t('oficio_label_to')}
                </label>
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="touch-target w-full p-3 rounded-2xl border-2 border-slate-300 font-bold text-xs sm:text-sm text-[#0f172a] bg-white focus:outline-hidden focus:border-[#1e3a8a]"
                >
                  {AUTHORITIES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-black text-[#0f172a] flex items-center gap-1.5 mb-1.5">
                  <User size={16} className="text-[#1e3a8a]" />
                  {t('oficio_label_name')}
                </label>
                <input
                  type="text"
                  placeholder="Ej: Juan Mendoza Pantoja"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="touch-target w-full p-3.5 rounded-2xl border-2 border-slate-300 font-bold text-base text-[#0f172a] bg-white focus:outline-hidden focus:border-[#1e3a8a]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-[#475569] block mb-1">
                    Tu rol o cargo comunal:
                  </label>
                  <input
                    type="text"
                    value={applicantRole}
                    onChange={(e) => setApplicantRole(e.target.value)}
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

          {/* PASO 3: VISTA PREVIA Y ACCIONES */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              {/* Ilustración de oficio */}
              <div className="no-print flex justify-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24">
                  <Illustration
                    name="oficio_documento"
                    alt="Documento formal de solicitud comunitaria"
                    animation="float"
                    className="w-full h-full drop-shadow-sm"
                  />
                </div>
              </div>

              {/* 3 Grandes Acciones Táctiles */}
              <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="touch-target py-3.5 px-4 rounded-2xl bg-[#1e3a8a] hover:bg-[#172554] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  <span>{copied ? '¡Copiado!' : t('oficio_btn_copy')}</span>
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

              {/* Vista previa tipo carta con formato formal imprimible */}
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

        {/* Footer con navegación de pasos (No imprimible) */}
        <div className="no-print p-3.5 sm:p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="touch-target px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-[#475569] hover:bg-[#e2e8f0] flex items-center gap-1 transition-colors"
            >
              <ChevronLeft size={18} />
              <span>Atrás</span>
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
              <span>Siguiente</span>
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="touch-target px-5 py-3 rounded-2xl bg-slate-700 hover:bg-slate-800 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md ml-auto"
            >
              <FileCheck size={18} />
              <span>Listo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
