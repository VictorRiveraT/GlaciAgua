import React from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useAudioGuide } from '../utils/useAudioGuide'
import { useI18n } from '../i18n/I18nContext'

interface AudioPlayButtonProps {
  audioKey: string
  textToSpeak?: string
  className?: string
  compact?: boolean
}

export const AudioPlayButton: React.FC<AudioPlayButtonProps> = ({
  audioKey,
  textToSpeak,
  className = '',
  compact = false,
}) => {
  const { isPlaying, isAvailable, togglePlay } = useAudioGuide({ audioKey, textToSpeak })
  const { t } = useI18n()

  if (!isAvailable) return null

  return (
    <button
      type="button"
      onClick={togglePlay}
      className={`touch-target inline-flex shrink-0 max-w-full whitespace-nowrap items-center justify-center gap-2 px-3 py-2 sm:px-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-sm ${
        isPlaying
          ? 'bg-[#991b1b] text-white animate-pulse ring-2 ring-red-300'
          : 'bg-[#1e3a8a] hover:bg-[#172554] text-white'
      } ${className}`}
      aria-label={isPlaying ? t('stop_audio') : t('listen')}
      title={isPlaying ? t('stop_audio') : t('listen')}
    >
      {isPlaying ? (
        <>
          <VolumeX size={18} className="shrink-0 sm:w-5 sm:h-5" />
          {!compact && <span>{t('stop_audio')}</span>}
        </>
      ) : (
        <>
          <Volume2 size={18} className="shrink-0 sm:w-5 sm:h-5" />
          {!compact && <span>{t('listen')}</span>}
        </>
      )}
    </button>
  )
}