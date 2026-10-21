import React, { useState } from 'react'
import {
  Sliders,
  Sparkles,
  Calculator,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FlaskConical,
} from 'lucide-react'

export const RiskSimulator: React.FC = () => {
  // 4 variables (0 to 100)
  const [rocaExpuesta, setRocaExpuesta] = useState<number>(85)
  const [potencialAcido, setPotencialAcido] = useState<number>(75)
  const [lluvia, setLluvia] = useState<number>(60)
  const [bofedal, setBofedal] = useState<number>(30)
  const [alpha, setAlpha] = useState<number>(0.75) // peso de depuración de bofedales

  // Presets
  const applyPreset = (preset: 'quillcay' | 'pachacoto' | 'rioblanco') => {
    if (preset === 'quillcay') {
      setRocaExpuesta(92)
      setPotencialAcido(78)
      setLluvia(65)
      setBofedal(28)
      setAlpha(0.75)
    } else if (preset === 'pachacoto') {
      setRocaExpuesta(65)
      setPotencialAcido(62)
      setLluvia(55)
      setBofedal(45)
      setAlpha(0.75)
    } else if (preset === 'rioblanco') {
      setRocaExpuesta(24)
      setPotencialAcido(18)
      setLluvia(40)
      setBofedal(62)
      setAlpha(0.75)
    }
  }

  // Formula:
  // generacion = (rocaExpuesta/100) * (potencialAcido/100)
  // depuracionFactor = (1 - alpha * (bofedal/100))
  // riesgo = generacion * (lluvia/100) * depuracionFactor * 100
  const generacion = (rocaExpuesta / 100) * (potencialAcido / 100)
  const amortiguacion = Math.max(0, 1 - alpha * (bofedal / 100))
  const rawRisk = generacion * (lluvia / 100) * amortiguacion
  const riskScore = Math.min(100, Math.round(rawRisk * 160)) // normalized scale 0-100

  const getRiskLevel = (score: number) => {
    if (score >= 65) return { label: 'Alto', color: '#bd3f3a', bg: 'bg-red-50 text-red-700 border-red-200' }
    if (score >= 35) return { label: 'Medio', color: '#a86408', bg: 'bg-amber-50 text-amber-700 border-amber-200' }
    return { label: 'Bajo', color: '#21835b', bg: 'bg-green-50 text-green-700 border-green-200' }
  }

  const riskLevel = getRiskLevel(riskScore)

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#dfe7e5] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase text-[#3346a8] tracking-wider mb-1">
              <FlaskConical size={16} /> Laboratorio de Modelamiento Ambiental
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#172726]">
              Simulador del Motor de Riesgo de Agua Ácida
            </h1>
            <p className="text-sm text-[#667573] mt-1 max-w-2xl">
              Modela el comportamiento del Drenaje Ácido de Roca (DAR) en función de las cuatro
              variables físicas consensuadas con el asesor ambiental.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 bg-[#f4f7f6] p-2 rounded-2xl border border-[#dfe7e5]">
            <span className="text-xs font-bold text-[#667573] px-1">Cargar Cuenca:</span>
            <button
              onClick={() => applyPreset('quillcay')}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-[#172726] hover:bg-[#edf0ff] hover:text-[#3346a8] border border-[#dfe7e5] transition-all"
            >
              Quillcay
            </button>
            <button
              onClick={() => applyPreset('pachacoto')}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-[#172726] hover:bg-[#edf0ff] hover:text-[#3346a8] border border-[#dfe7e5] transition-all"
            >
              Pachacoto
            </button>
            <button
              onClick={() => applyPreset('rioblanco')}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white text-[#172726] hover:bg-[#edf0ff] hover:text-[#3346a8] border border-[#dfe7e5] transition-all"
            >
              Río Blanco
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Sliders (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#dfe7e5] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#dfe7e5] pb-3">
            <h3 className="text-base font-black text-[#172726] flex items-center gap-2">
              <Sliders size={18} className="text-[#3346a8]" /> Variables de Entrada
            </h3>
            <button
              onClick={() => {
                setRocaExpuesta(50)
                setPotencialAcido(50)
                setLluvia(50)
                setBofedal(35)
                setAlpha(0.75)
              }}
              className="text-xs font-bold text-[#667573] hover:text-[#172726] flex items-center gap-1"
            >
              <RotateCcw size={13} /> Reiniciar
            </button>
          </div>

          {/* Slider 1: Roca Expuesta */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="font-bold text-[#172726] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#bd3f3a]" />
                1. Retroceso glaciar / Roca expuesta
              </label>
              <span className="font-black text-[#bd3f3a] bg-red-50 px-2.5 py-0.5 rounded-lg border border-red-200">
                {rocaExpuesta}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={rocaExpuesta}
              onChange={(e) => setRocaExpuesta(Number(e.target.value))}
              className="w-full accent-[#bd3f3a] cursor-pointer"
            />
            <p className="text-xs text-[#667573]">
              Gatillo físico: Área de morena y lecho rocoso recién desprovista de hielo y expuesta a la atmósfera.
            </p>
          </div>

          {/* Slider 2: Potencial Ácido (Litología con Sulfuros) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="font-bold text-[#172726] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a86408]" />
                2. Geología / Potencial ácido (% sulfuros)
              </label>
              <span className="font-black text-[#a86408] bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                {potencialAcido}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={potencialAcido}
              onChange={(e) => setPotencialAcido(Number(e.target.value))}
              className="w-full accent-[#a86408] cursor-pointer"
            />
            <p className="text-xs text-[#667573]">
              Potencial químico: Litologías con presencia de pirita ($FeS_2$) vs rocas carbonatadas neutralizantes.
            </p>
          </div>

          {/* Slider 3: Lluvia / Precipitación */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <label className="font-bold text-[#172726] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3346a8]" />
                3. Volumen de lluvia y estacionalidad
              </label>
              <span className="font-black text-[#3346a8] bg-[#edf0ff] px-2.5 py-0.5 rounded-lg border border-[#3346a8]/20">
                {lluvia}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={lluvia}
              onChange={(e) => setLluvia(Number(e.target.value))}
              className="w-full accent-[#3346a8] cursor-pointer"
            />
            <p className="text-xs text-[#667573]">
              Activador y vector de transporte: Acelera la oxidación y arrastra acidez y metales aguas abajo hacia quebradas.
            </p>
          </div>

          {/* Slider 4: Depuración Bofedales */}
          <div className="space-y-2 pt-2 border-t border-[#dfe7e5]">
            <div className="flex justify-between items-center text-sm">
              <label className="font-bold text-[#21835b] flex items-center gap-2">
                <Sparkles size={14} />
                4. Cobertura de bofedales (Filtro natural)
              </label>
              <span className="font-black text-[#21835b] bg-green-50 px-2.5 py-0.5 rounded-lg border border-green-200">
                {bofedal}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={bofedal}
              onChange={(e) => setBofedal(Number(e.target.value))}
              className="w-full accent-[#21835b] cursor-pointer"
            />
            <p className="text-xs text-[#21835b] font-medium">
              Amortiguador: Humedales que retienen metales pesados y amortiguan el pH ácido antes de llegar a la captación.
            </p>
          </div>

          {/* Slider 5: Factor Alfa de Calibración */}
          <div className="space-y-2 pt-2 border-t border-[#dfe7e5] bg-[#f8faf9] p-3.5 rounded-2xl">
            <div className="flex justify-between items-center text-xs">
              <label className="font-bold text-[#667573] flex items-center gap-1.5">
                <Calculator size={13} /> Factor de eficiencia del bofedal (α)
              </label>
              <span className="font-black text-[#172726] bg-white px-2 py-0.5 rounded-md border border-[#dfe7e5]">
                {alpha.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
              className="w-full accent-[#667573] cursor-pointer"
            />
            <p className="text-[11px] text-[#667573]">
              Parámetro a calibrar con el asesor ambiental según la conectividad hidrológica del humedal.
            </p>
          </div>
        </div>

        {/* Right Column: Live Computation & Results (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Big Risk Gauge Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#dfe7e5] shadow-xs flex flex-col items-center text-center">
            <span className="text-xs font-black uppercase tracking-wider text-[#667573]">
              Resultado del Algoritmo
            </span>

            {/* Score Ring / Display */}
            <div className="my-5 relative flex items-center justify-center">
              <div
                className="w-36 h-36 rounded-full border-8 flex flex-col items-center justify-center transition-all duration-300 shadow-inner"
                style={{
                  borderColor: riskLevel.color,
                  backgroundColor: `${riskLevel.color}0d`,
                }}
              >
                <span className="text-4xl font-black text-[#172726] tracking-tight">
                  {riskScore}
                </span>
                <span className="text-[11px] font-bold text-[#667573] uppercase">Puntaje / 100</span>
              </div>
            </div>

            {/* Level Badge */}
            <div
              className={`px-5 py-2 rounded-2xl border text-base font-black flex items-center gap-2 ${riskLevel.bg}`}
            >
              {riskScore >= 65 ? (
                <AlertTriangle size={18} />
              ) : riskScore >= 35 ? (
                <Info size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              Nivel de Riesgo {riskLevel.label}
            </div>

            <p className="text-xs text-[#667573] mt-4 leading-relaxed">
              {riskScore >= 65
                ? 'Alta probabilidad de drenaje ácido con metales pesados superando los Estándares de Calidad Ambiental (ECA Agua).'
                : riskScore >= 35
                ? 'Riesgo moderado. Se observan indicios de acidez que son parcialmente amortiguados por bofedales o baja lluvia.'
                : 'Condición estable. La baja presencia de sulfuros reactivos o la alta depuración del bofedal mantienen el agua segura.'}
            </p>
          </div>

          {/* Mathematical Formula Walkthrough */}
          <div className="bg-[#f8faf9] p-5 rounded-3xl border border-[#dfe7e5] space-y-3">
            <h4 className="text-xs font-black uppercase text-[#3346a8] tracking-wider flex items-center gap-1.5">
              <Calculator size={14} /> Desglose de la Fórmula Física
            </h4>

            <div className="text-xs font-mono bg-white p-3 rounded-xl border border-[#dfe7e5] space-y-1 text-[#172726]">
              <div>
                generación = roca ({rocaExpuesta}%) × sulfuros ({potencialAcido}%)
              </div>
              <div className="text-[#3346a8] font-bold">
                → potencial de acidez: {(generacion * 100).toFixed(1)}%
              </div>
              <div className="pt-1.5 border-t border-gray-100">
                amortiguación = 1 - ({alpha} × {bofedal}%) = {(amortiguacion * 100).toFixed(0)}%
              </div>
              <div className="pt-1.5 border-t border-gray-100 font-bold text-[#bd3f3a]">
                riesgo = generación × lluvia ({lluvia}%) × amortiguación
              </div>
            </div>

            <p className="text-[11px] text-[#667573] leading-relaxed">
              <strong>Nota científica:</strong> La multiplicación es deliberada: si no hay roca expuesta o si la geología no contiene sulfuros, el drenaje ácido es nulo, independientemente de cuánto llueva.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
