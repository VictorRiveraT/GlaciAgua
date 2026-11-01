import React, { useState, useEffect } from 'react'
import { GlaciAguaApi } from '../services/api'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const adminLogin = async (username: string, password: string): Promise<{ success: boolean; usuario?: any; error?: string }> => {
  try {
    const res = await fetch(API_BASE_URL + '/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      signal: AbortSignal.timeout(4000),
    })
    if (res.ok) return await res.json()
    const err = await res.json().catch(() => ({ detail: 'Credenciales invalidas' }))
    return { success: false, error: err.detail || 'Error de autenticacion' }
  } catch {
    return { success: false, error: 'No se pudo conectar con el servidor backend (:8000).' }
  }
}

const getMedicionesCampo = async (): Promise<any[]> => {
  try {
    const res = await fetch(API_BASE_URL + '/admin/mediciones', { signal: AbortSignal.timeout(4000) })
    if (res.ok) return await res.json()
    return []
  } catch {
    return []
  }
}

const guardarMedicionCampo = async (data: any): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const res = await fetch(API_BASE_URL + '/admin/mediciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) return await res.json()
    return { success: false, error: 'Error al registrar medicion' }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

const reentrenarModelo = async (params: {
  aumentar_con_fisica: boolean
  n_sinteticos: number
  n_arboles: number
  filas_adicionales?: any[]
}): Promise<{ exito: boolean; mensaje: string; version_nueva?: string; metricas?: any; error?: string }> => {
  try {
    const res = await fetch(API_BASE_URL + '/admin/reentrenar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(60000),
    })
    if (res.ok) return await res.json()
    const err = await res.json().catch(() => ({ detail: 'Fallo al reentrenar' }))
    return { exito: false, mensaje: err.detail || 'Error en reentrenamiento' }
  } catch {
    return { exito: false, mensaje: 'Error al comunicar con el backend de reentrenamiento.' }
  }
}

const getPlantillaCSV = async (): Promise<{ contenido_csv: string; nombre_archivo: string } | null> => {
  try {
    const res = await fetch(API_BASE_URL + '/admin/plantilla-csv', { signal: AbortSignal.timeout(3000) })
    if (res.ok) return await res.json()
    return null
  } catch {
    return null
  }
}

import {
  X,
  Lock,
  Unlock,
  ShieldCheck,
  Cpu,
  Database,
  RefreshCw,
  Download,
  Upload,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Layers,
  FileSpreadsheet,
  LogOut,
  Sliders,
  TrendingUp,
} from 'lucide-react'

