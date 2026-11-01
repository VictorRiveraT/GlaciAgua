import React, { createContext, useContext, useState, useEffect } from 'react'
import esData from './es.json'
import quData from './qu.json'

export type Language = 'es' | 'qu'

interface I18nContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string, fallback?: string) => string
  isQuechua: boolean
}

const STORAGE_KEY_LANG = 'glaciagua_lang_v1'

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const dictionaries: Record<Language, Record<string, any>> = {
  es: esData,
  qu: quData,
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG)
      if (saved === 'es' || saved === 'qu') return saved
    } catch {}
    return 'es'
  })

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    try {
      localStorage.setItem(STORAGE_KEY_LANG, newLang)
    } catch {}
  }

  const t = (key: string, fallback?: string): string => {
    const dict = dictionaries[lang]
    if (dict && dict[key] && typeof dict[key] === 'string') {
      return dict[key]
    }
    // Fallback al español si falta clave o en quechua está vacía
    const esDict = dictionaries['es']
    if (esDict && esDict[key] && typeof esDict[key] === 'string') {
      return esDict[key]
    }
    return fallback || key
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isQuechua: lang === 'qu' }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
