import React, { useRef, useState, useEffect } from 'react'
import {
  ArrowRight,
  ArrowUp,
  Droplet,
  MapPin,
  ShieldCheck,
  Waves,
} from 'lucide-react'
import { LanguageSelector } from './LanguageSelector'
import { useI18n } from '../i18n/I18nContext'

interface WelcomeScreenProps {
  onExplore: () => void
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onExplore,
}) => {
  const { lang } = useI18n()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const isQuechua = lang === 'qu'

  useEffect(() => {
    const container = scrollContainerRef.current

    if (!container) return

    const handleScroll = () => {
      setShowBackToTop(container.scrollTop > 300)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleBackToTop = () => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleGoToProject = () => {
    const container = scrollContainerRef.current
    const section = document.getElementById('como-funciona')

    if (!container || !section) return

    container.scrollTo({
      top: section.offsetTop - container.offsetTop,
      behavior: 'smooth',
    })
  }

  return (
    <div
      ref={scrollContainerRef}
      className="h-screen w-full overflow-x-hidden overflow-y-auto bg-[#f5f8f7] text-[#172726]"
    >
      <main className="min-h-full w-full">
        {/* Header sticky */}
        <header className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-[#dfe7e5]/80 bg-[#f5f8f7]/95 px-4 py-3 backdrop-blur-md sm:px-8 lg:px-12">
          {/* Brand */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#3346a8] text-white shadow-lg">
              <Droplet size={25} />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                GlaciAgua
              </h1>

              <p className="text-xs font-medium text-slate-500">
                {isQuechua
                  ? 'Mayupa yakun imano kaykashqanta musyanapaq'
                  : 'Monitoreo ambiental'}
              </p>
            </div>
          </div>

          {/* Selector de idioma + estado del piloto */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <LanguageSelector />

            <div className="hidden items-center gap-2 rounded-full border border-[#dfe7e5] bg-white px-4 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-semibold text-slate-600">
                Piloto · Áncash, Perú
              </span>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative mx-auto grid max-w-[1440px] items-center gap-10 px-5 pb-16 pt-8 sm:gap-12 sm:px-10 sm:pt-12 lg:grid-cols-2 lg:px-16 lg:pb-20">
          {/* Text */}
          <div className="relative z-10 max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cfe5df] bg-[#e8f4f0] px-4 py-2">
              <Waves size={15} className="text-[#277d6b]" />

              <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#277d6b]">
                Agua · Glaciares · Comunidades
              </span>
            </div>

            <h2
              className={`font-black leading-[1.1] tracking-tight ${
                isQuechua
                  ? 'text-3xl sm:text-4xl lg:text-5xl'
                  : 'text-4xl sm:text-5xl lg:text-6xl'
              }`}
            >
              {isQuechua
                ? '¡Allillanchu! GlaciAgua-man shamushqa kanki'
                : 'El agua que nace del glaciar'}

              <span className="mt-2 block text-[#3346a8]">
                merece ser comprendida.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              {isQuechua
                ? 'Explora las microcuencas de los Andes peruanos y conoce dónde se estima un mayor riesgo de drenaje ácido, qué factores ambientales influyen y qué información respalda cada estimación.'
                : 'Explora las microcuencas de los Andes peruanos y conoce dónde se estima un mayor riesgo de drenaje ácido, qué factores ambientales influyen y qué información respalda cada estimación.'}
            </p>

            {/* Actions */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onExplore}
                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-[#3346a8] px-7 py-4 text-sm font-bold text-white shadow-lg shadow-[#3346a8]/20 transition-all hover:-translate-y-0.5 hover:bg-[#25368f]"
              >
                Explorar mapa de riesgo

                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={handleGoToProject}
                className="inline-flex items-center justify-center rounded-2xl border border-[#dfe7e5] bg-white px-7 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Conoce el proyecto
              </button>
            </div>

            <div className="mt-8 flex items-center gap-3 text-sm text-slate-500">
              <ShieldCheck size={18} className="shrink-0 text-[#277d6b]" />

              <span>
                Información ambiental para una mejor toma de decisiones
              </span>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="absolute -inset-5 rounded-[3rem] bg-[#dcebe7] blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85"
                alt="Montañas andinas cubiertas de nieve"
                className="h-[360px] w-full object-cover sm:h-[480px] lg:h-[560px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#102f3a]/90 via-[#102f3a]/15 to-transparent" />

              <div className="absolute left-5 top-5 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                Cordillera de los Andes
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <div className="mb-3 flex items-center gap-2 text-[#a9e2d3]">
                  <MapPin size={17} />

                  <span className="text-xs font-bold uppercase tracking-widest">
                    Áncash · Perú
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white sm:text-3xl">
                  Comprender el agua desde su origen.
                </h3>

                <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
                  Una mirada a las microcuencas que conectan los glaciares,
                  los ecosistemas y las comunidades.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="como-funciona"
          className="border-t border-[#e1e9e6] bg-white px-5 py-16 sm:px-10 lg:px-16"
        >
          <div className="mx-auto max-w-[1200px]">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3346a8]">
                ¿Cómo funciona?
              </p>

              <h3 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Del territorio a la información.
              </h3>

              <p className="mt-4 leading-7 text-slate-500">
                GlaciAgua organiza información ambiental para facilitar
                la exploración y comprensión del riesgo hídrico.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                {
                  number: '01',
                  title: 'Explora',
                  description:
                    'Localiza microcuencas y conoce las zonas de monitoreo.',
                },
                {
                  number: '02',
                  title: 'Comprende',
                  description:
                    'Consulta los factores ambientales y las estimaciones de riesgo.',
                },
                {
                  number: '03',
                  title: 'Actúa',
                  description:
                    'Revisa recomendaciones y reporta posibles problemas con el agua.',
                },
              ].map((item) => (
                <article
                  key={item.number}
                  className="rounded-2xl border border-[#e1e9e6] bg-[#f8faf9] p-6 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="text-sm font-black text-[#3346a8]">
                    {item.number}
                  </span>

                  <h4 className="mt-4 text-xl font-bold">
                    {item.title}
                  </h4>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>

            {/* Volver al inicio */}
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={handleBackToTop}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3346a8] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#3346a8]/20 transition-all hover:-translate-y-0.5 hover:bg-[#25368f] focus:outline-none focus:ring-4 focus:ring-[#3346a8]/30"
              >
                <ArrowUp size={18} />
                Volver al inicio
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-3 bg-[#f5f8f7] px-6 py-6 text-center text-xs text-slate-500 sm:flex-row sm:px-12 lg:px-20">
          <span>
            GlaciAgua · Monitoreo ambiental de los Andes peruanos
          </span>

          <span>
            Las estimaciones de riesgo no sustituyen un análisis de laboratorio.
          </span>
        </footer>
      </main>
    </div>
  )
}