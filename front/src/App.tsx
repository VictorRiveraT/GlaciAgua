import React, { useState, useEffect, Suspense, lazy } from 'react'
import { PILOT_BASINS } from './data/basinsData'
import { REAL_MEASUREMENTS } from './data/measurementsData'
import { BasinData, CommunityReport, Season } from './types'
import { Navbar } from './components/Navbar'
import { PilotSidebar } from './components/PilotSidebar'
import { InteractiveMap } from './components/InteractiveMap'
import { BasinDetailPanel } from './components/BasinDetailPanel'
import { ReportModal } from './components/ReportModal'
import { OfflineSyncModal } from './components/OfflineSyncModal'
import { GlaciAguaApi } from './services/api'
import {
  Loader2,
  MapPin,
  BookOpen,
  PlusCircle,
  Sliders,
  AlertTriangle,
  X,
  ChevronUp,
} from 'lucide-react'

// Code-splitting para optimizar la carga inicial en redes móviles lentas (2G/3G)
const RiskSimulator = lazy(() =>
  import('./components/RiskSimulator').then((m) => ({ default: m.RiskSimulator }))
)
const GuidanceView = lazy(() =>
  import('./components/GuidanceView').then((m) => ({ default: m.GuidanceView }))
)
const ScientificDataView = lazy(() =>
  import('./components/ScientificDataView').then((m) => ({ default: m.ScientificDataView }))
)

const STORAGE_KEY_REPORTS = 'glaciagua_community_reports_v2'
const STORAGE_KEY_BASIN = 'glaciagua_selected_basin_id'
const STORAGE_KEY_SEASON = 'glaciagua_season'

const INITIAL_REPORTS: CommunityReport[] = [
  {
    id: 'rep-init-01',
    cuencaId: 'quillcay',
    quebrada: 'Quebrada Cojup (Quillcay)',
    coordenadas: { lat: -9.512, lng: -77.456, precisionM: 7 },
    fecha: '2026-10-18',
    colorAgua: 'Anaranjada o rojiza',
    olorSabor: 'Sabor metálico',
    usosAfectados: ['Consumo humano', 'Riego'],
    phMedido: 4.3,
    tieneFoto: true,
    comentarios: 'Agua con fuerte turbidez ferrosa en la toma de captación.',
    sincronizado: false,
    simulado: true,
  },
]

// Detección automática de temporada según el calendario real de la sierra peruana (SENAMHI)
const getAutoSeason = (): Season => {
  const month = new Date().getMonth() + 1 // 1-12
  // Octubre a Abril es temporada de lluvias en Áncash
  return month >= 10 || month <= 4 ? 'humeda' : 'seca'
}

