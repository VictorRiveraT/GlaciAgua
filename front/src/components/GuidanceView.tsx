import React, { useState } from 'react'
import {
  CheckCircle2,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  Info,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { Illustration } from './Illustration'
import { AudioPlayButton } from './AudioPlayButton'
import { useI18n } from '../i18n/I18nContext'

interface GuidanceViewProps {
  onOpenOficio?: () => void
}

export const GuidanceView: React.FC<GuidanceViewProps> = ({ onOpenOficio }) => {
  const { t } = useI18n()
  const [showDetails, setShowDetails] = useState(false)

  const doItems = [
    {
      id: 'avisar',
      illustration: 'hacer_avisar' as const,
      phrase: t('action_avisar_jass'),
      audioKey: 'guia_hacer_avisar',
      audioText: `${t('action_avisar_jass')}. Avisa de inmediato a tu junta de agua o directivo comunal.`,
      anim: 'pulse' as const,
    },
    {
      id: 'fuente',
      illustration: 'hacer_otra_fuente' as const,
      phrase: t('action_fuente_segura'),
      audioKey: 'guia_hacer_fuente',
      audioText: `${t('action_fuente_segura')}. Lleva agua de un manantial autorizado o de la cisterna.`,
      anim: 'float' as const,
    },
    {
      id: 'guardar',
      illustration: 'hacer_guardar' as const,
      phrase: t('action_guardar_tapa'),
      audioKey: 'guia_hacer_guardar',
      audioText: `${t('action_guardar_tapa')}. Mantén el agua limpia en recipientes tapados y frescos.`,
      anim: 'float' as const,
    },
  ]

  const avoidItems = [
    {
      id: 'beber',
      illustration: 'evitar_beber_quebrada' as const,
      phrase: t('avoid_beber_quebrada'),
      audioKey: 'guia_evitar_beber',
      audioText: `${t('avoid_beber_quebrada')}. El agua con color óxido tiene minerales que dañan la salud.`,
      anim: 'pulse' as const,
    },
    {
      id: 'hervir',
      illustration: 'evitar_hervir' as const,
      phrase: t('avoid_hervir_metales'),
      audioKey: 'guia_evitar_hervir',
      audioText: `${t('avoid_hervir_metales')}. Hervir el agua no elimina los metales de las piedras; los concentra más.`,
      anim: 'pulse' as const,
    },
    {
      id: 'animales',
      illustration: 'evitar_animales_riego' as const,
      phrase: t('avoid_animales_riego'),
      audioKey: 'guia_evitar_animales',
      audioText: `${t('avoid_animales_riego')}. Evita que el ganado tome de charcos anaranjados y no riegues papas con esa agua.`,
      anim: 'pulse' as const,
    },
  ]

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 lg:p-8 space-y-5 text-[#0f172a] select-none pb-24 lg:pb-12">
      {/* Cabecera Principal */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-[#cbd5e1] shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[11px] font-black uppercase text-[#1e3a8a] bg-[#eff6ff] px-3 py-1 rounded-full border border-blue-200 inline-block mb-1">
            {t('guidance_badge')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight">
            {t('guidance_title')}
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] font-medium mt-0.5">
            {t('guidance_subtitle')}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <AudioPlayButton
            audioKey="aviso_hervir"
            textToSpeak={`${t('guidance_title')}. ${t('guidance_do_title')}: ${t('action_avisar_jass')}, ${t('action_fuente_segura')}, ${t('action_guardar_tapa')}. ${t('guidance_avoid_title')}: ${t('avoid_beber_quebrada')}, ${t('avoid_hervir_metales')}, ${t('avoid_animales_riego')}.`}
          />
        </div>
      </div>

      {/* DOS COLUMNAS LADO A LADO: QUÉ HACER (VERDE) | QUÉ EVITAR (ROJO) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 items-start">
        {/* COLUMNA 1: QUÉ HACER */}
        <section
          aria-labelledby="col-hacer-title"
          className="bg-[#f0fdf4] border-2 border-[#16a34a] rounded-3xl p-2.5 sm:p-4 flex flex-col gap-3 shadow-xs"
        >
          {/* Encabezado de columna con color + icono + forma */}
          <div className="flex items-center justify-center gap-2 py-1.5 px-2 bg-white rounded-2xl border border-[#bbf7d0] shadow-2xs">
            <div className="w-6 h-6 rounded-full bg-[#16a34a] text-white flex items-center justify-center font-black text-xs shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <h2
              id="col-hacer-title"
              className="text-xs sm:text-base font-black text-[#14532d] uppercase tracking-wide truncate"
            >
              {t('guidance_do_title')}
            </h2>
          </div>

          {/* Tarjetas verticales de acciones a realizar */}
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {doItems.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-2xl p-2.5 sm:p-3.5 border border-[#bbf7d0] shadow-xs flex flex-col items-center text-center gap-2 transition-transform hover:scale-[1.01]"
              >
                <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
                  <Illustration
                    name={item.illustration}
                    animation={item.anim}
                    className="w-full h-full drop-shadow-xs"
                  />
                </div>

                <p className="text-xs sm:text-sm font-black text-[#14532d] leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">
                  {item.phrase}
                </p>

                <AudioPlayButton
                  audioKey={item.audioKey}
                  textToSpeak={item.audioText}
                  compact
                  className="mt-0.5"
                />
              </article>
            ))}
          </div>
        </section>

        {/* COLUMNA 2: QUÉ EVITAR */}
        <section
          aria-labelledby="col-evitar-title"
          className="bg-[#fef2f2] border-2 border-[#dc2626] rounded-3xl p-2.5 sm:p-4 flex flex-col gap-3 shadow-xs"
        >
          {/* Encabezado de columna con color + icono + forma */}
          <div className="flex items-center justify-center gap-2 py-1.5 px-2 bg-white rounded-2xl border border-[#fecaca] shadow-2xs">
            <div className="w-6 h-6 rounded-lg bg-[#dc2626] text-white flex items-center justify-center font-black text-xs shrink-0">
              <AlertOctagon size={16} />
            </div>
            <h2
              id="col-evitar-title"
              className="text-xs sm:text-base font-black text-[#7f1d1d] uppercase tracking-wide truncate"
            >
              {t('guidance_avoid_title')}
            </h2>
          </div>

          {/* Tarjetas verticales de acciones a evitar */}
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {avoidItems.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-2xl p-2.5 sm:p-3.5 border border-[#fecaca] shadow-xs flex flex-col items-center text-center gap-2 transition-transform hover:scale-[1.01]"
              >
                <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
                  <Illustration
                    name={item.illustration}
                    animation={item.anim}
                    className="w-full h-full drop-shadow-xs"
                  />
                </div>

                <p className="text-xs sm:text-sm font-black text-[#7f1d1d] leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] flex items-center justify-center">
                  {item.phrase}
                </p>

                <AudioPlayButton
                  audioKey={item.audioKey}
                  textToSpeak={item.audioText}
                  compact
                  className="mt-0.5"
                />
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* DESPLEGABLE "VER MÁS DETALLES" (Sin sobrecargar la vista principal) */}
      <div className="bg-white rounded-3xl border border-[#cbd5e1] p-4 sm:p-6 shadow-xs">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="touch-target w-full flex items-center justify-between text-left font-black text-sm sm:text-base text-[#1e3a8a] hover:text-[#172554] transition-colors"
          aria-expanded={showDetails}
        >
          <div className="flex items-center gap-2">
            <Info size={20} className="shrink-0" />
            <span>{showDetails ? t('btn_hide_more_details') : t('btn_see_more_details')}</span>
          </div>
          {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-[#e2e8f0] space-y-4 text-xs sm:text-sm text-[#334155] leading-relaxed animate-in fade-in">
            {/* Por qué hervir no quita metales */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
              <strong className="font-black text-[#92400e] flex items-center gap-1.5 text-sm">
                <AlertTriangle size={18} className="shrink-0" />
                {t('boil_alert_title')}
              </strong>
              <p>{t('boil_alert_desc')}</p>
            </div>

            {/* Detalles para cultivos y animales */}
            <div className="space-y-2">
              <strong className="font-bold text-[#0f172a] block">
                Efectos del agua ácida en el campo:
              </strong>
              <ul className="list-disc pl-5 space-y-1 font-medium text-[#475569]">
                <li>{t('tip_high_2')}</li>
                <li>{t('tip_high_3')}</li>
                <li>{t('tip_high_4')}</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* BOTÓN PARA REDACTAR OFICIO A LA AUTORIDAD (Anticipo Etapa 3) */}
      {onOpenOficio && (
        <div className="bg-[#eff6ff] border border-[#bfdbfe] p-4 rounded-3xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#1e3a8a] text-white flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div className="truncate">
              <strong className="text-xs sm:text-sm font-black text-[#0f172a] block truncate">
                {t('official_letter_btn')}
              </strong>
              <span className="text-[11px] text-[#475569]">
                Carta comunitaria lista para JASS y municipio
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenOficio}
            className="touch-target px-4 py-2.5 rounded-2xl bg-[#1e3a8a] hover:bg-[#172554] text-white font-black text-xs shrink-0 shadow-sm"
          >
            Abrir Oficio
          </button>
        </div>
      )}

      {/* Aviso Permanente de Precaución */}
      <div className="p-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
        <Info size={16} className="text-slate-500 shrink-0" />
        <span>{t('disclaimer')}</span>
      </div>
    </div>
  )
}
