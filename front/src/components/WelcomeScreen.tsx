import React, { useRef } from 'react'
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

  const isQuechua = lang === 'qu'

  const copy = isQuechua
    ? {
        headerSubtitle: 'Mayupa yakun imano kaykashqanta musyanapaq',
        pilot: 'Piloto · Áncash, Perú',
        category: 'Yaku · Rit’i · Llaqtakuna',
        title: '¡Allillanchu! GlaciAgua-man shamushqa kanki',
        titleAccent: 'Yaku paqarisqanta riqsiyqa allinmi.',
        description:
          'Perú Andes nisqapi uchuy mayu qallariyninkunata qaway. Maypitaq aswan hatun ácido drenaje nisqa sasachakuy kanman, imaynan pachamama tikraykuna chayta ruwanku, chaymanta imakunawanmi sapa yupaykuna yanapakun.',
        explore: 'Sasachakuykunata qawana mapata qaway',
        project: 'Kay llamkaymanta yachay',
        environmentalInfo:
          'Pachamama willakuykuna allin akllanakunapaq',
        imageAlt: 'Andes suyupi rit’iyuq urqukuna',
        mountainRange: 'Andes urqukuna',
        location: 'Áncash · Perú',
        imageTitle: 'Yaku paqarisqanmanta yachay.',
        imageDescription:
          'Uchuy mayu qallariyninkuna rit’ikunata, kawsay pachakunata, llaqtakunatapas tinkuchinku.',
        howItWorks: '¿Imaynatam llamkan?',
        howTitle: 'Allpa pachamanta willakuykama.',
        howDescription:
          'GlaciAgua pachamama willakuykunata huñun, yaku sasachakuykunamanta qawayta, hamut’ayta yanapanapaq.',
        exploreTitle: 'Allpata qaway',
        exploreDescription:
          'Andes suyupi uchuy mayu qallariyninkunata taripay, chaypim yaku purin. Qawaykunapaq akllasqa sitiokunata riqsiy, chaymanta imaynan urqukuna, rit’ikuna, mayukuna llaqtakunawan tinkisqa kashanku chayta qaway.',
        exploreExtra:
          'Kay willakuykuna yanapakun allpa pachata aswan allinta riqsiyta, maypim yaku paqarin chaymanta maymanmi purin chayta hamut’ayta.',
        understandTitle: 'Sasachakuykunata hamut’ay',
        understandDescription:
          'Yaku allin kayninta tikrayta atichiq pachamama kaqninkunata qaway. GlaciAgua nisqapi huñusqa willakuykuna yanapakun maypim yaku sasachakuy kanman chayta qawariy.',
        understandExtra:
          'Sapa yupayqa pachamama willakuykunawan yanapasqa kashan. Chayrayku, qawaykunata hamut’aspa, imakunam yaku allin kayninta tikranman chayta riqsiyta atinki.',
        actTitle: 'Willaywan ruray',
        actDescription:
          'Yaku sasachakuykunamanta yuyaykunata, allin ruraykunapaq kamachiykunata qaway. Kay willakuykuna yanapakun llaqtakunapi yaku allin kayninta waqaychayta.',
        actExtra:
          'Sasachakuykunata tarispayki willay, chaywanmi aswan allin akllanakunata rurayta, yaku waqaychayta yanapanki.',
        backToTop: 'Qallariyman kutiy',
        footer:
          'GlaciAgua · Perú Andes suyupi pachamama qaway',
        disclaimer:
          'Sasachakuy yupaykuna laboratorio nisqapi yachayta mana reemplazanku.',
      }
    : {
        headerSubtitle: 'Monitoreo ambiental',
        pilot: 'Piloto · Áncash, Perú',
        category: 'Agua · Glaciares · Comunidades',
        title: 'El agua que nace del glaciar',
        titleAccent: 'merece ser comprendida.',
        description:
          'Explora las microcuencas de los Andes peruanos y conoce dónde se estima un mayor riesgo de drenaje ácido, qué factores ambientales influyen y qué información respalda cada estimación.',
        explore: 'Explorar mapa de riesgo',
        project: 'Conoce el proyecto',
        environmentalInfo:
          'Información ambiental para una mejor toma de decisiones',
        imageAlt: 'Montañas andinas cubiertas de nieve',
        mountainRange: 'Cordillera de los Andes',
        location: 'Áncash · Perú',
        imageTitle: 'Comprender el agua desde su origen.',
        imageDescription:
          'Una mirada a las microcuencas que conectan los glaciares, los ecosistemas y las comunidades.',
        howItWorks: '¿Cómo funciona?',
        howTitle: 'Del territorio a la información.',
        howDescription:
          'GlaciAgua organiza información ambiental para facilitar la exploración y comprensión del riesgo hídrico.',
        exploreTitle: 'Explora el territorio',
        exploreDescription:
          'Localiza microcuencas de los Andes peruanos y descubre las zonas donde se realiza el monitoreo ambiental. Cada microcuenca conecta las montañas, los cursos de agua y los ecosistemas que dependen de ellos.',
        exploreExtra:
          'A través de una mirada territorial, GlaciAgua permite reconocer dónde nace el agua y cómo se relaciona con el entorno. Esta información ayuda a comprender mejor el paisaje y los lugares que requieren atención.',
        understandTitle: 'Comprende el riesgo',
        understandDescription:
          'Conoce los factores ambientales que influyen en las estimaciones de riesgo hídrico. La información reunida por GlaciAgua permite explorar las condiciones que podrían afectar la calidad del agua y reconocer zonas que merecen mayor atención.',
        understandExtra:
          'Cada estimación se apoya en información ambiental que puede ser consultada y analizada. Así, es posible comprender qué factores intervienen y por qué una zona puede presentar un nivel de riesgo diferente a otra.',
        actTitle: 'Actúa con información',
        actDescription:
          'Consulta recomendaciones y reporta posibles problemas relacionados con el agua. La información ambiental puede ayudar a orientar la atención hacia las zonas donde se identifican condiciones que requieren seguimiento.',
        actExtra:
          'El conocimiento del territorio permite tomar decisiones mejor fundamentadas y promover el cuidado del agua. GlaciAgua busca acercar esta información a las comunidades y facilitar una comprensión compartida de los desafíos ambientales.',
        backToTop: 'Volver al inicio',
        footer:
          'GlaciAgua · Monitoreo ambiental de los Andes peruanos',
        disclaimer:
          'Las estimaciones de riesgo no sustituyen un análisis de laboratorio.',
      }

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

  const projectSections = [
    {
      title: copy.exploreTitle,
      description: copy.exploreDescription,
      extra: copy.exploreExtra,
      image:
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
      alt: isQuechua
        ? 'Andes suyupi urqukuna'
        : 'Paisaje de montañas de los Andes peruanos',
    },
    {
      title: copy.understandTitle,
      description: copy.understandDescription,
      extra: copy.understandExtra,
      image:
        'https://images.unsplash.com/photo-1530053969600-caed2596d242?auto=format&fit=crop&w=1200&q=85',
      alt: isQuechua
        ? 'Mayu yakukuna urqukunapi'
        : 'Curso de agua entre montañas',
    },
    {
      title: copy.actTitle,
      description: copy.actDescription,
      extra: copy.actExtra,
      image:
        'https://images.unsplash.com/photo-1763160869927-c9719b5d45b8?auto=format&fit=crop&w=1200&q=85',
      alt: isQuechua
        ? 'Allpa pachapi kawsay'
        : 'Paisaje natural y ecosistema',
    },
  ]

  return (
    <div
      ref={scrollContainerRef}
      className="h-dvh min-h-dvh w-full overflow-x-hidden overflow-y-auto bg-[#f5f8f7] text-[#172726]"
    >
      <main className="min-h-full w-full">
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between gap-2 border-b border-[#dfe7e5]/80 bg-[#f5f8f7]/95 px-3 py-2.5 backdrop-blur-md sm:gap-3 sm:px-8 sm:py-3 lg:px-12">
          {/* Brand */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#3346a8] text-white shadow-lg sm:h-11 sm:w-11 sm:rounded-2xl">
              <Droplet size={22} className="sm:hidden" />
              <Droplet size={25} className="hidden sm:block" />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-black tracking-tight sm:text-2xl">
                GlaciAgua
              </h1>

              <p className="max-w-[150px] truncate text-[10px] font-medium text-slate-500 sm:max-w-none sm:text-xs">
                {copy.headerSubtitle}
              </p>
            </div>
          </div>

          {/* Selector de idioma + estado del piloto */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <LanguageSelector />

            <div className="hidden items-center gap-2 rounded-full border border-[#dfe7e5] bg-white px-4 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-semibold text-slate-600">
                {copy.pilot}
              </span>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative mx-auto grid max-w-[1440px] items-center gap-8 px-4 pb-10 pt-6 sm:gap-12 sm:px-10 sm:pb-16 sm:pt-12 lg:grid-cols-2 lg:px-16 lg:pb-20">
          {/* Text */}
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-[#cfe5df] bg-[#e8f4f0] px-3 py-2 sm:mb-6 sm:px-4">
              <Waves size={15} className="shrink-0 text-[#277d6b]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#277d6b] sm:text-xs sm:tracking-[0.12em]">
                {copy.category}
              </span>
            </div>

            <h2
              className={`break-words font-black leading-[1.08] tracking-tight ${
                isQuechua
                  ? 'text-3xl sm:text-4xl lg:text-5xl'
                  : 'text-3xl sm:text-5xl lg:text-6xl'
              }`}
            >
              {copy.title}

              <span className="mt-1.5 block text-[#3346a8] sm:mt-2">
                {copy.titleAccent}
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
              {copy.description}
            </p>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:mt-9 sm:flex-row">
              <button
                type="button"
                onClick={onExplore}
                className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[#3346a8] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#3346a8]/20 transition-all hover:-translate-y-0.5 hover:bg-[#25368f] sm:w-auto sm:px-7 sm:py-4"
              >
                <span>{copy.explore}</span>

                <ArrowRight
                  size={18}
                  className="shrink-0 transition-transform group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={handleGoToProject}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-[#dfe7e5] bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 sm:w-auto sm:px-7 sm:py-4"
              >
                {copy.project}
              </button>
            </div>

            <div className="mt-6 flex items-start gap-3 text-xs leading-5 text-slate-500 sm:mt-8 sm:text-sm sm:leading-normal">
              <ShieldCheck
                size={18}
                className="mt-0.5 shrink-0 text-[#277d6b]"
              />

              <span>{copy.environmentalInfo}</span>
            </div>
          </div>

          {/* Visual */}
          <div className="relative mx-1 sm:mx-0">
            <div className="absolute -inset-3 rounded-[2rem] bg-[#dcebe7] blur-2xl sm:-inset-5 sm:rounded-[3rem]" />

            <div className="relative overflow-hidden rounded-[1.5rem] border border-white shadow-2xl sm:rounded-[2rem]">
              <img
                src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85"
                alt={copy.imageAlt}
                className="h-64 w-full object-cover sm:h-[480px] lg:h-[560px]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#102f3a]/90 via-[#102f3a]/15 to-transparent" />

              <div className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-full border border-white/30 bg-white/15 px-3 py-2 text-[10px] font-semibold text-white backdrop-blur-md sm:left-5 sm:top-5 sm:px-4 sm:text-xs">
                {copy.mountainRange}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
                <div className="mb-2 flex items-center gap-2 text-[#a9e2d3] sm:mb-3">
                  <MapPin size={17} className="shrink-0" />

                  <span className="text-[10px] font-bold uppercase tracking-widest sm:text-xs">
                    {copy.location}
                  </span>
                </div>

                <h3 className="text-xl font-bold leading-tight text-white sm:text-3xl">
                  {copy.imageTitle}
                </h3>

                <p className="mt-2 max-w-md text-xs leading-5 text-white/80 sm:mt-3 sm:text-sm sm:leading-6">
                  {copy.imageDescription}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Project information */}
        <section
          id="como-funciona"
          className="border-t border-[#e1e9e6] bg-white px-4 py-12 sm:px-10 sm:py-20 lg:px-16 lg:py-24"
        >
          <div className="mx-auto max-w-[1200px]">
            {/* Section introduction */}
            <div className="mb-10 max-w-3xl sm:mb-20">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#3346a8] sm:text-xs">
                {copy.howItWorks}
              </p>

              <h3 className="mt-3 text-2xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {copy.howTitle}
              </h3>

              <p className="mt-4 text-sm leading-6 text-slate-500 sm:mt-5 sm:text-lg sm:leading-8">
                {copy.howDescription}
              </p>
            </div>

            {/* Project sections */}
            <div className="space-y-12 sm:space-y-24">
              {projectSections.map((item, index) => {
                const imageOnLeft = index % 2 === 1

                return (
                  <article
                    key={item.title}
                    className="grid items-center gap-6 md:grid-cols-2 md:gap-12 lg:gap-16"
                  >
                    {/* Image */}
                    <div
                      className={`relative ${
                        imageOnLeft ? 'md:order-1' : 'md:order-2'
                      }`}
                    >
                      <div className="absolute -inset-2 rounded-[1.5rem] bg-[#dcebe7] blur-xl sm:-inset-3 sm:rounded-[2rem]" />

                      <div className="relative overflow-hidden rounded-[1.25rem] border border-[#e1e9e6] shadow-lg sm:rounded-[1.75rem]">
                        <img
                          src={item.image}
                          alt={item.alt}
                          loading="lazy"
                          className="h-52 w-full object-cover sm:h-[360px] lg:h-[420px]"
                        />
                      </div>
                    </div>

                    {/* Text */}
                    <div
                      className={`${
                        imageOnLeft ? 'md:order-2' : 'md:order-1'
                      }`}
                    >
                      <div className="mb-4 h-1 w-14 rounded-full bg-[#3346a8] sm:mb-5" />

                      <h4 className="text-xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                        {item.title}
                      </h4>

                      <p className="mt-4 text-sm leading-6 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
                        {item.description}
                      </p>

                      <p className="mt-3 text-sm leading-6 text-slate-500 sm:mt-4 sm:text-lg sm:leading-8">
                        {item.extra}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>

            {/* Back to top */}
            <div className="mt-12 flex justify-center sm:mt-24">
              <button
                type="button"
                onClick={handleBackToTop}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#3346a8] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#3346a8]/20 transition-all hover:-translate-y-0.5 hover:bg-[#25368f] focus:outline-none focus:ring-4 focus:ring-[#3346a8]/30 sm:w-auto"
              >
                <ArrowUp size={18} />
                {copy.backToTop}
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-3 bg-[#f5f8f7] px-4 py-6 text-center text-[10px] leading-5 text-slate-500 sm:flex-row sm:px-12 sm:text-xs lg:px-20">
          <span className="max-w-full">{copy.footer}</span>

          <span className="max-w-full">{copy.disclaimer}</span>
        </footer>
      </main>
    </div>
  )
}