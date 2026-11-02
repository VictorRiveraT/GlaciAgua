import React from 'react'
import {
  ArrowRight,
  Users,
  FlaskConical,
  Droplet,
  Waves,
} from 'lucide-react'

interface ExperienceSelectionProps {
  onSelectCommunity: () => void
  onSelectTechnical: () => void
  onBack: () => void
}

export const ExperienceSelection: React.FC<ExperienceSelectionProps> = ({
  onSelectCommunity,
  onSelectTechnical,
  onBack,
}) => {
  return (
    <main className="min-h-screen w-full bg-[#f5f8f7] text-[#172726]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-5 py-5 sm:px-8 sm:py-6 lg:px-12 lg:py-5">
        {/* Header */}
        <header className="flex shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3346a8] text-white shadow-md">
            <Droplet size={24} />
          </div>

          <div>
            <h1 className="text-xl font-black leading-tight tracking-tight sm:text-2xl">
              GlaciAgua
            </h1>

            <p className="text-xs font-medium text-slate-500">
              Monitoreo ambiental
            </p>
          </div>
        </header>

        {/* Main content */}
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center">
          {/* Introduction */}
          <section className="mt-8 text-center sm:mt-10 lg:mt-4">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f4f0] text-[#277d6b]">
              <Waves size={22} />
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#277d6b] sm:text-xs">
              Explora GlaciAgua
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              ¿Cómo quieres explorar?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Elige la experiencia que mejor se adapte a tus necesidades.
              Consulta recomendaciones para el uso del agua o explora
              información ambiental más detallada.
            </p>
          </section>

          {/* Experience cards */}
          <section className="mt-6 grid gap-4 md:grid-cols-2 lg:mt-7 lg:gap-5">
            {/* Community experience */}
            <button
              type="button"
              onClick={onSelectCommunity}
              className="group flex h-full flex-col rounded-3xl border border-[#dfe7e5] bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b8d9ce] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#277d6b]/20 sm:p-6 lg:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f4f0] text-[#277d6b]">
                  <Users size={25} />
                </div>

                <span className="rounded-full bg-[#e8f4f0] px-3 py-1.5 text-xs font-bold text-[#277d6b]">
                  Simple y práctica
                </span>
              </div>

              <h3 className="mt-4 text-xl font-black sm:text-2xl">
                Vista comunitaria
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Consulta el estado de las cuencas y descubre recomendaciones
                sencillas para el cuidado y uso responsable del agua.
              </p>

              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#277d6b]" />
                  Mapa y nivel de riesgo
                </li>

                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#277d6b]" />
                  Estado del agua y fecha de medición
                </li>

                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#277d6b]" />
                  Recomendaciones y alertas
                </li>

                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#277d6b]" />
                  Reportes de la comunidad
                </li>
              </ul>

              <div className="mt-5 flex items-center justify-between border-t border-[#e8eeec] pt-4">
                <span className="text-sm font-bold text-[#277d6b]">
                  Ingresar a la vista comunitaria
                </span>

                <ArrowRight
                  size={19}
                  className="shrink-0 text-[#277d6b] transition-transform group-hover:translate-x-1"
                />
              </div>
            </button>

            {/* Technical experience */}
            <button
              type="button"
              onClick={onSelectTechnical}
              className="group flex h-full flex-col rounded-3xl border border-[#dfe7e5] bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c5ccef] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#3346a8]/20 sm:p-6 lg:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef0fc] text-[#3346a8]">
                  <FlaskConical size={25} />
                </div>

                <span className="rounded-full bg-[#eef0fc] px-3 py-1.5 text-xs font-bold text-[#3346a8]">
                  Análisis detallado
                </span>
              </div>

              <h3 className="mt-4 text-xl font-black sm:text-2xl">
                Vista técnica
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Explora diagnósticos ambientales, indicadores científicos y
                herramientas para analizar los factores que influyen en el riesgo.
              </p>

              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#3346a8]" />
                  Indicadores y evolución del riesgo
                </li>

                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#3346a8]" />
                  Diagnóstico de cuencas
                </li>

                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#3346a8]" />
                  Información científica y del modelo
                </li>

                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#3346a8]" />
                  Simulador de escenarios
                </li>
              </ul>

              <div className="mt-5 flex items-center justify-between border-t border-[#e8eeec] pt-4">
                <span className="text-sm font-bold text-[#3346a8]">
                  Ingresar a la vista técnica
                </span>

                <ArrowRight
                  size={19}
                  className="shrink-0 text-[#3346a8] transition-transform group-hover:translate-x-1"
                />
              </div>
            </button>
          </section>

          {/* Back button */}
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3346a8]/20"
            >
              ← Volver a la bienvenida
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <footer className="mt-4 shrink-0 border-t border-[#e1e9e6] pt-3 text-center">
          <p className="text-xs leading-5 text-slate-400">
            Las estimaciones de riesgo son orientativas y no sustituyen
            un análisis de laboratorio.
          </p>
        </footer>
      </div>
    </main>
  )
}
