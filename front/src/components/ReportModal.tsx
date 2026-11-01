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
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; precisionM: number } | null>(null)
  const [capturingGps, setCapturingGps] = useState(false)

  if (!isOpen) return null

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      alert('Tu teléfono no tiene GPS activado en este navegador.')
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
        alert('No se pudo fijar la señal satelital en este momento. Se usará la ubicación de la quebrada.')
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

    const cuencaId = quebrada.includes('Pachacoto') || quebrada.includes('Pastoruri') || quebrada.includes('Pumapampa')
      ? 'pachacoto'
      : quebrada.includes('Rurec')
      ? 'canray_chico'
      : quebrada.includes('Blanco')
      ? 'rio_blanco'
      : 'quillcay'

    const coords = gpsCoords || (quebrada.includes('Pastoruri')
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
      phMedido: colorKey === 'rust' ? 4.2 : colorKey === 'milky' ? 5.2 : null,
      tieneFoto: !!photoPreview,
      fotoUrl: photoPreview || undefined,
      comentarios,
      sincronizado: isOnline,
      simulado: true,
    }

    onSaveReport(newReport)
    setSubmitted(true)
  }

  const resetForm = () => {
    setStep(1)
    setSubmitted(false)
    setPhotoPreview(null)
    setComentarios('')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
        {/* Header with Title and Close Button */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/98 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Droplets size={22} />
            </div>
            <div>
              <h2 id="report-modal-title" className="text-lg font-black text-slate-900 leading-tight">
                {t('report_wizard_title')}
              </h2>
              <div className="flex items-center gap-1.5 text-xs">
                {isOnline ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Wifi size={12} /> {t('online_status')}
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold flex items-center gap-1">
                    <WifiOff size={12} /> {t('offline_status')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="touch-target p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label={t('btn_close')}
          >
            <X size={22} />
          </button>
        </div>

        {/* Step Progress Indicators (1 to 4) */}
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
                  <div key={s} className="flex-1 flex flex-col items-center">
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
                      {s === 1 ? 'Dónde' : s === 2 ? 'Color' : s === 3 ? 'Foto' : 'Enviar'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 flex-1">
          {submitted ? (
            /* Success confirmation with friendly droplet illustration */
            <div className="text-center py-6 space-y-4">
              <div className="w-24 h-24 mx-auto flex items-center justify-center">
                <AccessibleIllustration
                  name="gota_tranquila"
                  alt="Aviso registrado con éxito"
                  className="w-full h-full"
                />
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                ¡Gracias por avisar!
              </h3>
              <p className="text-sm text-slate-700 max-w-sm mx-auto leading-relaxed">
                {isOnline
                  ? t('report_saved_online')
                  : t('report_saved_offline')}
              </p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2 mt-4 text-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Quebrada:</span>
                  <strong className="text-slate-900">{quebrada}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Aspecto:</span>
                  <strong className="text-slate-900">{getColorLabel(colorKey)}</strong>
                </div>
                {photoPreview && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold">Foto:</span>
                    <strong className="text-emerald-700">Incluida ✓</strong>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 text-blue-800 font-bold flex items-center gap-1.5">
                  <ShieldCheck size={16} />
                  <span>Tu aviso ayuda a cuidar el agua de toda la comunidad.</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={resetForm}
                  className="touch-target w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-black text-base rounded-2xl shadow-md transition-transform active:scale-98"
                >
                  {t('btn_back_home')}
                </button>
              </div>
            </div>
          ) : step === 1 ? (
            /* Step 1: Ubicación */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <MapPin size={18} className="text-blue-700" />
                    {t('step_location')}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Elige la quebrada donde viste el agua:
                  </p>
                </div>
                <AudioPlayButton
                  audioKey="step_location"
                  textToSpeak="Paso uno: Elige en qué quebrada o río estás viendo el agua, o toca fijar GPS."
                />
              </div>

              {/* Large Quebrada Selector */}
              <div className="space-y-1">
                <select
                  value={quebrada}
                  onChange={(e) => setQuebrada(e.target.value)}
                  className="w-full p-3.5 rounded-2xl border-2 border-slate-300 bg-slate-50 text-base text-slate-900 font-bold focus:border-blue-700 focus:bg-white"
                  aria-label="Selecciona la quebrada o río"
                >
                  <option value="Quebrada Cojup (Quillcay)">Quebrada Cojup (Huaraz - Quillcay)</option>
                  <option value="Quebrada Shallap (Quillcay)">Quebrada Shallap (Huaraz - Quillcay)</option>
                  <option value="Quebrada Quilcayhuanca (Quillcay)">Quebrada Quilcayhuanca (Quillcay)</option>
                  <option value="Quebrada Pastoruri (Pachacoto)">Quebrada Pastoruri (Cátac - Pachacoto)</option>
                  <option value="Pampa de Pumapampa (Pachacoto)">Pumapampa (Cátac - Pachacoto)</option>
                  <option value="Quebrada Rurec (Canray Chico)">Quebrada Rurec (Olleros - Canray Chico)</option>
                  <option value="Quebrada Río Blanco (Huaylas)">Río Blanco (Santa Cruz - Huaylas)</option>
                  <option value="Río Santa (Puente Huaraz)">Río Santa (Puente Central Huaraz)</option>
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
                  <Navigation size={18} className={capturingGps ? 'animate-spin' : ''} />
                  <span>
                    {capturingGps
                      ? 'Buscando satélite GPS...'
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
            /* Step 2: ¿Cómo se ve el agua? con Ilustraciones */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <Droplets size={18} className="text-blue-700" />
                    {t('step_color')}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Toca la tarjeta que más se parezca al agua:
                  </p>
                </div>
                <AudioPlayButton
                  audioKey="step_color"
                  textToSpeak="Paso dos: Toca cómo se ve el agua. ¿Se ve naranja como óxido, blanca lechosa, o limpia y clara?"
                />
              </div>

              {/* 4 Big Color Cards con Ilustraciones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Naranja / Óxido */}
                <button
                  type="button"
                  onClick={() => setColorKey('rust')}
                  className={`touch-target p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                    colorKey === 'rust'
                      ? 'border-orange-600 bg-orange-50 ring-2 ring-orange-400'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 shrink-0">
                    <AccessibleIllustration name="quebrada_acida" alt="Rocas teñidas de óxido" />
                  </div>
                  <div>
                    <strong className="text-sm font-black text-slate-900 block">
                      {t('color_rust')}
                    </strong>
                    <span className="text-[11px] text-slate-600 leading-tight block">
                      Rocas con costra naranja/óxido
                    </span>
                  </div>
                </button>

                {/* 2. Blanca / Lechosa */}
                <button
                  type="button"
                  onClick={() => setColorKey('milky')}
                  className={`touch-target p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                    colorKey === 'milky'
                      ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-300 border border-slate-400 text-slate-800 flex items-center justify-center text-lg font-bold shrink-0 shadow-xs">
                    ⚪
                  </div>
                  <div>
                    <strong className="text-sm font-black text-slate-900 block">
                      {t('color_milky')}
                    </strong>
                    <span className="text-[11px] text-slate-600 leading-tight block">
                      Turbia con polvillo blanco
                    </span>
                  </div>
                </button>

                {/* 3. Clara / Cristalina */}
                <button
                  type="button"
                  onClick={() => setColorKey('clear')}
                  className={`touch-target p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                    colorKey === 'clear'
                      ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-300'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 shrink-0">
                    <AccessibleIllustration name="quebrada_limpia" alt="Quebrada con agua clara de montaña" />
                  </div>
                  <div>
                    <strong className="text-sm font-black text-slate-900 block">
                      {t('color_clear')}
                    </strong>
                    <span className="text-[11px] text-slate-600 leading-tight block">
                      Cristalina y piedras limpias
                    </span>
                  </div>
                </button>

                {/* 4. Marrón / Oscura */}
                <button
                  type="button"
                  onClick={() => setColorKey('muddy')}
                  className={`touch-target p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${
                    colorKey === 'muddy'
                      ? 'border-amber-800 bg-amber-50 ring-2 ring-amber-400'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-900 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-xs">
                    🟤
                  </div>
                  <div>
                    <strong className="text-sm font-black text-slate-900 block">
                      {t('color_muddy')}
                    </strong>
                    <span className="text-[11px] text-slate-600 leading-tight block">
                      Tierra, lodo o crecida
                    </span>
                  </div>
                </button>
              </div>

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
            /* Step 3: Foto (opcional) */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <Camera size={18} className="text-blue-700" />
                    {t('step_photo')}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {t('photo_optional_hint')}
                  </p>
                </div>
                <AudioPlayButton
                  audioKey="step_photo"
                  textToSpeak="Paso tres: Si es seguro, puedes tomar una foto con tu cámara. No te acerques al barranco."
                />
              </div>

              {/* Safety Alert (Prominent) */}
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 flex items-start gap-2.5">
                <AlertTriangle size={20} className="text-amber-800 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-950 font-bold leading-relaxed">
                  {t('photo_safety_alert')}
                </p>
              </div>

              {/* Big Photo Capture Button */}
              <div>
                <label className="touch-target border-2 border-dashed border-blue-400 bg-blue-50/60 hover:bg-blue-100/60 rounded-3xl p-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                  <Camera size={32} className="text-blue-700 mb-1.5" />
                  <span className="text-sm font-black text-slate-900">
                    {photoPreview ? 'Cambiar foto seleccionada' : t('take_photo')}
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5">
                    Toca para abrir cámara o galería
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

              {/* Preview if uploaded */}
              {photoPreview && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                    <img src={photoPreview} alt="Foto del agua" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-black text-slate-900 block truncate">
                      Foto cargada con éxito ✓
                    </span>
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="text-xs font-bold text-red-700 hover:underline mt-1"
                    >
                      Quitar foto
                    </button>
                  </div>
                </div>
              )}

              {/* Optional brief comment */}
              <div className="pt-1">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ¿Alguna observación adicional? (Opcional)
                </label>
                <textarea
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  placeholder="Ejemplo: piedras con costra roja, animales que no quieren beber, etc."
                  className="w-full p-3 rounded-2xl border border-slate-300 text-xs text-slate-900 min-h-[60px]"
                />
              </div>

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
            /* Step 4: Enviar con Ilustración */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                    <Send size={18} className="text-blue-700" />
                    {t('step_send')}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Revisa los datos antes de guardar:
                  </p>
                </div>
                <AudioPlayButton
                  audioKey="step_send"
                  textToSpeak="Paso cuatro: Revisa que tu quebrada y color de agua sean correctos, y toca el botón grande para enviar tu aviso."
                />
              </div>

              {/* Phone sending alert illustration */}
              <div className="w-20 h-20 mx-auto flex items-center justify-center">
                <AccessibleIllustration name="celular_aviso" alt="Aviso listo para enviar" />
              </div>

              {/* Summary Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2 text-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">📍 Quebrada:</span>
                  <strong className="text-slate-900 text-right">{quebrada}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">🎨 Aspecto:</span>
                  <strong className="text-slate-900">{getColorLabel(colorKey)}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">📷 Foto:</span>
                  <strong className={photoPreview ? 'text-emerald-700' : 'text-slate-600'}>
                    {photoPreview ? 'Foto adjunta ✓' : 'Sin foto'}
                  </strong>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500 font-semibold">📶 Conexión:</span>
                  <strong className={isOnline ? 'text-emerald-700' : 'text-amber-700'}>
                    {isOnline ? 'En línea (se envía ahora)' : 'Sin señal (se guarda en tu teléfono)'}
                  </strong>
                </div>
              </div>

              {/* Permanent Warning */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 leading-tight">
                <strong>Aviso:</strong> {t('disclaimer')}
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="touch-target px-4 py-3.5 border border-slate-300 text-slate-700 font-bold text-sm rounded-2xl hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ArrowLeft size={16} />
                  <span>{t('btn_back')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="touch-target flex-1 py-4 bg-blue-700 hover:bg-blue-800 text-white font-black text-base rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-transform"
                >
                  <Send size={18} />
                  <span>{t('send_report_btn')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
