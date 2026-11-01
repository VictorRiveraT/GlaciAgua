import { useState, useEffect, useRef } from 'react'
import { useI18n } from '../i18n/I18nContext'

interface UseAudioGuideProps {
  audioKey: string
  textToSpeak?: string
}

export function useAudioGuide({ audioKey, textToSpeak }: UseAudioGuideProps) {
  const { lang, isQuechua } = useI18n()
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAvailable, setIsAvailable] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Comprobar si el archivo de audio pregrabado existe para Quechua o Español
  useEffect(() => {
    let active = true
    const audioPath = `/audio/${lang}/${audioKey}.mp3`
    const testAudio = new Audio(audioPath)

    const handleCanPlay = () => {
      if (active) setIsAvailable(true)
    }

    const handleError = () => {
      if (active) {
        if (isQuechua) {
          // En quechua, si no hay audio pregrabado, ocultar el botón (regla B)
          setIsAvailable(false)
        } else {
          // En español, está disponible mediante Web Speech API
          setIsAvailable(typeof window !== 'undefined' && 'speechSynthesis' in window)
        }
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
  }, [lang, audioKey, isQuechua])

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

  const togglePlay = () => {
    if (isPlaying) {
      stop()
      return
    }

    const audioPath = `/audio/${lang}/${audioKey}.mp3`
    const audio = new Audio(audioPath)
    audioRef.current = audio

    audio.onended = () => {
      setIsPlaying(false)
    }

    audio.onerror = () => {
      // Si falla la reproducción del mp3:
      if (!isQuechua && typeof window !== 'undefined' && 'speechSynthesis' in window && textToSpeak) {
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

    audio.play().then(() => {
      setIsPlaying(true)
    }).catch(() => {
      // Fallback a SpeechSynthesis en español
      if (!isQuechua && typeof window !== 'undefined' && 'speechSynthesis' in window && textToSpeak) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        utterance.lang = 'es-PE'
        utterance.rate = 0.95
        utterance.onend = () => setIsPlaying(false)
        utterance.onerror = () => setIsPlaying(false)
        setIsPlaying(true)
        window.speechSynthesis.speak(utterance)
      }
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
