import React, { useState } from 'react'
import { CommunityReport } from '../types'
import {
  X,
  Wifi,
  WifiOff,
  Database,
  CloudUpload,
  CheckCircle2,
  Trash2,
  RefreshCw,
  HardDrive,
  Download,
  AlertCircle,
  Clock,
} from 'lucide-react'

interface OfflineSyncModalProps {
  isOpen: boolean
  onClose: () => void
  isOnline: boolean
  onToggleOnline: () => void
  pendingReports: CommunityReport[]
  onSyncAll: () => void
  onClearCache: () => void
  onOpenConnectivity?: () => void
}

export const OfflineSyncModal: React.FC<OfflineSyncModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  onToggleOnline,
  pendingReports,
  onSyncAll,
  onClearCache,
  onOpenConnectivity,
}) => {
  if (!isOpen) return null

  const [syncing, setSyncing] = useState(false)
  const [syncedSuccess, setSyncedSuccess] = useState(false)

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => {
      onSyncAll()
      setSyncing(false)
      setSyncedSuccess(true)
      setTimeout(() => setSyncedSuccess(false), 3000)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#dfe7e5] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#dfe7e5] flex items-center justify-between sticky top-0 bg-white/98 backdrop-blur-md z-10">
          <div>
            <span className="text-[10px] font-black uppercase text-[#3346a8] bg-[#edf0ff] px-2.5 py-0.5 rounded-full inline-block mb-1">
              PWA Offline Engine
            </span>
            <h2 className="text-xl font-black text-[#172726]">Gestor de Datos Sin Conexión</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Connection Mode Toggle (Ideal for Demo / Testing!) */}
          <div className="bg-[#f8faf9] p-4 rounded-2xl border border-[#dfe7e5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isOnline
                    ? 'bg-[#e8f5ed] text-[#21835b]'
                    : 'bg-amber-100 text-[#a86408]'
                }`}
              >
                {isOnline ? <Wifi size={22} /> : <WifiOff size={22} />}
              </div>
              <div>
                <strong className="text-sm font-black text-[#172726] block">
                  {isOnline ? 'Conexión a Internet Activa' : 'Modo Fuera de Línea (Campo)'}
                </strong>
                <span className="text-xs text-[#667573]">
                  {isOnline ? 'Sincronización en segundo plano lista' : 'Trabajando con datos locales'}
                </span>
              </div>
            </div>

            <button
              onClick={onToggleOnline}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isOnline
                  ? 'bg-white text-[#bd3f3a] border-red-200 hover:bg-red-50'
                  : 'bg-[#3346a8] text-white border-[#3346a8]'
              }`}
            >
              {isOnline ? 'Desconectar Red' : 'Reconectar'}
            </button>
          </div>

          {/* Downloaded Offline Zone Card */}
          <div className="bg-white p-4 rounded-2xl border border-[#dfe7e5] shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#21835b] bg-[#e8f5ed] px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                  <CheckCircle2 size={12} /> Zona Descargada en Teléfono
                </span>
                <h3 className="text-base font-black text-[#172726] mt-1">
                  Cordillera Blanca: Quillcay & Pachacoto
                </h3>
                <p className="text-xs text-[#667573]">
                  Mapa base vectorial, polígonos de microcuencas e inventario de bofedales.
                </p>
              </div>
              <Download size={20} className="text-[#3346a8]" />
            </div>

            {/* Storage Progress */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs text-[#667573]">
                <span>Espacio en memoria local (IndexedDB)</span>
                <strong className="text-[#172726]">18.4 MB / 100 MB</strong>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="w-[18%] h-full rounded-full bg-[#3346a8]" />
              </div>
              <div className="flex justify-between text-[10px] text-[#667573]">
                <span>Versión: GeoJSON v2.4 (Octubre 2026)</span>
                <span className="text-[#21835b] font-bold">100% Funcional sin señal</span>
              </div>
            </div>
          </div>

          {/* Pending Reports Queue */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#172726] flex items-center gap-1.5">
                <Clock size={16} className="text-[#a86408]" />
                Cola de Reportes Pendientes ({pendingReports.length})
              </h3>
              {pendingReports.length > 0 && (
                <button
                  onClick={handleSync}
                  disabled={syncing || !isOnline}
                  className="px-3 py-1 text-xs font-bold rounded-lg bg-[#3346a8] text-white hover:bg-[#25368f] disabled:opacity-50 flex items-center gap-1"
                >
                  <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
                  {syncing ? 'Enviando...' : 'Sincronizar ahora'}
                </button>
              )}
            </div>

            {syncedSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-[#21835b] font-bold flex items-center gap-2">
                <CheckCircle2 size={16} /> ¡Todos los reportes fueron enviados exitosamente!
              </div>
            )}

            {pendingReports.length === 0 ? (
              <div className="p-6 text-center bg-[#f8faf9] rounded-2xl border border-dashed border-[#dfe7e5] text-xs text-[#667573]">
                <CheckCircle2 size={24} className="mx-auto text-[#21835b] mb-1" />
                No hay reportes pendientes. Todos los datos están al día con la nube.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {pendingReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3 bg-[#fafbfb] rounded-xl border border-[#dfe7e5] flex items-center justify-between text-xs"
                  >
                    <div>
                      <strong className="text-[#172726] block">{rep.quebrada}</strong>
                      <span className="text-[#667573]">
                        {rep.colorAgua} · {rep.fecha}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#a86408] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      En cola
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {onOpenConnectivity && (
            <button
              onClick={() => {
                onClose()
                onOpenConnectivity()
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] text-xs font-bold border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Wifi size={14} />
              <span>¿Necesitas señal? Ver mapa de Tambos y WiFi Libre cercanos →</span>
            </button>
          )}

          {onOpenConnectivity && (
            <button
              onClick={() => {
                onClose()
                onOpenConnectivity()
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] text-xs font-bold border border-emerald-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Wifi size={14} />
              <span>¿Necesitas señal? Ver mapa de Tambos y WiFi Libre cercanos →</span>
            </button>
          )}

          {/* Offline Technical Explainer */}
          <div className="bg-[#edf0ff] p-4 rounded-2xl border border-[#3346a8]/20 text-xs text-[#172726] space-y-1.5">
            <h4 className="font-bold text-[#3346a8] flex items-center gap-1.5">
              <HardDrive size={15} /> ¿Cómo garantiza GlaciAgua el funcionamiento en campo?
            </h4>
            <p className="text-[11px] text-[#556563] leading-relaxed">
              El Service Worker de la PWA precachea el mapa y los algoritmos matemáticos en la memoria
              del navegador. Los reportes comunitarios generan un UUID único en el dispositivo, evitando
              duplicidad cuando la conexión se restablece en la ciudad.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
