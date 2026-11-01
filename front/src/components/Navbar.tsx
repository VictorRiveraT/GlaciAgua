import React from 'react'
import { Season } from '../types'
import { LanguageSelector } from './LanguageSelector'
import { AudioPlayButton } from './AudioPlayButton'
import { useI18n } from '../i18n/I18nContext'
import {
  Droplet,
  MapPin,
  PlusCircle,
  BookOpen,
  Wifi,
  WifiOff,
  CloudRain,
  SunMedium,
  Menu,
} from 'lucide-react'

interface NavbarProps {
  currentView: 'agua' | 'mapa' | 'guia' | 'mas' | 'simulador' | 'cientifico' | 'conectividad'
  onSelectView: (view: 'agua' | 'mapa' | 'guia' | 'mas' | 'simulador' | 'cientifico' | 'conectividad') => void
  season: Season
  onSetSeason: (s: Season) => void
  isOnline: boolean
  onOpenSync: () => void
  pendingReportsCount: number
  onOpenReport: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  season,
  onSetSeason,
  isOnline,
  onOpenSync,
  pendingReportsCount,
  onOpenReport,
}) => {
  const { t } = useI18n()

  return (
    <header className="bg-white border-b border-[#cbd5e1] px-3 sm:px-5 py-2 flex items-center justify-between gap-2 shadow-xs sticky top-0 z-30 select-none">
      {/* Brand */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => onSelectView('agua')}
          className="touch-target flex items-center gap-2 text-left group"
          aria-label="GlaciAgua inicio"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#1e3a8a] text-white flex items-center justify-center font-black shadow-xs">
            <Droplet size={22} />
          </div>
          <div className="hidden xs:block">
            <span className="text-lg sm:text-xl font-black text-[#0f172a] tracking-tight block leading-tight">
              GlaciAgua
            </span>
            <span className="text-[10px] text-[#64748b] font-bold block leading-none">
              Cordillera Blanca
            </span>
          </div>
        </button>
      </div>

      {/* Desktop Main Navigation Tabs (4 Items Only) */}
      <nav className="hidden lg:flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-2xl border border-[#cbd5e1]">
        <button
          type="button"
          onClick={() => onSelectView('agua')}
          className={`touch-target px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
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
          className={`touch-target px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
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
          onClick={onOpenReport}
          className="touch-target px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 bg-[#1e3a8a] text-white hover:bg-[#172554] shadow-xs"
        >
          <PlusCircle size={16} />
          <span>{t('nav_report')}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectView('guia')}
          className={`touch-target px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
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
          className={`touch-target px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
            currentView === 'mas' || currentView === 'simulador' || currentView === 'cientifico' || currentView === 'conectividad'
              ? 'bg-white text-[#1e3a8a] shadow-xs'
              : 'text-[#475569] hover:text-[#0f172a]'
          }`}
        >
          <Menu size={16} />
          <span>{t('nav_more')}</span>
        </button>
      </nav>

      {/* Right Controls: Idioma (ES | QU) + Temporada + Conexión */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Selector de Idioma Español / Quechua */}
        <LanguageSelector />

        {/* Conmutador de Temporada */}
        <button
          type="button"
          onClick={() => onSetSeason(season === 'humeda' ? 'seca' : 'humeda')}
          className="touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1e3a8a] border border-[#cbd5e1] transition-all"
          title="Cambiar temporada ambiental"
          aria-label={`Temporada actual: ${season === 'humeda' ? 'Lluvias' : 'Seca'}. Toca para cambiar.`}
        >
          {season === 'humeda' ? (
            <>
              <CloudRain size={16} className="text-[#2563eb]" />
              <span className="hidden sm:inline">{t('season_humeda')}</span>
            </>
          ) : (
            <>
              <SunMedium size={16} className="text-[#d97706]" />
              <span className="hidden sm:inline">{t('season_seca')}</span>
            </>
          )}
        </button>

        {/* Estado de Sincronización / Conexión */}
        {pendingReportsCount > 0 ? (
          <button
            type="button"
            onClick={onOpenSync}
            className="touch-target flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black bg-amber-500 text-white shadow-xs hover:bg-amber-600 transition-all animate-pulse"
            title="Reportes pendientes de enviar"
          >
            <Wifi size={16} />
            <span className="hidden sm:inline">Enviar ({pendingReportsCount})</span>
            <span className="sm:hidden">{pendingReportsCount}</span>
          </button>
        ) : !isOnline ? (
          <button
            type="button"
            onClick={onOpenSync}
            className="touch-target flex items-center gap-1 px-2.5 py-1.5 rounded-2xl text-xs font-bold bg-amber-50 text-[#92400e] border border-amber-300"
            title="Sin internet · Guardando en memoria local"
          >
            <WifiOff size={16} />
            <span className="hidden md:inline">Sin señal</span>
          </button>
        ) : (
          <div
            className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-[#166534] font-bold"
            title="Conexión activa"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a] animate-pulse" />
          </div>
        )}
      </div>
    </header>
  )
}
