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
} from 'lucide-react'
import { RiskLevel } from '../types'

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

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Title Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#dfe7e5] shadow-xs">
        <span className="text-[10px] font-black uppercase text-[#3346a8] bg-[#edf0ff] px-2.5 py-0.5 rounded-full inline-block mb-1">
          Guía de Prevención Comunitaria
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#172726]">
          Qué Hacer y Qué Evitar frente al Agua Ácida
        </h1>
        <p className="text-sm text-[#667573] mt-1 max-w-2xl">
          Instrucciones claras para proteger a las familias, cultivos y ganado en zonas afectadas
          por el deshielo de glaciares en la Cordillera Blanca.
        </p>

        {/* Risk Level Selector */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          <span className="text-xs font-bold text-[#667573] mr-1">Seleccionar Nivel:</span>
          {(['Alto', 'Medio', 'Bajo'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setSelectedRisk(level)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                selectedRisk === level
                  ? level === 'Alto'
                    ? 'bg-[#bd3f3a] text-white shadow-sm'
                    : level === 'Medio'
                    ? 'bg-[#a86408] text-white shadow-sm'
                    : 'bg-[#21835b] text-white shadow-sm'
                  : 'bg-[#f4f7f6] text-[#667573] hover:bg-gray-200'
              }`}
            >
              <AlertTriangle size={14} />
              Riesgo {level}
            </button>
          ))}
        </div>
      </div>

      {/* Critical Medical/Environmental Alert Banner */}
      <div className="bg-amber-50 border-2 border-amber-300 p-4 sm:p-5 rounded-3xl flex items-start gap-3.5 shadow-xs">
        <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
          <ShieldAlert size={22} />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-black text-amber-900">
            ¡ADVERTENCIA CRÍTICA SOBRE EL AGUA CON METALES PESADOS!
          </h3>
          <p className="text-xs text-amber-950 leading-relaxed font-medium">
            <strong>Hervir el agua NO elimina los metales pesados</strong> (hierro, aluminio, plomo o manganeso). Al hervir, el agua se evapora en forma de vapor y los metales disueltos quedan <em>más concentrados</em>. Si el agua proviene de quebradas con drenaje ácido, se debe priorizar una fuente alterna de manantial protegido.
          </p>
        </div>
      </div>

      {/* Grid: Qué Evitar vs Qué Hacer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Qué Evitar (Red) */}
        <div className="bg-white p-6 rounded-3xl border border-red-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#bd3f3a] border-b border-red-100 pb-3">
            <XCircle size={22} />
            <h3 className="text-lg font-black text-[#172726]">Qué Evitar</h3>
          </div>

          <ul className="space-y-3.5 text-xs text-[#172726]">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-red-100 text-[#bd3f3a] flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                ✕
              </span>
              <span>
                <strong>No bebas de quebradas con agua anaranjada, lechosa o turbia.</strong> La coloración rojiza evidencia óxidos de hierro precipitados por drenaje ácido.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-red-100 text-[#bd3f3a] flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                ✕
              </span>
              <span>
                <strong>No confíes en filtros caseros de tela o hervor simple</strong> para consumo familiar de agua con sospecha de metales.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-red-100 text-[#bd3f3a] flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                ✕
              </span>
              <span>
                <strong>No uses agua fuertemente ácida para hortalizas tiernas</strong> ni forraje delicado, ya que el aluminio y la acidez queman las raíces y degradan el suelo.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-red-100 text-[#bd3f3a] flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                ✕
              </span>
              <span>
                <strong>No dejes que el ganado beba directamente de charcas morenaicas</strong> recién expuestas donde se concentran sales de sulfatos.
              </span>
            </li>
          </ul>
        </div>

        {/* Qué Hacer (Green) */}
        <div className="bg-white p-6 rounded-3xl border border-green-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#21835b] border-b border-green-100 pb-3">
            <CheckCircle2 size={22} />
            <h3 className="text-lg font-black text-[#172726]">Qué Hacer</h3>
          </div>

          <ul className="space-y-3.5 text-xs text-[#172726]">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-green-100 text-[#21835b] flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                ✓
              </span>
              <span>
                <strong>Captar agua de manantiales laterales (puquios)</strong> o quebradas altas protegidas con cobertura vegetal y bofedales depuradores.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-green-100 text-[#21835b] flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                ✓
              </span>
              <span>
                <strong>Reportar en GlaciAgua cualquier cambio de color o sabor</strong> para alertar a los comités de agua y al municipio provincial.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-green-100 text-[#21835b] flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                ✓
              </span>
              <span>
                <strong>Cuidar y proteger los bofedales</strong>: son filtros biológicos que retienen hasta el 65% del hierro y neutralizan la acidez naturalmente.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-green-100 text-[#21835b] flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
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
      <div className="bg-white p-6 rounded-3xl border border-[#dfe7e5] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dfe7e5] pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-[#3346a8] tracking-wider block">
              Herramienta de Incidencia Social
            </span>
            <h3 className="text-lg font-black text-[#172726] flex items-center gap-2">
              <FileText size={18} className="text-[#3346a8]" /> Modelo de Oficio de Alerta para la JASS o Municipio
            </h3>
          </div>
          <button
            onClick={copyOficio}
            className="px-4 py-2 rounded-xl bg-[#3346a8] hover:bg-[#25368f] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {copiedLetter ? <Check size={15} /> : <Copy size={15} />}
            {copiedLetter ? '¡Copiado al Portapapeles!' : 'Copiar Oficio Oficial'}
          </button>
        </div>

        <div className="bg-[#f8faf9] p-4 rounded-2xl border border-[#dfe7e5] text-xs font-mono text-[#172726] leading-relaxed whitespace-pre-wrap select-all max-h-56 overflow-y-auto">
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
    </div>
  )
}
