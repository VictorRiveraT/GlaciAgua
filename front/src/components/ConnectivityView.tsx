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
  Radio,
  Signal,
  MapPin,
  Compass,
  Layers,
  Info,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Navigation,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'

export const ConnectivityView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layersGroupRef = useRef<{ [key: string]: L.LayerGroup }>({})

  const [selectedPoint, setSelectedPoint] = useState<ConnectivityPoint | null>(null)
  const [filterType, setFilterType] = useState<'all' | ConnectivityType>('all')
  const [selectedBasinFocus, setSelectedBasinFocus] = useState<string>('all')
  const [showZones, setShowZones] = useState<boolean>(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locating, setLocating] = useState<boolean>(false)

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

    // Satélite HD de Máxima Calidad con Toponimia Oficial (Google Hybrid)
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

    // ResizeObserver para ajuste perfecto de dimensiones
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current)
    }

    const t1 = setTimeout(() => map.invalidateSize(), 150)
    const t2 = setTimeout(() => map.invalidateSize(), 500)

    // Layer groups
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

  // Render Zones & Points
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const { zones: zonesGroup, points: pointsGroup } = layersGroupRef.current
    if (!zonesGroup || !pointsGroup) return

    zonesGroup.clearLayers()
    pointsGroup.clearLayers()

    // 1. Zonas de Cobertura (4G, 3G rural, Zona Sombra)
    if (showZones) {
      CONNECTIVITY_ZONES.forEach((zone) => {
        const polygon = L.polygon(zone.coordenadas, {
          color: zone.color,
          fillColor: zone.fillColor,
          fillOpacity: zone.tipo === 'zona_sombra' ? 0.25 : 0.18,
          weight: 2,
          dashArray: zone.tipo === 'zona_sombra' ? '6, 6' : undefined,
          lineCap: 'round',
          lineJoin: 'round',
        })

        polygon.bindTooltip(
          `<div style="font-family: 'DM Sans', sans-serif;">
            <strong style="color: ${zone.color}; font-size: 11px; display: block;">${zone.nombre}</strong>
            <span style="font-size: 10px; color: #475569;">${zone.descripcion}</span>
          </div>`,
          { sticky: true }
        )

        zonesGroup.addLayer(polygon)
      })
    }

    // 2. Puntos de Conexión y Antenas
    const filteredPoints = CONNECTIVITY_POINTS.filter((p) => {
      const matchesType = filterType === 'all' || p.tipo === filterType
      const matchesBasin =
        selectedBasinFocus === 'all' || p.cuencaCercana.toLowerCase().includes(selectedBasinFocus.toLowerCase())
      return matchesType && matchesBasin
    })

    filteredPoints.forEach((point) => {
      const isSelected = selectedPoint?.id === point.id

      // Color e ícono según tipo
      let badgeBg = '#3346a8'
      let badgeIcon = '📶'
      let badgeLabel = 'WiFi Libre'

      if (point.tipo === 'tambo_satelital') {
        badgeBg = '#059669'
        badgeIcon = '🏛️'
        badgeLabel = 'Tambo MIDIS'
      } else if (point.tipo === 'antena_movil') {
        badgeBg = '#7c3aed'
        badgeIcon = '📡'
        badgeLabel = point.tecnologia
      } else if (point.tipo === 'puesto_salud') {
        badgeBg = '#0284c7'
        badgeIcon = '🏥'
        badgeLabel = 'Puesto Salud'
      } else if (point.tipo === 'zona_sombra') {
        badgeBg = '#dc2626'
        badgeIcon = '⚠️'
        badgeLabel = 'Sin Señal'
      }

      const customIcon = L.divIcon({
        className: 'custom-connectivity-marker',
        html: `
          <div style="
            background: ${badgeBg};
            color: white;
            border: 2px solid ${isSelected ? '#00f0ff' : 'white'};
            border-radius: 999px;
            padding: 3px 8px;
            font-size: 10px;
            font-weight: 900;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            white-space: nowrap;
            transform: translate(-50%, -50%);
            cursor: pointer;
            scale: ${isSelected ? '1.15' : '1.0'};
            transition: all 0.2s ease;
          ">
            <span>${badgeIcon}</span>
            <span>${point.tieneWifiLibre ? 'WiFi Libre' : badgeLabel}</span>
          </div>
        `,
        iconSize: [0, 0],
      })

      const marker = L.marker([point.lat, point.lng], { icon: customIcon })

      marker.on('click', () => {
        setSelectedPoint(point)
        map.flyTo([point.lat, point.lng], 14, { duration: 1.2 })
      })

      marker.bindTooltip(
        `<div style="font-family: 'DM Sans', sans-serif; max-width: 220px;">
          <strong style="color: ${badgeBg}; font-size: 11px; display: block;">${point.nombre}</strong>
          <span style="font-size: 10px; color: #334155; display: block; margin-top: 2px;">${point.operador}</span>
          <span style="font-size: 9.5px; color: #059669; font-weight: bold;">${point.tieneWifiLibre ? '✓ Acceso Gratuito a Internet' : 'Señal Móvil'}</span>
        </div>`,
        { sticky: true }
      )

      pointsGroup.addLayer(marker)
    })
  }, [filterType, selectedBasinFocus, showZones, selectedPoint])

  // Geolocalización del usuario
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización satelital.')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation(coords)

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 14, { duration: 1.5 })

          const userMarker = L.marker([coords.lat, coords.lng], {
            icon: L.divIcon({
              className: 'custom-user-marker',
              html: `
                <div style="
                  background: #00f0ff;
                  border: 3px solid white;
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  box-shadow: 0 0 16px rgba(0,240,255,0.8);
                  transform: translate(-50%, -50%);
                "></div>
              `,
              iconSize: [0, 0],
            }),
          })
          userMarker.bindTooltip('📍 Tu ubicación actual', { permanent: true, direction: 'top' })
          userMarker.addTo(mapInstanceRef.current)
        }
      },
      (err) => {
        setLocating(false)
        console.warn('Geolocation error:', err)
        alert('No se pudo obtener la ubicación GPS precisa. Puedes explorar el mapa manualmente.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const focusPoint = (point: ConnectivityPoint) => {
    setSelectedPoint(point)
    mapInstanceRef.current?.flyTo([point.lat, point.lng], 14, { duration: 1.2 })
  }

  return (
    <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden relative select-none bg-[#eef2f1]">
      {/* Left Information & Community Guide Sidebar */}
      <aside className="w-full lg:w-96 bg-white border-r border-[#dfe7e5] flex flex-col h-auto lg:h-full shrink-0 shadow-sm z-20 overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-[#dfe7e5] bg-[#fafbfb]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3346a8]">
              Guía de Señal e Internet Rural
            </span>
          </div>
          <h1 className="text-xl font-black text-[#172726] tracking-tight">
            Mapa de Conexión
          </h1>
          <p className="text-xs text-[#667573] mt-1 leading-relaxed">
            Encuentra tambos con internet satelital libre, plazas con WiFi gratuito y zonas con cobertura móvil para sincronizar tus reportes de agua.
          </p>

          {/* Quick GPS Locator Button */}
          <button
            onClick={handleLocateMe}
            disabled={locating}
            className="mt-3 w-full py-2 px-3 rounded-xl bg-[#3346a8] hover:bg-[#25368f] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Navigation size={14} className={locating ? 'animate-spin' : ''} />
            <span>{locating ? 'Localizando GPS satelital...' : 'Buscar punto más cercano a mí'}</span>
          </button>
        </div>

        {/* Guía Rápida para el Poblador sin Megas ni Señal */}
        <div className="p-4 bg-[#eff6ff] border-b border-[#dbeafe]">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#3346a8] text-white flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck size={16} />
            </div>
            <div>
              <strong className="text-xs font-black text-[#1e3a8a] block">
                ¿No tienes saldo o estás en la montaña?
              </strong>
              <p className="text-[11px] text-[#2563eb] mt-1 leading-snug">
                GlaciAgua funciona <strong>100% sin internet</strong> en tu teléfono. Guarda tus fotos y mediciones; cuando llegues a cualquiera de estos puntos verdes, la app se sincronizará sola.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Chips by Type */}
        <div className="p-3 border-b border-[#dfe7e5] bg-white">
          <span className="text-[11px] font-black text-[#667573] block mb-2">Filtrar Puntos de Conexión:</span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'wifi_libre', label: '📶 WiFi Libre' },
              { id: 'tambo_satelital', label: '🏛️ Tambos MIDIS' },
              { id: 'antena_movil', label: '📡 Antenas 4G/3G' },
              { id: 'zona_sombra', label: '⚠️ Sin Señal' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilterType(btn.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  filterType === btn.id
                    ? 'bg-[#3346a8] text-white shadow-xs'
                    : 'bg-[#f0f4f3] text-[#667573] hover:bg-[#e4eae8]'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Connectivity Points */}
        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
          <span className="text-[11px] font-black text-[#667573] block px-1">
            Puntos Disponibles ({CONNECTIVITY_POINTS.filter((p) => filterType === 'all' || p.tipo === filterType).length}):
          </span>

          {CONNECTIVITY_POINTS.filter((p) => filterType === 'all' || p.tipo === filterType).map((point) => {
            const isSel = selectedPoint?.id === point.id
            return (
              <button
                key={point.id}
                onClick={() => focusPoint(point)}
                className={`w-full p-3 rounded-2xl text-left border transition-all flex flex-col gap-1.5 ${
                  isSel
                    ? 'bg-[#edf0ff] border-[#3346a8] shadow-sm'
                    : 'bg-white hover:bg-[#fafbfb] border-[#dfe7e5]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md text-white ${
                      point.tipo === 'tambo_satelital'
                        ? 'bg-[#059669]'
                        : point.tipo === 'wifi_libre'
                        ? 'bg-[#3346a8]'
                        : point.tipo === 'zona_sombra'
                        ? 'bg-[#dc2626]'
                        : 'bg-[#7c3aed]'
                    }`}
                  >
                    {point.tipo === 'tambo_satelital'
                      ? 'Tambo Satelital'
                      : point.tipo === 'wifi_libre'
                      ? 'WiFi Gratuito'
                      : point.tipo === 'zona_sombra'
                      ? 'Zona Sombra'
                      : point.tecnologia}
                  </span>

                  <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                    <Clock size={11} /> {point.horario}
                  </span>
                </div>

                <h4 className="text-xs font-black text-[#172726] leading-tight">
                  {point.nombre}
                </h4>

                <p className="text-[11px] text-[#667573] line-clamp-2 leading-relaxed">
                  {point.descripcion}
                </p>

                <div className="pt-1.5 border-t border-[#f0f4f3] flex items-center justify-between text-[10px]">
                  <span className="text-[#3346a8] font-bold">
                    {point.tieneWifiLibre ? '✓ Sin costo (Libre)' : 'Telefonía Celular'}
                  </span>
                  <span className="text-gray-400 font-medium">Ver en mapa →</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#dfe7e5] bg-[#fafbfb] text-[10.5px] text-[#667573] flex items-center gap-2">
          <Info size={14} className="text-[#3346a8] shrink-0" />
          <span>Datos coordinados con el MTC y el programa PAIS de Tambos.</span>
        </div>
      </aside>

      {/* Main Interactive Map Area */}
      <main className="flex-1 h-full min-h-0 w-full relative overflow-hidden flex flex-col">
        {/* Leaflet Satellite Map */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-[#0f172a]" />

        {/* Top Floating Map Controls */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-80px)] pointer-events-auto">
          {/* Badge */}
          <div className="bg-[#172726]/95 text-white backdrop-blur-md rounded-2xl px-3.5 py-1.5 shadow-lg border border-slate-700/60 flex items-center gap-2">
            <Radio size={14} className="text-emerald-400" />
            <span className="text-xs font-black tracking-wide">Cobertura e Internet Satelital</span>
          </div>

          {/* Toggle Zonas de Cobertura */}
          <button
            onClick={() => setShowZones((prev) => !prev)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg backdrop-blur-md border ${
              showZones
                ? 'bg-white text-[#3346a8] border-white'
                : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-white'
            }`}
          >
            <Layers size={13} />
            <span>{showZones ? 'Zonas 4G/3G Visibles' : 'Ocultar Zonas'}</span>
          </button>
        </div>

        {/* Floating Detail Card for Selected Point */}
        {selectedPoint && (
          <div className="absolute bottom-6 right-6 z-30 w-84 max-w-[calc(100%-3rem)] bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-[#dfe7e5] animate-in fade-in slide-in-from-bottom-3 pointer-events-auto">
            <div className="flex items-start justify-between border-b border-[#e2e8f0] pb-2 mb-2">
              <div>
                <span
                  className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md text-white inline-block mb-1 ${
                    selectedPoint.tipo === 'tambo_satelital'
                      ? 'bg-[#059669]'
                      : selectedPoint.tipo === 'wifi_libre'
                      ? 'bg-[#3346a8]'
                      : selectedPoint.tipo === 'zona_sombra'
                      ? 'bg-[#dc2626]'
                      : 'bg-[#7c3aed]'
                  }`}
                >
                  {selectedPoint.tecnologia}
                </span>
                <h3 className="text-sm font-black text-slate-900 leading-tight">
                  {selectedPoint.nombre}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <p className="leading-relaxed">{selectedPoint.descripcion}</p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1">
                <div>
                  <strong className="text-slate-800">Operador:</strong> {selectedPoint.operador}
                </div>
                <div>
                  <strong className="text-slate-800">Horario:</strong> {selectedPoint.horario}
                </div>
                <div>
                  <strong className="text-slate-800">Cuenca:</strong> {selectedPoint.cuencaCercana}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-emerald-900">
                <span className="font-bold flex items-center gap-1 text-[11px] mb-0.5">
                  <Sparkles size={13} className="text-emerald-600" /> Consejo Comunitario:
                </span>
                <span className="text-[10.5px] leading-snug block">
                  {selectedPoint.recomendacion}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Semáforo de Conexión Legend */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-[#dfe7e5] text-xs max-w-xs hidden sm:block">
          <strong className="text-[11px] font-black text-[#172726] block mb-2 flex items-center gap-1.5">
            <Signal size={13} className="text-[#3346a8]" /> Semáforo de Cobertura
          </strong>

          <div className="space-y-1.5 text-[10.5px]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#16a34a] border border-white shrink-0" />
              <span><strong>4G LTE Pleno:</strong> Valle del Río Santa (Huaraz, Cátac)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#eab308] border border-white shrink-0" />
              <span><strong>3G/2G Rural:</strong> Laderas y pueblos intermedios (Unchus, Llupa)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#dc2626] border border-white shrink-0" />
              <span><strong>Zona Sombra:</strong> Quebradas glaciares (Modo Offline Activo)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
