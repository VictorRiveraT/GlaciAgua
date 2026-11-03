import React from 'react'
import {
  ArrowRight,
  Users,
  FlaskConical,
  Droplet,
  Waves,
} from 'lucide-react'
import { LanguageSelector } from './LanguageSelector'
import { useI18n } from '../i18n/I18nContext'

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
  const { t } = useI18n()

  return (
    <div className="h-dvh min-h-dvh w-full overflow-x-hidden overflow-y-auto bg-[#f5f8f7] text-[#172726]">
      <main className="min-h-full w-full">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col px-4 py-3 sm:px-8 sm:py-4 lg:px-7 lg:py-3">
          {/* Header */}
          <header className="flex shrink-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#3346a8] text-white shadow-md">
                <Droplet size={24} />
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-black leading-tight tracking-tight sm:text-2xl">
                  GlaciAgua
                </h1>

                <p className="text-xs font-medium text-slate-500">
                  {t('welcome_monitoring')}
                </p>
              </div>
            </div>

            {/* Language selector */}
            <LanguageSelector />
          </header>

          {/* Main content */}
          <div className="mx-auto flex w-full max-w-5xl flex-col py-5 lg:py-2">
            {/* Introduction */}
            <section className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f4f0] text-[#277d6b]">
                <Waves size={22} />
              </div>

              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#277d6b] sm:text-xs">
                GlaciAgua
              </p>

              <h2 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                {t('exp_question')}
              </h2>

              <p className="mx-auto mt-2 max-w-2xl text-sm leading-5 text-slate-500 sm:leading-6">
                {t('exp_question_desc')}
              </p>
            </section>

            {/* Experience cards */}
            <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:mt-5 lg:gap-5">
              {/* Community experience */}
              <button
                type="button"
                onClick={onSelectCommunity}
                className="group flex h-full min-w-0 flex-col rounded-3xl border border-[#dfe7e5] bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b8d9ce] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#277d6b]/20 sm:p-6 lg:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8f4f0] text-[#277d6b]">
                    <Users size={24} />
                  </div>

                  <span className="rounded-full bg-[#e8f4f0] px-3 py-1.5 text-xs font-bold text-[#277d6b]">
                    {t('exp_comm_badge')}
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-black sm:text-2xl">
                  {t('exp_comm_title')}
                </h3>

                <p className="mt-2 text-sm leading-5 text-slate-500 sm:leading-6">
                  {t('exp_comm_desc')}
                </p>

                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#277d6b]" />
                    <span>{t('exp_comm_feature_map')}</span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#277d6b]" />
                    <span>{t('exp_comm_feature_water')}</span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#277d6b]" />
                    <span>{t('exp_comm_feature_alerts')}</span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#277d6b]" />
                    <span>{t('exp_comm_feature_reports')}</span>
                  </li>
                </ul>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#e8eeec] pt-3">
                  <span className="text-sm font-bold text-[#277d6b]">
                    {t('exp_comm_btn')}
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
                className="group flex h-full min-w-0 flex-col rounded-3xl border border-[#dfe7e5] bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c5ccef] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-[#3346a8]/20 sm:p-6 lg:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef0fc] text-[#3346a8]">
                    <FlaskConical size={24} />
                  </div>

                  <span className="rounded-full bg-[#eef0fc] px-3 py-1.5 text-xs font-bold text-[#3346a8]">
                    {t('exp_tech_badge')}
                  </span>
                </div>

                <h3 className="mt-3 text-xl font-black sm:text-2xl">
                  {t('exp_tech_title')}
                </h3>

                <p className="mt-2 text-sm leading-5 text-slate-500 sm:leading-6">
                  {t('exp_tech_desc')}
                </p>

                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#3346a8]" />
                    <span>{t('exp_tech_feature_risk')}</span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#3346a8]" />
                    <span>{t('exp_tech_feature_basin')}</span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#3346a8]" />
                    <span>{t('exp_tech_feature_science')}</span>
                  </li>

                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#3346a8]" />
                    <span>{t('exp_tech_feature_simulator')}</span>
                  </li>
                </ul>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#e8eeec] pt-3">
                  <span className="text-sm font-bold text-[#3346a8]">
                    {t('exp_tech_btn')}
                  </span>

                  <ArrowRight
                    size={19}
                    className="shrink-0 text-[#3346a8] transition-transform group-hover:translate-x-1"
                  />
                </div>
              </button>
            </section>

            {/* Back button */}
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={onBack}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3346a8]/20"
              >
                ← {t('exp_btn_back')}
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <footer className="mt-2 border-t border-[#e1e9e6] px-2 py-2 text-center">
            <p className="text-xs leading-5 text-slate-400">
              {t('exp_disclaimer')}
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}