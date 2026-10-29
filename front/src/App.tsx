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
import { MobilePwaShell } from './components/MobilePwaShell'
import { GlaciAguaApi } from './services/api'
import { Loader2 } from 'lucide-react'

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
const STORAGE_KEY_DISPLAY = 'glaciagua_display_mode'

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

export default function App() {
  // Persistencia de temporada
  const [season, setSeason] = useState<Season>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEASON)
      if (saved === 'seca' || saved === 'humeda') return saved
    } catch {}
    return 'seca'
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

  // Persistencia de modo de visualización
  const [displayMode, setDisplayMode] = useState<'desktop' | 'mobile-pwa'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISPLAY)
      if (saved === 'desktop' || saved === 'mobile-pwa') return saved
    } catch {}
    return 'desktop'
  })

  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [offlineToast, setOfflineToast] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<
    'mapa' | 'simulador' | 'reportar' | 'guia' | 'cientifico'
  >('mapa')

  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)

  // Persistencia robusta de reportes comunitarios en LocalStorage (Offline-First)
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DISPLAY, displayMode)
    } catch {}
  }, [displayMode])

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
    <div className="min-h-screen flex flex-col bg-[#eef2f1] text-[#172726] font-sans">
      {/* Top Navigation Bar */}
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
        displayMode={displayMode}
        onToggleDisplayMode={() =>
          setDisplayMode((m) => (m === 'desktop' ? 'mobile-pwa' : 'desktop'))
        }
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

      {/* Main View Container */}
      <main className="flex-1 flex overflow-hidden">
        {displayMode === 'mobile-pwa' ? (
          /* Mobile PWA Simulator View */
          <div className="w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#dce7e5] to-[#c7d7d3]">
            <div className="mb-3 text-center">
              <span className="text-xs font-black uppercase tracking-wider text-[#3346a8] bg-white/80 px-3 py-1 rounded-full shadow-xs">
                Simulador de Experiencia Móvil PWA
              </span>
              <p className="text-xs text-[#667573] mt-1">
                Optimizado para teléfonos de comunidades altoandinas, brigadistas y juntas de agua
              </p>
            </div>
            <MobilePwaShell
              basins={PILOT_BASINS}
              season={season}
              setSeason={setSeason}
              isOnline={isOnline}
              onToggleOnline={() => setIsOnline((prev) => !prev)}
              onOpenReport={() => setIsReportModalOpen(true)}
              onSelectBasin={(b) => setSelectedBasin(b)}
              measurements={REAL_MEASUREMENTS}
            />
          </div>
        ) : (
          /* Desktop Workspace Mode */
          <div className="w-full flex-1 flex overflow-hidden">
            {currentView === 'mapa' && (
              <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">
                {/* Left Sidebar */}
                <PilotSidebar
                  basins={PILOT_BASINS}
                  selectedBasin={selectedBasin}
                  onSelectBasin={(b) => setSelectedBasin(b)}
                  season={season}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  isCollapsed={isSidebarCollapsed}
                  onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
                />

                {/* Middle Center Interactive Map */}
                <div className="flex-1 h-full min-h-[450px] relative overflow-hidden">
                  <InteractiveMap
                    basins={PILOT_BASINS}
                    selectedBasin={selectedBasin}
                    onSelectBasin={(b) => setSelectedBasin(b)}
                    season={season}
                    measurements={REAL_MEASUREMENTS}
                  />
                </div>

                {/* Right Basin Detail Panel */}
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

            {currentView === 'simulador' && (
              <div className="w-full h-full overflow-y-auto">
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

            {currentView === 'cientifico' && (
              <div className="w-full h-full overflow-y-auto">
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

            {currentView === 'guia' && (
              <div className="w-full h-full overflow-y-auto">
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
          </div>
        )}
      </main>

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
