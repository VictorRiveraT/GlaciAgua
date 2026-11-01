import React, { useState } from 'react'
import { CommunityReport } from '../types'
import {
  X,
  Wifi,
  WifiOff,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { useI18n } from '../i18n/I18nContext'

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
  const { t } = useI18n()
  const [syncing, setSyncing] = useState(false)
  const [syncedSuccess, setSyncedSuccess] = useState(false)

  if (!isOpen) return null

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#dfe7e5] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#dfe7e5] flex items-center justify-between sticky top-0 bg-white/98 backdrop-blur-md z-10">
          <div>
            <h2 className="text-xl font-black text-[#172726]">{t('sync_modal_title')}</h2>
            <p className="text-xs text-[#667573] mt-0.5">
              {isOnline ? t('sync_online_desc') : t('sync_offline_desc')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="touch-target p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            aria-label={t('btn_close')}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Connection Status Pill */}
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
                  {isOnline ? t('online_status') : t('offline_status')}
                </strong>
                <span className="text-xs text-[#667573]">
                  {isOnline ? 'Internet disponible' : 'Guardado en almacenamiento local'}
                </span>
              </div>
            </div>

            <button
              onClick={onToggleOnline}
              className={`touch-target px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isOnline
                  ? 'bg-white text-[#bd3f3a] border-red-200 hover:bg-red-50'
                  : 'bg-white text-[#21835b] border-green-200 hover:bg-green-50'
              }`}
            >
              {isOnline ? 'Simular Offline' : 'Activar Online'}
            </button>
          </div>

          {/* Pending Reports List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-[#172726] flex items-center gap-1.5">
                <Clock size={15} className="text-[#3346a8]" />
                <span>Avisos pendientes ({pendingReports.length})</span>
              </h3>
              {pendingReports.length > 0 && (
                <button
                  onClick={onClearCache}
                  className="touch-target text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>Limpiar</span>
                </button>
              )}
            </div>

            {pendingReports.length === 0 ? (
              <div className="p-8 text-center bg-[#f8faf9] rounded-2xl border border-[#dfe7e5] space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-100 text-[#21835b] flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-sm font-black text-[#172726]">
                  {t('no_pending_reports')}
                </h4>
                <p className="text-xs text-[#667573]">
                  Todos los avisos que enviaste ya están guardados y respaldados.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {pendingReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3.5 bg-[#f8faf9] rounded-2xl border border-[#dfe7e5] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-sm font-black text-[#172726]">{rep.quebrada}</strong>
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                        En espera
                      </span>
                    </div>
                    <div className="text-[#667573] flex items-center gap-3">
                      <span>Aspecto: {rep.colorAgua}</span>
                      <span>Fecha: {rep.fecha}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sync Button */}
          {pendingReports.length > 0 && (
            <div className="space-y-2 pt-2">
              <button
                onClick={handleSync}
                disabled={syncing || !isOnline}
                className={`touch-target w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  isOnline
                    ? 'bg-[#1e3a8a] hover:bg-[#172554] text-white active:scale-98'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                <span>{syncing ? 'Enviando...' : t('btn_sync_all')}</span>
              </button>

              {!isOnline && (
                <p className="text-[11px] text-[#a86408] text-center font-bold">
                  {t('sync_offline_desc')}
                </p>
              )}

              {syncedSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-[#21835b] font-bold text-center animate-in fade-in">
                  ✓ ¡Todos los reportes fueron enviados exitosamente!
                </div>
              )}
            </div>
          )}

          {/* Tambos Link */}
          {onOpenConnectivity && (
            <div className="pt-2 border-t border-[#dfe7e5]">
              <button
                onClick={() => {
                  onClose()
                  onOpenConnectivity()
                }}
                className="touch-target w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] text-xs font-bold flex items-center justify-center gap-2 border border-emerald-200 transition-colors"
              >
                <Wifi size={14} />
                <span>¿Dónde hay internet cerca? Ver Tambos y WiFi</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
