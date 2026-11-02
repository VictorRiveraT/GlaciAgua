import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  CONNECTIVITY_POINTS,
  CONNECTIVITY_ZONES,
  ConnectivityPoint,
  ConnectivityType,
} from '../data/connectivityData'
import {
  Wifi,
  Navigation,
  ChevronDown,
  ChevronUp,
  X,
  PhoneCall,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react'

export const ConnectivityView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layersGroupRef = useRef<{ [key: string]: L.LayerGroup }>({})

  const [selectedPoint, setSelectedPoint] = useState<ConnectivityPoint | null>(null)
  const [filterType, setFilterType] = useState<'all' | ConnectivityType>('all')
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isMobilePanelCollapsed, setIsMobilePanelCollapsed] = useState(false)
  const [locating, setLocating] = useState(false)

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id
    }

    const map = L.map(mapContainerRef.current, {
      center: [-9.53, -77.46],
      zoom: 11,
      minZoom: 8,
      maxZoom: 21,
      zoomControl: false,
    })

    mapInstanceRef.current = map

    // Satélite HD de Máxima Calidad
    const satLayer = L.tileLayer(
      'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      {
        subdomains: ['0', '1', '2', '3'],
        attribution: 'Imágenes Satelitales &copy; Google, Maxar Technologies',
        maxZoom: 21,
        maxNativeZoom: 20,
      }
    )
    satLayer.addTo(map)

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current)
    }

    const t1 = setTimeout(() => map.invalidateSize(), 150)
    const t2 = setTimeout(() => map.invalidateSize(), 500)

    const zonesGroup = L.layerGroup().addTo(map)
    const pointsGroup = L.layerGroup().addTo(map)

    layersGroupRef.current = {
      zones: zonesGroup,
      points: pointsGroup,
    }

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      resizeObserver.disconnect()
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Render Vector Layers
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const { zones: zonesGroup, points: pointsGroup } = layersGroupRef.current
    if (!zonesGroup || !pointsGroup) return

    zonesGroup.clearLayers()
    pointsGroup.clearLayers()

    const hasHover =
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: hover)').matches

    // 1. Zonas de conectividad
    CONNECTIVITY_ZONES.forEach((zone) => {
      const polygon = L.polygon(zone.coordenadas, {
        color: zone.color,
        fillColor: zone.fillColor,
        fillOpacity: 0.22,
        weight: 2,
        dashArray: zone.tipo === 'zona_sombra' ? '4, 4' : undefined,
      })

      // Hover escritorio: tooltip de 1 línea con el nombre
      if (hasHover) {
        polygon.bindTooltip(`<strong>${zone.nombre}</strong>`, { sticky: true })
      }

      zonesGroup.addLayer(polygon)
    })

    // 2. Puntos de conectividad
    const filteredPoints = CONNECTIVITY_POINTS.filter(
      (p) => filterType === 'all' || p.tipo === filterType
    )

    filteredPoints.forEach((point) => {
      let iconSymbol = '📶'
      let badgeBg = '#2563eb'

      if (point.tipo === 'tambo_satelital') {
        iconSymbol = '🏛️'
        badgeBg = '#16a34a'
      } else if (point.tipo === 'antena_movil') {
        iconSymbol = '📡'
        badgeBg = '#7c3aed'
      } else if (point.tipo === 'zona_sombra') {
        iconSymbol = '⚠️'
        badgeBg = '#dc2626'
      }

      const isSelected = selectedPoint?.id === point.id

      const customIcon = L.divIcon({
        className: 'custom-conn-icon',
        html: `
          <div style="
            background: ${badgeBg};
            color: white;
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '16px' : '13px'};
            transform: translate(-50%, -50%);
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            ${iconSymbol}
          </div>
        `,
        iconSize: [0, 0],
      })

      const marker = L.marker([point.lat, point.lng], { icon: customIcon })

      // Hover escritorio: tooltip de 1 línea con el nombre
      if (hasHover) {
        marker.bindTooltip(`<strong>${point.nombre}</strong>`, { sticky: true })
      }

      // Tap/Click: abre bottom sheet/tarjeta con detalles
      marker.on('click', () => {
        setSelectedPoint(point)
      })

      pointsGroup.addLayer(marker)
    })
  }, [filterType, selectedPoint])

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 13, { duration: 1.2 })

          const userMarker = L.marker([coords.lat, coords.lng], {
            icon: L.divIcon({
              className: 'custom-user-marker',
              html: `
                <div style="
                  background: #1e3a8a;
                  border: 3px solid white;
                  width: 20px;
                  height: 20px;
                  border-radius: 50%;
                  box-shadow: 0 0 16px rgba(30,58,138,0.8);
                  transform: translate(-50%, -50%);
                "></div>
              `,
              iconSize: [0, 0],
            }),
          })
          userMarker.bindTooltip('📍 Tu ubicación', { sticky: true })
          userMarker.addTo(mapInstanceRef.current)
        }
      },
      (err) => {
        setLocating(false)
        console.warn('Geolocation error:', err)
        alert('No se pudo obtener el GPS. Puedes explorar el mapa tocando los puntos.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const focusPoint = (point: ConnectivityPoint) => {
    setSelectedPoint(point)
    mapInstanceRef.current?.flyTo([point.lat, point.lng], 14, { duration: 1.2 })
  }

  return (
    <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden relative select-none bg-slate-900">
      {/* MAPA PRINCIPAL (Ocupa todo el espacio) */}
      <div className="flex-1 h-full w-full relative">
        <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-[#0f172a]" />
      </div>

      {/* PANEL IZQUIERDO (En escritorio) / TARJETA COLAPSABLE (En celular) */}
      <div
        className={`z-20 transition-all duration-300 pointer-events-auto ${
          // En escritorio: panel lateral fijo
          'lg:static lg:w-96 lg:h-full lg:bg-white lg:border-r lg:border-slate-200 lg:shadow-xl lg:flex lg:flex-col lg:overflow-y-auto ' +
          // En celular: tarjeta flotante en la parte superior del mapa
          'absolute top-3 left-3 right-3 lg:top-auto lg:left-auto lg:right-auto bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 shadow-2xl p-3 sm:p-4'
        }`}
      >
        {/* Toggle para colapsar en celular */}
        <div className="lg:hidden flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <strong className="text-xs font-black text-slate-800">Ruta del Agua y Conexión</strong>
          </div>
          <button
            type="button"
            onClick={() => setIsMobilePanelCollapsed(!isMobilePanelCollapsed)}
            className="touch-target p-1 text-slate-500 hover:text-slate-900 font-bold text-xs flex items-center gap-1"
          >
            <span>{isMobilePanelCollapsed ? 'Ver panel' : 'Ocultar'}</span>
            {isMobilePanelCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>

        {/* Contenido (ocultable en móvil si está colapsado) */}
        {(!isMobilePanelCollapsed || window.innerWidth >= 1024) && (
          <div className="space-y-3.5">
            {/* Título de sección en escritorio */}
            <div className="hidden lg:block pb-2 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase text-[#1e3a8a] bg-[#eff6ff] px-2.5 py-0.5 rounded-full inline-block mb-1">
                Monitoreo Territorial
              </span>
              <h1 className="text-xl font-black text-[#0f172a] tracking-tight">
                Mapa de Conexión
              </h1>
            </div>

            {/* CADENA VISUAL SIMPLE: Glaciar → Quebrada → Comunidad */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[10px] font-black uppercase text-[#1e3a8a] tracking-wider block mb-2 text-center sm:text-left">
                Ruta del Agua en la Cordillera
              </span>
              <div className="flex items-center justify-between gap-1 text-center">
                {/* Eslabón 1: Glaciar */}
                <div className="flex-1 flex flex-col items-center p-2 rounded-xl bg-sky-50 border border-sky-100">
                  <span className="text-xl mb-0.5">❄️</span>
                  <strong className="text-xs font-black text-sky-950">Glaciar</strong>
                  <span className="text-[10px] font-bold text-sky-700">Deshielo</span>
                </div>

                <span className="text-slate-400 font-black text-sm">→</span>

                {/* Eslabón 2: Quebrada */}
                <div className="flex-1 flex flex-col items-center p-2 rounded-xl bg-amber-50 border border-amber-100">
                  <span className="text-xl mb-0.5">💧</span>
                  <strong className="text-xs font-black text-amber-950">Quebrada</strong>
                  <span className="text-[10px] font-bold text-amber-700">Minerales</span>
                </div>

                <span className="text-slate-400 font-black text-sm">→</span>

                {/* Eslabón 3: Comunidad */}
                <div className="flex-1 flex flex-col items-center p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-xl mb-0.5">🏡</span>
                  <strong className="text-xs font-black text-emerald-950">Comunidad</strong>
                  <span className="text-[10px] font-bold text-emerald-700">Prevención</span>
                </div>
              </div>
            </div>

            {/* Botón de Geolocalización GPS */}
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={locating}
              className="touch-target w-full py-2.5 px-3 rounded-2xl bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
            >
              <Navigation size={14} className={locating ? 'animate-spin' : ''} />
              <span>{locating ? 'Buscando con GPS...' : 'Mi ubicación en el mapa'}</span>
            </button>

            {/* DESPLEGABLE "MÁS DETALLES" (Filtros y Puntos Técnicos) */}
            <div className="border-t border-slate-200 pt-2">
              <button
                type="button"
                onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                className="touch-target w-full flex items-center justify-between text-xs font-black text-slate-700 hover:text-slate-900 py-1"
                aria-expanded={isDetailsOpen}
              >
                <div className="flex items-center gap-1.5">
                  <Info size={16} className="text-[#1e3a8a]" />
                  <span>{isDetailsOpen ? 'Ocultar detalles' : 'Más detalles y lista de tambos'}</span>
                </div>
                {isDetailsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isDetailsOpen && (
                <div className="mt-2 space-y-3 pt-2 border-t border-slate-100 animate-in fade-in">
                  {/* Filtros */}
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                      Filtrar por tipo:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { id: 'all', label: 'Todos' },
                        { id: 'tambo_satelital', label: '🏛️ Tambos' },
                        { id: 'wifi_libre', label: '📶 WiFi libre' },
                        { id: 'antena_movil', label: '📡 Antenas' },
                        { id: 'zona_sombra', label: '⚠️ Sin señal' },
                      ].map((btn) => (
                        <button
                          key={btn.id}
                          type="button"
                          onClick={() => setFilterType(btn.id as any)}
                          className={`touch-target px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                            filterType === btn.id
                              ? 'bg-[#1e3a8a] text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lista de Puntos */}
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {CONNECTIVITY_POINTS.filter(
                      (p) => filterType === 'all' || p.tipo === filterType
                    ).map((point) => (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => focusPoint(point)}
                        className={`touch-target w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between gap-2 ${
                          selectedPoint?.id === point.id
                            ? 'bg-blue-50 border-blue-400'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        <div className="truncate">
                          <strong className="text-xs font-bold text-slate-900 block truncate">
                            {point.nombre}
                          </strong>
                          <span className="text-[10px] text-slate-500">{point.operador}</span>
                        </div>
                        <span className="text-xs shrink-0">
                          {point.tipo === 'tambo_satelital' ? '🏛️' : point.tipo === 'wifi_libre' ? '📶' : '📡'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM SHEET / TARJETA PARA PUNTO SELECCIONADO (Cierra con X grande o tocar fuera) */}
      {selectedPoint && (
        <>
          {/* Backdrop que cierra al tocar fuera */}
          <div
            onClick={() => setSelectedPoint(null)}
            className="fixed inset-0 z-30 bg-black/25 backdrop-blur-2xs transition-opacity"
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="point-sheet-title"
            className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-40 bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
              <div>
                <span className="text-[10px] font-black uppercase text-[#1e3a8a] bg-[#eff6ff] px-2 py-0.5 rounded-full inline-block mb-1">
                  Punto de Conexión
                </span>
                <h3 id="point-sheet-title" className="text-base sm:text-lg font-black text-[#0f172a] leading-tight">
                  {selectedPoint.nombre}
                </h3>
              </div>

              {/* Botón X grande para cerrar */}
              <button
                type="button"
                onClick={() => setSelectedPoint(null)}
                className="touch-target w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                aria-label="Cerrar detalle de punto"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">{selectedPoint.descripcion}</p>

            <div className="space-y-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 font-bold">
                <Clock size={14} className="text-slate-500" />
                <span>Horario: {selectedPoint.horario}</span>
              </div>
              <div>
                <strong>Operador / Red:</strong> {selectedPoint.operador}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