interface AdminPortalModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  // Estado de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('glaciagua_admin_auth') === 'true'
  })
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('glaciagua2026')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  // Pestaña activa
  const [activeTab, setActiveTab] = useState<'metricas' | 'ingreso' | 'reentrenar'>('metricas')

  // Estado del modelo
  const [modelInfo, setModelInfo] = useState<any>(null)
  const [loadingModelInfo, setLoadingModelInfo] = useState(false)

  // Mediciones de campo registradas
  const [mediciones, setMediciones] = useState<any[]>([])
  const [loadingMediciones, setLoadingMediciones] = useState(false)

  // Formulario de nueva medición
  const [cuencaId, setCuencaId] = useState('quillcay')
  const [quebrada, setQuebrada] = useState('Quebrada Shallap (Toma Principal)')
  const [periodo, setPeriodo] = useState('2026-humeda')
  const [temporada, setTemporada] = useState<'seca' | 'humeda'>('humeda')
  const [phMin, setPhMin] = useState<number>(4.1)
  const [lluviaMm, setLluviaMm] = useState<number>(185.0)
  const [rocaExpuestaKm2, setRocaExpuestaKm2] = useState<number>(36.0)
  const [pctSulfuros, setPctSulfuros] = useState<number>(55.0)
  const [pctCarbonatos, setPctCarbonatos] = useState<number>(8.0)
  const [pctBofedal, setPctBofedal] = useState<number>(24.0)
  const [responsable, setResponsable] = useState('Ing. Monitoreo Ambiental')
  const [savingMedicion, setSavingMedicion] = useState(false)
  const [medicionSuccess, setMedicionSuccess] = useState<string | null>(null)

  // Estado de Reentrenamiento
  const [aumentarConFisica, setAumentarConFisica] = useState(true)
  const [nSinteticos, setNSinteticos] = useState(100)
  const [nArboles, setNArboles] = useState(250)
  const [reentrenando, setReentrenando] = useState(false)
  const [resultadoReentreno, setResultadoReentreno] = useState<any>(null)

  // Cargar info del modelo y mediciones al autenticar
  const fetchDashboardData = async () => {
    setLoadingModelInfo(true)
    setLoadingMediciones(true)
    try {
      const [mInfo, mList] = await Promise.all([
        GlaciAguaApi.getMLModeloInfo(),
        getMedicionesCampo(),
      ])
      setModelInfo(mInfo)
      setMediciones(mList)
    } finally {
      setLoadingModelInfo(false)
      setLoadingMediciones(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData()
    }
  }, [isAuthenticated])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError(null)

    const res = await adminLogin(username, password)
    setLoggingIn(false)

    if (res.success) {
      setIsAuthenticated(true)
      localStorage.setItem('glaciagua_admin_auth', 'true')
    } else {
      setLoginError(res.error || 'Credenciales inválidas.')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('glaciagua_admin_auth')
  }

  const handleGuardarMedicion = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingMedicion(true)
    setMedicionSuccess(null)

    const payload = {
      cuenca_id: cuencaId,
      quebrada,
      periodo,
      temporada,
      area_km2: cuencaId === 'quillcay' ? 249.5 : cuencaId === 'pachacoto' ? 202.8 : 150.0,
      roca_expuesta_km2: rocaExpuestaKm2,
      pct_sulfuros: pctSulfuros,
      pct_carbonatos: pctCarbonatos,
      lluvia_mm: lluviaMm,
      pct_bofedal: pctBofedal,
      pct_veg_humeda_est: pctBofedal * 1.2,
      ph_min: phMin,
      conductividad: phMin < 5 ? 580 : 120,
      metales_texto: phMin < 5 ? 'Hierro y Aluminio detectados por encima de ECA Agua' : 'Normal',
      responsable,
    }

    const res = await guardarMedicionCampo(payload)
    setSavingMedicion(false)

    if (res.success) {
      setMedicionSuccess('✓ Medición guardada exitosamente en la base de datos central.')
      fetchDashboardData()
      setTimeout(() => setMedicionSuccess(null), 4000)
    }
  }

  const handleReentrenar = async () => {
    setReentrenando(true)
    setResultadoReentreno(null)

    const res = await reentrenarModelo({
      aumentar_con_fisica: aumentarConFisica,
      n_sinteticos: nSinteticos,
      n_arboles: nArboles,
    })

    setReentrenando(false)
    setResultadoReentreno(res)
    if (res.exito) {
      fetchDashboardData()
    }
  }

  const handleDescargarPlantilla = async () => {
    const data = await getPlantillaCSV()
    if (!data) return

    const blob = new Blob([data.contenido_csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = data.nombre_archivo
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs select-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Común */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md">
              <Cpu size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Portal de Ingeniería Ambiental
                {isAuthenticated && (
                  <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full">
                    Sesión Activa
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Carga de datos hidroquímicos, aumento sintético y re-entrenamiento del modelo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Salir</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CONTENIDO: PANTALLA DE LOGIN SI NO ESTÁ AUTENTICADO */}
        {!isAuthenticated ? (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shadow-inner">
              <Lock size={32} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">Acceso a Calibración Técnica</h3>
              <p className="text-xs text-slate-500">
                Ingrese las credenciales del especialista hidroquímico para alimentar el modelo con nuevas mediciones.
              </p>
            </div>

            {loginError && (
              <div className="w-full text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-left">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="w-full space-y-4 text-left">
              <div>
                <label className="block text-xs font-black uppercase text-slate-600 mb-1">
                  Usuario Especialista
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  placeholder="admin"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-600 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loggingIn ? <RefreshCw size={16} className="animate-spin" /> : <Unlock size={16} />}
                <span>{loggingIn ? 'Verificando...' : 'Ingresar al Portal'}</span>
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setUsername('admin')
                setPassword('glaciagua2026')
              }}
              className="text-xs text-blue-700 hover:underline font-bold"
            >
              Usar credenciales de evaluación (admin / glaciagua2026)
            </button>
          </div>
        ) : (
          /* CONTENIDO AUTENTICADO: PANEL DE INGENIERÍA */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Navegación por Pestañas */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('metricas')}
                className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
                  activeTab === 'metricas'
                    ? 'bg-white text-blue-700 border-slate-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
                }`}
              >
                <Cpu size={15} />
                <span>1. Estado del Modelo ML</span>
              </button>

              <button
                onClick={() => setActiveTab('ingreso')}
                className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
                  activeTab === 'ingreso'
                    ? 'bg-white text-blue-700 border-slate-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
                }`}
              >
                <Database size={15} />
                <span>2. Ingresar Nueva Temporada</span>
                {mediciones.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full text-[10px]">
                    {mediciones.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('reentrenar')}
                className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all flex items-center gap-2 border-t border-x ${
                  activeTab === 'reentrenar'
                    ? 'bg-white text-blue-700 border-slate-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
                }`}
              >
                <RefreshCw size={15} />
                <span>3. Re-entrenar con 1 Clic</span>
              </button>
            </div>

            {/* CUERPO DEL TAB */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* PESTAÑA 1: MÉTRICAS Y ESTADO DEL MODELO */}
              {activeTab === 'metricas' && (
                <div className="space-y-6">
                  {loadingModelInfo ? (
                    <div className="flex items-center justify-center py-12 text-sm text-slate-500 font-bold gap-2">
                      <RefreshCw size={18} className="animate-spin text-blue-700" /> Consultando modelo en vivo...
                    </div>
                  ) : modelInfo ? (
                    <>
                      {/* Banner de Estado */}
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase text-blue-900">
                                Versión: {modelInfo.version}
                              </span>
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                modelInfo.fuente_datos === 'real'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : modelInfo.fuente_datos === 'hibrido'
                                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}>
                                Datos: {modelInfo.fuente_datos}
                              </span>
                            </div>
                            <p className="text-xs text-blue-800 mt-0.5">
                              Entrenado con {modelInfo.n_filas} filas y {modelInfo.n_microcuencas} microcuencas
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={fetchDashboardData}
                          className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-white px-3 py-1.5 rounded-xl border border-blue-200 transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <RefreshCw size={13} /> Actualizar Estado
                        </button>
                      </div>

                      {/* Tarjetas de Métricas Estadísticas */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                          <span className="text-[11px] font-black uppercase text-slate-500">Coeficiente R²</span>
                          <p className="text-2xl font-black text-slate-900 mt-1">
                            {modelInfo.metricas_validacion?.r2 ?? 'N/A'}
                          </p>
                          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                            Ajuste de varianza
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                          <span className="text-[11px] font-black uppercase text-slate-500">Error MAE</span>
                          <p className="text-2xl font-black text-slate-900 mt-1">
                            ±{modelInfo.metricas_validacion?.mae_ph ?? 'N/A'}
                          </p>
                          <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                            Unidades de pH
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                          <span className="text-[11px] font-black uppercase text-slate-500">Error RMSE</span>
                          <p className="text-2xl font-black text-slate-900 mt-1">
                            {modelInfo.metricas_validacion?.rmse_ph ?? 'N/A'}
                          </p>
                          <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                            Penalización cuadrática
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                          <span className="text-[11px] font-black uppercase text-slate-500">Acierto Semáforo</span>
                          <p className="text-2xl font-black text-blue-700 mt-1">
                            {modelInfo.metricas_validacion?.acierto_nivel
                              ? `${Math.round(modelInfo.metricas_validacion.acierto_nivel * 100)}%`
                              : 'N/A'}
                          </p>
                          <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                            Riesgo Alto/Medio/Bajo
                          </span>
                        </div>
                      </div>

                      {/* Importancia de Variables en el Random Forest */}
                      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <TrendingUp size={15} className="text-blue-700" />
                          Variables con mayor peso en el drenaje ácido
                        </h4>

                        <div className="space-y-2">
                          {modelInfo.importancia_variables &&
                            Object.entries(modelInfo.importancia_variables)
                              .sort(([, a], [, b]) => (b as number) - (a as number))
                              .slice(0, 6)
                              .map(([variable, peso]: [string, any]) => (
                                <div key={variable} className="space-y-1">
                                  <div className="flex justify-between text-xs font-bold text-slate-700">
                                    <span>
                                      {variable === 'pct_sulfuros'
                                        ? 'Minerales de Sulfuro (Pirita / Potencial Ácido)'
                                        : variable === 'roca_relativa'
                                        ? 'Proporción de Roca Desglaciada Expuesta'
                                        : variable === 'ratio_neutralizacion'
                                        ? 'Ratio de Neutralización (Carbonatos vs Sulfuros)'
                                        : variable === 'depuracion_bofedal'
                                        ? 'Capacidad de Amortiguación del Bofedal'
                                        : variable === 'balance_geoquimico'
                                        ? 'Balance Geoquímico Neto (ABA)'
                                        : variable}
                                    </span>
                                    <span>{Math.round(peso * 100)}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${Math.min(100, Math.max(5, peso * 100))}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      No se pudo cargar la información del modelo desde el microservicio (:8001).
                    </div>
                  )}
                </div>
              )}

              {/* PESTAÑA 2: INGRESO DE MEDICIONES DE CAMPO */}
              {activeTab === 'ingreso' && (
                <div className="space-y-6">
                  {/* Formulario de Registro Rápido */}
                  <form
                    onSubmit={handleGuardarMedicion}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                        <PlusCircle size={15} className="text-blue-700" />
                        Registrar Medición de Temporada
                      </h4>
                      <button
                        type="button"
                        onClick={handleDescargarPlantilla}
                        className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        <Download size={13} /> Descargar plantilla CSV
                      </button>
                    </div>

                    {medicionSuccess && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                        <CheckCircle2 size={16} /> {medicionSuccess}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                          Microcuenca
                        </label>
                        <select
                          value={cuencaId}
                          onChange={(e) => setCuencaId(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                        >
                          <option value="quillcay">Quillcay (Huaraz)</option>
                          <option value="pachacoto">Pachacoto (Pastoruri)</option>
                          <option value="canray_chico">Canray Chico (Olleros)</option>
                          <option value="rio_blanco">Río Blanco (Cátac)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                          Periodo / Año
                        </label>
                        <input
                          type="text"
                          value={periodo}
                          onChange={(e) => setPeriodo(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                          placeholder="2026-humeda"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                          Temporada
                        </label>
                        <select
                          value={temporada}
                          onChange={(e) => setTemporada(e.target.value as any)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                        >
                          <option value="humeda">Lluvias (Húmeda)</option>
                          <option value="seca">Estiaje (Seca)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase text-blue-900 mb-1">
                          pH Mínimo Medido *
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min="1"
                          max="14"
                          value={phMin}
                          onChange={(e) => setPhMin(parseFloat(e.target.value))}
                          className="w-full px-3 py-2 bg-blue-50 border-2 border-blue-400 rounded-xl text-sm font-black text-blue-950"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                          Lluvia (mm)
                        </label>
                        <input
                          type="number"
                          step="5"
                          value={lluviaMm}
                          onChange={(e) => setLluviaMm(parseFloat(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                          Roca Expuesta (km²)
                        </label>
                        <input
                          type="number"
                          step="1"
                          value={rocaExpuestaKm2}
                          onChange={(e) => setRocaExpuestaKm2(parseFloat(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                          % Sulfuros
                        </label>
                        <input
                          type="number"
                          step="1"
                          value={pctSulfuros}
                          onChange={(e) => setPctSulfuros(parseFloat(e.target.value))}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                          Quebrada / Estación de Muestreo
                        </label>
                        <input
                          type="text"
                          value={quebrada}
                          onChange={(e) => setQuebrada(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black uppercase text-slate-600 mb-1">
                          Responsable / Laboratorio
                        </label>
                        <input
                          type="text"
                          value={responsable}
                          onChange={(e) => setResponsable(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={savingMedicion}
                      className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-black rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {savingMedicion ? <RefreshCw size={14} className="animate-spin" /> : <PlusCircle size={14} />}
                      <span>{savingMedicion ? 'Guardando...' : 'Guardar Medición en Base de Datos Central'}</span>
                    </button>
                  </form>

                  {/* Tabla de Mediciones Existentes en SQLite */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                        <Layers size={15} className="text-blue-700" />
                        Historial de Mediciones Guardadas ({mediciones.length})
                      </h4>
                    </div>

                    {mediciones.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 text-center">
                        Aún no hay mediciones registradas en SQLite. Utilice el formulario superior para añadir la primera.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-black">
                              <th className="py-2 px-2">Cuenca</th>
                              <th className="py-2 px-2">Periodo</th>
                              <th className="py-2 px-2">pH Real</th>
                              <th className="py-2 px-2">Lluvia</th>
                              <th className="py-2 px-2">Roca</th>
                              <th className="py-2 px-2">Responsable</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {mediciones.map((m) => (
                              <tr key={m.id} className="hover:bg-slate-50">
                                <td className="py-2 px-2 font-bold text-slate-900 uppercase">{m.cuenca_id}</td>
                                <td className="py-2 px-2 text-slate-600">{m.periodo} ({m.temporada})</td>
                                <td className="py-2 px-2 font-black text-blue-700">{m.ph_min}</td>
                                <td className="py-2 px-2 text-slate-600">{m.lluvia_mm} mm</td>
                                <td className="py-2 px-2 text-slate-600">{m.roca_expuesta_km2} km²</td>
                                <td className="py-2 px-2 text-slate-500 text-[11px]">{m.responsable}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PESTAÑA 3: RE-ENTRENAMIENTO Y AUMENTO DE DATOS */}
              {activeTab === 'reentrenar' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Sliders size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-indigo-950">
                          Aumento de Datos & Simulación Física Guiada
                        </h4>
                        <p className="text-xs text-indigo-800 mt-0.5">
                          Cuando hay pocas mediciones de campo, este proceso combina tus muestras reales con simulaciones de balance ácido-base (Sobek Method / Monte Carlo) para entrenar un modelo robusto sin sobreajuste.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-indigo-200/60">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={aumentarConFisica}
                          onChange={(e) => setAumentarConFisica(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded-md border-indigo-300 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-bold text-indigo-900">
                          Combinar con datos sintéticos basados en física ambiental (Recomendado cuando hay &lt; 30 mediciones)
                        </span>
                      </label>

                      {aumentarConFisica && (
                        <div className="space-y-1 pl-7">
                          <div className="flex justify-between text-xs font-bold text-indigo-900">
                            <span>Cantidad de microcuencas sintéticas:</span>
                            <span>{nSinteticos} cuencas ({nSinteticos * 14} observaciones históricas)</span>
                          </div>
                          <input
                            type="range"
                            min="30"
                            max="200"
                            step="10"
                            value={nSinteticos}
                            onChange={(e) => setNSinteticos(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-indigo-200 rounded-lg cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón de Reentrenamiento con 1 Clic */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm">
                    <div className="max-w-md mx-auto space-y-1">
                      <h4 className="text-base font-black text-slate-900">
                        ¿Listo para actualizar el modelo en producción?
                      </h4>
                      <p className="text-xs text-slate-500">
                        Se tomarán las {mediciones.length} mediciones reales en SQLite
                        {aumentarConFisica ? ` + ${nSinteticos} cuencas sintéticas` : ''} y se entrenará un nuevo ensamble Random Forest de {nArboles} árboles.
                      </p>
                    </div>

                    <button
                      onClick={handleReentrenar}
                      disabled={reentrenando}
                      className="px-8 py-3.5 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                    >
                      <RefreshCw size={18} className={reentrenando ? 'animate-spin' : ''} />
                      <span>{reentrenando ? 'Entrenando Random Forest en vivo...' : 'Re-entrenar Modelo Ahora'}</span>
                    </button>

                    {resultadoReentreno && (
                      <div className={`p-4 rounded-2xl border text-xs font-bold text-left max-w-lg mx-auto ${
                        resultadoReentreno.exito
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-red-50 border-red-300 text-red-900'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          <span className="font-black text-sm">{resultadoReentreno.mensaje}</span>
                        </div>
                        {resultadoReentreno.version_nueva && (
                          <div className="mt-2 space-y-0.5 text-[11px] text-emerald-800">
                            <div>• Nueva versión guardada: <strong className="font-mono">{resultadoReentreno.version_nueva}</strong></div>
                            <div>• Total filas entrenadas: <strong>{resultadoReentreno.n_filas}</strong> ({resultadoReentreno.fuente_datos})</div>
                            {resultadoReentreno.metricas && (
                              <div>• Métricas validación: R²: <strong>{resultadoReentreno.metricas.r2}</strong> | MAE pH: <strong>±{resultadoReentreno.metricas.mae_ph}</strong> | Acierto: <strong>{Math.round(resultadoReentreno.metricas.acierto_nivel * 100)}%</strong></div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
