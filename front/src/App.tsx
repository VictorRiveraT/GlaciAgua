import React, { useState, useEffect, Suspense, lazy } from 'react'
import { PILOT_BASINS } from './data/basinsData'
import { REAL_MEASUREMENTS } from './data/measurementsData'
import { BasinData, CommunityReport, Season } from './types'
import { Navbar } from './components/Navbar'
import { PilotSidebar } from './components/PilotSidebar'
import { InteractiveMap } from './components/InteractiveMap'
import { BasinDetailPanel } from './components/BasinDetailPanel'
import { SimpleWaterStatusCard } from './components/SimpleWaterStatusCard'
import { MoreOptionsView } from './components/MoreOptionsView'
import { ReportModal } from './components/ReportModal'
import { OfflineSyncModal } from './components/OfflineSyncModal'
import { OnboardingModal } from './components/OnboardingModal'
import { GlaciAguaApi } from './services/api'
import { useI18n } from './i18n/I18nContext'
import {
  Loader2,
  Droplet,
  MapPin,
  PlusCircle,
  Menu,
  X,
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
const ConnectivityView = lazy(() =>
  import('./components/ConnectivityView').then((m) => ({ default: m.ConnectivityView }))
)

const STORAGE_KEY_REPORTS = 'glaciagua_community_reports_v2'
const STORAGE_KEY_BASIN = 'glaciagua_selected_basin_id'
const STORAGE_KEY_SEASON = 'glaciagua_season'
const STORAGE_KEY_ONBOARDING_SEEN = 'glaciagua_onboarding_seen_v1'

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
  const { t } = useI18n()

  // Persistencia de temporada
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
  
  // Vista principal: por defecto responde a '¿Puedo usar el agua?'
  const [currentView, setCurrentView] = useState<
    'agua' | 'mapa' | 'guia' | 'mas' | 'simulador' | 'cientifico' | 'conectividad'
  >('agua')

  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [isMobileDrawerExpanded, setIsMobileDrawerExpanded] = useState(false)

  // Mostrar onboarding la primera vez
  useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY_ONBOARDING_SEEN)
      if (!seen) {
        setIsOnboardingOpen(true)
        localStorage.setItem(STORAGE_KEY_ONBOARDING_SEEN, 'true')
      }
    } catch {}
  }, [])

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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports))
    } catch (e) {
      console.warn('Error persisting reports to cache:', e)
    }
  }, [reports])

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

  // Listener para eventos reales de red
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setOfflineToast('✓ Conexión a internet detectada · Sincronizando reportes pendientes...')
      handleSyncAll()
    }
    const handleOffline = () => {
      setIsOnline(false)
      setOfflineToast('⚡ Modo sin conexión activo · Datos y mapas guardados en celular')
      setTimeout(() => setOfflineToast(null), 4500)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [reports])

  // Guardar un nuevo reporte
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
    setOfflineToast('⚡ Reporte guardado en tu teléfono. Se enviará al detectar internet.')
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
    <div className="h-screen h-[100dvh] w-screen w-full flex flex-col bg-[#f8fafc] text-[#0f172a] font-sans overflow-hidden">
      {/* Top Header */}
      <Navbar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        season={season}
        onSetSeason={setSeason}
        isOnline={isOnline}
        onOpenSync={() => setIsSyncModalOpen(true)}
        pendingReportsCount={pendingReports.length}
        onOpenReport={() => setIsReportModalOpen(true)}
      />

      {/* Dynamic Offline / Online Notification Banner */}
      {offlineToast && (
        <div className="bg-[#1e3a8a] text-white text-xs font-bold py-2 px-4 flex items-center justify-between shadow-md z-40">
          <span>{offlineToast}</span>
          <button
            type="button"
            onClick={() => setOfflineToast(null)}
            className="text-white/80 hover:text-white ml-2 text-xs font-black"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main View Container */}
      <main className="flex-1 min-h-0 w-full flex overflow-hidden relative">
        {/* Vista 1: ¿Puedo usar el agua? (Principal por defecto) */}
        {currentView === 'agua' && (
          <div className="w-full h-full overflow-y-auto px-4 py-5 pb-24 lg:pb-8 flex justify-center">
            <SimpleWaterStatusCard
              basins={PILOT_BASINS}
              selectedBasin={selectedBasin || PILOT_BASINS[0]}
              onSelectBasin={(b) => setSelectedBasin(b)}
              season={season}
              onOpenReport={() => setIsReportModalOpen(true)}
              onOpenGuidance={() => setCurrentView('guia')}
              onOpenScientific={() => setCurrentView('cientifico')}
            />
          </div>
        )}

        {/* Vista 2: Mapa Satelital */}
        {currentView === 'mapa' && (
          <div className="w-full h-full flex-1 min-h-0 flex flex-row overflow-hidden relative pb-14 lg:pb-0">
            {/* Desktop Left Sidebar: Solo >= lg */}
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

            {/* Central Interactive Satellite Map */}
            <div className="flex-1 h-full min-h-0 w-full relative overflow-hidden flex flex-col">
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

            {/* Desktop Right Detail Panel (>= lg) */}
            {selectedBasin && (
              <div className="hidden lg:flex h-full">
                <BasinDetailPanel
                  basin={selectedBasin}
                  season={season}
                  onClose={() => setSelectedBasin(null)}
                  onOpenReport={() => setIsReportModalOpen(true)}
                  onOpenGuidance={() => setCurrentView('guia')}
                  onOpenSimulator={() => setCurrentView('simulador')}
                  onOpenConnectivity={() => setCurrentView('conectividad')}
                />
              </div>
            )}

            {/* Mobile Bottom Sheet Drawer (< lg) */}
            {selectedBasin && (
              <div
                className={`lg:hidden fixed inset-x-0 bottom-14 z-40 bg-white rounded-t-3xl shadow-2xl border-t border-[#cbd5e1] transition-all duration-300 flex flex-col ${
                  isMobileDrawerExpanded ? 'max-h-[80vh]' : 'max-h-20'
                }`}
              >
                <div
                  onClick={() => setIsMobileDrawerExpanded((prev) => !prev)}
                  className="w-full py-2.5 px-4 flex items-center justify-between cursor-pointer bg-[#f8fafc] rounded-t-3xl border-b border-[#e2e8f0]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        selectedBasin.nivelRiesgo[season] === 'Alto'
                          ? 'bg-[#991b1b]'
                          : selectedBasin.nivelRiesgo[season] === 'Medio'
                          ? 'bg-[#92400e]'
                          : 'bg-[#166534]'
                      }`}
                    />
                    <strong className="text-sm font-black text-[#0f172a]">
                      {selectedBasin.nombre}
                    </strong>
                    <span className="text-xs text-[#64748b]">
                      (Riesgo {selectedBasin.nivelRiesgo[season]})
                    </span>
                  </div>
                  <span className="text-xs font-black text-[#1e3a8a]">
                    {isMobileDrawerExpanded ? 'Cerrar' : 'Ver Ficha'}
                  </span>
                </div>

                {isMobileDrawerExpanded && (
                  <div className="flex-1 overflow-y-auto">
                    <BasinDetailPanel
                      basin={selectedBasin}
                      season={season}
                      onClose={() => setSelectedBasin(null)}
                      onOpenReport={() => setIsReportModalOpen(true)}
                      onOpenGuidance={() => setCurrentView('guia')}
                      onOpenSimulator={() => setCurrentView('simulador')}
                      onOpenConnectivity={() => setCurrentView('conectividad')}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Vista 3: Guía Comunitaria */}
        {currentView === 'guia' && (
          <div className="w-full h-full overflow-y-auto pb-20 lg:pb-8">
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center gap-2 text-sm font-bold text-[#64748b]">
                  <Loader2 size={20} className="animate-spin text-[#1e3a8a]" /> Cargando guía...
                </div>
              }
            >
              <GuidanceView />
            </Suspense>
          </div>
        )}

        {/* Vista 4: Más Opciones (Ayuda, Sincronización, Jurado) */}
        {currentView === 'mas' && (
          <div className="w-full h-full overflow-y-auto pb-20 lg:pb-8">
            <MoreOptionsView
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onOpenConnectivity={() => setCurrentView('conectividad')}
              onOpenSync={() => setIsSyncModalOpen(true)}
              pendingReportsCount={pendingReports.length}
              onOpenSimulator={() => setCurrentView('simulador')}
              onOpenScientific={() => setCurrentView('cientifico')}
            />
          </div>
        )}

        {/* Vistas Secundarias (Jurado / Conectividad) */}
        {currentView === 'simulador' && (
          <div className="w-full h-full overflow-y-auto pb-20 lg:pb-8">
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center gap-2 text-sm font-bold text-[#64748b]">
                  <Loader2 size={20} className="animate-spin text-[#1e3a8a]" /> Cargando simulador...
                </div>
              }
            >
              <RiskSimulator />
            </Suspense>
          </div>
        )}

        {currentView === 'cientifico' && (
          <div className="w-full h-full overflow-y-auto pb-20 lg:pb-8">
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center gap-2 text-sm font-bold text-[#64748b]">
                  <Loader2 size={20} className="animate-spin text-[#1e3a8a]" /> Cargando datos...
                </div>
              }
            >
              <ScientificDataView />
            </Suspense>
          </div>
        )}

        {currentView === 'conectividad' && (
          <div className="w-full h-full overflow-hidden pb-20 lg:pb-8">
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center gap-2 text-sm font-bold text-[#64748b]">
                  <Loader2 size={20} className="animate-spin text-[#1e3a8a]" /> Cargando mapa...
                </div>
              }
            >
              <ConnectivityView />
            </Suspense>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar: Máximo 4 Ítems con Altura Accesible 56px+ */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-white border-t border-[#cbd5e1] z-50 flex items-center justify-around px-2 shadow-xl select-none"
        role="navigation"
        aria-label="Navegación principal"
      >
        <button
          type="button"
          onClick={() => setCurrentView('agua')}
          className={`touch-target flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
            currentView === 'agua' ? 'text-[#1e3a8a] font-black' : 'text-[#64748b]'
          }`}
        >
          <Droplet size={22} />
          <span className="text-[11px] leading-none">¿Uso el agua?</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentView('mapa')}
          className={`touch-target flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
            currentView === 'mapa' ? 'text-[#1e3a8a] font-black' : 'text-[#64748b]'
          }`}
        >
          <MapPin size={22} />
          <span className="text-[11px] leading-none">{t('nav_map')}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsReportModalOpen(true)}
          className="touch-target flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[#1e3a8a] font-black"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#1e3a8a] text-white flex items-center justify-center shadow-md -mt-4 border-2 border-white">
            <PlusCircle size={22} />
          </div>
          <span className="text-[11px] leading-none text-[#1e3a8a]">Avisar</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentView('mas')}
          className={`touch-target flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
            currentView === 'mas' ? 'text-[#1e3a8a] font-black' : 'text-[#64748b]'
          }`}
        >
          <Menu size={22} />
          <span className="text-[11px] leading-none">{t('nav_more')}</span>
        </button>
      </nav>

      {/* Modales Globales */}
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
        onOpenConnectivity={() => setCurrentView('conectividad')}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  )
}
