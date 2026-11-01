import React, { useState } from 'react'

export type IllustrationName =
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

interface AccessibleIllustrationProps {
  name: IllustrationName
  alt: string
  className?: string
  width?: number | string
  height?: number | string
}

export const AccessibleIllustration: React.FC<AccessibleIllustrationProps> = ({
  name,
  alt,
  className = '',
  width = '100%',
  height = '100%',
}) => {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    // Graceful fallback showing a stylized text/icon pill
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 rounded-2xl text-xs font-bold text-slate-700 p-2 border border-slate-200 ${className}`}
        role="img"
        aria-label={alt}
        style={{ width, height }}
      >
        <span>💧 {alt}</span>
      </div>
    )
  }

  return (
    <img
      src={`/illustrations/${name}.svg`}
      alt={alt}
      className={`select-none object-contain ${className}`}
      style={{ width, height }}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  )
}
