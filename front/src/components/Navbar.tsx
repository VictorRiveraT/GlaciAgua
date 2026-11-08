import React from 'react'
import { Season } from '../types'
import { LanguageSelector } from './LanguageSelector'
import { useI18n } from '../i18n/I18nContext'
import {
  Droplet,
  Cpu,
  MapPin,
  BookOpen,
  WifiOff,
  CloudRain,
  SunMedium,
  Menu,
  Plus,
  Send,
} from 'lucide-react'

interface NavbarProps {
  currentView: 'agua' | 'mapa' | 'guia' | 'mas' | 'simulador' | 'cientifico' | 'conectividad'
  onSelectView: (view: 'agua' | 'mapa' | 'guia' | 'mas' | 'simulador' | 'cientifico' | 'conectividad') => void
  onGoHome: () => void
  season: Season
  onSetSeason: (s: Season) => void
  isOnline: boolean
  onOpenSync: () => void
  pendingReportsCount: number
  onOpenReport: () => void
  onOpenAdmin?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  onGoHome,
  season,
  onSetSeason,
  isOnline,
  onOpenSync,
  pendingReportsCount,
  onOpenReport,
  onOpenAdmin,
}) => {
  const { t } = useI18n()

  const seasonLabel =
    season === 'humeda' ? t('season_humeda') : t('season_seca')

  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between gap-1.5 border-b border-[#cbd5e1] bg-white px-2 py-2 shadow-xs select-none sm:gap-2 sm:px-5">
      {/* Brand */}
      <div className="flex min-w-0 shrink-0 items-center">
        <button
          type="button"
          onClick={onGoHome}
          className="touch-target group flex items-center gap-1.5 text-left sm:gap-2"
          aria-label={t('app_home_aria')}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1e3a8a] text-white shadow-xs sm:h-12 sm:w-12 sm:rounded-2xl">
            <Droplet size={21} />
          </div>

          <div className="flex min-w-0 flex-col">
            <span className="block text-base font-black leading-tight tracking-tight text-[#0f172a] sm:text-xl">
              GlaciAgua
            </span>
            <span className="block text-[9px] font-bold leading-none text-[#64748b] sm:text-[11px]">
              Cordillera Blanca
            </span>
          </div>
        </button>
      </div>

      {/* Desktop Main Navigation */}
      <nav className="hidden items-center gap-1 rounded-2xl border border-[#cbd5e1] bg-[#f1f5f9] p-1 lg:flex">
        <button
          type="button"
          onClick={() => onSelectView('agua')}
          className={`touch-target flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition-all ${
            currentView === 'agua'
              ? 'bg-white text-[#1e3a8a] shadow-xs'
              : 'text-[#475569] hover:text-[#0f172a]'
          }`}
        >
          <Droplet size={16} />
          <span>{t('nav_water')}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectView('mapa')}
          className={`touch-target flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition-all ${
            currentView === 'mapa'
              ? 'bg-white text-[#1e3a8a] shadow-xs'
              : 'text-[#475569] hover:text-[#0f172a]'
          }`}
        >
          <MapPin size={16} />
          <span>{t('nav_map')}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectView('guia')}
          className={`touch-target flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition-all ${
            currentView === 'guia'
              ? 'bg-white text-[#1e3a8a] shadow-xs'
              : 'text-[#475569] hover:text-[#0f172a]'
          }`}
        >
          <BookOpen size={16} />
          <span>{t('btn_guidance')}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectView('mas')}
          className={`touch-target flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black transition-all ${
            currentView === 'mas' ||
            currentView === 'simulador' ||
            currentView === 'cientifico' ||
            currentView === 'conectividad'
              ? 'bg-white text-[#1e3a8a] shadow-xs'
              : 'text-[#475569] hover:text-[#0f172a]'
          }`}
        >
          <Menu size={16} />
          <span>{t('nav_more')}</span>
        </button>
      </nav>

      {/* Right Controls */}
      <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-2">
        {/* Reportar agua sucia */}
        <button
          type="button"
          onClick={onOpenReport}
          className="touch-target flex items-center gap-1 rounded-xl border border-amber-500 bg-amber-400 px-2 py-2 text-xs font-black text-slate-950 shadow-sm transition-transform hover:bg-amber-500 active:scale-95 sm:gap-1.5 sm:rounded-2xl sm:px-4 sm:text-sm"
          title={t('report_water_title')}
          aria-label={t('report_water_aria')}
        >
          <div className="flex shrink-0 items-center -mr-0.5">
            <Droplet size={16} className="fill-slate-950 text-slate-950" />
            <Plus size={12} className="-ml-1 font-black" />
          </div>
          <span className="whitespace-nowrap sm:hidden">
            {t('btn_report_short')}
          </span>
          <span className="hidden whitespace-nowrap sm:inline">
            {t('btn_report_water')}
          </span>
        </button>

        {/* Portal de Ingeniería / Admin */}
        {onOpenAdmin && (
          <button
            type="button"
            onClick={onOpenAdmin}
            className="hidden touch-target items-center gap-1.5 rounded-2xl border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-xs font-black text-slate-700 shadow-2xs transition-all hover:bg-blue-50 hover:text-blue-800 md:flex"
            title={t('admin_portal_title')}
            aria-label={t('nav_engineering')}
          >
            <Cpu size={14} className="text-blue-700" />
            <span>{t('nav_engineering')}</span>
          </button>
        )}

        {/* Selector de idioma */}
        <LanguageSelector />

        {/* Temporada */}
        <button
          type="button"
          onClick={() => onSetSeason(season === 'humeda' ? 'seca' : 'humeda')}
          className="hidden touch-target items-center gap-1.5 rounded-2xl border border-[#cbd5e1] bg-[#f1f5f9] px-3 py-1.5 text-xs font-black text-[#1e3a8a] transition-all hover:bg-[#e2e8f0] sm:flex"
          title={t('season_change_title')}
          aria-label={`${t('season_aria_label')}: ${seasonLabel}`}
        >
          {season === 'humeda' ? (
            <>
              <CloudRain size={16} className="text-[#2563eb]" />
              <span className="hidden xl:inline">{t('season_humeda')}</span>
            </>
          ) : (
            <>
              <SunMedium size={16} className="text-[#d97706]" />
              <span className="hidden xl:inline">{t('season_seca')}</span>
            </>
          )}
        </button>

        {/* Sincronización */}
        {pendingReportsCount > 0 ? (
          <button
            type="button"
            onClick={onOpenSync}
            className="hidden touch-target items-center gap-1.5 rounded-2xl bg-blue-700 px-3 py-1.5 text-xs font-black text-white shadow-sm transition-all hover:bg-blue-800 animate-pulse sm:flex"
            title={t('pending_reports_title').replace(
              '{count}',
              String(pendingReportsCount)
            )}
            aria-label={t('pending_reports_aria').replace(
              '{count}',
              String(pendingReportsCount)
            )}
          >
            <Send size={14} />
            <span>
              {t('btn_send_reports').replace(
                '{count}',
                String(pendingReportsCount)
              )}
            </span>
          </button>
        ) : !isOnline ? (
          <button
            type="button"
            onClick={onOpenSync}
            className="hidden touch-target items-center gap-1 rounded-2xl border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-[#92400e] sm:flex"
            title={t('offline_title')}
            aria-label={t('offline_aria')}
          >
            <WifiOff size={16} />
            <span className="hidden md:inline">{t('status_no_signal')}</span>
          </button>
        ) : (
          <div
            className="hidden items-center gap-1 px-2 py-1 text-xs font-bold text-[#166534] sm:flex"
            title={t('online_title')}
            aria-label={t('connection_online_aria')}
          >
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#16a34a]" />
          </div>
        )}
      </div>
    </header>
  )
}