import React, { useState } from 'react'
import { BasinData, Season } from '../types'
import {
  AlertTriangle,
  CheckCircle2,
  Droplet,
  Wifi,
  X,
  PlusCircle,
  BookOpen,
  MapPin,
  Sparkles,
  FlaskConical,
  Cpu,
  Sliders,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Flame,
  FileText,
  AlertOctagon,
  Scale,
} from 'lucide-react'

interface BasinDetailPanelProps {
  basin: BasinData | null
  season: Season
  onClose: () => void
  onOpenReport: () => void
  onOpenGuidance: () => void
  onOpenSimulator?: () => void
  onOpenConnectivity?: () => void
}

export const BasinDetailPanel: React.FC<BasinDetailPanelProps> = ({
  basin,
  season,
  onClose,
  onOpenReport,
  onOpenGuidance,
  onOpenSimulator,
  onOpenConnectivity,
}) => {
  const [showTechnicalSection, setShowTechnicalSection] = useState(false)
  const [showMLFeatures, setShowMLFeatures] = useState(false)

  if (!basin) return null

  const currentRisk = basin.nivelRiesgo[season]
  const currentScore = basin.scoreRiesgo[season]
  const mlData = basin.prediccionML ? basin.prediccionML[season] : null
  const features = basin.featuresML

  // Guía de uso cotidiano para familias, agricultores y ganaderos
  const getUsageGuidance = () => {
    switch (currentRisk) {
      case 'Alto':
        return {
          bannerBg: 'bg-red-500 text-white',
          title: '¡PELIGRO! AGUA NO APTA PARA CONSUMO',
          subtitle: 'Agua ácida con alta concentración de metales pesados (hierro y aluminio).',
          human: {
            status: 'NO BEBER NI COCINAR',
            badgeBg: 'bg-red-100 text-red-800 border-red-300',
            desc: 'Peligro grave para la salud de niños y adultos. Los metales dañan el estómago y los riñones.',
            icon: <AlertOctagon size={16} className="text-red-700 shrink-0" />,
          },
          crops: {
            status: 'EVITAR EN HORTALIZAS Y PAPAS',
            badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
            desc: 'La acidez quema las raíces tiernas y los metales se acumulan en la tierra de cultivo.',
            icon: <AlertTriangle size={16} className="text-amber-700 shrink-0" />,
          },
          animals: {
            status: 'NO DAR AL GANADO NI TRUCHAS',
            badgeBg: 'bg-red-100 text-red-800 border-red-300',
            desc: 'Causa cólicos, diarreas y bajo peso en vacas y ovejas. Tóxico para piscigranjas.',
            icon: <AlertOctagon size={16} className="text-red-700 shrink-0" />,
          },
        }
      case 'Medio':
        return {
          bannerBg: 'bg-amber-500 text-white',
          title: 'PRECAUCIÓN: AGUA EN OBSERVACIÓN',
          subtitle: 'Presenta acidez moderada. Evitar el consumo directo sin tratamiento.',
          human: {
            status: 'USAR SOLO AGUA DE CAPTACIÓN SEGURA',
            badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
            desc: 'No tomar directo de la acequia. Coordinar con la JASS para verificar la red de agua potable.',
            icon: <AlertTriangle size={16} className="text-amber-700 shrink-0" />,
          },
          crops: {
            status: 'APTO CON PRECAUCIÓN',
            badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
            desc: 'Monitorear si las hojas se ponen amarillentas o si el suelo presenta costras ocres.',
            icon: <Droplet size={16} className="text-amber-600 shrink-0" />,
          },
          animals: {
            status: 'USO MODERADO',
            badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
            desc: 'Preferir dar agua de manantiales limpios o fuentes que pasen por bofedales.',
            icon: <Droplet size={16} className="text-amber-600 shrink-0" />,
          },
        }
      default:
        return {
          bannerBg: 'bg-emerald-600 text-white',
          title: 'AGUA LIMPIA Y SEGURA',
          subtitle: 'Cumple los estándares ambientales de calidad para la comunidad.',
          human: {
            status: 'APTA PARA CONSUMO (TRATAMIENTO JASS)',
            badgeBg: 'bg-green-100 text-green-800 border-green-300',
            desc: 'Agua de glaciar limpia. Apta para el hogar tras la cloración habitual de la JASS.',
            icon: <CheckCircle2 size={16} className="text-green-700 shrink-0" />,
          },
          crops: {
            status: 'EXCELENTE PARA RIEGO',
            badgeBg: 'bg-green-100 text-green-800 border-green-300',
            desc: 'Nutre la tierra y los pastizales sin riesgo de acidificación.',
            icon: <CheckCircle2 size={16} className="text-green-700 shrink-0" />,
          },
          animals: {
            status: 'SEGURA PARA ANIMALES',
            badgeBg: 'bg-green-100 text-green-800 border-green-300',
            desc: 'Agua pura para abrevadero de ganado y apta para truchas.',
            icon: <CheckCircle2 size={16} className="text-green-700 shrink-0" />,
          },
        }
    }
  }

  const usage = getUsageGuidance()

  // Aspecto visual y sensorial del agua en la quebrada
  const getVisualWaterInfo = () => {
    if (basin.id === 'quillcay' || basin.ultimaMedicion.ph < 4.5) {
      return {
        colorName: 'Agua Anaranjada / Color Herrumbre',
        colorHex: '#ea580c',
        appearance: 'Rojiza y turbia. Piedras del río teñidas de óxido anaranjado.',
        taste: 'Sabor agrio o a metal oxidado que raspa la garganta.',
      }
    }
    if (basin.id === 'pachacoto' || basin.ultimaMedicion.ph < 5.6) {
      return {
        colorName: 'Agua Amarillenta / Tono Ocre',
        colorHex: '#d97706',
        appearance: 'Turbidez moderada con polvo mineral ocre en las orillas.',
        taste: 'Sabor ligeramente metálico o astringente.',
      }
    }
    if (basin.id === 'canray-chico') {
      return {
        colorName: 'Agua Ámbar Clara',
        colorHex: '#eab308',
        appearance: 'Casi clara en el curso bajo, pero con manchas amarillas en las nacientes.',
        taste: 'Sin olor perceptible, sabor ligeramente mineral.',
      }
    }
    return {
      colorName: 'Agua Cristalina y Transparente',
      colorHex: '#0ea5e9',
      appearance: 'Totalmente transparente. Lecho del río con piedras limpias y vida acuática.',
      taste: 'Sabor fresco de manantial glaciar.',
    }
  }

  const visual = getVisualWaterInfo()

  return (
    <aside className="w-full lg:w-[440px] bg-white border-l border-[#dfe7e5] flex flex-col h-full overflow-y-auto shadow-xl z-20 transition-all select-none">
      {/* Header con Ubicación Familiar */}
      <div className="p-4 sm:p-5 border-b border-[#dfe7e5] bg-[#fafbfb] sticky top-0 z-10 shadow-2xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-black uppercase text-[#3346a8] bg-[#edf0ff] px-2.5 py-0.5 rounded-full inline-block mb-1">
              Microcuenca Hidrográfica
            </span>
            <h2 className="text-2xl font-black text-[#172726]">{basin.nombre}</h2>
            <p className="text-xs text-[#667573] flex items-center gap-1 mt-0.5 font-medium">
              <MapPin size={13} className="text-[#3346a8]" />
              {basin.distrito}, {basin.provincia}
            </p>
            <p className="text-[11px] text-[#475569] font-bold mt-1">
              Quebradas: {basin.quebradasPrincipales.join(' · ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            title="Cerrar panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Semáforo del Agua Comunitario */}
        <div className={`mt-3.5 p-3.5 rounded-2xl ${usage.bannerBg} shadow-sm`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <h3 className="text-sm font-black tracking-tight">{usage.title}</h3>
          </div>
          <p className="text-xs opacity-95 mt-1 leading-snug font-medium">
            {usage.subtitle}
          </p>
        </div>
      </div>

      {/* Cuerpo Principal: Diseñado para Pobladores, Agricultores y Familias */}
      <div className="p-4 sm:p-5 space-y-5 flex-1">
        {/* Usos Cotidianos del Agua */}
        <section className="space-y-2.5">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#172726] flex items-center gap-1.5">
            <Droplet size={14} className="text-[#3346a8]" />
            ¿Para qué se puede usar esta agua hoy?
          </h4>

          {/* 1. Consumo Humano */}
          <div className="p-3 bg-white rounded-2xl border border-[#dfe7e5] shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#172726] flex items-center gap-1.5">
                🚰 Beber y Cocinar:
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${usage.human.badgeBg}`}>
                {usage.human.status}
              </span>
            </div>
            <p className="text-[11px] text-[#667573] leading-snug">
              {usage.human.desc}
            </p>
          </div>

          {/* 2. Riego de Cultivos */}
          <div className="p-3 bg-white rounded-2xl border border-[#dfe7e5] shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#172726] flex items-center gap-1.5">
                🌾 Riego de Chacras:
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${usage.crops.badgeBg}`}>
                {usage.crops.status}
              </span>
            </div>
            <p className="text-[11px] text-[#667573] leading-snug">
              {usage.crops.desc}
            </p>
          </div>

          {/* 3. Animales y Ganado */}
          <div className="p-3 bg-white rounded-2xl border border-[#dfe7e5] shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#172726] flex items-center gap-1.5">
                🐄 Ganado y Truchas:
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${usage.animals.badgeBg}`}>
                {usage.animals.status}
              </span>
            </div>
            <p className="text-[11px] text-[#667573] leading-snug">
              {usage.animals.desc}
            </p>
          </div>
        </section>

        {/* Alerta Médica Importante (Hervir el agua NO quita los metales) */}
        {currentRisk !== 'Bajo' && (
          <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-2xl flex items-start gap-3">
            <span className="text-2xl shrink-0">🫖</span>
            <div>
              <strong className="text-xs font-black text-[#a86408] block uppercase tracking-tight">
                ¡Aviso Importante de Salud!
              </strong>
              <p className="text-[11.5px] text-[#78350f] mt-1 leading-snug">
                <strong>Hervir el agua NO elimina los metales pesados.</strong> Al hervirla, el agua se evapora y los metales (hierro, aluminio, plomo) se concentran más. Usa agua de red potabilizada o manantiales certificados por la JASS.
              </p>
            </div>
          </div>
        )}

        {/* Aspecto Visual del Agua: Para que el poblador la reconozca */}
        <section className="bg-[#f8faf9] p-3.5 rounded-2xl border border-[#dfe7e5] space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#667573] block">
            ¿Cómo reconocer esta agua a simple vista?
          </span>
          <div className="flex items-center gap-2.5">
            <span
              className="w-4 h-4 rounded-full shadow-xs shrink-0 border border-white"
              style={{ backgroundColor: visual.colorHex }}
            />
            <strong className="text-xs font-black text-[#172726]">
              {visual.colorName}
            </strong>
          </div>
          <p className="text-[11px] text-[#475569] leading-snug">
            <strong>Color y turbidez:</strong> {visual.appearance}
          </p>
          <p className="text-[11px] text-[#475569] leading-snug">
            <strong>Olor y sabor:</strong> {visual.taste}
          </p>
        </section>

        {/* ¿Por qué está así el agua? Explicado en Lenguaje Sencillo */}
        <section className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#667573] block">
            ¿Por qué se produce esta contaminación?
          </span>
          <div className="bg-white p-3.5 rounded-2xl border border-[#dfe7e5] space-y-2.5 text-xs text-[#334155]">
            <div className="flex items-start gap-2">
              <span className="font-black text-[#3346a8] shrink-0">1.</span>
              <p className="leading-snug">
                <strong>El hielo se derritió:</strong> El glaciar retrocedió y dejó al descubierto cerros de roca que contienen azufre y minerales ácidos.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-black text-[#3346a8] shrink-0">2.</span>
              <p className="leading-snug">
                <strong>Las lluvias mojan la roca:</strong> Al llover, el agua lava esos minerales y los arrastra quebrada abajo hacia el río Santa.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-black text-[#21835b] shrink-0">3.</span>
              <p className="leading-snug">
                <strong>Los bofedales ayudan:</strong> Los humedales altoandinos atrapan parte de la suciedad, pero no alcanzan cuando el deshielo es muy fuerte.
              </p>
            </div>
          </div>
        </section>

        {/* Botones de Acción para la Comunidad */}
        <div className="pt-1 space-y-2">
          <button
            onClick={onOpenReport}
            className="w-full min-h-[46px] rounded-2xl bg-[#3346a8] hover:bg-[#25368f] text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <PlusCircle size={16} />
            Avisar sobre agua turbia en mi zona (Tomar Foto)
          </button>

          <button
            onClick={onOpenGuidance}
            className="w-full min-h-[42px] rounded-2xl bg-[#f0f4f3] hover:bg-[#e4eae8] text-[#172726] text-xs font-bold flex items-center justify-center gap-2 border border-[#dfe7e5] transition-all"
          >
            <BookOpen size={15} className="text-[#3346a8]" />
            Ver consejos completos de salud y redactar oficio para la JASS
          </button>

          {onOpenConnectivity && (
            <button
              onClick={onOpenConnectivity}
              className="w-full min-h-[40px] rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] text-xs font-bold flex items-center justify-center gap-2 border border-emerald-200 transition-all shadow-2xs"
            >
              <Wifi size={14} />
              Ver puntos con internet y señal cerca de esta cuenca
            </button>
          )}
        </div>

        {/* Acordeón Plegable: Para Ingenieros, Jurado y Personal Técnico */}
        <div className="pt-2 border-t border-[#dfe7e5]">
          <button
            onClick={() => setShowTechnicalSection(!showTechnicalSection)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#f8faf9] hover:bg-[#edf0ff] border border-[#dfe7e5] text-left flex items-center justify-between text-xs font-bold text-[#475569] transition-all"
          >
            <span className="flex items-center gap-1.5 text-[#3346a8]">
              <FlaskConical size={14} />
              <span>Ver Diagnóstico Técnico y Datos de Laboratorio (Jurado / Ingenieros)</span>
            </span>
            {showTechnicalSection ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showTechnicalSection && (
            <div className="mt-3 space-y-3 bg-[#0f172a] text-white p-4 rounded-2xl border border-slate-700 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs">
                  <Cpu size={14} />
                  <span>Modelo Predictivo Random Forest (83.6% precisión)</span>
                </div>
                <span className="text-[9px] bg-sky-950 text-sky-300 px-2 py-0.5 rounded-full border border-sky-600/50">
                  Microservicio ML
                </span>
              </div>

              {mlData && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">pH de Salida Estimado</span>
                    <strong className="text-base text-white">
                      pH {mlData.ph_estimado.toFixed(2)}
                    </strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Margen: ±{mlData.incertidumbre_ph.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-bold">Consenso de Árboles</span>
                    <strong className="text-base text-sky-300">
                      {Math.round(mlData.acuerdo_arboles * 100)}%
                    </strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Riesgo IA: {mlData.nivel_riesgo}
                    </span>
                  </div>
                </div>
              )}

              {/* Contraste Físico vs IA */}
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/60 text-[10.5px] space-y-1">
                <div className="flex items-center gap-1 text-sky-300 font-bold">
                  <Scale size={12} />
                  <span>Validación Dual: Motor Físico ({currentScore}/100) vs IA (pH {mlData?.ph_estimado})</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Ambos modelos convergen en clasificación de riesgo <strong>{currentRisk}</strong>, validando la hipótesis física de drenaje ácido de roca.
                </p>
              </div>

              {/* Botón para ver las 8 variables HydroBASINS */}
              {features && (
                <div>
                  <button
                    onClick={() => setShowMLFeatures(!showMLFeatures)}
                    className="w-full text-[10.5px] font-bold text-slate-300 hover:text-white flex items-center justify-between py-1 transition-colors"
                  >
                    <span>Detalle de 8 variables HydroBASINS nivel 12</span>
                    {showMLFeatures ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  {showMLFeatures && (
                    <div className="mt-1 space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-300">
                      <div className="flex justify-between py-0.5 border-b border-slate-800">
                        <span className="text-slate-400">Área de cuenca:</span>
                        <span>{features.area_km2} km²</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-slate-800">
                        <span className="text-slate-400">Roca expuesta (glaciar):</span>
                        <span className="text-sky-300">{features.roca_expuesta_km2} km²</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-slate-800">
                        <span className="text-slate-400">Sulfuros oxidables:</span>
                        <span className="text-red-400">{features.pct_sulfuros}%</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-slate-800">
                        <span className="text-slate-400">Carbonatos neutralizantes:</span>
                        <span className="text-emerald-400">{features.pct_carbonatos}%</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-slate-800">
                        <span className="text-slate-400">Lluvia estacional:</span>
                        <span>{features.lluvia_mm} mm</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-400">Bofedales amortiguadores:</span>
                        <span className="text-emerald-300">{features.pct_bofedal}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Última medición de campo INAIGEM / UPCH */}
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700 text-[10.5px] space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 block">Dato de Laboratorio en Campo:</span>
                <p className="text-slate-200">
                  pH medido: <strong>{basin.ultimaMedicion.ph.toFixed(1)}</strong> · Conductividad: <strong>{basin.ultimaMedicion.conductividad} µS/cm</strong>
                </p>
                <p className="text-slate-400 text-[10px]">
                  Fuente: {basin.ultimaMedicion.fuente} ({basin.ultimaMedicion.fecha})
                </p>
              </div>

              {/* Botón directo al simulador */}
              {onOpenSimulator && (
                <button
                  onClick={onOpenSimulator}
                  className="w-full py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sliders size={13} />
                  Abrir Simulador del Modelo con esta cuenca
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
