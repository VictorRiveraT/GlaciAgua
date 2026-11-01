import React, { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ShieldAlert,
  Droplet,
  Info,
} from 'lucide-react'
import { RiskLevel } from '../types'
import { AudioPlayButton } from './AudioPlayButton'
import { useI18n } from '../i18n/I18nContext'
import { getRiskTheme } from '../utils/accessibleTheme'

export const GuidanceView: React.FC = () => {
  const { t } = useI18n()
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>('Alto')
  const [copiedLetter, setCopiedLetter] = useState(false)

  const copyOficio = () => {
    const text = `OFICIO N° 012-2026/ALERTA-GLACIAGUA
A: Junta Administradora de Servicios de Saneamiento (JASS) / Junta de Regantes / Municipio
DE: Monitoreo Comunitario GlaciAgua - Cordillera Blanca
ASUNTO: Alerta Temprana por Probable Drenaje Ácido de Roca y Minerales en Cabecera

Mediante la presente se comunica que la herramienta de alerta temprana GlaciAgua ha clasificado el sector en nivel de RIESGO ${selectedRisk.toUpperCase()}.

RECOMENDACIONES DE PRECAUCIÓN:
1. Inspeccionar bocatomas de captación y canales principales.
2. Recordar que hervir el agua NO quita los metales pesados (el calor evapora el líquido y concentra los minerales).
3. Evaluar el uso de fuentes alternas de manantial o puquio para consumo humano y abrevadero de ganado.
4. Notificar al Centro de Salud / DIRESA y a la Autoridad Local del Agua.

Fecha: ${new Date().toLocaleDateString('es-PE')}
Plataforma Comunitaria GlaciAgua. Alerta temprana. No certifica potabilidad.`

    navigator.clipboard?.writeText(text)
    setCopiedLetter(true)
    setTimeout(() => setCopiedLetter(false), 2500)
  }

  const audioGuidanceText = `${t('guidance_title')}. ${t('boil_alert_desc')}`

  const theme = getRiskTheme(selectedRisk)

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-[#0f172a] select-none">
      {/* Title Card */}
      <div className="bg-white p-6 rounded-3xl border border-[#cbd5e1] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <span className="text-xs font-black uppercase text-[#1e3a8a] bg-[#eff6ff] px-3 py-1 rounded-full inline-block">
            {t('guidance_badge')}
          </span>
          <AudioPlayButton audioKey="aviso_hervir" textToSpeak={audioGuidanceText} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a]">
          {t('guidance_title')}
        </h1>
        <p className="text-base text-[#475569] mt-1 max-w-2xl font-medium">
          {t('guidance_subtitle')}
        </p>

        {/* Risk Level Selector */}
        <div className="flex flex-wrap items-center gap-2 mt-5">
          <span className="text-xs font-black text-[#475569] mr-1">{t('select_level')}</span>
          {(['Alto', 'Medio', 'Bajo'] as const).map((level) => {
            const lvlTheme = getRiskTheme(level)
            const isSelected = selectedRisk === level
            return (
              <button
                key={level}
                onClick={() => setSelectedRisk(level)}
                className={`touch-target px-4 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? level === 'Alto'
                      ? 'bg-[#991b1b] text-white shadow-sm'
                      : level === 'Medio'
                      ? 'bg-[#92400e] text-white shadow-sm'
                      : 'bg-[#166534] text-white shadow-sm'
                    : 'bg-[#f1f5f9] text-[#475569] hover:bg-slate-200'
                }`}
              >
                <span>{lvlTheme.iconName === 'octagon' ? '🛑' : lvlTheme.iconName === 'triangle' ? '⚠️' : '✓'}</span>
                <span>{level === 'Alto' ? t('risk_alto') : level === 'Medio' ? t('risk_medio') : t('risk_bajo')}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Critical Boil Alert */}
      <div className="bg-[#fff7ed] border-2 border-[#fdba74] p-5 rounded-3xl flex items-start gap-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-[#fed7aa] text-[#9a3412] flex items-center justify-center shrink-0 mt-0.5">
          <ShieldAlert size={28} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-black text-[#9a3412]">
            {t('boil_alert_title')}
          </h3>
          <p className="text-sm text-[#7c2d12] leading-relaxed font-medium">
            {t('boil_alert_desc')}
          </p>
        </div>
      </div>

      {/* Action Cards for Selected Risk */}
      <div className="bg-white p-6 rounded-3xl border border-[#cbd5e1] shadow-xs space-y-4">
        <h2 className="text-lg font-black text-[#0f172a] flex items-center gap-2">
          <Droplet size={20} className="text-[#1e3a8a]" />
          <span>Consejos para {selectedRisk === 'Alto' ? t('risk_alto') : selectedRisk === 'Medio' ? t('risk_medio') : t('risk_bajo')}:</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {selectedRisk === 'Alto' ? (
            <>
              <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-1">
                <span className="text-xs font-black text-red-900 block">🚰 Consumo Humano</span>
                <p className="text-xs text-red-800 leading-snug">{t('tip_high_1')}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-xs font-black text-amber-900 block">🌾 Riego y Chacra</span>
                <p className="text-xs text-amber-800 leading-snug">{t('tip_high_2')}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-2xl border border-red-200 space-y-1">
                <span className="text-xs font-black text-red-900 block">🐄 Animales y Ganado</span>
                <p className="text-xs text-red-800 leading-snug">{t('tip_high_3')}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
                <span className="text-xs font-black text-blue-900 block">📢 Organización Comunitaria</span>
                <p className="text-xs text-blue-800 leading-snug">{t('tip_high_4')}</p>
              </div>
            </>
          ) : selectedRisk === 'Medio' ? (
            <>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-xs font-black text-amber-900 block">🚰 Consumo Humano</span>
                <p className="text-xs text-amber-800 leading-snug">{t('tip_med_1')}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-xs font-black text-amber-900 block">🌾 Riego y Chacra</span>
                <p className="text-xs text-amber-800 leading-snug">{t('tip_med_2')}</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-xs font-black text-amber-900 block">🐄 Animales y Ganado</span>
                <p className="text-xs text-amber-800 leading-snug">{t('tip_med_3')}</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-green-50 rounded-2xl border border-green-200 space-y-1">
                <span className="text-xs font-black text-green-900 block">🚰 Consumo Humano</span>
                <p className="text-xs text-green-800 leading-snug">{t('tip_low_1')}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl border border-green-200 space-y-1">
                <span className="text-xs font-black text-green-900 block">🌾 Riego y Chacra</span>
                <p className="text-xs text-green-800 leading-snug">{t('tip_low_2')}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl border border-green-200 space-y-1">
                <span className="text-xs font-black text-green-900 block">🐄 Animales y Ganado</span>
                <p className="text-xs text-green-800 leading-snug">{t('tip_low_3')}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Copy Official Letter for Community/Authorities */}
      <div className="bg-white p-6 rounded-3xl border border-[#cbd5e1] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <strong className="text-sm font-black text-[#0f172a] block">
            {t('official_letter_btn')}
          </strong>
          <span className="text-xs text-[#64748b]">
            Plantilla comunitaria con fecha y formato listo para presentar a la JASS o municipio.
          </span>
        </div>
        <button
          onClick={copyOficio}
          className="touch-target w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#1e3a8a] hover:bg-[#172554] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98 shrink-0"
        >
          {copiedLetter ? <Check size={16} /> : <Copy size={16} />}
          <span>{copiedLetter ? t('official_letter_copied') : 'Copiar Oficio'}</span>
        </button>
      </div>

      {/* Permanent Caution Disclaimer */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
        <Info size={16} className="text-slate-500 shrink-0" />
        <span>{t('disclaimer')}</span>
      </div>
    </div>
  )
}
