import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { BasinData, RealMeasurement, RiskLevel, Season } from '../types'
import { REAL_GEOGRAPHIC_FEATURES } from '../data/basinsData'
import { CONNECTIVITY_POINTS } from '../data/connectivityData'
import {
  FLUVIAL_HAZARD_CORRIDORS,
  FluvialHazardCorridor,
  DAR_HAZARD_HOTSPOTS,
  REAL_VALLEY_BOFEDALES,
} from '../data/geoBoundaries'
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Droplet,
  Wifi,
  Compass,
  MapPin,
  AlertOctagon,
  Flame,
  X,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react'
import { chaikinSmoothLine, chaikinSmoothPolygon, LatLngCoord } from '../utils/geoSmoothing'
import { loadBasinsGeoJson, getBasinPolygonCoords } from '../utils/basinGeoJson'
import { getRiskTheme } from '../utils/accessibleTheme'
import { useI18n } from '../i18n/I18nContext'
import { Illustration } from './Illustration'

interface InteractiveMapProps {
  basins: BasinData[]
  selectedBasin: BasinData | null
  onSelectBasin: (basin: BasinData) => void
  season: Season
  measurements: RealMeasurement[]
  onOpenDetails?: (basin: BasinData) => void
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  basins,
  selectedBasin,
  onSelectBasin,
  season,
  measurements,
  onOpenDetails,
}) => {
  const { t } = useI18n()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layersGroupRef = useRef<{ [key: string]: L.LayerGroup }>({})
  const [legendOpen, setLegendOpen] = useState(false)
  const [layersModalOpen, setLayersModalOpen] = useState(false)
  const [dangerFilter, setDangerFilter] = useState<'all' | 'Critico' | 'Alto' | 'Medio' | 'Bajo'>('all')
  const [selectedCorridor, setSelectedCorridor] = useState<FluvialHazardCorridor | null>(null)
  const [geoJsonPolygons, setGeoJsonPolygons] = useState<Record<string, LatLngCoord[]> | null>(null)
  const [sheetBasin, setSheetBasin] = useState<BasinData | null>(null)

  // Capas por defecto: cuencas, rios y lineas de subcuencas/quebradas activas
  const [layersState, setLayersState] = useState({
    cuencas: true,
    rios: true,
    corredores: true,
    hotspotsDAR: false,
    bofedales: false,
    glaciares: false,
    monitoreo: false,
    conectividad: false,
  })

  // Load external GeoJSON on mount
  useEffect(() => {
    let isMounted = true
    loadBasinsGeoJson().then((data) => {
      if (isMounted && data) {
        setGeoJsonPolygons(data)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  const toggleLayer = (layerKey: keyof typeof layersState) => {
    setLayersState((prev) => {
      const next = { ...prev, [layerKey]: !prev[layerKey] }
      const group = layersGroupRef.current[layerKey]
      if (group && mapInstanceRef.current) {
        if (next[layerKey]) {
          mapInstanceRef.current.addLayer(group)
        } else {
          mapInstanceRef.current.removeLayer(group)
        }
      }
      return next
    })
  }

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'Alto':
        return '#b91c1c'
      case 'Medio':
        return '#b45309'
      case 'Bajo':
        return '#15803d'
    }
  }

  // Count active advanced layers
  const activeAdvancedCount = [
    layersState.corredores,
    layersState.hotspotsDAR,
    layersState.bofedales,
    layersState.glaciares,
    layersState.monitoreo,
    layersState.conectividad,
  ].filter(Boolean).length

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id
    }

    // Default center and zoom showing all 4 basins of Callejón de Huaylas
    // En móviles < 640px, encuadre directo a los bounds de las 4 cuencas con margen seguro
    const isMobile = window.innerWidth < 640
    const allBasinsBounds: L.LatLngBoundsExpression = [
      [-10.05, -77.65], // Suroeste (Pachacoto y Río Blanco)
      [-9.35, -77.05],  // Noreste (Quillcay)
    ]

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      zoomSnap: 0.5,
      minZoom: 8,
      maxZoom: 22,
    })

    if (isMobile) {
      map.fitBounds(allBasinsBounds, {
        paddingTopLeft: [12, 60],
        paddingBottomRight: [12, 110],
      })
    } else {
      map.setView([-9.55, -77.45], 10)
    }

    mapInstanceRef.current = map

    // Base satellite tile layer
    const satLayer = L.tileLayer(
      'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      {
        subdomains: ['0', '1', '2', '3'],
        attribution: 'Imágenes Satelitales &copy; Google, Maxar Technologies',
        maxZoom: 22,
        maxNativeZoom: 20,
      }
    )
    satLayer.addTo(map)

    // Grupos de capas: cuencas, rios y lineas de subcuencas activas al cargar
    const cuencasGroup = L.layerGroup().addTo(map)
    const riosGroup = L.layerGroup().addTo(map)
    const corredoresGroup = L.layerGroup().addTo(map)
    const hotspotsGroup = L.layerGroup()
    const bofedalesGroup = L.layerGroup()
    const glaciaresGroup = L.layerGroup()
    const monitoreoGroup = L.layerGroup()
    const conectividadGroup = L.layerGroup()

    layersGroupRef.current = {
      cuencas: cuencasGroup,
      rios: riosGroup,
      corredores: corredoresGroup,
      hotspotsDAR: hotspotsGroup,
      bofedales: bofedalesGroup,
      glaciares: glaciaresGroup,
      monitoreo: monitoreoGroup,
      conectividad: conectividadGroup,
    }

    // Observer for container resize
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize()
      }
    })
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current)
    }

    const t1 = setTimeout(() => map.invalidateSize(), 200)

    return () => {
      clearTimeout(t1)
      resizeObserver.disconnect()
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update Vector Layers
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const {
      cuencas: cuencasGroup,
      corredores: corredoresGroup,
      hotspotsDAR: hotspotsGroup,
      bofedales: bofedalesGroup,
      glaciares: glaciaresGroup,
      monitoreo: monitoreoGroup,
      rios: riosGroup,
      conectividad: conectividadGroup,
    } = layersGroupRef.current

    if (!cuencasGroup) return

    // Clear all layers
    cuencasGroup.clearLayers()
    corredoresGroup.clearLayers()
    hotspotsGroup.clearLayers()
    bofedalesGroup.clearLayers()
    glaciaresGroup.clearLayers()
    monitoreoGroup.clearLayers()
    riosGroup.clearLayers()
    conectividadGroup?.clearLayers()

    // 1. Polígonos de Cuencas Hidrográficas con Chaikin Smoothing y Semáforo
    basins.forEach((basin) => {
      const rawCoords = getBasinPolygonCoords(basin, geoJsonPolygons)
      if (!rawCoords || rawCoords.length === 0) return

      const smoothedCoords = chaikinSmoothPolygon(rawCoords, 2)
      const risk = basin.nivelRiesgo[season]
      const color = getRiskColor(risk)
      const isSelected = selectedBasin?.id === basin.id
      const theme = getRiskTheme(risk)

      // Casing / Sombra de contraste
      const casing = L.polygon(smoothedCoords, {
        color: '#020617',
        fill: false,
        weight: isSelected ? 6.5 : 4.5,
        opacity: isSelected ? 0.95 : 0.75,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false,
      })
      cuencasGroup.addLayer(casing)

      // Polígono con relleno semitransparente según semáforo
      const polygon = L.polygon(smoothedCoords, {
        color: isSelected ? '#38bdf8' : color,
        fillColor: color,
        fillOpacity: isSelected ? 0.28 : 0.16,
        weight: isSelected ? 4 : 2.8,
        opacity: 1.0,
        dashArray: isSelected ? undefined : '8, 6',
        lineCap: 'round',
        lineJoin: 'round',
      })

      polygon.on('click', () => {
        onSelectBasin(basin)
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
          setSheetBasin(basin)
        }
      })

      polygon.on('mouseover', () => {
        polygon.setStyle({ weight: 5, fillOpacity: 0.35 })
      })

      polygon.on('mouseout', () => {
        polygon.setStyle({
          weight: isSelected ? 4 : 2.8,
          fillOpacity: isSelected ? 0.28 : 0.16,
        })
      })

      if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
        polygon.bindTooltip(`<strong>Cuenca ${basin.nombre}</strong>`, { sticky: true })
      }

      cuencasGroup.addLayer(polygon)

      // Distintivo de semáforo en centroide accesible con forma geométrica
      const shapeSymbol = theme.iconName === 'octagon' ? '🛑' : theme.iconName === 'triangle' ? '⚠️' : '✓'

      const centerMarker = L.marker(basin.centroide, {
        icon: L.divIcon({
          className: 'custom-basin-badge',
          html: `<div style="
            background: #ffffff;
            border: 2px solid ${color};
            border-radius: 999px;
            padding: 4px 12px;
            font-size: 12px;
            font-weight: 900;
            color: #0f172a;
            box-shadow: 0 4px 14px rgba(0,0,0,0.25);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            transform: translate(-50%, -50%);
          ">
            <span style="font-size: 13px;">${shapeSymbol}</span>
            <span>Cuenca ${basin.nombre}</span>
          </div>`,
          iconSize: [0, 0],
        }),
      })

      centerMarker.on('click', () => {
        onSelectBasin(basin)
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
          setSheetBasin(basin)
        }
      })
      cuencasGroup.addLayer(centerMarker)
    })

    // 2. Río Santa: Colector Principal suavizado con Chaikin
    const smoothedSanta = chaikinSmoothLine(REAL_GEOGRAPHIC_FEATURES.rioSanta, 2)
    const rioSantaGlow = L.polyline(smoothedSanta, {
      color: '#38bdf8',
      weight: 7,
      opacity: 0.4,
      lineCap: 'round',
      lineJoin: 'round',
    })
    const rioSantaLine = L.polyline(smoothedSanta, {
      color: '#0284c7',
      weight: 3.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    })
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
      rioSantaLine.bindTooltip('<strong>Río Santa</strong>', { sticky: true })
    }
    riosGroup.addLayer(rioSantaGlow)
    riosGroup.addLayer(rioSantaLine)

    // Ciudades en la capa de ríos / base
    REAL_GEOGRAPHIC_FEATURES.ciudades.forEach((c) => {
      const ciudadMarker = L.marker(c.coords, {
        icon: L.divIcon({
          className: 'custom-city-marker',
          html: `<div style="
            background: ${c.principal ? '#1e3a8a' : '#ffffff'};
            color: ${c.principal ? '#ffffff' : '#0f172a'};
            border: 1.5px solid ${c.principal ? '#ffffff' : '#64748b'};
            border-radius: 6px;
            padding: 2px 7px;
            font-size: 11px;
            font-weight: 800;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            white-space: nowrap;
            transform: translate(-50%, -50%);
          ">
            ${c.nombre}
          </div>`,
          iconSize: [0, 0],
        }),
      })
      riosGroup.addLayer(ciudadMarker)
    })

    // 3. Corredores Fluviales (capa opcional avanzada)
    const corridorsToRender = FLUVIAL_HAZARD_CORRIDORS.filter(
      (c) => dangerFilter === 'all' || c.nivelPeligro === dangerFilter
    )

    corridorsToRender.forEach((corridor) => {
      const smoothedThalweg = chaikinSmoothLine(corridor.thalweg, 2)
      const handleSelect = () => setSelectedCorridor(corridor)

      const riverCasing = L.polyline(smoothedThalweg, {
        color: '#020617',
        weight: 5.5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false,
      })

      const thalwegLine = L.polyline(smoothedThalweg, {
        color: corridor.color,
        weight: 3.2,
        opacity: 1.0,
        lineCap: 'round',
        lineJoin: 'round',
      })

      thalwegLine.on('click', handleSelect)

      thalwegLine.bindTooltip(
        `<div style="font-family: inherit; max-width: 260px; padding: 2px;">
          <div style="font-size: 10px; font-weight: 900; color: ${corridor.color}; text-transform: uppercase;">
            Peligro ${corridor.nivelPeligro} · pH ${corridor.phPromedio}
          </div>
          <h4 style="margin: 2px 0; font-size: 13px; font-weight: 900; color: #0f172a;">${corridor.nombre}</h4>
          <p style="margin: 0; font-size: 11px; color: #475569;">${corridor.descripcion}</p>
        </div>`,
        { sticky: true }
      )

      corredoresGroup.addLayer(riverCasing)
      corredoresGroup.addLayer(thalwegLine)

      // Distintivo flotante con el nombre de la subcuenca / quebrada
      const midPoint = corridor.thalweg[Math.floor(corridor.thalweg.length / 2)]
      const subbasinBadge = L.marker(midPoint, {
        icon: L.divIcon({
          className: 'custom-subbasin-badge',
          html: `<div style="
            background: rgba(15, 23, 42, 0.90);
            color: white;
            border: 1.5px solid ${corridor.color};
            border-radius: 999px;
            padding: 2px 8px;
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.4);
            transform: translate(-50%, -100%);
            cursor: pointer;
          ">
            <span style="font-size: 9px; opacity: 0.85;">Subcuenca:</span>
            <strong style="color: #f8fafc;">${corridor.quebrada}</strong>
          </div>`,
          iconSize: [0, 0],
        }),
      })
      subbasinBadge.on('click', handleSelect)
      corredoresGroup.addLayer(subbasinBadge)
    })

    // 4. Focos DAR (capa opcional avanzada)
    DAR_HAZARD_HOTSPOTS.forEach((spot) => {
      const centerCoord = spot.coords[0]
      const hazardBadge = L.marker(centerCoord, {
        icon: L.divIcon({
          className: 'custom-hazard-icon',
          html: `<div style="
            background: #b91c1c;
            color: white;
            border: 2px solid white;
            border-radius: 999px;
            padding: 3px 8px;
            font-size: 11px;
            font-weight: 900;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 4px 10px rgba(185, 28, 28, 0.4);
            white-space: nowrap;
            transform: translate(-50%, -50%);
          ">
            <span>🔥</span> Foco DAR (pH ${spot.ph})
          </div>`,
          iconSize: [0, 0],
        }),
      })

      hazardBadge.bindTooltip(
        `<div style="font-family: inherit; max-width: 240px; padding: 2px;">
          <strong style="color: #b91c1c;">Foco de Acidez: ${spot.nombre}</strong>
          <div style="font-size: 11px; color: #334155; margin-top: 2px;">
            pH: ${spot.ph} · Hierro: ${spot.hierro} · Aluminio: ${spot.aluminio}
          </div>
        </div>`,
        { sticky: true }
      )

      hotspotsGroup.addLayer(hazardBadge)
    })

    // 5. Bofedales (capa opcional avanzada)
    REAL_VALLEY_BOFEDALES.forEach((bof) => {
      const centerCoord = bof.coords[0]
      const cleanName = bof.nombre.replace('Bofedal de ', '').replace('Bofedales del ', '').replace('Humedal Aluvial ', '')
      const bofBadge = L.marker(centerCoord, {
        icon: L.divIcon({
          className: 'custom-bof-icon',
          html: `<div style="
            background: #15803d;
            color: white;
            border: 1.5px solid white;
            border-radius: 999px;
            padding: 3px 8px;
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 3px;
            box-shadow: 0 3px 8px rgba(21, 128, 61, 0.4);
            white-space: nowrap;
            transform: translate(-50%, -50%);
          ">
            <span>🌿</span> ${cleanName}
          </div>`,
          iconSize: [0, 0],
        }),
      })

      if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
        bofBadge.bindTooltip(`<strong>${bof.nombre}</strong>`, { sticky: true })
      }

      bofedalesGroup.addLayer(bofBadge)
    })

    // 6. Glaciares (capa opcional avanzada)
    REAL_GEOGRAPHIC_FEATURES.picos.forEach((p) => {
      const picoMarker = L.marker(p.coords, {
        icon: L.divIcon({
          className: 'custom-pico-marker',
          html: `<div style="
            background: rgba(15, 23, 42, 0.92);
            color: white;
            border: 1px solid rgba(255,255,255,0.4);
            border-radius: 8px;
            padding: 2px 7px;
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            transform: translate(-50%, -100%);
          ">
            <span style="color: #38bdf8;">▲</span>
            <span>${p.nombre} (${p.altitud})</span>
          </div>`,
          iconSize: [0, 0],
        }),
      })
      glaciaresGroup.addLayer(picoMarker)
    })

    // 7. Puntos de Monitoreo (capa opcional avanzada)
    measurements.forEach((m) => {
      const isBad = !m.cumpleECA
      const color = isBad ? '#b91c1c' : '#15803d'

      const customIcon = L.divIcon({
        className: 'custom-meas-marker',
        html: `<div style="
          background: ${color};
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 900;
        ">
          ${isBad ? '!' : '✓'}
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker([m.lat, m.lng], { icon: customIcon })
      marker.bindPopup(`
        <div style="font-family: inherit; min-width: 220px; padding: 4px;">
          <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: 900; color: #0f172a;">${m.punto}</h4>
          <div style="font-size: 12px; margin-bottom: 4px;">pH Medido: <strong style="color: ${color};">${m.ph.toFixed(2)}</strong></div>
          <div style="font-size: 11px; color: #64748b;">${m.fuente} · ${m.quebrada}</div>
        </div>
      `)
      monitoreoGroup.addLayer(marker)
    })

    // 8. Tambos y Conectividad (capa opcional avanzada)
    if (conectividadGroup) {
      CONNECTIVITY_POINTS.forEach((pt) => {
        const badgeBg = pt.tipo === 'tambo_satelital' ? '#047857' : '#1d4ed8'
        const badgeIcon = pt.tipo === 'tambo_satelital' ? '🏛️' : '📶'

        const icon = L.divIcon({
          className: 'custom-wifi-marker',
          html: `<div style="
            background: ${badgeBg};
            color: white;
            border: 2px solid white;
            border-radius: 999px;
            padding: 3px 8px;
            font-size: 11px;
            font-weight: 900;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
            white-space: nowrap;
            transform: translate(-50%, -50%);
          ">
            <span>${badgeIcon}</span>
            <span>${pt.nombre}</span>
          </div>`,
          iconSize: [0, 0],
        })

        const ptMarker = L.marker([pt.lat, pt.lng], { icon })
        ptMarker.bindTooltip(
          `<div style="font-family: inherit; padding: 2px;">
            <strong style="color: ${badgeBg};">${pt.nombre}</strong>
            <div style="font-size: 11px; color: #475569;">${pt.descripcion}</div>
          </div>`,
          { sticky: true }
        )
        conectividadGroup.addLayer(ptMarker)
      })
    }
  }, [basins, selectedBasin, season, measurements, dangerFilter, geoJsonPolygons])

  // Center on selected basin
  useEffect(() => {
    if (!selectedBasin || !mapInstanceRef.current) return
    const coords = getBasinPolygonCoords(selectedBasin, geoJsonPolygons)
    if (coords && coords.length > 0) {
      const bounds = L.latLngBounds(coords)
      mapInstanceRef.current.flyToBounds(bounds, {
        padding: [40, 40],
        maxZoom: 12,
        duration: 1.0,
      })
    } else {
      mapInstanceRef.current.flyTo([selectedBasin.centroide.lat, selectedBasin.centroide.lng], 11, {
        duration: 1.0,
      })
    }
  }, [selectedBasin, geoJsonPolygons])

  const focusLocation = (lat: number, lng: number, zoom = 11) => {
    mapInstanceRef.current?.flyTo([lat, lng], zoom, { duration: 1.0 })
  }

  return (
    <div className="relative w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden select-none bg-slate-900">
      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-[#0f172a]" />

      {/* Top Floating Control Bar - Simplified & Accessible */}
      <div className="absolute top-3 left-3 right-16 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* Layer Manager Modal Toggle Button (Min 44px tactile) */}
        <button
          onClick={() => setLayersModalOpen(true)}
          className="touch-target min-h-[44px] bg-white/95 hover:bg-white text-slate-800 backdrop-blur-md rounded-2xl px-3 sm:px-4 py-2 shadow-lg border border-slate-200 font-bold text-sm flex items-center gap-2 transition-transform active:scale-95"
          aria-label={t('map_layers')}
          title={t('map_layers')}
        >
          <Layers size={18} className="text-blue-700 shrink-0" />
          <span className="hidden sm:inline">{t('map_layers')}</span>
          {activeAdvancedCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-black">
              {activeAdvancedCount}
            </span>
          )}
        </button>

        {/* Legend Button */}
        <button
          onClick={() => setLegendOpen(!legendOpen)}
          className="touch-target min-h-[44px] bg-white/95 hover:bg-white text-slate-800 backdrop-blur-md rounded-2xl px-3 sm:px-3.5 py-2 shadow-lg border border-slate-200 font-bold text-sm flex items-center gap-1.5 transition-transform active:scale-95"
          aria-label={t('legend')}
          title={t('legend')}
        >
          <Info size={16} className="text-slate-600 shrink-0" />
          <span className="hidden sm:inline">{t('legend')}</span>
        </button>

        {/* Cautious Permanent Disclaimer Pill */}
        <div className="hidden md:flex items-center gap-1.5 bg-amber-50/95 backdrop-blur-md border border-amber-300 text-amber-900 text-xs font-semibold px-3 py-2 rounded-2xl shadow-sm">
          <AlertTriangle size={14} className="text-amber-700 shrink-0" />
          <span>{t('disclaimer_short')}</span>
        </div>
      </div>

      {/* Right Zoom & View Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200 pointer-events-auto">
        {selectedBasin && (
          <button
            onClick={() => {
              const coords = getBasinPolygonCoords(selectedBasin, geoJsonPolygons)
              if (coords?.length) {
                mapInstanceRef.current?.flyToBounds(L.latLngBounds(coords), {
                  padding: [40, 40],
                  maxZoom: 12,
                  duration: 1.0,
                })
              } else {
                focusLocation(selectedBasin.centroide.lat, selectedBasin.centroide.lng, 11)
              }
            }}
            className="touch-target w-11 h-11 rounded-xl flex items-center justify-center bg-blue-100 text-blue-800 hover:bg-blue-700 hover:text-white transition-colors"
            title={`Centrar en Cuenca ${selectedBasin.nombre}`}
            aria-label={`Centrar en Cuenca ${selectedBasin.nombre}`}
          >
            <MapPin size={20} />
          </button>
        )}
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="touch-target w-11 h-11 rounded-xl flex items-center justify-center text-slate-800 hover:bg-slate-100 transition-colors"
          title="Acercar mapa"
          aria-label="Acercar mapa"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="touch-target w-11 h-11 rounded-xl flex items-center justify-center text-slate-800 hover:bg-slate-100 transition-colors"
          title="Alejar mapa"
          aria-label="Alejar mapa"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={() => {
            const isMobile = window.innerWidth < 640
            if (isMobile) {
              mapInstanceRef.current?.fitBounds(
                [
                  [-10.05, -77.65],
                  [-9.35, -77.05],
                ],
                {
                  paddingTopLeft: [12, 60],
                  paddingBottomRight: [12, 110],
                  animate: true,
                }
              )
            } else {
              focusLocation(-9.55, -77.45, 10)
            }
          }}
          className="touch-target w-11 h-11 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
          title="Ver todas las cuencas"
          aria-label="Restablecer vista general"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* Corridor Detail Popover (If a corridor is selected) */}
      {selectedCorridor && (
        <div className="absolute top-20 right-3 left-3 sm:left-auto sm:w-88 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-200 pointer-events-auto animate-in fade-in">
          <div className="flex items-start justify-between border-b border-slate-200 pb-2 mb-2">
            <div>
              <span
                className="text-xs font-black uppercase px-2 py-0.5 rounded-md text-white inline-block mb-1"
                style={{ background: selectedCorridor.color }}
              >
                Peligro {selectedCorridor.nivelPeligro} · pH {selectedCorridor.phPromedio}
              </span>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                {selectedCorridor.nombre}
              </h3>
            </div>
            <button
              onClick={() => setSelectedCorridor(null)}
              className="touch-target text-slate-400 hover:text-slate-700 rounded-lg p-1"
              aria-label="Cerrar detalle del río"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-xs text-slate-600 mb-3">{selectedCorridor.descripcion}</p>
          <div className="bg-slate-100 p-2.5 rounded-xl text-xs space-y-1 mb-3 text-slate-700">
            <div><strong>Hierro (Fe):</strong> {selectedCorridor.hierro}</div>
            <div><strong>Aluminio (Al):</strong> {selectedCorridor.aluminio}</div>
            <div className="text-emerald-700 font-bold">🌿 {selectedCorridor.bofedalAmortiguador}</div>
          </div>
          <button
            onClick={() => {
              const center = selectedCorridor.thalweg[Math.floor(selectedCorridor.thalweg.length / 2)]
              focusLocation(center[0], center[1], 12)
            }}
            className="touch-target w-full rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
            style={{ background: selectedCorridor.color }}
          >
            <Activity size={18} /> Enfocar este río
          </button>
        </div>
      )}

      {/* Floating Legend Panel */}
      {legendOpen && (
        <div className="absolute bottom-16 right-3 left-3 sm:left-auto sm:w-80 z-20 pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-200 text-xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <strong className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Info size={16} className="text-blue-700" /> {t('legend')}
            </strong>
            <button
              onClick={() => setLegendOpen(false)}
              className="touch-target text-slate-400 hover:text-slate-700 p-1"
              aria-label="Cerrar leyenda"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-red-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                🛑
              </span>
              <div>
                <strong className="text-red-700 text-xs block">{t('risk_alto')}</strong>
                <span className="text-slate-600 text-[11px]">{t('advice_alto')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                ⚠️
              </span>
              <div>
                <strong className="text-amber-700 text-xs block">{t('risk_medio')}</strong>
                <span className="text-slate-600 text-[11px]">{t('advice_medio')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                ✓
              </span>
              <div>
                <strong className="text-emerald-700 text-xs block">{t('risk_bajo')}</strong>
                <span className="text-slate-600 text-[11px]">{t('advice_bajo')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
              <span className="w-5 h-1.5 bg-blue-600 rounded-full shrink-0" />
              <span className="text-slate-700 text-xs font-semibold">Río Santa (Colector Central)</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-5 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-emerald-600 rounded-full shrink-0" />
              <span className="text-slate-700 text-xs font-semibold">Líneas de Subcuencas / Quebradas</span>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Layers Modal (Accessible Drawer / Popover) */}
      {layersModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <SlidersHorizontal size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    {t('map_layers')}
                  </h3>
                  <p className="text-xs text-slate-500">{t('layers_modal_desc')}</p>
                </div>
              </div>
              <button
                onClick={() => setLayersModalOpen(false)}
                className="touch-target p-2 text-slate-400 hover:text-slate-700 rounded-xl"
                aria-label="Cerrar capas"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3">
              {/* Cuencas (Principal) */}
              <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    🗺️
                  </div>
                  <div>
                    <strong className="text-sm text-slate-900 block">Cuencas con Semáforo</strong>
                    <span className="text-xs text-slate-500">Límites y color de riesgo por quebrada</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={layersState.cuencas}
                  onChange={() => toggleLayer('cuencas')}
                  className="w-6 h-6 text-blue-600 rounded-lg cursor-pointer"
                />
              </label>

              {/* Río Santa */}
              <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                    🌊
                  </div>
                  <div>
                    <strong className="text-sm text-slate-900 block">Río Santa</strong>
                    <span className="text-xs text-slate-500">Cauce central del Callejón de Huaylas</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={layersState.rios}
                  onChange={() => toggleLayer('rios')}
                  className="w-6 h-6 text-blue-600 rounded-lg cursor-pointer"
                />
              </label>

              {/* Líneas de Subcuencas / Quebradas */}
              <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                    ⚡
                  </div>
                  <div>
                    <strong className="text-sm text-slate-900 block">Líneas de Subcuencas (Quebradas)</strong>
                    <span className="text-xs text-slate-500">Cauces interiores con nivel de acidez y pH</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={layersState.corredores}
                  onChange={() => toggleLayer('corredores')}
                  className="w-6 h-6 text-blue-600 rounded-lg cursor-pointer"
                />
              </label>

              <div className="pt-2">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Capas Científicas Opcionales
                </h4>
              </div>

              {/* Focos DAR */}
              <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                    🔥
                  </div>
                  <div>
                    <strong className="text-sm text-slate-900 block">Focos de Acidez (DAR)</strong>
                    <span className="text-xs text-slate-500">Morrenas con sulfuros reactivos</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={layersState.hotspotsDAR}
                  onChange={() => toggleLayer('hotspotsDAR')}
                  className="w-6 h-6 text-blue-600 rounded-lg cursor-pointer"
                />
              </label>

              {/* Bofedales */}
              <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    🌿
                  </div>
                  <div>
                    <strong className="text-sm text-slate-900 block">Bofedales y Humedales</strong>
                    <span className="text-xs text-slate-500">Filtros naturales que retienen metales</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={layersState.bofedales}
                  onChange={() => toggleLayer('bofedales')}
                  className="w-6 h-6 text-blue-600 rounded-lg cursor-pointer"
                />
              </label>

              {/* Monitoreo */}
              <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    🔬
                  </div>
                  <div>
                    <strong className="text-sm text-slate-900 block">Puntos de Monitoreo</strong>
                    <span className="text-xs text-slate-500">Mediciones INAIGEM y UPCH</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={layersState.monitoreo}
                  onChange={() => toggleLayer('monitoreo')}
                  className="w-6 h-6 text-blue-600 rounded-lg cursor-pointer"
                />
              </label>

              {/* Tambos / Conectividad */}
              <label className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                    📶
                  </div>
                  <div>
                    <strong className="text-sm text-slate-900 block">Tambos e Internet Rural</strong>
                    <span className="text-xs text-slate-500">Puntos con señal para sincronizar</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={layersState.conectividad}
                  onChange={() => toggleLayer('conectividad')}
                  className="w-6 h-6 text-blue-600 rounded-lg cursor-pointer"
                />
              </label>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200">
              <button
                onClick={() => setLayersModalOpen(false)}
                className="touch-target w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-2xl text-center shadow-md active:scale-98 transition-transform"
              >
                {t('btn_done_map')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Tap/Click Bottom Sheet para Cuenca: panel inferior con nombre, icono-estado, 1 frase y botón "Ver más" */}
      {sheetBasin && (
        <div className="lg:hidden">
          <div
            onClick={() => setSheetBasin(null)}
            className="absolute inset-0 z-20 transition-opacity"
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="map-sheet-basin-title"
            className="absolute bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-30 bg-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4 pointer-events-auto"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 mb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-[#1e3a8a] bg-[#eff6ff] px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Microcuenca
                </span>
                <h3
                  id="map-sheet-basin-title"
                  className="text-lg sm:text-xl font-black text-[#0f172a] leading-tight"
                >
                  Cuenca {sheetBasin.nombre}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSheetBasin(null)}
                className="touch-target w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                aria-label="Cerrar panel de cuenca"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f8fafc] border border-slate-200 mb-3">
              <div className="w-12 h-12 shrink-0">
                <Illustration
                  name={
                    sheetBasin.nivelRiesgo[season] === 'Alto'
                      ? 'gota_enferma'
                      : sheetBasin.nivelRiesgo[season] === 'Medio'
                      ? 'gota_preocupada'
                      : 'gota_tranquila'
                  }
                  className="w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block mb-0.5 ${
                    sheetBasin.nivelRiesgo[season] === 'Alto'
                      ? 'bg-red-100 text-red-800'
                      : sheetBasin.nivelRiesgo[season] === 'Medio'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {sheetBasin.nivelRiesgo[season] === 'Alto'
                    ? 'Alerta'
                    : sheetBasin.nivelRiesgo[season] === 'Medio'
                    ? 'Precaución'
                    : 'Menor riesgo'}
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                  {sheetBasin.nivelRiesgo[season] === 'Alto'
                    ? 'Agua ácida con metales en cabecera'
                    : sheetBasin.nivelRiesgo[season] === 'Medio'
                    ? 'Agua en observación preventiva'
                    : 'Menor riesgo de acidez'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onSelectBasin(sheetBasin)
                if (onOpenDetails) {
                  onOpenDetails(sheetBasin)
                }
                setSheetBasin(null)
              }}
              className="touch-target w-full py-3 px-4 rounded-2xl bg-[#1e3a8a] hover:bg-[#172554] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98"
            >
              <span>{t('btn_more_info')}</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
