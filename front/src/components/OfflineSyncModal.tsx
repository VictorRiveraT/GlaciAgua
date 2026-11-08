
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] max-h-[90dvh] overflow-hidden shadow-2xl border border-[#dfe7e5] flex flex-col">

        {/* Header fijo */}
        <div className="p-4 sm:p-5 border-b border-[#dfe7e5] flex items-center justify-between gap-3 shrink-0 sticky top-0 bg-white z-10">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-black text-[#172726] leading-tight">
              {t('sync_modal_title')}
            </h2>

            <p className="text-xs text-[#667573] mt-1">
              {isOnline ? t('sync_online_desc') : t('sync_offline_desc')}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="touch-target shrink-0 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            aria-label={t('btn_close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 overflow-y-auto overscroll-contain min-h-0">

          {/* Estado de conexión */}
          <div className="bg-[#f8faf9] p-4 rounded-2xl border border-[#dfe7e5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isOnline
                    ? 'bg-[#e8f5ed] text-[#21835b]'
                    : 'bg-amber-100 text-[#a86408]'
                }`}
              >
                {isOnline ? <Wifi size={22} /> : <WifiOff size={22} />}
              </div>

              <div className="min-w-0">
                <strong className="text-sm font-black text-[#172726] block">
                  {isOnline ? t('online_status') : t('offline_status')}
                </strong>

                <span className="text-xs text-[#667573] block mt-0.5">
                  {isOnline
                    ? t('sync_internet_available')
                    : t('sync_local_storage')}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-1.5">
              <span className="text-[10px] font-bold text-[#667573]">
                {t('sync_field_test')}
              </span>

              <button
                type="button"
                onClick={onToggleOnline}
                className={`touch-target w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  isOnline
                    ? 'bg-white text-[#bd3f3a] border-red-200 hover:bg-red-50'
                    : 'bg-white text-[#21835b] border-green-200 hover:bg-green-50'
                }`}
              >
                {isOnline
                  ? t('sync_simulate_offline')
                  : t('sync_restore_online')}
              </button>
            </div>
          </div>

          {/* Lista de reportes pendientes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-black uppercase text-[#172726] flex items-center gap-1.5">
                <Clock size={15} className="text-[#3346a8] shrink-0" />
                <span>
                  {t('sync_pending_reports')} ({pendingReports.length})
                </span>
              </h3>

              {pendingReports.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCache}
                  className="touch-target shrink-0 text-xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>{t('sync_clear')}</span>
                </button>
              )}
            </div>

            {pendingReports.length === 0 ? (
              <div className="p-6 sm:p-8 text-center bg-[#f8faf9] rounded-2xl border border-[#dfe7e5] space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-100 text-[#21835b] flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>

                <h4 className="text-sm font-black text-[#172726]">
                  {t('no_pending_reports')}
                </h4>

                <p className="text-xs text-[#667573]">
                  {t('sync_all_backed_up')}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto overscroll-contain">
                {pendingReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3.5 bg-[#f8faf9] rounded-2xl border border-[#dfe7e5] text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <strong className="text-sm font-black text-[#172726] min-w-0 break-words">
                        {rep.quebrada}
                      </strong>

                      <span className="shrink-0 text-[10px] bg-amber-100 text-amber-900 px-2 py-1 rounded-md font-bold">
                        {t('sync_waiting')}
                      </span>
                    </div>

                    <div className="text-[#667573] grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-3">
                      <span className="break-words">
                        {t('sync_appearance')}: {rep.colorAgua}
                      </span>

                      <span className="break-words">
                        {t('sync_date')}: {rep.fecha}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botón de sincronización */}
          {pendingReports.length > 0 && (
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing || !isOnline}
                className={`touch-target w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  isOnline
                    ? 'bg-[#1e3a8a] hover:bg-[#172554] text-white active:scale-98'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <RefreshCw
                  size={18}
                  className={syncing ? 'animate-spin' : ''}
                />

                <span>
                  {syncing ? t('sync_sending') : t('btn_sync_all')}
                </span>
              </button>

              {!isOnline && (
                <p className="text-[11px] text-[#a86408] text-center font-bold">
                  {t('sync_offline_desc')}
                </p>
              )}

              {syncedSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-[#21835b] font-bold text-center animate-in fade-in">
                  ✓ {t('sync_success')}
                </div>
              )}
            </div>
          )}

          {/* Acceso a Tambos y WiFi */}
          {onOpenConnectivity && (
            <div className="pt-3 border-t border-[#dfe7e5]">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenConnectivity()
                }}
                className="touch-target w-full py-3 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] text-xs font-bold flex items-center justify-center gap-2 border border-emerald-200 transition-colors text-center"
              >
                <Wifi size={14} className="shrink-0" />

                <span>
                  {t('sync_find_connectivity')}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
