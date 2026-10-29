import React from 'react'
import { Season } from '../types'
import {
  Droplet,
  MapPin,
  Sliders,
  PlusCircle,
  BookOpen,
  FlaskConical,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  ShieldCheck,
} from 'lucide-react'

interface NavbarProps {
  currentView: 'mapa' | 'simulador' | 'reportar' | 'guia' | 'cientifico'
  onSelectView: (view: 'mapa' | 'simulador' | 'reportar' | 'guia' | 'cientifico') => void
  season: Season
  onSetSeason: (s: Season) => void
  isOnline: boolean
  onOpenSync: () => void
  displayMode: 'desktop' | 'mobile-pwa'
  onToggleDisplayMode: () => void
  pendingReportsCount: number
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  season,
  onSetSeason,
  isOnline,
  onOpenSync,
  displayMode,
  onToggleDisplayMode,
  pendingReportsCount,
}) => {
  return (
    <header className="bg-white border-b border-[#dfe7e5] px-4 lg:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs sticky top-0 z-30 select-none">
      {/* Brand & Pilot Basin Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelectView('mapa')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#3346a8] group-hover:bg-[#25368f] text-white flex items-center justify-center font-black transition-colors shadow-xs">
            <Droplet size={22} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-[#172726] tracking-tight">GlaciAgua</span>
              <span className="hidden sm:inline-block text-[10px] font-black uppercase text-[#3346a8] bg-[#edf0ff] px-2 py-0.5 rounded-md">
                Comunidades Áncash
              </span>
            </div>
            <span className="text-[11px] text-[#667573] block -mt-0.5 hidden md:block">
              Alerta ciudadana de agua de deshielo y metales pesados
            </span>
          </div>
        </button>
      </div>

      {/* Main Navigation Tabs: Diseñadas para personas comunes */}
      <nav className="hidden xl:flex items-center gap-1 bg-[#f4f7f6] p-1 rounded-2xl border border-[#dfe7e5]">
        <button
          onClick={() => onSelectView('mapa')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentView === 'mapa'
              ? 'bg-white text-[#3346a8] shadow-xs'
              : 'text-[#667573] hover:text-[#172726]'
          }`}
        >
          <MapPin size={14} /> Mapa de Quebradas
        </button>

        <button
          onClick={() => onSelectView('guia')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentView === 'guia'
              ? 'bg-white text-[#3346a8] shadow-xs'
              : 'text-[#667573] hover:text-[#172726]'
          }`}
        >
          <BookOpen size={14} /> ¿Puedo Usar el Agua? (Guía)
        </button>

        <button
          onClick={() => onSelectView('reportar')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentView === 'reportar'
              ? 'bg-[#3346a8] text-white shadow-xs'
              : 'text-[#3346a8] hover:bg-white'
          }`}
        >
          <PlusCircle size={14} /> Avisar Agua Sucia (Reportar)
        </button>

        <div className="w-[1px] h-4 bg-gray-300 mx-1" />

        {/* Pestañas para evaluación técnica y jurado */}
        <button
          onClick={() => onSelectView('simulador')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentView === 'simulador'
              ? 'bg-white text-[#3346a8] shadow-xs'
              : 'text-[#667573] hover:text-[#172726]'
          }`}
          title="Laboratorio de simulación para jurados y evaluadores"
        >
          <Sliders size={13} /> Simulador
        </button>

        <button
          onClick={() => onSelectView('cientifico')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentView === 'cientifico'
              ? 'bg-white text-[#3346a8] shadow-xs'
              : 'text-[#667573] hover:text-[#172726]'
          }`}
          title="Base de datos de laboratorio INAIGEM y UPCH"
        >
          <FlaskConical size={13} /> Datos INAIGEM
        </button>
      </nav>

      {/* Right Controls: Community Badge, Season, Offline, and Display Mode */}
      <div className="flex items-center gap-2">
        {/* Friendly Community Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#edf0ff] text-[#3346a8] rounded-xl text-xs font-bold border border-[#c7d2fe]">
          <ShieldCheck size={14} />
          <span>Vigilancia Activa</span>
        </div>

        {/* Season Selector */}
        <div className="hidden sm:flex items-center bg-[#f4f7f6] p-1 rounded-xl border border-[#dfe7e5] text-xs">
          <button
            onClick={() => onSetSeason('seca')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              season === 'seca' ? 'bg-[#3346a8] text-white shadow-xs' : 'text-[#667573]'
            }`}
            title="Época de estiaje / seca (Mayo a Septiembre)"
          >
            Seca
          </button>
          <button
            onClick={() => onSetSeason('humeda')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              season === 'humeda' ? 'bg-[#3346a8] text-white shadow-xs' : 'text-[#667573]'
            }`}
            title="Época de lluvias (Octubre a Abril)"
          >
            Lluvias
          </button>
        </div>

        {/* Offline & Sync Status Trigger */}
        <button
          onClick={onOpenSync}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            isOnline
              ? 'bg-[#e8f5ed] text-[#21835b] border-green-200 hover:bg-green-100'
              : 'bg-amber-50 text-[#a86408] border-amber-200 hover:bg-amber-100'
          }`}
          title="Gestor de sincronización sin conexión"
        >
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span className="hidden md:inline">{isOnline ? 'En línea' : 'Sin internet'}</span>
          {pendingReportsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#a86408] text-white text-[10px] flex items-center justify-center font-black animate-pulse">
              {pendingReportsCount}
            </span>
          )}
        </button>

        {/* Display Mode Switcher (Desktop vs Mobile PWA) */}
        <button
          onClick={onToggleDisplayMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#fafbfb] hover:bg-[#edf0ff] text-[#3346a8] border border-[#dfe7e5] transition-all"
          title="Alternar entre interfaz de escritorio y simulador móvil de bolsillo"
        >
          {displayMode === 'desktop' ? <Smartphone size={15} /> : <Monitor size={15} />}
          <span className="hidden sm:inline">
            {displayMode === 'desktop' ? 'Ver en Celular' : 'Ver Escritorio'}
          </span>
        </button>
      </div>
    </header>
  )
}
