import React, { useState } from 'react'
import {
  AlertTriangle,
  XCircle,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Droplet,
  Users,
  Copy,
  Check,
  Printer,
  Sparkles,
  Info,
} from 'lucide-react'
import { RiskLevel } from '../types'
import { AudioPlayButton } from './AudioPlayButton'
import { DISCLAIMER_NOTE_ES } from '../utils/accessibleTheme'

export const GuidanceView: React.FC = () => {
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>('Alto')
  const [copiedLetter, setCopiedLetter] = useState(false)
  const [comunidadNombre, setComunidadNombre] = useState('Comunidad Campesina de Huaraz')

  const copyOficio = () => {
    const text = `OFICIO N° 012-2026/ALERTA-GLACIAGUA
A: Junta Administradora de Servicios de Saneamiento (JASS) / EPS Chavín / Junta de Regantes
DE: Monitoreo Comunitario GlaciAgua - Cordillera Blanca
ASUNTO: Alerta Temprana por Probable Drenaje Ácido de Roca y Presencia de Metales Pesados en Cabecera

Mediante la presente se hace de su conocimiento que la herramienta de alerta temprana GlaciAgua ha clasificado el sector en nivel de RIESGO ${selectedRisk.toUpperCase()}.

PARÁMETROS OBSERVADOS:
- Retroceso glaciar con roca reactiva con sulfuros expuesta a la atmósfera.
- Posible superación de Estándares de Calidad Ambiental (ECA Agua) en pH ácido y metales disueltos (Fe, Al, Mn).

RECOMENDACIONES INMEDIATAS:
1. Inspeccionar bocatomas de captación y canales principales.
2. NO recomendar únicamente hervir el agua (el calor evapora el líquido y concentra los metales pesados).
3. Evaluar el uso de fuentes alternas de manantial para consumo humano y abrevadero de ganado.
4. Notificar a la Dirección Regional de Salud (DIRESA Áncash) y a la Autoridad Nacional del Agua (ANA).

Fecha de emisión: ${new Date().toLocaleDateString('es-PE')}
Generado mediante la plataforma GlaciAgua (PWA Comunitario).`

    navigator.clipboard?.writeText(text)
    setCopiedLetter(true)
    setTimeout(() => setCopiedLetter(false), 2500)
  }

  const audioGuidanceText = `Guía comunitaria de agua. Cuando una quebrada tiene alerta roja o amarilla, hervir el agua no quita los metales pesados. Busca manantiales limpios de ladera, cuida los bofedales que limpian el agua y avisa a tu junta de agua o municipio.`

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-[#0f172a]">
      {/* Title Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#cbd5e1] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <span className="text-xs font-black uppercase text-[#1e3a8a] bg-[#eff6ff] px-3 py-1 rounded-full inline-block">
            Guía de Prevención Comunitaria
          </span>
          <AudioPlayButton audioKey="aviso_hervir" textToSpeak={audioGuidanceText} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a]">
          Qué Hacer y Qué Evitar frente al Agua Ácida
        </h1>
        <p className="text-base text-[#475569] mt-1 max-w-2xl font-medium">
          Instrucciones claras para proteger a las familias, cultivos y ganado en zonas afectadas
          por el deshielo de glaciares en la Cordillera Blanca.
        </p>

        {/* Risk Level Selector */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          <span className="text-xs font-black text-[#475569] mr-1">Seleccionar Nivel:</span>
          {(['Alto', 'Medio', 'Bajo'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSelectedRisk(level)}
              className={`touch-target px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-1.5 ${
                selectedRisk === level
                  ? level === 'Alto'
                    ? 'bg-[#991b1b] text-white shadow-sm'
                    : level === 'Medio'
                    ? 'bg-[#92400e] text-white shadow-sm'
                    : 'bg-[#166534] text-white shadow-sm'
                  : 'bg-[#f1f5f9] text-[#475569] hover:bg-slate-200'
              }`}
            >
              <AlertTriangle size={16} />
              Riesgo {level}
            </button>
          ))}
        </div>
      </div>

      {/* Critical Medical/Environmental Alert Banner */}
      <div className="bg-[#fff7ed] border-2 border-[#fdba74] p-5 rounded-3xl flex items-start gap-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-[#fed7aa] text-[#9a3412] flex items-center justify-center shrink-0 mt-0.5">
          <ShieldAlert size={28} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-[#9a3412]">
            ¡ADVERTENCIA SOBRE EL HERVIDO DEL AGUA!
          </h3>
          <p className="text-sm text-[#7c2d12] leading-relaxed font-semibold">
            <strong>Hervir el agua NO elimina los metales pesados</strong> (hierro, aluminio, plomo o manganeso). Al hervir, el agua se evapora en vapor y los metales disueltos quedan <em>más concentrados</em>. Si el agua proviene de quebradas con drenaje ácido, prioriza fuentes alternas de manantiales protegidos.
          </p>
        </div>
      </div>

      {/* Grid: Qué Evitar vs Qué Hacer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Qué Evitar (Red) */}
        <div className="bg-white p-6 rounded-3xl border border-red-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#991b1b] border-b border-red-100 pb-3">
            <XCircle size={24} />
            <h3 className="text-xl font-black text-[#0f172a]">Qué Evitar</h3>
          </div>

          <ul className="space-y-3.5 text-sm text-[#0f172a]">
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-red-100 text-[#991b1b] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                ✕
              </span>
              <span>
                <strong>Evita beber de quebradas con agua anaranjada, lechosa o turbia.</strong> La coloración rojiza evidencia óxidos de hierro precipitados por drenaje ácido.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-red-100 text-[#991b1b] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                ✕
              </span>
              <span>
                <strong>No confíes en filtros caseros de tela o hervor simple</strong> para consumo familiar de agua con sospecha de metales.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-red-100 text-[#991b1b] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                ✕
              </span>
              <span>
                <strong>Evita usar agua fuertemente ácida para hortalizas tiernas</strong> ni forraje delicado, ya que el aluminio y la acidez queman las raíces.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-red-100 text-[#991b1b] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                ✕
              </span>
              <span>
                <strong>Evita que el ganado beba directamente de charcas morenaicas</strong> recién expuestas donde se concentran sales de sulfatos.
              </span>
            </li>
          </ul>
        </div>

        {/* Qué Hacer (Green) */}
        <div className="bg-white p-6 rounded-3xl border border-green-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#166534] border-b border-green-100 pb-3">
            <CheckCircle2 size={24} />
            <h3 className="text-xl font-black text-[#0f172a]">Qué Hacer</h3>
          </div>

          <ul className="space-y-3.5 text-sm text-[#0f172a]">
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-green-100 text-[#166534] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                ✓
              </span>
              <span>
                <strong>Captar agua de manantiales laterales (puquios)</strong> o quebradas altas protegidas con cobertura vegetal y bofedales depuradores.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-green-100 text-[#166534] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                ✓
              </span>
              <span>
                <strong>Reportar en GlaciAgua cualquier cambio de color o sabor</strong> para alertar a los comités de agua y al municipio provincial.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-green-100 text-[#166534] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                ✓
              </span>
              <span>
                <strong>Cuidar y proteger los bofedales</strong>: son filtros biológicos que retienen metales y neutralizan la acidez naturalmente.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-green-100 text-[#166534] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                ✓
              </span>
              <span>
                <strong>Emitir una alerta a la JASS o Junta de Usuarios</strong> usando la plantilla de oficio adjunta abajo.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Official Communication Generator (Oficio para la JASS / Autoridades) */}
      <div className="bg-white p-6 rounded-3xl border border-[#cbd5e1] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#cbd5e1] pb-3">
          <div>
            <span className="text-xs font-black uppercase text-[#1e3a8a] tracking-wider block">
              Herramienta de Incidencia Social
            </span>
            <h3 className="text-lg font-black text-[#0f172a] flex items-center gap-2">
              <FileText size={20} className="text-[#1e3a8a]" /> Modelo de Oficio de Alerta para la JASS o Municipio
            </h3>
          </div>
          <button
            onClick={copyOficio}
            className="touch-target px-4 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-black flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {copiedLetter ? <Check size={16} /> : <Copy size={16} />}
            {copiedLetter ? '¡Copiado al Portapapeles!' : 'Copiar Oficio Oficial'}
          </button>
        </div>

        <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#cbd5e1] text-xs font-mono text-[#0f172a] leading-relaxed whitespace-pre-wrap select-all max-h-56 overflow-y-auto">
{`OFICIO N° 012-2026/ALERTA-GLACIAGUA
A: Junta Administradora de Servicios de Saneamiento (JASS) / EPS Chavín / Junta de Regantes
DE: Monitoreo Comunitario GlaciAgua - Cordillera Blanca
ASUNTO: Alerta Temprana por Probable Drenaje Ácido de Roca y Presencia de Metales Pesados en Cabecera

Mediante la presente se hace de su conocimiento que la herramienta de alerta temprana GlaciAgua ha clasificado el sector en nivel de RIESGO ${selectedRisk.toUpperCase()}.

PARÁMETROS OBSERVADOS:
- Retroceso glaciar con roca reactiva con sulfuros expuesta a la atmósfera.
- Posible superación de Estándares de Calidad Ambiental (ECA Agua) en pH ácido y metales disueltos (Fe, Al, Mn).

RECOMENDACIONES INMEDIATAS:
1. Inspeccionar bocatomas de captación y canales principales.
2. NO recomendar únicamente hervir el agua (el calor evapora el líquido y concentra los metales pesados).
3. Evaluar el uso de fuentes alternas de manantial para consumo humano y abrevadero de ganado.
4. Notificar a la Dirección Regional de Salud (DIRESA Áncash) y a la Autoridad Nacional del Agua (ANA).`}
        </div>
      </div>

      {/* Aviso Permanente de No Potabilidad (Regla N° 4) */}
      <div className="p-4 rounded-2xl bg-[#f1f5f9] border border-[#cbd5e1] text-xs text-[#334155] flex items-center gap-2.5">
        <Info size={20} className="text-[#1e3a8a] shrink-0" />
        <span className="font-semibold leading-relaxed">
          {DISCLAIMER_NOTE_ES}
        </span>
      </div>
    </div>
  )
}
