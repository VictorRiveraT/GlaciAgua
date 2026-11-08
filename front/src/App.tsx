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
import { CommunityHelpModal } from './components/CommunityHelpModal'
import { OfficialLetterModal } from './components/OfficialLetterModal'
import { AdminPortalModal } from './components/AdminPortalModal'
import { WelcomeScreen } from './components/WelcomeScreen'
import { ExperienceSelection } from './components/ExperienceSelection'
import { GlaciAguaApi } from './services/api'
import { useI18n } from './i18n/I18nContext'
import {
  Loader2,
  Droplet,
  MapPin,
  PlusCircle,
  Menu,
  X,
  BookOpen,
  Plus,
} from 'lucide-react'

// Code-splitting para optimizar la carga inicial en redes móviles lentas (2G/3G)
const RiskSimulator = lazy(() =>
  import('./components/RiskSimulator').then((m) => ({
    default: m.RiskSimulator,
  }))
)

const GuidanceView = lazy(() =>
  import('./components/GuidanceView').then((m) => ({
    default: m.GuidanceView,
  }))
)

const ScientificDataView = lazy(() =>
  import('./components/ScientificDataView').then((m) => ({
    default: m.ScientificDataView,
  }))
)

const ConnectivityView = lazy(() =>
  import('./components/ConnectivityView').then((m) => ({
    default: m.ConnectivityView,
  }))
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
  const month = new Date().getMonth() + 1

  // Octubre a Abril es temporada de lluvias en Áncash
  return month >= 10 || month <= 4 ? 'humeda' : 'seca'
}

