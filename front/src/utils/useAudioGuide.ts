import { useState, useEffect, useRef } from 'react'
import { useI18n } from '../i18n/I18nContext'

interface UseAudioGuideProps {
  audioKey: string
  textToSpeak?: string
}

export function useAudioGuide({ audioKey, textToSpeak }: UseAudioGuideProps) {
  const { lang, isQuechua } = useI18n()
  const [isPlaying, setIsPlaying] = useState(false)
  // En quechua, NUNCA asumir disponible hasta confirmar que el archivo .mp3 existe
  const [isAvailable, setIsAvailable] = useState<boolean>(!isQuechua)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Normalizar nombres de archivo (guiones a guiones bajos para consistencia en disco)
  const normalizedKey = audioKey.replace(/-/g, '_')

  useEffect(() => {
    let active = true
    const audioPath = `/audio/${lang}/${normalizedKey}.mp3`

    if (isQuechua) {
      // REGLA CRÍTICA: En Quechua, NINGÚN motor TTS pronuncia bien el quechua ancashino.
      // Si no existe el archivo .mp3 pregrabado en /audio/qu/, el botón se oculta por completo.
      setIsAvailable(false)

      const testAudio = new Audio(audioPath)
      const handleCanPlay = () => {
        if (active) setIsAvailable(true)
      }
      const handleError = () => {
        if (active) setIsAvailable(false)
      }

      testAudio.addEventListener('canplaythrough', handleCanPlay, { once: true })
      testAudio.addEventListener('error', handleError, { once: true })
      testAudio.load()

      return () => {
        active = false
        testAudio.removeEventListener('canplaythrough', handleCanPlay)
        testAudio.removeEventListener('error', handleError)
        testAudio.src = ''
      }
    } else {
      // En español: comprobamos si existe el .mp3 pregrabado; si no, recurrimos a Web Speech API
      const hasSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window
      setIsAvailable(true)

      const testAudio = new Audio(audioPath)
      const handleCanPlay = () => {
        if (active) setIsAvailable(true)
      }
      const handleError = () => {
        if (active) {
          setIsAvailable(hasSpeech && Boolean(textToSpeak))
        }
      }

      testAudio.addEventListener('canplaythrough', handleCanPlay, { once: true })
      testAudio.addEventListener('error', handleError, { once: true })
      testAudio.load()

      return () => {
        active = false
        testAudio.removeEventListener('canplaythrough', handleCanPlay)
        testAudio.removeEventListener('error', handleError)
        testAudio.src = ''
      }
    }
  }, [lang, normalizedKey, isQuechua, textToSpeak])

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
  }

  const fallbackToSpeechSynthesis = () => {
    // Si estamos en quechua, JAMÁS usar síntesis de voz en español ni inglés
    if (isQuechua) {
      setIsPlaying(false)
      setIsAvailable(false)
      return
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && textToSpeak) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(textToSpeak)
      utterance.lang = 'es-PE'
      utterance.rate = 0.95 // Ritmo pausado y claro para comunidades
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      setIsPlaying(true)
      window.speechSynthesis.speak(utterance)
    } else {
      setIsPlaying(false)
    }
  }

  const togglePlay = () => {
    if (isPlaying) {
      stop()
      return
    }

    const audioPath = `/audio/${lang}/${normalizedKey}.mp3`
    const audio = new Audio(audioPath)
    audioRef.current = audio

    audio.onended = () => {
      setIsPlaying(false)
    }

    if (isQuechua) {
      // En quechua: reproducción estricta de archivo físico
      audio.onerror = () => {
        setIsPlaying(false)
        setIsAvailable(false)
      }

      audio.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        setIsPlaying(false)
        setIsAvailable(false)
      })
      return
    }

    // En español: primero intenta reproducir el .mp3, si falla usa síntesis de voz
    audio.onerror = () => {
      fallbackToSpeechSynthesis()
    }

    audio.play().then(() => {
      setIsPlaying(true)
    }).catch(() => {
      fallbackToSpeechSynthesis()
    })
  }

  useEffect(() => {
    return () => {
      stop()
    }
  }, [])

  return {
    isPlaying,
    isAvailable,
    togglePlay,
    stop,
  }
}
