
import React, { useState, useEffect } from 'react'
import {
  Sliders,
  Sparkles,
  Calculator,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FlaskConical,
  Cpu,
  Activity,
  Layers,
} from 'lucide-react'
import { GlaciAguaApi } from '../services/api'
import { useI18n } from '../i18n/I18nContext'

export const RiskSimulator: React.FC = () => {
  const { t } = useI18n()

  // 4 variables (0 to 100)
  const [rocaExpuesta, setRocaExpuesta] = useState<number>(85)
  const [potencialAcido, setPotencialAcido] = useState<number>(75)
  const [lluvia, setLluvia] = useState<number>(60)
  const [bofedal, setBofedal] = useState<number>(30)
  const [alpha, setAlpha] = useState<number>(0.75)
  const [temporada, setTemporada] = useState<'seca' | 'humeda'>('seca')

  // Estado para la respuesta del modelo de Machine Learning
  const [mlResult, setMlResult] = useState<any>(null)
  const [cargandoMl, setCargandoMl] = useState<boolean>(false)

  // Presets
  const applyPreset = (preset: 'quillcay' | 'pachacoto' | 'rioblanco') => {
    if (preset === 'quillcay') {
      setRocaExpuesta(92)
      setPotencialAcido(78)
      setLluvia(65)
      setBofedal(28)
      setAlpha(0.75)
      setTemporada('seca')
    } else if (preset === 'pachacoto') {
      setRocaExpuesta(65)
      setPotencialAcido(62)
      setLluvia(55)
      setBofedal(45)
      setAlpha(0.75)
      setTemporada('seca')
    } else if (preset === 'rioblanco') {
      setRocaExpuesta(24)
      setPotencialAcido(18)
      setLluvia(40)
      setBofedal(62)
      setAlpha(0.75)
      setTemporada('humeda')
    }
  }

  // Fórmula física paramétrica
  const generacion = (rocaExpuesta / 100) * (potencialAcido / 100)
  const amortiguacion = Math.max(0, 1 - alpha * (bofedal / 100))
  const rawRisk = generacion * (lluvia / 100) * amortiguacion
  const riskScore = Math.min(100, Math.round(rawRisk * 160))

  // Consulta reactiva debounced al backend / microservicio ML
  useEffect(() => {
    let activo = true
    setCargandoMl(true)

    const timer = setTimeout(async () => {
      try {
        const resp = await GlaciAguaApi.simularRiesgo({
          rocaExpuesta,
          potencialAcido,
          lluvia,
          bofedal,
          alpha,
          temporada,
        })

        if (activo && resp?.prediccion_ml) {
          setMlResult(resp.prediccion_ml)
        }
      } catch {
        if (activo) setMlResult(null)
      } finally {
        if (activo) setCargandoMl(false)
      }
    }, 300)

    return () => {
      activo = false
      clearTimeout(timer)
    }
  }, [rocaExpuesta, potencialAcido, lluvia, bofedal, alpha, temporada])

  const getRiskLevel = (score: number) => {
    if (score >= 65) {
      return {
        label: t('sim_risk_high', 'Alto'),
        color: '#bd3f3a',
        bg: 'bg-red-50 text-red-700 border-red-200',
      }
    }

    if (score >= 35) {
      return {
        label: t('sim_risk_medium', 'Medio'),
        color: '#a86408',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
      }
    }

    return {
      label: t('sim_risk_low', 'Bajo'),
      color: '#21835b',
      bg: 'bg-green-50 text-green-700 border-green-200',
    }
  }

  const riskLevel = getRiskLevel(riskScore)

  // Traduce el nivel recibido del backend sin modificar su valor original
  const getMlRiskLabel = (level: string) => {
    const normalizedLevel = String(level).toLowerCase()

    if (normalizedLevel === 'alto' || normalizedLevel === 'high') {
      return t('sim_risk_high', 'Alto')
    }

    if (normalizedLevel === 'medio' || normalizedLevel === 'medium') {
      return t('sim_risk_medium', 'Medio')
    }

    if (normalizedLevel === 'bajo' || normalizedLevel === 'low') {
      return t('sim_risk_low', 'Bajo')
    }

    return level
  }

  return (
    <div className="w-full max-w-5xl mx-auto box-border px-3 py-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">

      {/* ENCABEZADO Y PRESETS */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#dfe7e5] shadow-xs">
        <div className="flex flex-col gap-4">

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase text-[#3346a8] tracking-wider mb-2">
              <FlaskConical size={16} className="shrink-0" />
              <span>{t('sim_lab_title', 'Laboratorio de Modelamiento Ambiental')}</span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-[#172726] leading-tight">
              {t('sim_main_title', 'Simulador del Motor de Riesgo de Agua Ácida')}
            </h1>

            <p className="text-sm text-[#667573] mt-2 max-w-2xl leading-relaxed">
              {t(
                'sim_main_description',
                'Modela el comportamiento del Drenaje Ácido de Roca (DAR) en función de las cuatro variables físicas y contrasta con el microservicio predictivo de Machine Learning.'
              )}
            </p>
          </div>

          {/* PRESETS */}
          <div className="w-full min-w-0 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 bg-[#f4f7f6] p-3 rounded-2xl border border-[#dfe7e5]">
            <span className="text-xs font-bold text-[#667573] px-1">
              {t('sim_load_basin', 'Cargar Cuenca:')}
            </span>

            <div className="grid grid-cols-3 sm:flex gap-2">
              <button
                type="button"
                onClick={() => applyPreset('quillcay')}
                className="min-h-10 px-2 sm:px-3 py-2 text-xs font-bold rounded-xl bg-white text-[#172726] hover:bg-[#edf0ff] hover:text-[#3346a8] border border-[#dfe7e5] transition-all"
              >
                Quillcay
              </button>

              <button
                type="button"
                onClick={() => applyPreset('pachacoto')}
                className="min-h-10 px-2 sm:px-3 py-2 text-xs font-bold rounded-xl bg-white text-[#172726] hover:bg-[#edf0ff] hover:text-[#3346a8] border border-[#dfe7e5] transition-all"
              >
                Pachacoto
              </button>

              <button
                type="button"
                onClick={() => applyPreset('rioblanco')}
                className="min-h-10 px-2 sm:px-3 py-2 text-xs font-bold rounded-xl bg-white text-[#172726] hover:bg-[#edf0ff] hover:text-[#3346a8] border border-[#dfe7e5] transition-all"
              >
                Río Blanco
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">

        {/* COLUMNA IZQUIERDA: VARIABLES */}
        <div className="min-w-0 lg:col-span-7 bg-white p-4 sm:p-6 rounded-3xl border border-[#dfe7e5] shadow-xs space-y-5">

          {/* ENCABEZADO DE VARIABLES */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#dfe7e5]">
            <h3 className="font-black text-[#172726] flex items-center gap-2 text-sm sm:text-base min-w-0">
              <Sliders size={18} className="text-[#3346a8] shrink-0" />
              <span>{t('sim_environmental_variables', 'Variables Ambientales')}</span>
            </h3>

            <button
              type="button"
              onClick={() => {
                setRocaExpuesta(50)
                setPotencialAcido(50)
                setLluvia(50)
                setBofedal(50)
                setAlpha(0.75)
                setTemporada('seca')
              }}
              className="shrink-0 text-xs font-bold text-[#667573] hover:text-[#172726] flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={13} />
              {t('sim_reset', 'Reiniciar')}
            </button>
          </div>

          {/* TEMPORADA HIDROLÓGICA */}
          <div className="space-y-2">
            <div className="flex flex-col min-[360px]:flex-row min-[360px]:justify-between min-[360px]:items-center gap-2 text-xs">
              <label className="font-bold text-[#172726] flex items-center gap-2">
                <Layers size={14} className="text-[#3346a8] shrink-0" />
                {t('sim_hydrological_season', 'Temporada Hidrológica')}
              </label>

              <div className="flex w-full min-[360px]:w-auto bg-[#f4f7f6] p-1 rounded-xl border border-[#dfe7e5]">
                <button
                  type="button"
                  onClick={() => setTemporada('seca')}
                  className={`flex-1 min-[360px]:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    temporada === 'seca'
                      ? 'bg-[#3346a8] text-white shadow-xs'
                      : 'text-[#667573]'
                  }`}
                >
                  {t('sim_season_dry', 'Seca')}
                </button>

                <button
                  type="button"
                  onClick={() => setTemporada('humeda')}
                  className={`flex-1 min-[360px]:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    temporada === 'humeda'
                      ? 'bg-[#0284c7] text-white shadow-xs'
                      : 'text-[#667573]'
                  }`}
                >
                  {t('sim_season_wet', 'Húmeda')}
                </button>
              </div>
            </div>
          </div>

          {/* SLIDER 1: ROCA EXPUESTA */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2 text-xs">
              <label className="font-bold text-[#172726] flex items-start gap-2 min-w-0 leading-relaxed">
                <span className="w-2.5 h-2.5 rounded-full bg-[#bd3f3a] shrink-0 mt-1" />
                <span>{t('sim_rock_label', '1. Roca recién expuesta (Deglaciación)')}</span>
              </label>

              <span className="shrink-0 font-black text-[#bd3f3a] bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                {rocaExpuesta}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={rocaExpuesta}
              onChange={(e) => setRocaExpuesta(Number(e.target.value))}
              aria-label={t('sim_rock_aria', 'Roca recién expuesta')}
              className="w-full accent-[#bd3f3a] cursor-pointer touch-pan-y"
            />

            <p className="text-xs text-[#667573] leading-relaxed">
              {t('sim_rock_description', 'Gatillo inicial: Área de roca descubierta recientemente por el retroceso del glaciar.')}
            </p>
          </div>

          {/* SLIDER 2: POTENCIAL ÁCIDO */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2 text-xs">
              <label className="font-bold text-[#172726] flex items-start gap-2 min-w-0 leading-relaxed">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a86408] shrink-0 mt-1" />
                <span>{t('sim_geology_label', '2. Geología reactiva (Contenido de sulfuros)')}</span>
              </label>

              <span className="shrink-0 font-black text-[#a86408] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                {potencialAcido}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={potencialAcido}
              onChange={(e) => setPotencialAcido(Number(e.target.value))}
              aria-label={t('sim_geology_aria', 'Geología reactiva')}
              className="w-full accent-[#a86408] cursor-pointer touch-pan-y"
            />

            <p className="text-xs text-[#667573] leading-relaxed">
              {t('sim_geology_description', 'Reactivo químico: Porcentaje de rocas con pirita oxidable (Formaciones Chicama, Chimú).')}
            </p>
          </div>

          {/* SLIDER 3: LLUVIA */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2 text-xs">
              <label className="font-bold text-[#172726] flex items-start gap-2 min-w-0 leading-relaxed">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] shrink-0 mt-1" />
                <span>{t('sim_rain_label', '3. Precipitación acumulada (Escorrentía)')}</span>
              </label>

              <span className="shrink-0 font-black text-[#0284c7] bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                {lluvia}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={lluvia}
              onChange={(e) => setLluvia(Number(e.target.value))}
              aria-label={t('sim_rain_aria', 'Precipitación acumulada')}
              className="w-full accent-[#0284c7] cursor-pointer touch-pan-y"
            />

            <p className="text-xs text-[#667573] leading-relaxed">
              {t('sim_rain_description', 'Vector de transporte: El agua de lluvia oxigena la roca y transporta los iones sulfato y metales.')}
            </p>
          </div>

          {/* SLIDER 4: BOFEDALES */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2 text-xs">
              <label className="font-bold text-[#21835b] flex items-start gap-2 min-w-0 leading-relaxed">
                <Sparkles size={14} className="shrink-0 mt-0.5" />
                <span>{t('sim_wetland_label', '4. Cobertura de bofedales (Filtro natural)')}</span>
              </label>

              <span className="shrink-0 font-black text-[#21835b] bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                {bofedal}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={bofedal}
              onChange={(e) => setBofedal(Number(e.target.value))}
              aria-label={t('sim_wetland_aria', 'Cobertura de bofedales')}
              className="w-full accent-[#21835b] cursor-pointer touch-pan-y"
            />

            <p className="text-xs text-[#21835b] font-medium leading-relaxed">
              {t('sim_wetland_description', 'Amortiguador: Humedales que retienen metales pesados y amortiguan el pH ácido antes de llegar a la captación.')}
            </p>
          </div>

          {/* SLIDER 5: FACTOR ALFA */}
          <div className="space-y-3 pt-3 border-t border-[#dfe7e5] bg-[#f8faf9] p-3 sm:p-4 rounded-2xl">
            <div className="flex items-start justify-between gap-2 text-xs">
              <label className="font-bold text-[#667573] flex items-start gap-1.5 min-w-0 leading-relaxed">
                <Calculator size={13} className="shrink-0 mt-0.5" />
                <span>{t('sim_alpha_label', 'Factor de eficiencia del bofedal (α)')}</span>
              </label>

              <span className="shrink-0 font-black text-[#172726] bg-white px-2.5 py-1 rounded-md border border-[#dfe7e5]">
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
              aria-label={t('sim_alpha_aria', 'Factor de eficiencia del bofedal')}
              className="w-full accent-[#667573] cursor-pointer touch-pan-y"
            />

            <p className="text-[11px] text-[#667573] leading-relaxed">
              {t('sim_alpha_description', 'Parámetro a calibrar según la saturación y conectividad hidrológica del humedal.')}
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESULTADOS */}
        <div className="min-w-0 lg:col-span-5 flex flex-col gap-4 sm:gap-6">

          {/* RESULTADO DEL MODELO FÍSICO */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#dfe7e5] shadow-xs flex flex-col items-center text-center">
            <span className="text-xs font-black uppercase tracking-wider text-[#667573]">
              {t('sim_physical_result', 'Resultado del Modelo Físico')}
            </span>

            {/* INDICADOR CIRCULAR */}
            <div className="my-5 relative flex items-center justify-center">
              <div
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-[7px] sm:border-8 flex flex-col items-center justify-center transition-all duration-300 shadow-inner"
                style={{
                  borderColor: riskLevel.color,
                  backgroundColor: `${riskLevel.color}0d`,
                }}
              >
                <span className="text-4xl font-black text-[#172726] tracking-tight">
                  {riskScore}
                </span>

                <span className="text-[10px] sm:text-[11px] font-bold text-[#667573] uppercase">
                  {t('sim_score', 'Puntaje')} / 100
                </span>
              </div>
            </div>

            {/* NIVEL DE RIESGO */}
            <div
              className={`max-w-full px-4 sm:px-5 py-2.5 rounded-2xl border text-sm sm:text-base font-black flex items-center justify-center gap-2 ${riskLevel.bg}`}
            >
              {riskScore >= 65 ? (
                <AlertTriangle size={18} className="shrink-0" />
              ) : riskScore >= 35 ? (
                <Info size={18} className="shrink-0" />
              ) : (
                <CheckCircle2 size={18} className="shrink-0" />
              )}

              <span>
                {t('sim_risk_level', 'Nivel de Riesgo')} {riskLevel.label}
              </span>
            </div>

            <p className="text-xs text-[#667573] mt-4 leading-relaxed">
              {riskScore >= 65
                ? t('sim_risk_high_description', 'Alta probabilidad de drenaje ácido con metales pesados superando los Estándares de Calidad Ambiental (ECA Agua).')
                : riskScore >= 35
                ? t('sim_risk_medium_description', 'Riesgo moderado. Se observan indicios de acidez que son parcialmente amortiguados por bofedales o baja lluvia.')
                : t('sim_risk_low_description', 'Condición estable. La baja presencia de sulfuros reactivos o la alta depuración del bofedal indican menor riesgo de acidez. Tratar según indicaciones de la JASS.')}
            </p>
          </div>

          {/* PREDICCIÓN MACHINE LEARNING */}
          <div className="min-w-0 bg-gradient-to-br from-[#172726] to-[#0f1b1a] text-white p-4 sm:p-5 rounded-3xl border border-gray-700 shadow-sm space-y-3">
            <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-[#38bdf8] tracking-wider min-w-0">
                <Cpu size={16} className="shrink-0" />
                <span>{t('sim_ml_title', 'Predicción Machine Learning (Random Forest)')}</span>
              </div>

              <span className="self-start min-[380px]:self-auto shrink-0 text-[10px] bg-sky-950/80 text-sky-300 px-2 py-1 rounded-full border border-sky-700/50 font-bold">
                API 8001
              </span>
            </div>

            {mlResult ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="min-w-0 bg-white/5 p-3 rounded-2xl border border-white/10">
                    <span className="text-[11px] text-gray-400 block font-medium">
                      {t('sim_estimated_ph', 'pH Estimado')}
                    </span>

                    <span className="text-xl sm:text-2xl font-black text-white break-words">
                      {mlResult.ph_estimado?.toFixed(2)}

                      <span className="text-xs text-gray-400 font-normal ml-1">
                        ±{mlResult.incertidumbre_ph?.toFixed(2)}
                      </span>
                    </span>
                  </div>

                  <div className="min-w-0 bg-white/5 p-3 rounded-2xl border border-white/10">
                    <span className="text-[11px] text-gray-400 block font-medium">
                      {t('sim_ai_risk', 'Riesgo IA')}
                    </span>

                    <span
                      className={`text-base sm:text-lg font-black inline-block mt-1 break-words ${
                        mlResult.nivel_riesgo === 'Alto' || mlResult.nivel_riesgo === 'High'
                          ? 'text-red-400'
                          : mlResult.nivel_riesgo === 'Medio' || mlResult.nivel_riesgo === 'Medium'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {getMlRiskLabel(mlResult.nivel_riesgo)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between gap-2 text-xs bg-white/5 px-3 py-3 rounded-xl border border-white/10">
                  <span className="text-gray-300 flex items-center gap-1.5">
                    <Activity size={13} className="text-sky-400 shrink-0" />
                    {t('sim_tree_agreement', 'Acuerdo entre árboles')}
                  </span>

                  <span className="font-black text-sky-300">
                    {Math.round((mlResult.acuerdo_arboles || 0) * 100)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400 py-3 text-center leading-relaxed">
                {cargandoMl
                  ? t('sim_ml_loading', 'Consultando microservicio ML...')
                  : t('sim_ml_unavailable', 'Servicio ML en línea o respondiendo con valores estimados.')}
              </div>
            )}
          </div>

          {/* DESGLOSE DE LA FÓRMULA FÍSICA */}
          <div className="min-w-0 bg-[#f8faf9] p-4 sm:p-5 rounded-3xl border border-[#dfe7e5] space-y-3">
            <h4 className="text-xs font-black uppercase text-[#3346a8] tracking-wider flex items-center gap-1.5">
              <Calculator size={14} className="shrink-0" />
              {t('sim_formula_title', 'Desglose de la Fórmula Física')}
            </h4>

            <div className="min-w-0 text-[11px] sm:text-xs font-mono bg-white p-3 sm:p-4 rounded-xl border border-[#dfe7e5] space-y-2 text-[#172726] break-words [overflow-wrap:anywhere]">
              <div>
                {t('sim_formula_generation', 'generación')} = {t('sim_formula_rock', 'roca')} ({rocaExpuesta}%) × {t('sim_formula_sulfides', 'sulfuros')} ({potencialAcido}%)
              </div>

              <div className="text-[#3346a8] font-bold">
                → {t('sim_formula_acidity', 'potencial de acidez')}: {(generacion * 100).toFixed(1)}%
              </div>

              <div className="pt-2 border-t border-gray-100">
                {t('sim_formula_damping', 'amortiguación')} = 1 - ({alpha} × {bofedal}%) = {(amortiguacion * 100).toFixed(0)}%
              </div>

              <div className="pt-2 border-t border-gray-100 font-bold text-[#bd3f3a]">
                {t('sim_formula_risk', 'riesgo')} = {t('sim_formula_generation', 'generación')} × {t('sim_formula_rain', 'lluvia')} ({lluvia}%) × {t('sim_formula_damping', 'amortiguación')}
              </div>
            </div>

            <p className="text-[11px] text-[#667573] leading-relaxed">
              <strong>{t('sim_scientific_validation', 'Validación científica:')}</strong>{' '}
              {t('sim_scientific_validation_description', 'El orden de riesgo generado por el modelo físico y el pH estimado por el Random Forest se contrastan con los datos históricos de campo.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
