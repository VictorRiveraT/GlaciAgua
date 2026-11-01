import React from 'react'
import { useI18n, Language } from '../i18n/I18nContext'
import { Globe } from 'lucide-react'

export const LanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, setLang } = useI18n()

  return (
    <div
      className={`inline-flex items-center bg-[#f1f5f9] p-1 rounded-2xl border border-[#cbd5e1] select-none ${className}`}
      role="group"
      aria-label="Selector de idioma / Rimaykuna akray"
    >
      <button
        type="button"
        onClick={() => setLang('es')}
        className={`touch-target px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
          lang === 'es'
            ? 'bg-[#1e3a8a] text-white shadow-xs'
            : 'text-[#475569] hover:text-[#0f172a]'
        }`}
        aria-pressed={lang === 'es'}
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => setLang('qu')}
        className={`touch-target px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
          lang === 'qu'
            ? 'bg-[#1e3a8a] text-white shadow-xs'
            : 'text-[#475569] hover:text-[#0f172a]'
        }`}
        aria-pressed={lang === 'qu'}
        title="Quechua Ancashino (Huaylas) - Revisión en curso"
      >
        QU
      </button>
    </div>
  )
}
