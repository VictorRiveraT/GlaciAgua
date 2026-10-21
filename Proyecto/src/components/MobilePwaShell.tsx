import React, { useState } from 'react'
import { BasinData, RealMeasurement, Season } from '../types'
import { InteractiveMap } from './InteractiveMap'
import {
  Map as MapIcon,
  Layers,
  PlusCircle,
  BookOpen,
  Wifi,
  WifiOff,
  AlertTriangle,
  Droplet,
  CheckCircle2,
  ChevronRight,
  Download,
  Info,
  RotateCcw,
} from 'lucide-react'

interface MobilePwaShellProps {
  basins: BasinData[]
  season: Season
  setSeason: (s: Season) => void
  isOnline: boolean
  onToggleOnline: () => void
  onOpenReport: () => void
  onSelectBasin: (basin: BasinData) => void
  measurements: RealMeasurement[]
}

export const MobilePwaShell: React.FC<MobilePwaShellProps> = ({
  basins,
  season,
  setSeason,
  isOnline,
  onToggleOnline,
  onOpenReport,
  onSelectBasin,
  measurements,
}) => {
  const [tab, setTab] = useState<'mapa' | 'cuencas' | 'aprender'>('mapa')
  const [activeBasin, setActiveBasin] = useState<BasinData>(basins[0])

  return (
    <div className="w-full max-w-[400px] mx-auto min-h-[720px] max-h-[860px] h-[92vh] bg-white rounded-[40px] shadow-2xl border-[10px] border-[#172726] flex flex-col overflow-hidden relative select-none">
      {/* Phone Speaker Notch / Dynamic Island */}
      <div className="w-full bg-[#172726] h-6 flex justify-center items-center shrink-0">
        <div className="w-24 h-4 bg-black rounded-full" />
      </div>

      {/* Top Mobile App Header */}
      <header className="px-4 py-3 bg-white border-b border-[#dfe7e5] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#3346a8] text-white flex items-center justify-center font-black text-sm">
            <Droplet size={17} />
          </div>
          <div>
            <h1 className="text-sm font-black text-[#172726] leading-none">GlaciAgua</h1>
            <span className="text-[10px] text-[#667573]">Cordillera Blanca PWA</span>
          </div>
        </div>

        {/* Connectivity Status Pill */}
        <button
          onClick={onToggleOnline}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
            isOnline
              ? 'bg-[#e8f5ed] text-[#21835b] border-green-200'
              : 'bg-amber-50 text-[#a86408] border-amber-200'
          }`}
        >
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          {isOnline ? 'En línea' : 'Sin señal'}
        </button>
      </header>

      {/* Season Toggle on Mobile */}
      <div className="px-4 py-2 bg-[#f4f7f6] border-b border-[#dfe7e5] flex items-center justify-between text-xs shrink-0">
        <span className="text-[11px] font-bold text-[#667573]">Temporada:</span>
        <div className="flex rounded-lg p-0.5 bg-gray-200/80">
          <button
            onClick={() => setSeason('seca')}
            className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
              season === 'seca' ? 'bg-[#3346a8] text-white shadow-xs' : 'text-[#667573]'
            }`}
          >
            Seca (Estiaje)
          </button>
          <button
            onClick={() => setSeason('humeda')}
            className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
              season === 'humeda' ? 'bg-[#3346a8] text-white shadow-xs' : 'text-[#667573]'
            }`}
          >
            Húmeda (Lluvias)
          </button>
        </div>
      </div>

      {/* Mobile Screen Body */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {tab === 'mapa' && (
          <div className="flex flex-col flex-1">
            {/* Real Topographic Leaflet Map in Mobile Shell */}
            <div className="w-full h-64 shrink-0 relative overflow-hidden border-b border-[#dfe7e5]">
              <InteractiveMap
                basins={basins}
                selectedBasin={activeBasin}
                onSelectBasin={(b) => {
                  setActiveBasin(b)
                  onSelectBasin(b)
                }}
                season={season}
                measurements={measurements}
              />
            </div>

            <div className="p-4 space-y-4">
              {/* Quick Basin Status Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-[#667573] tracking-wider">
                Microcuencas Monitoreadas
              </span>
              <div className="grid grid-cols-2 gap-2">
                {basins.map((b) => {
                  const risk = b.nivelRiesgo[season]
                  const isSelected = activeBasin.id === b.id

                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        setActiveBasin(b)
                        onSelectBasin(b)
                      }}
                      className={`p-3 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'border-[#3346a8] bg-[#edf0ff] ring-2 ring-[#3346a8]/20 shadow-xs'
                          : 'border-[#dfe7e5] bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-xs font-black text-[#172726]">{b.nombre}</strong>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            risk === 'Alto'
                              ? 'bg-[#bd3f3a]'
                              : risk === 'Medio'
                              ? 'bg-[#a86408]'
                              : 'bg-[#21835b]'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[#667573] block">
                        Riesgo {risk}
                      </span>
                      <span className="text-[9px] text-[#667573] block truncate">
                        pH {b.ultimaMedicion.ph.toFixed(1)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Selected Basin Detail Card */}
            <div className="bg-[#fbfcfc] p-4 rounded-3xl border border-[#dfe7e5] shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase text-[#3346a8]">
                    Ficha Móvil
                  </span>
                  <h3 className="text-lg font-black text-[#172726]">{activeBasin.nombre}</h3>
                  <p className="text-[11px] text-[#667573]">{activeBasin.distrito}</p>
                </div>
                <div
                  className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                    activeBasin.nivelRiesgo[season] === 'Alto'
                      ? 'bg-red-50 text-[#bd3f3a] border-red-200'
                      : activeBasin.nivelRiesgo[season] === 'Medio'
                      ? 'bg-amber-50 text-[#a86408] border-amber-200'
                      : 'bg-green-50 text-[#21835b] border-green-200'
                  }`}
                >
                  Nivel {activeBasin.nivelRiesgo[season]}
                </div>
              </div>

              {/* Factors Bars */}
              <div className="space-y-2 text-[11px]">
                <div>
                  <div className="flex justify-between font-bold text-[#172726] mb-0.5">
                    <span>Roca recién expuesta</span>
                    <span className="text-[#bd3f3a]">
                      {activeBasin.factores[season].rocaExpuesta}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-[#bd3f3a]"
                      style={{ width: `${activeBasin.factores[season].rocaExpuesta}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-[#172726] mb-0.5">
                    <span>Potencial ácido (sulfuros)</span>
                    <span className="text-[#a86408]">
                      {activeBasin.factores[season].potencialAcido}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-[#a86408]"
                      style={{ width: `${activeBasin.factores[season].potencialAcido}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-[#21835b] mb-0.5">
                    <span>Bofedales (depuración natural)</span>
                    <span>↓ {activeBasin.factores[season].bofedalDepuracion}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-[#21835b]"
                      style={{ width: `${activeBasin.factores[season].bofedalDepuracion}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#dfe7e5] flex gap-2">
                <button
                  onClick={onOpenReport}
                  className="flex-1 min-h-[42px] rounded-xl bg-[#3346a8] text-white text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <PlusCircle size={15} /> Reportar Agua
                </button>
              </div>
            </div>

            {/* Offline Advisory Notice */}
            <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-[#3346a8] flex items-center gap-2">
              <Info size={16} className="shrink-0" />
              <span>Datos guardados en memoria local para consulta en campo.</span>
            </div>
          </div>
        </div>
        )}

        {tab === 'cuencas' && (
          <div className="p-4 space-y-3">
            <h2 className="text-base font-black text-[#172726]">Cuencas Monitoreadas</h2>
            {basins.map((b) => (
              <div
                key={b.id}
                onClick={() => {
                  setActiveBasin(b)
                  onSelectBasin(b)
                }}
                className="p-3.5 bg-white rounded-2xl border border-[#dfe7e5] shadow-xs flex items-center justify-between cursor-pointer hover:border-[#3346a8] transition-all"
              >
                <div>
                  <strong className="text-sm font-black text-[#172726] block">{b.nombre}</strong>
                  <span className="text-xs text-[#667573]">
                    {b.provincia} · {b.areaKm2} km²
                  </span>
                  <span className="text-[10px] text-[#3346a8] block mt-0.5 font-bold">
                    pH actual {b.ultimaMedicion.ph.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black border ${
                      b.nivelRiesgo[season] === 'Alto'
                        ? 'bg-red-50 text-[#bd3f3a] border-red-200'
                        : b.nivelRiesgo[season] === 'Medio'
                        ? 'bg-amber-50 text-[#a86408] border-amber-200'
                        : 'bg-green-50 text-[#21835b] border-green-200'
                    }`}
                  >
                    {b.nivelRiesgo[season]}
                  </span>
                  <ChevronRight size={16} className="text-[#667573]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'aprender' && (
          <div className="p-4 space-y-3">
            <h2 className="text-base font-black text-[#172726]">Guía Rápida de Salud</h2>
            <div className="bg-red-50 p-3 rounded-2xl border border-red-200 text-xs text-[#bd3f3a] space-y-1">
              <strong className="block font-black">⚠️ Recordatorio Vital</strong>
              <p className="leading-relaxed">
                Hervir el agua NO elimina el hierro, aluminio ni plomo. Buscar manantiales de ladera
                protegidos.
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-[#dfe7e5] text-xs space-y-2">
              <h4 className="font-black text-[#172726]">Qué evitar:</h4>
              <p className="text-[#667573]">
                • Quebradas de color anaranjado intenso o blanco lechoso.
                <br />
                • Dar de beber al ganado en charcas con sulfatos.
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-2xl border border-[#dfe7e5] text-xs space-y-2">
              <h4 className="font-black text-[#172726]">Qué hacer:</h4>
              <p className="text-[#667573]">
                • Captar de fuentes protegidas aguas arriba del glaciar.
                <br />• Avisar a la junta de regantes y al comité de agua.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar (Figma replica) */}
      <nav className="h-16 bg-white border-t border-[#dfe7e5] px-4 flex items-center justify-around shrink-0">
        <button
          onClick={() => setTab('mapa')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            tab === 'mapa' ? 'text-[#3346a8]' : 'text-[#667573]'
          }`}
        >
          <MapIcon size={20} />
          <span>Mapa</span>
        </button>

        <button
          onClick={() => setTab('cuencas')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            tab === 'cuencas' ? 'text-[#3346a8]' : 'text-[#667573]'
          }`}
        >
          <Layers size={20} />
          <span>Cuencas</span>
        </button>

        <button
          onClick={onOpenReport}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-[#3346a8]"
        >
          <div className="w-8 h-8 rounded-full bg-[#3346a8] text-white flex items-center justify-center shadow-md">
            <PlusCircle size={20} />
          </div>
          <span>Reportar</span>
        </button>

        <button
          onClick={() => setTab('aprender')}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            tab === 'aprender' ? 'text-[#3346a8]' : 'text-[#667573]'
          }`}
        >
          <BookOpen size={20} />
          <span>Guía</span>
        </button>
      </nav>
    </div>
  )
}
