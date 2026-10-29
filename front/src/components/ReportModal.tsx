import React, { useState } from 'react'
import { CommunityReport } from '../types'
import {
  X,
  Camera,
  Navigation,
  MapPin,
  CheckCircle2,
  Clock,
  Upload,
  AlertCircle,
  Droplets,
  Eye,
  ShieldAlert,
} from 'lucide-react'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveReport: (report: CommunityReport) => void
  isOnline: boolean
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSaveReport,
  isOnline,
}) => {
  if (!isOpen) return null

  const [quebrada, setQuebrada] = useState('Quebrada Cojup (Quillcay)')
  const [colorAgua, setColorAgua] = useState('Anaranjada o rojiza (óxidos de hierro)')
  const [olorSabor, setOlorSabor] = useState('Sabor metálico astringente')
  const [usos, setUsos] = useState<string[]>(['Consumo humano / potable', 'Riego agrícola'])
  const [ph, setPh] = useState<number | null>(4.2)
  const [comentarios, setComentarios] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const toggleUse = (use: string) => {
    setUsos((prev) =>
      prev.includes(use) ? prev.filter((item) => item !== use) : [...prev, use]
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

  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; precisionM: number } | null>(null)
  const [capturingGps, setCapturingGps] = useState(false)

  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      alert('Tu dispositivo no soporta geolocalización satelital.')
      return
    }

    setCapturingGps(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          lat: parseFloat(pos.coords.latitude.toFixed(5)),
          lng: parseFloat(pos.coords.longitude.toFixed(5)),
          precisionM: Math.round(pos.coords.accuracy || 7),
        })
        setCapturingGps(false)
      },
      (err) => {
        setCapturingGps(false)
        console.warn('GPS capture error:', err)
        alert('No se pudo fijar satélite GPS en este instante. Se usarán las coordenadas de la quebrada.')
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newReport: CommunityReport = {
      id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      cuencaId: quebrada.includes('Pachacoto') ? 'pachacoto' : 'quillcay',
      quebrada,
      coordenadas: gpsCoords || (quebrada.includes('Pastoruri')
        ? { lat: -9.921, lng: -77.195, precisionM: 10 }
        : quebrada.includes('Shallap')
        ? { lat: -9.524, lng: -77.388, precisionM: 10 }
        : quebrada.includes('Rurec')
        ? { lat: -9.635, lng: -77.47, precisionM: 10 }
        : { lat: -9.512, lng: -77.456, precisionM: 8 }),
      fecha: new Date().toISOString().split('T')[0],
      colorAgua,
      olorSabor,
      usosAfectados: usos,
      phMedido: ph,
      tieneFoto: !!photoPreview,
      fotoUrl: photoPreview || undefined,
      comentarios,
      sincronizado: isOnline,
      simulado: true,
    }

    onSaveReport(newReport)
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#dfe7e5] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#dfe7e5] flex items-center justify-between sticky top-0 bg-white/98 backdrop-blur-md z-10">
          <div>
            <span className="text-[10px] font-black uppercase text-[#3346a8] bg-[#edf0ff] px-2.5 py-0.5 rounded-full inline-block mb-1">
              Ciencia Ciudadana
            </span>
            <h2 className="text-xl font-black text-[#172726]">Reportar Calidad del Agua</h2>
            <p className="text-xs text-[#667573]">
              {isOnline
                ? 'Conexión activa · Tu reporte se guardará de inmediato'
                : 'Sin conexión · Se guardará en cola local y se enviará al reconectar'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Success State */}
        {submitted ? (
          <div className="p-8 flex flex-col items-center text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-green-100 text-[#21835b] flex items-center justify-center">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-black text-[#172726]">¡Reporte Registrado!</h3>
            <p className="text-sm text-[#667573] max-w-md">
              {isOnline
                ? 'Tu reporte fue transmitido exitosamente y servirá para calibrar los mapas de alerta temprana de la Cordillera Blanca.'
                : 'Tu reporte se guardó de forma segura en tu teléfono (almacenamiento local IndexedDB). Se sincronizará automáticamente apenas detectemos señal.'}
            </p>
            <div className="bg-[#f8faf9] p-4 rounded-2xl border border-[#dfe7e5] text-xs text-left w-full space-y-1">
              <div>
                <strong>Punto:</strong> {quebrada}
              </div>
              <div>
                <strong>Color reportado:</strong> {colorAgua}
              </div>
              {ph && (
                <div>
                  <strong>pH registrado:</strong> {ph.toFixed(1)}
                </div>
              )}
              <div className="text-[#3346a8] font-bold flex items-center gap-1 pt-1">
                <Clock size={13} /> Estado:{' '}
                {isOnline ? 'Sincronizado en servidor' : 'En cola local sin conexión'}
              </div>
            </div>
            <button
              onClick={() => {
                setSubmitted(false)
                onClose()
              }}
              className="w-full min-h-[48px] rounded-xl bg-[#3346a8] hover:bg-[#25368f] text-white font-bold text-sm transition-colors mt-2"
            >
              Cerrar y volver al mapa
            </button>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Step 1: Ubicación */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-[#172726] flex items-center gap-1.5">
                  <MapPin size={15} className="text-[#3346a8]" /> 1. Ubicación y Quebrada
                </label>
                <button
                  type="button"
                  onClick={handleCaptureGps}
                  disabled={capturingGps}
                  className="text-[11px] font-bold text-[#3346a8] hover:text-[#25368f] bg-[#edf0ff] hover:bg-[#e0e7ff] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Navigation size={12} className={capturingGps ? 'animate-spin' : ''} />
                  <span>{capturingGps ? 'Obteniendo GPS...' : 'Fijar mi GPS real'}</span>
                </button>
              </div>
              <select
                value={quebrada}
                onChange={(e) => setQuebrada(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#dfe7e5] bg-[#fafbfb] text-sm text-[#172726] font-semibold focus:outline-[#3346a8]"
              >
                <option value="Quebrada Cojup (Quillcay)">Quebrada Cojup (Captación Huaraz)</option>
                <option value="Quebrada Shallap (Quillcay)">Quebrada Shallap (Aguas ácidas)</option>
                <option value="Quebrada Quilcayhuanca (Quillcay)">Quebrada Quilcayhuanca</option>
                <option value="Quebrada Pastoruri (Pachacoto)">Quebrada Pastoruri (Cátac)</option>
                <option value="Pampa de Pumapampa (Pachacoto)">Pampa de Pumapampa (Bofedal)</option>
                <option value="Río Santa (Puente Huaraz)">Río Santa (Zona urbana Huaraz)</option>
                <option value="Quebrada Rurec (Canray Chico)">Quebrada Rurec (Olleros)</option>
              </select>
              {gpsCoords ? (
                <div className="flex items-center gap-2 text-[11px] text-[#21835b] bg-[#e8f5ed] px-3 py-1.5 rounded-lg border border-[#21835b]/20">
                  <CheckCircle2 size={13} /> GPS satelital fijado: {gpsCoords.lat}, {gpsCoords.lng} (Margen ±{gpsCoords.precisionM} m)
                </div>
              ) : (
                <div className="flex items-center justify-between text-[11px] text-[#667573] bg-[#f8faf9] px-3 py-1.5 rounded-lg border border-[#dfe7e5]">
                  <span>Coordenadas aproximadas de la quebrada</span>
                  <span className="text-[#3346a8] font-bold cursor-pointer" onClick={handleCaptureGps}>Toca "Fijar mi GPS real"</span>
                </div>
              )}
            </div>

            {/* Step 2: Foto del agua */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#172726] flex items-center gap-1.5">
                <Camera size={15} className="text-[#3346a8]" /> 2. Foto del agua o quebrada
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 border-2 border-dashed border-[#dfe7e5] hover:border-[#3346a8] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#fafbfb] text-center">
                  <Upload size={22} className="text-[#667573] mb-1" />
                  <span className="text-xs font-bold text-[#172726]">
                    {photoPreview ? 'Cambiar foto cargada' : 'Tomar foto o subir desde galería'}
                  </span>
                  <span className="text-[10px] text-[#667573]">
                    Mantén distancia prudente del lecho
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {photoPreview && (
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#dfe7e5] relative shadow-sm">
                    <img
                      src={photoPreview}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Color del Agua */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#172726] flex items-center gap-1.5">
                <Droplets size={15} className="text-[#3346a8]" /> 3. Coloración observable del agua
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Anaranjada o rojiza', desc: 'Precipitación de hierro (DAR)' },
                  { label: 'Blanquecina o lechosa', desc: 'Coloides de aluminio' },
                  { label: 'Clara o cristalina', desc: 'Sin cambios visibles' },
                  { label: 'Amarillenta u oscura', desc: 'Materia orgánica / turba' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setColorAgua(item.label)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      colorAgua.includes(item.label)
                        ? 'border-[#3346a8] bg-[#edf0ff] ring-2 ring-[#3346a8]/20'
                        : 'border-[#dfe7e5] bg-white hover:bg-gray-50'
                    }`}
                  >
                    <strong className="text-xs font-black text-[#172726] block">{item.label}</strong>
                    <span className="text-[10px] text-[#667573]">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Usos comunitarios del agua */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#172726] flex items-center gap-1.5">
                <ShieldAlert size={15} className="text-[#3346a8]" /> 4. Usos del agua en la zona
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Consumo humano / potable',
                  'Riego agrícola',
                  'Abrevadero para ganado',
                  'Piscicultura (truchas)',
                  'Ninguno / Zona alta',
                ].map((use) => (
                  <button
                    key={use}
                    type="button"
                    onClick={() => toggleUse(use)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      usos.includes(use)
                        ? 'bg-[#3346a8] text-white border-[#3346a8]'
                        : 'bg-white text-[#172726] border-[#dfe7e5] hover:bg-gray-50'
                    }`}
                  >
                    {use}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Tira de pH (Opcional) */}
            <div className="space-y-2 bg-[#f8faf9] p-3.5 rounded-2xl border border-[#dfe7e5]">
              <div className="flex justify-between items-center text-xs">
                <label className="font-black text-[#172726]">
                  5. Medición con tira de pH (opcional)
                </label>
                <span className="font-bold text-[#3346a8] bg-white px-2 py-0.5 rounded-md border border-[#dfe7e5]">
                  {ph !== null ? `pH ${ph.toFixed(1)}` : 'Sin dato'}
                </span>
              </div>
              <input
                type="range"
                min="2.0"
                max="9.0"
                step="0.1"
                value={ph ?? 7.0}
                onChange={(e) => setPh(Number(e.target.value))}
                className="w-full accent-[#3346a8] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#667573] font-bold">
                <span className="text-red-700">Ácido (2.0 - 5.0)</span>
                <span className="text-green-700">Neutro ECA (6.5 - 8.5)</span>
                <span>Alcalino (9.0)</span>
              </div>
            </div>

            {/* Step 6: Comentarios */}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-[#172726]">
                6. Observaciones adicionales
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Describe si notaste peces muertos, olor a azufre, animales que rechazan beber, etc."
                className="w-full p-3 rounded-xl border border-[#dfe7e5] text-xs text-[#172726] focus:outline-[#3346a8] min-h-[70px]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full min-h-[50px] rounded-xl bg-[#3346a8] hover:bg-[#25368f] text-white font-black text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <CheckCircle2 size={18} />
                Guardar Reporte Comunitario
              </button>
              <p className="text-[11px] text-[#667573] text-center mt-2">
                {isOnline
                  ? 'Se guardará en la base de datos de alerta temprana.'
                  : 'Se guardará en la memoria local de tu dispositivo y se enviará al conectarte.'}
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
