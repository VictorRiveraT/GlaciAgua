import React, { useState, useEffect } from 'react'
import { PILOT_BASINS } from './data/basinsData'
import { REAL_MEASUREMENTS } from './data/measurementsData'
import { BasinData, CommunityReport, Season } from './types'
import { Navbar } from './components/Navbar'
import { PilotSidebar } from './components/PilotSidebar'
import { InteractiveMap } from './components/InteractiveMap'
import { BasinDetailPanel } from './components/BasinDetailPanel'
import { RiskSimulator } from './components/RiskSimulator'
import { GuidanceView } from './components/GuidanceView'
import { ScientificDataView } from './components/ScientificDataView'
import { ReportModal } from './components/ReportModal'
import { OfflineSyncModal } from './components/OfflineSyncModal'
import { MobilePwaShell } from './components/MobilePwaShell'

export default function App() {
  const [season, setSeason] = useState<Season>('seca')
  const [selectedBasin, setSelectedBasin] = useState<BasinData | null>(PILOT_BASINS[0])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false)
  const [offlineToast, setOfflineToast] = useState<string | null>(null)
  const [displayMode, setDisplayMode] = useState<'desktop' | 'mobile-pwa'>('desktop')
  const [currentView, setCurrentView] = useState<
    'mapa' | 'simulador' | 'reportar' | 'guia' | 'cientifico'
  >('mapa')

  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)

  // Local state for community reports
  const [reports, setReports] = useState<CommunityReport[]>([
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
  ])

  // Sync listener for actual online/offline browser events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setOfflineToast('✓ Conexión a internet restablecida · Listo para sincronizar')
      setTimeout(() => setOfflineToast(null), 4000)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setOfflineToast('⚡ Modo sin conexión activo · Mapa base y 18.4 MB disponibles en memoria local')
      setTimeout(() => setOfflineToast(null), 4500)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleSaveReport = (newReport: CommunityReport) => {
    setReports((prev) => [newReport, ...prev])
  }

  const handleSyncAll = () => {
    setReports((prev) => prev.map((r) => ({ ...r, sincronizado: true })))
  }

  const handleClearCache = () => {
    setReports([])
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
                <RiskSimulator />
              </div>
            )}

            {currentView === 'cientifico' && (
              <div className="w-full h-full overflow-y-auto">
                <ScientificDataView />
              </div>
            )}

            {currentView === 'guia' && (
              <div className="w-full h-full overflow-y-auto">
                <GuidanceView />
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