export default function App() {
  // Persistencia de temporada (por defecto detecta la temporada real)
  const [season, setSeason] = useState<Season>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEASON)
      if (saved === 'seca' || saved === 'humeda') return saved
    } catch {}
    return getAutoSeason()
  })

  // Persistencia de cuenca seleccionada
  const [selectedBasin, setSelectedBasin] = useState<BasinData | null>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY_BASIN)
      if (savedId) {
        const found = PILOT_BASINS.find((b) => b.id === savedId)
        if (found) return found
      }
    } catch {}
    return PILOT_BASINS[0]
  })

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [offlineToast, setOfflineToast] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<
    'mapa' | 'simulador' | 'reportar' | 'guia' | 'cientifico'
  >('mapa')

  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)
  const [isMobileDrawerExpanded, setIsMobileDrawerExpanded] = useState(false)

  // Persistencia de reportes comunitarios en LocalStorage (Offline-First)
  const [reports, setReports] = useState<CommunityReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORTS)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.warn('Error reading reports from cache:', e)
    }
    return INITIAL_REPORTS
  })

  // Sincronizar cambios de reportes hacia el almacenamiento local persistente
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports))
    } catch (e) {
      console.warn('Error persisting reports to cache:', e)
    }
  }, [reports])

  // Guardar preferencias en LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SEASON, season)
    } catch {}
  }, [season])

  useEffect(() => {
    try {
      if (selectedBasin) {
        localStorage.setItem(STORAGE_KEY_BASIN, selectedBasin.id)
      }
    } catch {}
  }, [selectedBasin])

  // Función de sincronización masiva con el backend
  const handleSyncAll = async () => {
    const unsynced = reports.filter((r) => !r.sincronizado)
    if (unsynced.length === 0) {
      setOfflineToast('✓ Todos los reportes locales ya están sincronizados.')
      setTimeout(() => setOfflineToast(null), 3000)
      return
    }

    setOfflineToast(`Enviando ${unsynced.length} reporte(s) al servidor...`)
    let exitosos = 0

    for (const report of unsynced) {
      try {
        const resp = await GlaciAguaApi.enviarReporte(report)
        if (resp.success) {
          exitosos++
          setReports((prev) =>
            prev.map((r) => (r.id === report.id ? { ...r, sincronizado: true } : r))
          )
        }
      } catch (err) {
        console.warn('Sync failed for report:', report.id, err)
      }
    }

    if (exitosos > 0) {
      setOfflineToast(`✓ ${exitosos} reporte(s) sincronizados con la base de datos central.`)
    } else {
      setOfflineToast('⚡ Sin conexión al servidor. Los reportes permanecen seguros en tu dispositivo.')
    }
    setTimeout(() => setOfflineToast(null), 4000)
  }

  // Listener para eventos reales de red (Online / Offline)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setOfflineToast('✓ Conexión a internet detectada · Sincronizando reportes pendientes...')
      handleSyncAll()
    }
    const handleOffline = () => {
      setIsOnline(false)
      setOfflineToast('⚡ Modo sin conexión activo · Mapa base y caché local listos')
      setTimeout(() => setOfflineToast(null), 4500)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [reports])

  // Guardar un nuevo reporte (inmediato en local + intento en segundo plano si hay red)
  const handleSaveReport = async (newReport: CommunityReport) => {
    setReports((prev) => [newReport, ...prev])

    if (navigator.onLine) {
      try {
        const resp = await GlaciAguaApi.enviarReporte(newReport)
        if (resp.success) {
          setReports((prev) =>
            prev.map((r) => (r.id === newReport.id ? { ...r, sincronizado: true } : r))
          )
          setOfflineToast('✓ Reporte guardado y sincronizado con éxito.')
          setTimeout(() => setOfflineToast(null), 3500)
          return
        }
      } catch {}
    }
    setOfflineToast('⚡ Reporte guardado en memoria local. Se enviará al recuperar señal.')
    setTimeout(() => setOfflineToast(null), 4000)
  }

  const handleClearCache = () => {
    setReports([])
    try {
      localStorage.removeItem(STORAGE_KEY_REPORTS)
    } catch {}
  }

  const pendingReports = reports.filter((r) => !r.sincronizado)

  return (
    <div className="h-screen h-[100dvh] w-screen w-full flex flex-col bg-[#eef2f1] text-[#172726] font-sans overflow-hidden">
      {/* Top Navigation Bar: Limpia, sin botones de demo ni saturación */}
      <Navbar
        currentView={currentView}
        onSelectView={(v) => {
          if (v === 'reportar') {
            setIsReportModalOpen(true)
          } else {
            setCurrentView(v)
          }
        }}
        season={season}
        onSetSeason={setSeason}
        isOnline={isOnline}
        onOpenSync={() => setIsSyncModalOpen(true)}
        pendingReportsCount={pendingReports.length}
      />

      {/* Dynamic Offline / Online Notification Banner */}
      {offlineToast && (
        <div className="bg-[#3346a8] text-white text-xs font-bold py-2 px-4 flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-300 z-40">
          <span>{offlineToast}</span>
          <button
            onClick={() => setOfflineToast(null)}
            className="text-white/80 hover:text-white ml-2 text-xs font-black"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main View Container con diseño 100% responsivo nativo */}
      <main className="flex-1 min-h-0 w-full flex overflow-hidden relative">
        {currentView === 'mapa' && (
          <div className="w-full h-full flex-1 min-h-0 flex flex-row overflow-hidden relative">
            {/* Desktop Left Sidebar: Sólo visible en pantallas grandes (>= lg) */}
            <div className="hidden lg:flex h-full min-h-0 shrink-0">
              <PilotSidebar
                basins={PILOT_BASINS}
                selectedBasin={selectedBasin}
                onSelectBasin={(b) => setSelectedBasin(b)}
                season={season}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
              />
            </div>

            {/* Central Interactive Satellite Map (100% del espacio en móvil y tablet) */}
            <div className="flex-1 h-full min-h-0 w-full relative overflow-hidden flex flex-col">
              {/* Barra flotante de selección rápida para teléfonos móviles (< lg) */}
              <div className="lg:hidden absolute top-3 inset-x-3 z-20 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {PILOT_BASINS.map((b) => {
                  const risk = b.nivelRiesgo[season]
                  const isSel = selectedBasin?.id === b.id
                  const dotColor =
                    risk === 'Alto' ? 'bg-[#dc2626]' : risk === 'Medio' ? 'bg-[#d97706]' : 'bg-[#16a34a]'
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBasin(b)
                        setIsMobileDrawerExpanded(true)
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shadow-md backdrop-blur-md flex items-center gap-1.5 transition-all ${
                        isSel
                          ? 'bg-[#172726] text-white border border-slate-700'
                          : 'bg-white/95 text-slate-800 border border-slate-200 hover:bg-white'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      <span>{b.nombre}</span>
                    </button>
                  )
                })}
              </div>

              <InteractiveMap
                basins={PILOT_BASINS}
                selectedBasin={selectedBasin}
                onSelectBasin={(b) => {
                  setSelectedBasin(b)
                  setIsMobileDrawerExpanded(true)
                }}
                season={season}
                measurements={REAL_MEASUREMENTS}
              />
            </div>

            {/* Desktop Right Basin Detail Panel (>= lg) */}
            {selectedBasin && (
              <div className="hidden lg:flex h-full">
                <BasinDetailPanel
                  basin={selectedBasin}
                  season={season}
                  onClose={() => setSelectedBasin(null)}
                  onOpenReport={() => setIsReportModalOpen(true)}
                  onOpenGuidance={() => setCurrentView('guia')}
                  onOpenSimulator={() => setCurrentView('simulador')}
                />
              </div>
            )}

            {/* Mobile Bottom Sheet Drawer (< lg): Se despliega fluidamente al tocar una cuenca */}
            {selectedBasin && (
              <div
                className={`lg:hidden fixed inset-x-0 bottom-14 z-40 bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 transition-all duration-300 flex flex-col ${
                  isMobileDrawerExpanded ? 'max-h-[80vh]' : 'max-h-24'
                }`}
              >
                {/* Drag / Expand Bar */}
                <div
                  onClick={() => setIsMobileDrawerExpanded((prev) => !prev)}
                  className="w-full py-2 flex flex-col items-center justify-center cursor-pointer bg-[#fafbfb] rounded-t-3xl border-b border-slate-100"
                >
                  <div className="w-10 h-1 rounded-full bg-slate-300 mb-1" />
                  <div className="w-full px-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          selectedBasin.nivelRiesgo[season] === 'Alto'
                            ? 'bg-red-500'
                            : selectedBasin.nivelRiesgo[season] === 'Medio'
                            ? 'bg-amber-500'
                            : 'bg-green-500'
                        }`}
                      />
                      <span className="text-sm font-black text-slate-900">{selectedBasin.nombre}</span>
                      <span className="text-xs text-slate-500 font-medium">
                        (pH {selectedBasin.ultimaMedicion.ph})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#3346a8]">
                        {isMobileDrawerExpanded ? 'Cerrar' : 'Ver Guía de Agua'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedBasin(null)
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content Drawer */}
                {isMobileDrawerExpanded && (
                  <div className="flex-1 overflow-y-auto">
                    <BasinDetailPanel
                      basin={selectedBasin}
                      season={season}
                      onClose={() => setSelectedBasin(null)}
                      onOpenReport={() => setIsReportModalOpen(true)}
                      onOpenGuidance={() => setCurrentView('guia')}
                      onOpenSimulator={() => setCurrentView('simulador')}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Simulador para evaluadores y jurado */}
        {currentView === 'simulador' && (
          <div className="w-full h-full overflow-y-auto pb-16 lg:pb-0">
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center gap-2 text-xs font-bold text-[#667573]">
                  <Loader2 size={18} className="animate-spin text-[#3346a8]" /> Cargando simulador...
                </div>
              }
            >
              <RiskSimulator />
            </Suspense>
          </div>
        )}

        {/* Guía práctica de agua */}
        {currentView === 'guia' && (
          <div className="w-full h-full overflow-y-auto pb-16 lg:pb-0">
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center gap-2 text-xs font-bold text-[#667573]">
                  <Loader2 size={18} className="animate-spin text-[#3346a8]" /> Cargando guía comunitaria...
                </div>
              }
            >
              <GuidanceView />
            </Suspense>
          </div>
        )}

        {/* Datos científicos */}
        {currentView === 'cientifico' && (
          <div className="w-full h-full overflow-y-auto pb-16 lg:pb-0">
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center gap-2 text-xs font-bold text-[#667573]">
                  <Loader2 size={18} className="animate-spin text-[#3346a8]" /> Cargando datos científicos...
                </div>
              }
            >
              <ScientificDataView />
            </Suspense>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar: Nativa, rápida e intuitiva (< lg) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 h-14 bg-white border-t border-[#dfe7e5] z-50 flex items-center justify-around px-2 shadow-lg select-none">
        <button
          onClick={() => setCurrentView('mapa')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            currentView === 'mapa' ? 'text-[#3346a8] font-bold' : 'text-[#667573]'
          }`}
        >
          <MapPin size={18} />
          <span className="text-[10px]">Mapa</span>
        </button>

        <button
          onClick={() => setCurrentView('guia')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            currentView === 'guia' ? 'text-[#3346a8] font-bold' : 'text-[#667573]'
          }`}
        >
          <BookOpen size={18} />
          <span className="text-[10px]">¿Agua Segura?</span>
        </button>

        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl text-[#3346a8] font-bold"
        >
          <div className="w-8 h-8 rounded-full bg-[#3346a8] text-white flex items-center justify-center shadow-md -mt-3 border-2 border-white">
            <PlusCircle size={20} />
          </div>
          <span className="text-[10px] text-[#3346a8]">Avisar Turbia</span>
        </button>

        <button
          onClick={() => setCurrentView(currentView === 'simulador' ? 'mapa' : 'simulador')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
            currentView === 'simulador' ? 'text-[#3346a8] font-bold' : 'text-[#667573]'
          }`}
        >
          <Sliders size={18} />
          <span className="text-[10px]">Simulador</span>
        </button>
      </nav>

      {/* Global Modals */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSaveReport={handleSaveReport}
        isOnline={isOnline}
      />

      <OfflineSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        isOnline={isOnline}
        onToggleOnline={() => setIsOnline((prev) => !prev)}
        pendingReports={pendingReports}
        onSyncAll={handleSyncAll}
        onClearCache={handleClearCache}
      />
    </div>
  )
}
