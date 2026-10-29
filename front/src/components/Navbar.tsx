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
  CloudRain,
  SunMedium,
  ChevronDown,
} from 'lucide-react'

interface NavbarProps {
  currentView: 'mapa' | 'simulador' | 'reportar' | 'guia' | 'cientifico' | 'conectividad'
  onSelectView: (view: 'mapa' | 'simulador' | 'reportar' | 'guia' | 'cientifico' | 'conectividad') => void
  season: Season
  onSetSeason: (s: Season) => void
  isOnline: boolean
  onOpenSync: () => void
  pendingReportsCount: number
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  season,
  onSetSeason,
  isOnline,
  onOpenSync,
  pendingReportsCount,
}) => {
  return (
    <header className="bg-white border-b border-[#dfe7e5] px-4 lg:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs sticky top-0 z-30 select-none">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelectView('mapa')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#3346a8] group-hover:bg-[#25368f] text-white flex items-center justify-center font-black transition-colors shadow-xs">
            <Droplet size={20} className="sm:w-5.5 sm:h-5.5" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-black text-[#172726] tracking-tight">GlaciAgua</span>
          </div>
        </button>
      </div>

      {/* Main Navigation Tabs: Esenciales, directas y claras */}
      <nav className="hidden md:flex items-center gap-1 bg-[#f4f7f6] p-1 rounded-2xl border border-[#dfe7e5]">
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
          <BookOpen size={14} /> ¿Puedo Usar el Agua?
        </button>

        <button
          onClick={() => onSelectView('conectividad')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentView === 'conectividad'
              ? 'bg-white text-[#3346a8] shadow-xs'
              : 'text-[#667573] hover:text-[#172726]'
          }`}
          title="Mapa de señal celular, tambos satelitales y plazas con WiFi gratuito"
        >
          <Wifi size={14} /> Puntos de Internet
        </button>

        <button
          onClick={() => onSelectView('reportar')}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-[#3346a8] text-white hover:bg-[#25368f] shadow-xs"
        >
          <PlusCircle size={14} /> Avisar Agua Sucia
        </button>

        <div className="w-[1px] h-4 bg-gray-300 mx-1" />

        {/* Acceso para jurado / técnicos */}
        <button
          onClick={() => onSelectView(currentView === 'simulador' ? 'mapa' : 'simulador')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            currentView === 'simulador' || currentView === 'cientifico'
              ? 'bg-[#edf0ff] text-[#3346a8] border border-[#c7d2fe]'
              : 'text-[#667573] hover:text-[#172726]'
          }`}
          title="Panel de simulación y datos de laboratorio para jurado"
        >
          <Sliders size={13} />
          <span>Datos / Jurado</span>
        </button>
      </nav>

      {/* Right Controls: Temporada actual y conectividad limpia */}
      <div className="flex items-center gap-2">
        {/* Temporada Ambiental Automática (conmutable con un clic discreto) */}
        <button
          onClick={() => onSetSeason(season === 'humeda' ? 'seca' : 'humeda')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#f4f7f6] hover:bg-[#edf0ff] text-[#3346a8] border border-[#dfe7e5] transition-all"
          title="Clic para cambiar entre temporada de lluvias y estiaje"
        >
          {season === 'humeda' ? (
            <>
              <CloudRain size={14} className="text-[#2563eb]" />
              <span className="hidden sm:inline">Lluvias</span>
              <span className="text-[10px] text-slate-400 font-normal hidden lg:inline">(Actual)</span>
            </>
          ) : (
            <>
              <SunMedium size={14} className="text-[#d97706]" />
              <span className="hidden sm:inline">Estiaje</span>
              <span className="text-[10px] text-slate-400 font-normal hidden lg:inline">(Seca)</span>
            </>
          )}
        </button>

        {/* Estado de Red / Sincronización */}
        {pendingReportsCount > 0 ? (
          <button
            onClick={onOpenSync}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-xs hover:bg-amber-600 transition-all animate-pulse"
            title="Hay reportes pendientes de sincronizar"
          >
            <Wifi size={14} />
            <span>Sincronizar ({pendingReportsCount})</span>
          </button>
        ) : !isOnline ? (
          <button
            onClick={onOpenSync}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-[#a86408] border border-amber-200"
            title="Modo sin conexión · Guardando en memoria local"
          >
            <WifiOff size={14} />
            <span className="hidden sm:inline">Sin señal</span>
          </button>
        ) : (
          <div
            className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-[#21835b] font-medium"
            title="Conexión en línea activa"
          >
            <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
            <span className="hidden sm:inline text-xs font-bold text-slate-600">En línea</span>
          </div>
        )}
      </div>
    </header>
  )
}
