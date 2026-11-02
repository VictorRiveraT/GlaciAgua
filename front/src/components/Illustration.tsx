import React, { useState } from 'react'

export type IllustrationName =
  // Nuevas ilustraciones Gemini (WebP)
  | 'hacer_avisar'
  | 'hacer_otra_fuente'
  | 'hacer_guardar'
  | 'evitar_beber_quebrada'
  | 'evitar_hervir'
  | 'evitar_animales_riego'
  | 'oficio_documento'
  | 'guia_ayuda'
  // Ilustraciones vectoriales (SVG)
  | 'gota_tranquila'
  | 'gota_preocupada'
  | 'gota_enferma'
  | 'persona_bebiendo'
  | 'persona_nohervir'
  | 'chacra_papas'
  | 'vaca_oveja'
  | 'trucha'
  | 'quebrada_limpia'
  | 'quebrada_acida'
  | 'glaciar'
  | 'lluvia'
  | 'celular_aviso'
  | 'manos_lavando'

interface IllustrationProps {
  name: IllustrationName
  alt?: string
  className?: string
  width?: number | string
  height?: number | string
  animation?: 'float' | 'pulse' | 'none'
  priority?: boolean
}

// Mapeo de respaldo si un WebP no carga o se encuentra en entorno offline restringido
const WEBP_TO_SVG_FALLBACK: Record<string, IllustrationName> = {
  hacer_avisar: 'celular_aviso',
  hacer_otra_fuente: 'persona_bebiendo',
  hacer_guardar: 'manos_lavando',
  evitar_beber_quebrada: 'quebrada_acida',
  evitar_hervir: 'persona_nohervir',
  evitar_animales_riego: 'vaca_oveja',
  oficio_documento: 'celular_aviso',
  guia_ayuda: 'gota_tranquila',
}

const DEFAULT_ALTS: Record<string, string> = {
  hacer_avisar: 'Persona avisando a la junta de agua por teléfono',
  hacer_otra_fuente: 'Familia recogiendo agua de un caño o fuente autorizada',
  hacer_guardar: 'Mujer tapando un cántaro limpio con agua',
  evitar_beber_quebrada: 'Persona evitando beber agua de una quebrada ácida anaranjada',
  evitar_hervir: 'Olla en fogón con advertencia de no hervir agua con metales',
  evitar_animales_riego: 'Ganado y chacra con advertencia de no usar agua anaranjada',
  oficio_documento: 'Documento formal de solicitud para autoridades',
  guia_ayuda: 'Comunero andino saludando y ofreciendo ayuda',
  gota_tranquila: 'Gota sonriente de menor riesgo',
  gota_preocupada: 'Gota preocupada de precaución',
  gota_enferma: 'Gota enferma de alerta por acidez',
  persona_bebiendo: 'Persona bebiendo agua limpia',
  persona_nohervir: 'Advertencia: no hervir agua ácida',
  chacra_papas: 'Cultivo de papas en la chacra',
  vaca_oveja: 'Vaca y oveja en el pastizal',
  trucha: 'Trucha nadando en río andino',
  quebrada_limpia: 'Quebrada con agua clara',
  quebrada_acida: 'Quebrada con agua rojiza o ácida',
  glaciar: 'Glaciar en la Cordillera Blanca',
  lluvia: 'Nube con lluvia andina',
  celular_aviso: 'Celular enviando aviso comunitario',
  manos_lavando: 'Manos lavándose con agua limpia',
}

export const Illustration: React.FC<IllustrationProps> = ({
  name,
  alt,
  className = '',
  width = '100%',
  height = '100%',
  animation = 'none',
  priority = false,
}) => {
  const [triedFallback, setTriedFallback] = useState(false)
  const [failed, setFailed] = useState(false)

  const resolvedAlt = alt || DEFAULT_ALTS[name] || 'Ilustración informativa'

  // Determinar extensión inicial según el grupo
  const isWebpName = Boolean(WEBP_TO_SVG_FALLBACK[name])
  const initialSrc = isWebpName
    ? `/illustrations/${name}.webp`
    : `/illustrations/${name}.svg`

  const [currentSrc, setCurrentSrc] = useState(initialSrc)

  const handleError = () => {
    if (!triedFallback && isWebpName && WEBP_TO_SVG_FALLBACK[name]) {
      setTriedFallback(true)
      setCurrentSrc(`/illustrations/${WEBP_TO_SVG_FALLBACK[name]}.svg`)
    } else {
      setFailed(true)
    }
  }

  const animationClass =
    animation === 'float'
      ? 'motion-safe:animate-float'
      : animation === 'pulse'
      ? 'motion-safe:animate-gentle-pulse'
      : ''

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 rounded-2xl text-xs font-bold text-slate-700 p-2 border border-slate-200 aspect-square ${className}`}
        role="img"
        aria-label={resolvedAlt}
        style={{ width, height }}
      >
        <span>💧 {resolvedAlt}</span>
      </div>
    )
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden aspect-square ${className}`}
      style={{ width, height }}
    >
      <img
        src={currentSrc}
        alt={resolvedAlt}
        className={`w-full h-full object-contain select-none transition-transform duration-300 ${animationClass}`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onError={handleError}
      />
    </div>
  )
}

// Compatibilidad con componentes que importen AccessibleIllustration
export const AccessibleIllustration = Illustration
