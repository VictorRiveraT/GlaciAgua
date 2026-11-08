import React, { useState } from 'react'
import { CommunityReport } from '../types'
import {
  X,
  Camera,
  Navigation,
  MapPin,
  CheckCircle2,
  Droplets,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Send,
  Wifi,
  WifiOff,
  ShieldCheck,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'
import { AudioPlayButton } from './AudioPlayButton'
import { AccessibleIllustration } from './AccessibleIllustration'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveReport: (report: CommunityReport) => void
  isOnline: boolean
}

type ColorOption = 'rust' | 'milky' | 'clear' | 'muddy'

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSaveReport,
  isOnline,
}) => {
  const { t } = useI18n()

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [quebrada, setQuebrada] = useState('Quebrada Cojup (Quillcay)')
  const [colorKey, setColorKey] = useState<ColorOption>('rust')
  const [comentarios, setComentarios] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [gpsCoords, setGpsCoords] = useState<{
    lat: number
    lng: number
    precisionM: number
  } | null>(null)
  const [capturingGps, setCapturingGps] = useState(false)

  if (!isOpen) return null

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      alert(t('report_gps_unavailable'))
      return
    }

    setCapturingGps(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          lat: parseFloat(pos.coords.latitude.toFixed(5)),
          lng: parseFloat(pos.coords.longitude.toFixed(5)),
          precisionM: Math.round(pos.coords.accuracy || 8),
        })
        setCapturingGps(false)
      },
      (err) => {
        setCapturingGps(false)
        console.warn('GPS capture error:', err)
        alert(t('report_gps_error'))
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (file) {
      const reader = new FileReader()

      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }

      reader.readAsDataURL(file)
    }
  }

  const getColorLabel = (k: ColorOption) => {
    switch (k) {
      case 'rust':
        return t('color_rust')
      case 'milky':
        return t('color_milky')
      case 'clear':
        return t('color_clear')
      case 'muddy':
        return t('color_muddy')
    }
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const cuencaId =
      quebrada.includes('Pachacoto') ||
      quebrada.includes('Pastoruri') ||
      quebrada.includes('Pumapampa')
        ? 'pachacoto'
        : quebrada.includes('Rurec')
          ? 'canray_chico'
          : quebrada.includes('Blanco')
            ? 'rio_blanco'
            : 'quillcay'

    const coords = gpsCoords ||
      (quebrada.includes('Pastoruri')
        ? { lat: -9.921, lng: -77.195, precisionM: 10 }
        : quebrada.includes('Shallap')
          ? { lat: -9.524, lng: -77.388, precisionM: 10 }
          : quebrada.includes('Rurec')
            ? { lat: -9.635, lng: -77.47, precisionM: 10 }
            : quebrada.includes('Blanco')
              ? { lat: -8.980, lng: -77.700, precisionM: 12 }
              : { lat: -9.512, lng: -77.456, precisionM: 8 })

    const newReport: CommunityReport = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      cuencaId,
      quebrada,
      coordenadas: coords,
      fecha: new Date().toISOString().split('T')[0],
      colorAgua: getColorLabel(colorKey),
      olorSabor: colorKey === 'rust' ? 'Sabor metálico o ácido' : 'Normal',
      usosAfectados: ['Consumo humano', 'Riego y ganado'],
      phMedido:
        colorKey === 'rust' ? 4.2 : colorKey === 'milky' ? 5.2 : null,
      tieneFoto: !!photoPreview,
      fotoUrl: photoPreview || undefined,
      comentarios,
      sincronizado: isOnline,
      simulado: false,
    }

    onSaveReport(newReport)
    setSubmitted(true)
  }

  const resetForm = () => {
    setStep(1)
    setSubmitted(false)
    setPhotoPreview(null)
    setComentarios('')
    setGpsCoords(null)
    setCapturingGps(false)
    setColorKey('rust')
    setQuebrada('Quebrada Cojup (Quillcay)')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92dvh] overflow-y-auto overscroll-contain shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/98 backdrop-blur-md z-10 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
              <Droplets size={22} />
            </div>

            <div className="min-w-0">
              <h2
                id="report-modal-title"
                className="text-lg font-black text-slate-900 leading-tight"
              >
                {t('report_wizard_title')}
              </h2>

              <div className="flex items-center gap-1.5 text-xs">
                {isOnline ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Wifi size={12} />
                    {t('online_status')}
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold flex items-center gap-1">
                    <WifiOff size={12} />
                    {t('offline_status')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="touch-target shrink-0 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label={t('btn_close')}
          >
            <X size={22} />
          </button>
        </div>

        {/* Progress Indicators */}
        {!submitted && (
          <div className="px-5 pt-3 pb-2 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center justify-between gap-1">
              {[
                { s: 1, label: t('step_location') },
                { s: 2, label: t('step_color') },
                { s: 3, label: t('step_photo') },
                { s: 4, label: t('step_send') },
              ].map(({ s }) => {
                const isActive = step === s
                const isPassed = step > s

                return (
                  <div
                    key={s}
                    className="flex-1 flex flex-col items-center min-w-0"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        isActive
                          ? 'bg-blue-700 text-white shadow-md ring-2 ring-blue-300'
                          : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isPassed ? '✓' : s}
                    </div>

                    <span className="text-[10px] font-bold text-slate-600 mt-1 text-center line-clamp-1">
                      {s === 1
                        ? t('report_step_location_short')
                        : s === 2
                          ? t('report_step_color_short')
                          : s === 3
                            ? t('report_step_photo_short')
                            : t('report_step_send_short')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-5 flex-1 min-w-0">
          {submitted ? (
            /* Success Confirmation */
            <div className="text-center py-6 space-y-4">
              <div className="w-24 h-24 mx-auto flex items-center justify-center">
                <AccessibleIllustration
                  name="gota_tranquila"
                  alt={t('report_success_alt')}
                  className="w-full h-full"
                />
              </div>

              <h3 className="text-2xl font-black text-slate-900">
                {t('report_thanks')}
              </h3>

              <p className="text-sm text-slate-700 max-w-sm mx-auto leading-relaxed">
                {isOnline
                  ? t('report_saved_online')
                  : t('report_saved_offline')}
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-3 mt-4 text-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 min-w-0">
                  <span className="text-slate-500 font-semibold shrink-0">
                    {t('report_summary_basin')}:
                  </span>
                  <strong className="text-slate-900 min-w-0 break-words">
                    {quebrada}
                  </strong>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 min-w-0">
                  <span className="text-slate-500 font-semibold shrink-0">
                    {t('report_summary_appearance')}:
                  </span>
                  <strong className="text-slate-900 min-w-0 break-words">
                    {getColorLabel(colorKey)}
                  </strong>
                </div>

                {photoPreview && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-slate-500 font-semibold shrink-0">
                      {t('report_summary_photo')}:
                    </span>
                    <strong className="text-emerald-700">
                      {t('report_photo_included')} ✓
                    </strong>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 text-blue-800 font-bold flex items-start gap-1.5">
                  <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                  <span>{t('report_community_thanks')}</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="touch-target w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-black text-base rounded-2xl shadow-md transition-transform active:scale-98"
                >
                  {t('btn_back_home')}
                </button>
              </div>
            </div>
          ) : step === 1 ? (
            /* Step 1: Location */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <MapPin size={18} className="text-blue-700 shrink-0" />
                    {t('step_location')}
                  </h3>

                  <p className="text-xs text-slate-600 mt-0.5">
                    {t('report_location_hint')}
                  </p>
                </div>

                <AudioPlayButton
                  audioKey="step_location"
                  textToSpeak={t('report_audio_location')}
                  className="self-start sm:self-auto"
                />
              </div>

              {/* Quebrada Selector */}
              <div className="space-y-1 min-w-0">
                <select
                  value={quebrada}
                  onChange={(e) => setQuebrada(e.target.value)}
                  className="w-full min-w-0 p-3 sm:p-3.5 rounded-2xl border-2 border-slate-300 bg-slate-50 text-xs sm:text-base text-slate-900 font-bold focus:border-blue-700 focus:bg-white"
                  aria-label={t('report_select_basin')}
                >
                  <option value="Quebrada Cojup (Quillcay)">
                    Quebrada Cojup (Huaraz - Quillcay)
                  </option>
                  <option value="Quebrada Shallap (Quillcay)">
                    Quebrada Shallap (Huaraz - Quillcay)
                  </option>
                  <option value="Quebrada Quilcayhuanca (Quillcay)">
                    Quebrada Quilcayhuanca (Quillcay)
                  </option>
                  <option value="Quebrada Pastoruri (Pachacoto)">
                    Quebrada Pastoruri (Cátac - Pachacoto)
                  </option>
                  <option value="Pampa de Pumapampa (Pachacoto)">
                    Pumapampa (Cátac - Pachacoto)
                  </option>
                  <option value="Quebrada Rurec (Canray Chico)">
                    Quebrada Rurec (Olleros - Canray Chico)
                  </option>
                  <option value="Quebrada Río Blanco (Huaylas)">
                    Río Blanco (Santa Cruz - Huaylas)
                  </option>
                  <option value="Río Santa (Puente Huaraz)">
                    Río Santa (Puente Central Huaraz)
                  </option>
                </select>
              </div>

              {/* GPS Capture Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCaptureGps}
                  disabled={capturingGps}
                  className={`touch-target w-full p-3.5 rounded-2xl border-2 font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    gpsCoords
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-blue-300 bg-blue-50 text-blue-900 hover:bg-blue-100'
                  }`}
                >
                  <Navigation
                    size={18}
                    className={capturingGps ? 'animate-spin' : ''}
                  />

                  <span>
                    {capturingGps
                      ? t('report_gps_searching')
                      : gpsCoords
                        ? `${t('gps_ok')} (±${gpsCoords.precisionM} m)`
                        : t('fix_gps')}
                  </span>
                </button>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="touch-target w-full sm:w-auto px-6 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-black text-base rounded-2xl flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform"
                >
                  <span>{t('btn_next')}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ) : step === 2 ? (
            /* Step 2: Water Color */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <Droplets size={18} className="text-blue-700 shrink-0" />
                    {t('step_color')}
                  </h3>

                  <p className="text-xs text-slate-600 mt-0.5">
                    {t('report_color_hint')}
                  </p>
                </div>

                <AudioPlayButton
                  audioKey="step_color"
                  textToSpeak={t('report_audio_color')}
                  className="self-start sm:self-auto"
                />
              </div>

              {/* Color Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Rust */}
                <button
                  type="button"
                  onClick={() => setColorKey('rust')}
                  className={`touch-target min-w-0 p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                    colorKey === 'rust'
                      ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-400'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 shrink-0">
                    <AccessibleIllustration
                      name="quebrada_acida"
                      alt={t('report_rust_rocks_alt')}
                    />
                  </div>

                  <div className="min-w-0">
                    <strong className="text-sm font-black text-slate-900 block">
                      {t('color_rust')}
                    </strong>

                    <span className="text-[11px] text-slate-600 leading-tight block">
                      {t('report_color_rust_desc')}
                    </span>
                  </div>
                </button>

                {/* Milky */}
                <button
                  type="button"
                  onClick={() => setColorKey('milky')}
                  className={`touch-target min-w-0 p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                    colorKey === 'milky'
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-300 border border-slate-400 text-slate-800 flex items-center justify-center text-lg font-bold shrink-0 shadow-xs">
                    ⚪
                  </div>

                  <div className="min-w-0">
                    <strong className="text-sm font-black text-slate-900 block">
                      {t('color_milky')}
                    </strong>

                    <span className="text-[11px] text-slate-600 leading-tight block">
                      {t('report_color_milky_desc')}
                    </span>
                  </div>
                </button>

                {/* Clear */}
                <button
                  type="button"
                  onClick={() => setColorKey('clear')}
                  className={`touch-target min-w-0 p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                    colorKey === 'clear'
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 shrink-0">
                    <AccessibleIllustration
                      name="quebrada_limpia"
                      alt={t('report_clear_creek_alt')}
                    />
                  </div>

                  <div className="min-w-0">
                    <strong className="text-sm font-black text-slate-900 block">
                      {t('color_clear')}
                    </strong>

                    <span className="text-[11px] text-slate-600 leading-tight block">
                      {t('report_color_clear_desc')}
                    </span>
                  </div>
                </button>

                {/* Muddy */}
                <button
                  type="button"
                  onClick={() => setColorKey('muddy')}
                  className={`touch-target min-w-0 p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                    colorKey === 'muddy'
                      ? 'border-amber-800 bg-amber-50 ring-2 ring-amber-400'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-900 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-xs">
                    🟤
                  </div>

                  <div className="min-w-0">
                    <strong className="text-sm font-black text-slate-900 block">
                      {t('color_muddy')}
                    </strong>

                    <span className="text-[11px] text-slate-600 leading-tight block">
                      {t('report_color_muddy_desc')}
                    </span>
                  </div>
                </button>
              </div>

              {/* Dynamic Visual Diagnostic */}
              <div
                className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 transition-all ${
                  colorKey === 'rust'
                    ? 'bg-orange-50 border-orange-200 text-orange-950'
                    : colorKey === 'milky'
                      ? 'bg-blue-50 border-blue-200 text-blue-950'
                      : colorKey === 'muddy'
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {colorKey === 'rust' && (
                    <AlertTriangle size={16} className="text-orange-700" />
                  )}
                  {colorKey === 'milky' && (
                    <AlertTriangle size={16} className="text-blue-700" />
                  )}
                  {colorKey === 'muddy' && (
                    <AlertTriangle size={16} className="text-amber-700" />
                  )}
                  {colorKey === 'clear' && (
                    <CheckCircle2 size={16} className="text-emerald-700" />
                  )}
                </div>

                <div className="space-y-0.5 min-w-0">
                  <strong className="block font-black">
                    {colorKey === 'rust'
                      ? t('report_diagnostic_rust_title')
                      : colorKey === 'milky'
                        ? t('report_diagnostic_milky_title')
                        : colorKey === 'muddy'
                          ? t('report_diagnostic_muddy_title')
                          : t('report_diagnostic_clear_title')}
                  </strong>

                  <p className="text-[11px] leading-snug">
                    {colorKey === 'rust'
                      ? t('report_diagnostic_rust_desc')
                      : colorKey === 'milky'
                        ? t('report_diagnostic_milky_desc')
                        : colorKey === 'muddy'
                          ? t('report_diagnostic_muddy_desc')
                          : t('report_diagnostic_clear_desc')}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="touch-target px-4 py-3 border border-slate-300 text-slate-700 font-bold text-sm rounded-2xl hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ArrowLeft size={16} />
                  <span>{t('btn_back')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="touch-target px-6 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-black text-base rounded-2xl flex items-center gap-2 shadow-md active:scale-98 transition-transform"
                >
                  <span>{t('btn_next')}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ) : step === 3 ? (
            /* Step 3: Photo */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <Camera size={18} className="text-blue-700 shrink-0" />
                    {t('step_photo')}
                  </h3>

                  <p className="text-xs text-slate-600 mt-0.5">
                    {t('photo_optional_hint')}
                  </p>
                </div>

                <AudioPlayButton
                  audioKey="step_photo"
                  textToSpeak={t('report_audio_photo')}
                  className="self-start sm:self-auto"
                />
              </div>

              {/* Safety Alert */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 flex items-start gap-2.5">
                <AlertTriangle
                  size={20}
                  className="text-amber-800 shrink-0 mt-0.5"
                />

                <p className="text-xs text-amber-950 font-bold leading-relaxed">
                  {t('photo_safety_alert')}
                </p>
              </div>

              {/* Photo Capture */}
              <div>
                <label className="touch-target border-2 border-dashed border-blue-400 bg-blue-50/60 hover:bg-blue-100/60 rounded-3xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                  <Camera size={32} className="text-blue-700 mb-1.5" />

                  <span className="text-sm font-black text-slate-900">
                    {photoPreview
                      ? t('report_photo_change')
                      : t('take_photo')}
                  </span>

                  <span className="text-xs text-slate-500 mt-0.5">
                    {t('report_photo_open')}
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Photo Preview */}
              {photoPreview && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                    <img
                      src={photoPreview}
                      alt={t('report_photo_alt')}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-black text-slate-900 block truncate">
                      {t('report_photo_loaded')} ✓
                    </span>

                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="text-xs font-bold text-red-700 hover:underline mt-1"
                    >
                      {t('report_photo_remove')}
                    </button>
                  </div>
                </div>
              )}

              {/* Optional Comment */}
              <div className="pt-1">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('report_comment_label')}
                </label>

                <textarea
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder={t('report_comment_placeholder')}
                  className="w-full p-3 rounded-2xl border border-slate-300 text-xs text-slate-900 min-h-[60px] resize-y"
                />
              </div>

              {/* Navigation */}
              <div className="pt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="touch-target px-4 py-3 border border-slate-300 text-slate-700 font-bold text-sm rounded-2xl hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ArrowLeft size={16} />
                  <span>{t('btn_back')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="touch-target px-6 py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-black text-base rounded-2xl flex items-center gap-2 shadow-md active:scale-98 transition-transform"
                >
                  <span>{t('btn_next')}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          ) : (
            /* Step 4: Send Report */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <Send size={18} className="text-blue-700 shrink-0" />
                    {t('step_send')}
                  </h3>

                  <p className="text-xs text-slate-600 mt-0.5">
                    {t('report_review_hint')}
                  </p>
                </div>

                <AudioPlayButton
                  audioKey="step_send"
                  textToSpeak={t('report_audio_send')}
                  className="self-start sm:self-auto"
                />
              </div>

              {/* Sending Illustration */}
              <div className="w-20 h-20 mx-auto flex items-center justify-center">
                <AccessibleIllustration
                  name="celular_aviso"
                  alt={t('report_ready_alt')}
                />
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-3 text-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 min-w-0">
                  <span className="text-slate-500 font-semibold shrink-0">
                    📍 {t('report_summary_basin')}:
                  </span>

                  <strong className="text-slate-900 min-w-0 break-words">
                    {quebrada}
                  </strong>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 min-w-0">
                  <span className="text-slate-500 font-semibold shrink-0">
                    🎨 {t('report_summary_appearance')}:
                  </span>

                  <strong className="text-slate-900 min-w-0 break-words">
                    {getColorLabel(colorKey)}
                  </strong>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="text-slate-500 font-semibold shrink-0">
                    📷 {t('report_summary_photo')}:
                  </span>

                  <strong
                    className={
                      photoPreview ? 'text-emerald-700' : 'text-slate-600'
                    }
                  >
                    {photoPreview
                      ? `${t('report_photo_attached')} ✓`
                      : t('report_no_photo')}
                  </strong>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-1 border-t border-slate-200 min-w-0">
                  <span className="text-slate-500 font-semibold shrink-0">
                    📶 {t('report_connection')}:
                  </span>

                  <strong
                    className={`min-w-0 break-words ${
                      isOnline ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {isOnline
                      ? t('report_online_now')
                      : t('report_offline_saved')}
                  </strong>
                </div>
              </div>

              {/* Permanent Warning */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 leading-tight">
                <strong>{t('report_warning_label')}</strong> {t('disclaimer')}
              </div>

              {/* Navigation and Submit */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="touch-target shrink-0 px-4 py-3.5 border border-slate-300 text-slate-700 font-bold text-sm rounded-2xl hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ArrowLeft size={16} />
                  <span>{t('btn_back')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="touch-target min-w-0 flex-1 py-4 px-3 bg-blue-700 hover:bg-blue-800 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-transform"
                >
                  <Send size={18} className="shrink-0" />
                  <span className="text-center">
                    {t('send_report_btn')}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}