export default function App() {
  const { t } = useI18n()

  // Persistencia de temporada
  const [season, setSeason] = useState<Season>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEASON)

      if (saved === 'seca' || saved === 'humeda') {
        return saved
      }
    } catch {}

    return getAutoSeason()
  })

  // Persistencia de cuenca seleccionada
  const [selectedBasin, setSelectedBasin] = useState<BasinData | null>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY_BASIN)

      if (savedId) {
        const found = PILOT_BASINS.find((b) => b.id === savedId)

        if (found) {
          return found
        }
      }
    } catch {}

    return PILOT_BASINS[0]
  })

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [offlineToast, setOfflineToast] = useState<string | null>(null)

  // Vista principal: comienza en la bienvenida
  const [currentView, setCurrentView] = useState<
    | 'welcome'
    | 'agua'
    | 'mapa'
    | 'guia'
    | 'mas'
    | 'simulador'
    | 'cientifico'
    | 'conectividad'
  >('welcome')

  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false)
  const [isOficioModalOpen, setIsOficioModalOpen] = useState(false)
  const [isMobileDrawerExpanded, setIsMobileDrawerExpanded] = useState(false)
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false)
  const [welcomeStep, setWelcomeStep] = useState<'landing' | 'experience'>('landing')

  // Identifica si la guía se abrió desde el onboarding
  const [helpFromOnboarding, setHelpFromOnboarding] = useState(false)

  // Mostrar onboarding la primera vez
  useEffect(() => {
    try {
      const seen =
        localStorage.getItem('glaciagua_welcome_seen') ||
        localStorage.getItem(STORAGE_KEY_ONBOARDING_SEEN)

      if (!seen) {
        setIsOnboardingOpen(true)
      }
    } catch {}
  }, [])

  // Cerrar onboarding y mostrar WelcomeScreen
  const handleOnboardingClose = () => {
    setIsOnboardingOpen(false)
    setCurrentView('welcome')
  }

  // Abrir la guía desde el onboarding
  const handleOnboardingHelp = () => {
    setHelpFromOnboarding(true)
    setIsHelpModalOpen(true)
  }

  // Cerrar la guía de ayuda
  const handleHelpClose = () => {
    setIsHelpModalOpen(false)

    // Si se abrió desde el onboarding, continuar a WelcomeScreen
    if (helpFromOnboarding) {
      setCurrentView('welcome')
      setHelpFromOnboarding(false)
    }
  }

  // Persistencia de reportes comunitarios en LocalStorage (Offline-First)
  const [reports, setReports] = useState<CommunityReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORTS)

      if (saved) {
        const parsed = JSON.parse(saved)

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
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
            prev.map((r) =>
              r.id === report.id ? { ...r, sincronizado: true } : r
            )
          )
        }
      } catch (err) {
        console.warn('Sync failed for report:', report.id, err)
      }
    }

    if (exitosos > 0) {
      setOfflineToast(
        `✓ ${exitosos} reporte(s) sincronizados con la base de datos central.`
      )
    } else {
      setOfflineToast(
        '⚡ Sin conexión al servidor. Los reportes permanecen seguros en tu dispositivo.'
      )
    }

    setTimeout(() => setOfflineToast(null), 4000)
  }

  // Listener para eventos reales de red
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)

      setOfflineToast(
        '✓ Conexión a internet detectada · Sincronizando reportes pendientes...'
      )

      handleSyncAll()
    }

    const handleOffline = () => {
      setIsOnline(false)

      setOfflineToast(
        '⚡ Modo sin conexión activo · Datos y mapas guardados en celular'
      )

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
            prev.map((r) =>
              r.id === newReport.id ? { ...r, sincronizado: true } : r
            )
          )

          setOfflineToast('✓ Reporte guardado y sincronizado con éxito.')
          setTimeout(() => setOfflineToast(null), 3500)

          return
        }
      } catch {}
    }

    setOfflineToast(
      '⚡ Reporte guardado en tu teléfono. Se enviará al detectar internet.'
    )

    setTimeout(() => setOfflineToast(null), 4000)
  }

  const handleClearCache = () => {
    setReports([])

    try {
      localStorage.removeItem(STORAGE_KEY_REPORTS)
    } catch {}
  }

  const pendingReports = reports.filter((r) => !r.sincronizado)

  // Mostrar la bienvenida sin la navegación habitual de la aplicación
  const isWelcomeView = currentView === 'welcome'

  return (
    <div
      className={`${
        isWelcomeView
          ? 'min-h-screen w-full overflow-x-hidden bg-[#f5f8f7]'
          : 'h-screen h-[100dvh] w-screen w-full flex flex-col bg-[#f8fafc] text-[#0f172a] font-sans overflow-hidden'
      }`}
    >
      {/* Top Header */}
      {!isWelcomeView && (
        <Navbar
          currentView={currentView}
          onSelectView={(v) => setCurrentView(v)}
          onGoHome={() => {
            setCurrentView('welcome')
            setWelcomeStep('landing')
          }}
          season={season}
          onSetSeason={setSeason}
          isOnline={isOnline}
          onOpenSync={() => setIsSyncModalOpen(true)}
          pendingReportsCount={pendingReports.length}
          onOpenReport={() => setIsReportModalOpen(true)}
          onOpenAdmin={() => setIsAdminPortalOpen(true)}
        />
      )}

      {/* Dynamic Offline / Online Notification Banner */}
      {offlineToast && !isWelcomeView && (
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
      <main
        className={`${
          isWelcomeView
            ? 'w-full'
            : 'flex-1 min-h-0 w-full flex overflow-hidden relative'
        }`}
      >
        {/* Vista de bienvenida & Selección de Perfil */}
        {currentView === 'welcome' && (
          <div className="w-full">
            {welcomeStep === 'landing' ? (
              <WelcomeScreen
                onExplore={() => setWelcomeStep('experience')}
              />
            ) : (
              <ExperienceSelection
                onSelectCommunity={() => {
                  setCurrentView('agua')
                  setWelcomeStep('landing')
                }}
                onSelectTechnical={() => {
                  setIsAdminPortalOpen(true)
                  setCurrentView('mapa')
                  setWelcomeStep('landing')
                }}
                onBack={() => setWelcomeStep('landing')}
              />
            )}
          </div>
        )}

        {/* Vista 1: ¿Puedo usar el agua? */}
        {currentView === 'agua' && (
          <div className="box-border h-full min-h-0 w-full flex-none overflow-x-hidden overflow-y-auto px-4 pt-5 pb-36 lg:pb-8">
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
                onToggleCollapse={() =>
                  setIsSidebarCollapsed((prev) => !prev)
                }
              />
            </div>

            {/* Central Interactive Satellite Map */}
            <div className="flex-1 h-full min-h-0 w-full relative overflow-hidden flex flex-col">
              <InteractiveMap
                basins={PILOT_BASINS}
                selectedBasin={selectedBasin}
                onSelectBasin={(b) => {
                  setSelectedBasin(b)
                }}
                onOpenDetails={(b) => {
                  setSelectedBasin(b)
                  setIsMobileDrawerExpanded(true)
                  setIsDetailsExpanded(true)
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
                  onClose={() => {
                    setSelectedBasin(null)
                    setIsDetailsExpanded(false)
                  }}
                  onOpenReport={() => setIsReportModalOpen(true)}
                  onOpenGuidance={() => setCurrentView('guia')}
                  onOpenSimulator={() => setCurrentView('simulador')}
                  onOpenConnectivity={() => setCurrentView('conectividad')}
                  forceShowDetails={isDetailsExpanded}
                />
              </div>
            )}

            {/* Mobile Bottom Sheet Drawer (< lg) */}
            {selectedBasin && (
              <div
                className={`lg:hidden fixed inset-x-0 bottom-16 z-40 bg-white rounded-t-3xl shadow-2xl border-t border-[#cbd5e1] transition-all duration-300 flex flex-col ${
                  isMobileDrawerExpanded ? 'max-h-[75vh]' : 'max-h-14'
                }`}
              >
                <div
                  onClick={() =>
                    setIsMobileDrawerExpanded((prev) => !prev)
                  }
                  className="touch-target w-full py-2.5 px-4 flex items-center justify-between cursor-pointer bg-[#f8fafc] rounded-t-3xl border-b border-[#e2e8f0] select-none"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-xs shrink-0 ${
                        selectedBasin.nivelRiesgo[season] === 'Alto'
                          ? 'bg-[#dc2626]'
                          : selectedBasin.nivelRiesgo[season] === 'Medio'
                          ? 'bg-[#d97706]'
                          : 'bg-[#16a34a]'
                      }`}
                    />

                    <strong className="text-sm font-black text-[#0f172a] truncate max-w-[170px]">
                      {selectedBasin.nombre}
                    </strong>

                    <span className="text-xs font-bold text-[#475569] hidden sm:inline">
                      ·{' '}
                      {selectedBasin.nivelRiesgo[season] === 'Alto'
                        ? 'Alerta'
                        : selectedBasin.nivelRiesgo[season] === 'Medio'
                        ? 'Precaución'
                        : 'Menor riesgo'}
                    </span>
                  </div>

                  <span className="text-xs font-black text-[#1e3a8a] bg-[#eff6ff] border border-blue-200 px-3 py-1 rounded-xl shrink-0">
                    {isMobileDrawerExpanded ? '▼ Bajar' : '▲ Ver más'}
                  </span>
                </div>

                {isMobileDrawerExpanded && (
                  <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pb-6">
                    <BasinDetailPanel
                      basin={selectedBasin}
                      season={season}
                      onClose={() => {
                        setIsMobileDrawerExpanded(false)
                        setIsDetailsExpanded(false)
                      }}
                      onOpenReport={() => setIsReportModalOpen(true)}
                      onOpenGuidance={() => setCurrentView('guia')}
                      onOpenSimulator={() => setCurrentView('simulador')}
                      onOpenConnectivity={() => setCurrentView('conectividad')}
                      forceShowDetails={isDetailsExpanded}
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
                  <Loader2
                    size={20}
                    className="animate-spin text-[#1e3a8a]"
                  />
                  Cargando guía...
                </div>
              }
            >
              <GuidanceView
                onOpenOficio={() => setIsOficioModalOpen(true)}
              />
            </Suspense>
          </div>
        )}

        {/* Vista 4: Más Opciones */}
        {currentView === 'mas' && (
          <div className="w-full h-full overflow-y-auto pb-20 lg:pb-8">
            <MoreOptionsView
              onOpenOnboarding={() => {
                setHelpFromOnboarding(false)
                setIsHelpModalOpen(true)
              }}
              onOpenConnectivity={() => setCurrentView('conectividad')}
              onOpenSync={() => setIsSyncModalOpen(true)}
              pendingReportsCount={pendingReports.length}
              onOpenSimulator={() => setCurrentView('simulador')}
              onOpenScientific={() => setCurrentView('cientifico')}
              onOpenAdmin={() => setIsAdminPortalOpen(true)}
              onOpenOficio={() => setIsOficioModalOpen(true)}
            />
          </div>
        )}

        {/* Vista secundaria: Simulador */}
        {currentView === 'simulador' && (
          <div className="w-full h-full overflow-y-auto pb-20 lg:pb-8">
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center gap-2 text-sm font-bold text-[#64748b]">
                  <Loader2
                    size={20}
                    className="animate-spin text-[#1e3a8a]"
                  />
                  Cargando simulador...
                </div>
              }
            >
              <RiskSimulator />
            </Suspense>
          </div>
        )}

        {/* Vista secundaria: Datos científicos */}
        {currentView === 'cientifico' && (
          <div className="w-full h-full overflow-y-auto pb-20 lg:pb-8">
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center gap-2 text-sm font-bold text-[#64748b]">
                  <Loader2
                    size={20}
                    className="animate-spin text-[#1e3a8a]"
                  />
                  Cargando datos...
                </div>
              }
            >
              <ScientificDataView />
            </Suspense>
          </div>
        )}

        {/* Vista secundaria: Conectividad */}
        {currentView === 'conectividad' && (
          <div className="w-full h-full overflow-hidden pb-20 lg:pb-8">
            <Suspense
              fallback={
                <div className="h-full flex items-center justify-center gap-2 text-sm font-bold text-[#64748b]">
                  <Loader2
                    size={20}
                    className="animate-spin text-[#1e3a8a]"
                  />
                  Cargando mapa...
                </div>
              }
            >
              <ConnectivityView />
            </Suspense>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      {!isWelcomeView && (
        <nav
          className="lg:hidden fixed bottom-0 inset-x-0 h-16 bg-white border-t border-[#cbd5e1] z-50 flex items-center justify-around px-2 shadow-xl select-none"
          role="navigation"
          aria-label="Navegación principal"
        >
          <button
            type="button"
            onClick={() => setCurrentView('agua')}
            className={`touch-target flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
              currentView === 'agua'
                ? 'text-[#1e3a8a] font-black'
                : 'text-[#64748b]'
            }`}
          >
            <Droplet size={22} />
            <span className="text-[11px] leading-none">{t('nav_water_mobile')}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('mapa')}
            className={`touch-target flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
              currentView === 'mapa'
                ? 'text-[#1e3a8a] font-black'
                : 'text-[#64748b]'
            }`}
          >
            <MapPin size={22} />
            <span className="text-[11px] leading-none">
              {t('nav_map')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('guia')}
            className={`touch-target flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
              currentView === 'guia'
                ? 'text-[#1e3a8a] font-black'
                : 'text-[#64748b]'
            }`}
          >
            <BookOpen size={22} />
            <span className="text-[11px] leading-none">
              {t('btn_guidance')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('mas')}
            className={`touch-target flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
              currentView === 'mas'
                ? 'text-[#1e3a8a] font-black'
                : 'text-[#64748b]'
            }`}
          >
            <Menu size={22} />
            <span className="text-[11px] leading-none">
              {t('nav_more')}
            </span>
          </button>
        </nav>
      )}

      {/* Botón flotante permanente de Ayuda Comunitaria */}
      {!isWelcomeView && (
        <button
          type="button"
          onClick={() => {
            setHelpFromOnboarding(false)
            setIsHelpModalOpen(true)
          }}
          style={{
            bottom: 'calc(4.75rem + env(safe-area-inset-bottom, 0px))',
            right: 'calc(1rem + env(safe-area-inset-right, 0px))',
          }}
          className={`fixed z-40 w-12 h-12 rounded-full bg-[#1e3a8a] hover:bg-[#172554] text-white shadow-xl items-center justify-center font-black text-2xl border-2 border-white ring-2 ring-[#1e3a8a]/20 transition-transform active:scale-95 focus:outline-hidden focus:ring-4 focus:ring-blue-400 select-none lg:bottom-6 lg:right-6 ${
            currentView === 'mapa' || currentView === 'conectividad' || currentView === 'simulador' ? 'hidden' : 'flex'
          }`}
          aria-label={t('help_floating_aria')}
          title={t('help_floating_aria')}
        >
          ?
        </button>
      )}

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
        onClose={handleOnboardingClose}
        onOpenHelp={handleOnboardingHelp}
      />

      <CommunityHelpModal
        isOpen={isHelpModalOpen}
        onClose={handleHelpClose}
      />

      <OfficialLetterModal
        isOpen={isOficioModalOpen}
        onClose={() => setIsOficioModalOpen(false)}
        initialBasinName={selectedBasin?.nombre || 'Quillcay'}
      />

      <AdminPortalModal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
      />
    </div>
  )
}