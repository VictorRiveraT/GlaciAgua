import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { BasinData, RealMeasurement, RiskLevel, Season } from '../types'
import { REAL_GEOGRAPHIC_FEATURES } from '../data/basinsData'
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
  Mountain,
  Sparkles,
  Droplet,
  ShieldCheck,
  Compass,
  MapPin,
  AlertOctagon,
  Flame,
  Info,
  X,
  Activity,
} from 'lucide-react'

interface InteractiveMapProps {
  basins: BasinData[]
  selectedBasin: BasinData | null
  onSelectBasin: (basin: BasinData) => void
  season: Season
  measurements: RealMeasurement[]
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  basins,
  selectedBasin,
  onSelectBasin,
  season,
  measurements,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const layersGroupRef = useRef<{ [key: string]: L.LayerGroup }>({})
  const baseLayersRef = useRef<{ [key: string]: L.TileLayer }>({})

  const [baseMapStyle, setBaseMapStyle] = useState<'topo' | 'satelite' | 'opentopo'>('topo')
  const [legendOpen, setLegendOpen] = useState(false)
  const [dangerFilter, setDangerFilter] = useState<'all' | 'Critico' | 'Alto' | 'Medio' | 'Bajo'>('all')
  const [selectedCorridor, setSelectedCorridor] = useState<FluvialHazardCorridor | null>(null)

  const [layersState, setLayersState] = useState({
    cuencas: true,
    corredores: true,
    hotspotsDAR: true,
    bofedales: true,
    glaciares: true,
    monitoreo: true,
    rios: true,
  })

  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null)

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
        return '#bd3f3a'
      case 'Medio':
        return '#a86408'
      case 'Bajo':
        return '#21835b'
    }
  }

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [-9.52, -77.45],
      zoom: 11,
      minZoom: 8,
      maxZoom: 18,
      zoomControl: false,
    })

    mapInstanceRef.current = map

    // 1. ESRI World Topo Map (Relieve Real con curvas y sombras 3D)
    const topoLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri, DeLorme, USGS, IGN Perú',
        maxZoom: 18,
      }
    )

    // 2. ESRI World Imagery (Satélite Real)
    const satLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics',
        maxZoom: 18,
      }
    )

    // 3. OpenTopoMap (Curvas de nivel en metros)
    const openTopoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map &copy; OpenTopoMap (CC-BY-SA)',
      maxZoom: 17,
    })

    baseLayersRef.current = {
      topo: topoLayer,
      satelite: satLayer,
      opentopo: openTopoLayer,
    }

    topoLayer.addTo(map)

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setMouseCoords({ lat: e.latlng.lat, lng: e.latlng.lng })
    })

    // Layer Groups
    const cuencasGroup = L.layerGroup().addTo(map)
    const corredoresGroup = L.layerGroup().addTo(map)
    const hotspotsGroup = L.layerGroup().addTo(map)
    const bofedalesGroup = L.layerGroup().addTo(map)
    const glaciaresGroup = L.layerGroup().addTo(map)
    const monitoreoGroup = L.layerGroup().addTo(map)
    const riosGroup = L.layerGroup().addTo(map)

    layersGroupRef.current = {
      cuencas: cuencasGroup,
      corredores: corredoresGroup,
      hotspotsDAR: hotspotsGroup,
      bofedales: bofedalesGroup,
      glaciares: glaciaresGroup,
      monitoreo: monitoreoGroup,
      rios: riosGroup,
    }

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Switch Base Map Style
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    Object.values(baseLayersRef.current).forEach((layer) => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer)
      }
    })

    const selectedTile = baseLayersRef.current[baseMapStyle]
    if (selectedTile) {
      selectedTile.addTo(map)
    }
  }, [baseMapStyle])

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
    } = layersGroupRef.current

    if (!cuencasGroup) return

    // Clear all vector layers
    cuencasGroup.clearLayers()
    corredoresGroup.clearLayers()
    hotspotsGroup.clearLayers()
    bofedalesGroup.clearLayers()
    glaciaresGroup.clearLayers()
    monitoreoGroup.clearLayers()
    riosGroup.clearLayers()

    // 1. Polígonos de Cuencas Generales (Línea de cresta / divisoria de aguas topográfica)
    // Se estila de forma cartográfica sutil para permitir apreciar plenamente el relieve 3D y las curvas de nivel
    basins.forEach((basin) => {
      if (!basin.poligonoGeo || basin.poligonoGeo.length === 0) return

      const risk = basin.nivelRiesgo[season]
      const color = getRiskColor(risk)
      const isSelected = selectedBasin?.id === basin.id

      // Polígono perimetral de divisoria de aguas: sin relleno para evitar tintar el relieve y sin tooltip pegajoso
      const polygon = L.polygon(basin.poligonoGeo, {
        color: isSelected ? color : '#64748b',
        fill: false,
        weight: isSelected ? 2.5 : 1.4,
        dashArray: isSelected ? undefined : '6, 6',
      })

      polygon.on('click', () => {
        onSelectBasin(basin)
      })

      polygon.on('mouseover', () => {
        polygon.setStyle({ weight: 2.5, color: color })
      })

      polygon.on('mouseout', () => {
        polygon.setStyle({
          weight: isSelected ? 2.5 : 1.4,
          color: isSelected ? color : '#64748b',
        })
      })

      polygon.bindTooltip(`Cuenca ${basin.nombre} (Divisoria Topográfica)`, {
        sticky: false,
        direction: 'center',
      })

      cuencasGroup.addLayer(polygon)

      // Center Basin Label Badge
      const centerMarker = L.marker(basin.centroide, {
        icon: L.divIcon({
          className: 'custom-basin-badge',
          html: `<div style="
            background: rgba(255, 255, 255, 0.94);
            border: 1.5px solid ${color};
            border-radius: 999px;
            padding: 3px 10px;
            font-size: 11px;
            font-weight: 900;
            color: #172726;
            box-shadow: 0 3px 10px rgba(0,0,0,0.15);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 5px;
            transform: translate(-50%, -50%);
          ">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: ${color};"></span>
            Cuenca ${basin.nombre}
          </div>`,
          iconSize: [0, 0],
        }),
      })

      centerMarker.on('click', () => onSelectBasin(basin))
      cuencasGroup.addLayer(centerMarker)
    })

    // 2. Corredores Fluviales de Peligro Geoquímico (DAR) de Alta Fidelidad
    // Siguen de manera milimétrica (sub-metro) las coordenadas oficiales de OpenStreetMap / IGN
    const corridorsToRender = FLUVIAL_HAZARD_CORRIDORS.filter(
      (c) => dangerFilter === 'all' || c.nivelPeligro === dangerFilter
    )

    corridorsToRender.forEach((corridor) => {
      const handleSelect = () => {
        setSelectedCorridor(corridor)
      }

      // Halo de Peligro Fluvial (Ribbon de afectación ribereña con bordes redondeados y unión continua)
      const hazardHalo = L.polyline(corridor.thalweg, {
        color: corridor.color,
        weight: 8,
        opacity: 0.38,
        lineCap: 'round',
        lineJoin: 'round',
      })

      // Cauce Central Activo (Talweg)
      const thalwegLine = L.polyline(corridor.thalweg, {
        color: corridor.color,
        weight: 3.2,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      })

      // Pulso de Flujo Dinámico (Línea discontinua que resalta la corriente)
      const flowPulse = L.polyline(corridor.thalweg, {
        color: '#ffffff',
        weight: 1.6,
        dashArray: '6, 14',
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round',
      })

      hazardHalo.on('click', handleSelect)
      thalwegLine.on('click', handleSelect)
      flowPulse.on('click', handleSelect)

      hazardHalo.on('mouseover', () => {
        hazardHalo.setStyle({ opacity: 0.65, weight: 11 })
      })
      hazardHalo.on('mouseout', () => {
        hazardHalo.setStyle({ opacity: 0.38, weight: 8 })
      })

      const popupContent = `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 260px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
            <span style="font-size: 9px; font-weight: 900; text-transform: uppercase; color: white; background: ${corridor.color}; padding: 2px 7px; border-radius: 999px;">
              Peligro ${corridor.nivelPeligro}
            </span>
            <span style="font-size: 10px; font-weight: 800; color: ${corridor.color};">
              pH ${corridor.phPromedio}
            </span>
          </div>
          <h4 style="margin: 4px 0 2px; font-size: 13px; font-weight: 900; color: #0f172a;">${corridor.nombre}</h4>
          <p style="margin: 0 0 6px; font-size: 10.5px; color: #475569; line-height: 1.3;">${corridor.descripcion}</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 5px; font-size: 9.5px; color: #334155;">
            <div><strong>Hierro (Fe):</strong> ${corridor.hierro}</div>
            <div><strong>Aluminio (Al):</strong> ${corridor.aluminio}</div>
            <div style="margin-top: 3px; color: #64748b;"><strong>Impacto:</strong> ${corridor.poblacionAfectada}</div>
          </div>
          <div style="font-size: 9px; color: #0f766e; margin-top: 4px; font-weight: bold;">
            🌿 ${corridor.bofedalAmortiguador}
          </div>
        </div>
      `

      hazardHalo.bindTooltip(popupContent, { sticky: true })
      thalwegLine.bindTooltip(popupContent, { sticky: true })

      corredoresGroup.addLayer(hazardHalo)
      corredoresGroup.addLayer(thalwegLine)
      corredoresGroup.addLayer(flowPulse)
    })

    // 3. Hotspots de Peligro Activo: Focos de Drenaje Ácido de Roca (DAR) en Frentes Glaciares
    DAR_HAZARD_HOTSPOTS.forEach((spot) => {
      const hotspotPolygon = L.polygon(spot.coords, {
        color: '#b91c1c',
        fillColor: '#dc2626',
        fillOpacity: 0.48,
        weight: 2.2,
        dashArray: '3, 3',
      })

      hotspotPolygon.bindTooltip(
        `<div style="font-family: 'DM Sans', sans-serif; max-width: 230px;">
          <div style="display: flex; align-items: center; gap: 4px; color: #b91c1c; font-weight: 900; font-size: 10px; text-transform: uppercase;">
            <span>🔥</span> Foco de Drenaje Ácido de Roca (DAR)
          </div>
          <h4 style="margin: 2px 0; font-size: 12px; font-weight: 900; color: #1e293b;">${spot.nombre}</h4>
          <div style="font-size: 11px; font-weight: bold; color: #b91c1c; margin-top: 2px;">
            pH Crítico: ${spot.ph} · Fe: ${spot.hierro} · Al: ${spot.aluminio}
          </div>
          <p style="margin: 3px 0 0; font-size: 9.5px; color: #64748b;">
            Morena con sulfuros reactivos expuestos. Lavado activo de acidez por deshielo.
          </p>
        </div>`,
        { sticky: true }
      )

      hotspotsGroup.addLayer(hotspotPolygon)

      // Center warning flame badge on hotspot
      const centerCoord = spot.coords[0]
      const hazardBadge = L.marker(centerCoord, {
        icon: L.divIcon({
          className: 'custom-hazard-icon',
          html: `<div style="
            background: #dc2626;
            color: white;
            border: 2px solid white;
            border-radius: 999px;
            padding: 2px 7px;
            font-size: 9.5px;
            font-weight: 900;
            display: flex;
            align-items: center;
            gap: 3px;
            box-shadow: 0 4px 10px rgba(220, 38, 38, 0.4);
            white-space: nowrap;
            transform: translate(-50%, -50%);
          ">
            <span>🔥</span> Foco DAR pH ${spot.ph}
          </div>`,
          iconSize: [0, 0],
        }),
      })

      hotspotsGroup.addLayer(hazardBadge)
    })

    // 4. Bofedales Realistas (Filtros Naturales de Fondo de Valle)
    REAL_VALLEY_BOFEDALES.forEach((bof) => {
      const bofPolygon = L.polygon(bof.coords, {
        color: '#059669',
        fillColor: '#10b981',
        fillOpacity: 0.48,
        weight: 1.8,
      })

      bofPolygon.bindTooltip(
        `<div style="font-family: 'DM Sans', sans-serif;">
          <div style="display: flex; align-items: center; gap: 4px; color: #047857; font-weight: 900; font-size: 10px; text-transform: uppercase;">
            <span>🌿</span> Bofedal (Humedal Amortiguador)
          </div>
          <h4 style="margin: 2px 0; font-size: 12px; font-weight: 900; color: #064e3b;">${bof.nombre}</h4>
          <div style="font-size: 10px; color: #047857; font-weight: bold; margin-top: 2px;">
            Área: ${bof.areaHa} hectáreas · ${bof.eficienciaRetencion}
          </div>
          <p style="margin: 3px 0 0; font-size: 9.5px; color: #475569;">
            Filtro biológico natural: neutraliza acidez y absorbe metales pesados disueltos.
          </p>
        </div>`,
        { sticky: true }
      )

      bofedalesGroup.addLayer(bofPolygon)
    })

    // 5. Glaciares y Crestas Nevadas
    REAL_GEOGRAPHIC_FEATURES.picos.forEach((p) => {
      const picoMarker = L.marker(p.coords, {
        icon: L.divIcon({
          className: 'custom-pico-marker',
          html: `<div style="
            background: rgba(15, 23, 42, 0.92);
            color: white;
            border: 1px solid rgba(255,255,255,0.4);
            border-radius: 8px;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
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

    // 6. Ciudades y Poblaciones principales
    REAL_GEOGRAPHIC_FEATURES.ciudades.forEach((c) => {
      const ciudadMarker = L.marker(c.coords, {
        icon: L.divIcon({
          className: 'custom-city-marker',
          html: `<div style="
            background: ${c.principal ? '#3346a8' : 'white'};
            color: ${c.principal ? 'white' : '#1e293b'};
            border: 1.5px solid ${c.principal ? 'white' : '#94a3b8'};
            border-radius: 6px;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: 900;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
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

    // 7. Río Santa: Colector Principal con Meandros Reales de Alta Resolución (OSM / IGN)
    const rioSantaGlow = L.polyline(REAL_GEOGRAPHIC_FEATURES.rioSanta, {
      color: '#38bdf8',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round',
      lineJoin: 'round',
    })
    const rioSantaLine = L.polyline(REAL_GEOGRAPHIC_FEATURES.rioSanta, {
      color: '#0284c7',
      weight: 3.6,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    })
    rioSantaLine.bindTooltip(
      '<strong>Río Santa</strong> (Colector Principal del Callejón de Huaylas - Cauce Exacto)',
      { sticky: true }
    )
    riosGroup.addLayer(rioSantaGlow)
    riosGroup.addLayer(rioSantaLine)

    // 8. Puntos de Monitoreo Hidroquímico INAIGEM / UPCH
    measurements.forEach((m) => {
      const isBad = !m.cumpleECA
      const color = isBad ? '#bd3f3a' : '#16a34a'

      const customIcon = L.divIcon({
        className: 'custom-meas-marker',
        html: `<div style="
          background: ${color};
          color: white;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 900;
        ">
          ${isBad ? '!' : '✓'}
        </div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      })

      const marker = L.marker([m.lat, m.lng], { icon: customIcon })

      marker.bindPopup(`
        <div style="font-family: 'DM Sans', sans-serif; min-width: 230px; padding: 2px;">
          <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #3346a8; background: #eff6ff; padding: 2px 6px; border-radius: 4px;">
              ${m.fuente}
            </span>
            <h4 style="margin: 4px 0 0; font-size: 13px; font-weight: 900; color: #0f172a;">${m.punto}</h4>
            <span style="font-size: 11px; color: #64748b;">${m.quebrada}</span>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
            <div style="background: ${m.ph < 6.5 ? '#fef2f2' : '#f0fdf4'}; padding: 6px; border-radius: 8px; border: 1px solid ${m.ph < 6.5 ? '#fecaca' : '#bbf7d0'};">
              <span style="font-size: 9px; color: #64748b; font-weight: bold; display: block;">pH Medido</span>
              <strong style="font-size: 15px; color: ${m.ph < 6.5 ? '#b91c1c' : '#15803d'};">${m.ph.toFixed(2)}</strong>
              <span style="font-size: 8px; display: block; color: ${m.ph < 6.5 ? '#b91c1c' : '#15803d'}; font-weight: 800;">
                ${m.ph < 6.5 ? 'Ácido (< 6.5)' : 'Dentro de ECA'}
              </span>
            </div>

            <div style="background: #f8fafc; padding: 6px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <span style="font-size: 9px; color: #64748b; font-weight: bold; display: block;">Conductividad</span>
              <strong style="font-size: 15px; color: #0f172a;">${m.conductividad}</strong>
              <span style="font-size: 8px; display: block; color: #64748b;">µS/cm</span>
            </div>
          </div>

          <div style="font-size: 10px; background: #f8fafc; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 6px;">
            <div><strong>Hierro (Fe):</strong> <span style="color: ${m.hierro > 1.0 ? '#b91c1c' : '#15803d'}; font-weight: 800;">${m.hierro} mg/L</span> ${m.hierro > 1.0 ? '(ECA: 1.0)' : ''}</div>
            <div><strong>Aluminio (Al):</strong> <span style="color: ${m.aluminio > 0.9 ? '#b91c1c' : '#15803d'}; font-weight: 800;">${m.aluminio} mg/L</span> ${m.aluminio > 0.9 ? '(ECA: 0.9)' : ''}</div>
          </div>

          <p style="margin: 0; font-size: 9.5px; color: #475569; font-style: italic; line-height: 1.3;">
            "${m.notas}"
          </p>
        </div>
      `)

      monitoreoGroup.addLayer(marker)
    })
  }, [basins, selectedBasin, season, measurements, dangerFilter])

  // Center on selected basin
  useEffect(() => {
    if (!selectedBasin || !mapInstanceRef.current) return
    mapInstanceRef.current.flyTo([selectedBasin.centroide.lat, selectedBasin.centroide.lng], 11, {
      duration: 1.2,
    })
  }, [selectedBasin])

  const focusLocation = (lat: number, lng: number, zoom = 12) => {
    mapInstanceRef.current?.flyTo([lat, lng], zoom, { duration: 1.2 })
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden select-none">
      {/* Real Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#e2e8f0]" />

      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 max-w-[calc(100%-80px)] pointer-events-auto">
        {/* Base Map Style Switcher */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-lg border border-[#dfe7e5] flex items-center">
          <button
            onClick={() => setBaseMapStyle('topo')}
            className={`px-3 py-1.5 text-xs rounded-xl font-black transition-all flex items-center gap-1.5 ${
              baseMapStyle === 'topo'
                ? 'bg-[#3346a8] text-white shadow-xs'
                : 'text-[#667573] hover:text-[#172726]'
            }`}
          >
            <Mountain size={14} /> Relieve Topográfico
          </button>
          <button
            onClick={() => setBaseMapStyle('satelite')}
            className={`px-3 py-1.5 text-xs rounded-xl font-black transition-all flex items-center gap-1.5 ${
              baseMapStyle === 'satelite'
                ? 'bg-[#172726] text-white shadow-xs'
                : 'text-[#667573] hover:text-[#172726]'
            }`}
          >
            <Compass size={14} /> Satélite Real
          </button>
          <button
            onClick={() => setBaseMapStyle('opentopo')}
            className={`px-3 py-1.5 text-xs rounded-xl font-black transition-all flex items-center gap-1.5 ${
              baseMapStyle === 'opentopo'
                ? 'bg-[#0f766e] text-white shadow-xs'
                : 'text-[#667573] hover:text-[#172726]'
            }`}
          >
            Curvas de Nivel
          </button>
        </div>

        {/* Hazard Level Quick Filter Pills */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-lg border border-[#dfe7e5] flex items-center gap-1">
          <span className="text-[11px] font-black text-[#667573] px-2 flex items-center gap-1">
            <Flame size={13} className="text-[#dc2626]" /> Peligro DAR:
          </span>
          <button
            onClick={() => setDangerFilter('all')}
            className={`px-2 py-1 text-xs rounded-lg font-bold transition-all ${
              dangerFilter === 'all'
                ? 'bg-[#3346a8] text-white'
                : 'text-[#667573] hover:bg-gray-100'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setDangerFilter('Critico')}
            className={`px-2 py-1 text-xs rounded-lg font-bold transition-all flex items-center gap-1 ${
              dangerFilter === 'Critico'
                ? 'bg-[#dc2626] text-white'
                : 'text-[#dc2626] hover:bg-red-50'
            }`}
          >
            🔴 Crítico
          </button>
          <button
            onClick={() => setDangerFilter('Alto')}
            className={`px-2 py-1 text-xs rounded-lg font-bold transition-all flex items-center gap-1 ${
              dangerFilter === 'Alto'
                ? 'bg-[#ea580c] text-white'
                : 'text-[#ea580c] hover:bg-orange-50'
            }`}
          >
            🟠 Alto
          </button>
          <button
            onClick={() => setDangerFilter('Medio')}
            className={`px-2 py-1 text-xs rounded-lg font-bold transition-all flex items-center gap-1 ${
              dangerFilter === 'Medio'
                ? 'bg-[#d97706] text-white'
                : 'text-[#d97706] hover:bg-amber-50'
            }`}
          >
            🟡 Medio
          </button>
          <button
            onClick={() => setDangerFilter('Bajo')}
            className={`px-2 py-1 text-xs rounded-lg font-bold transition-all flex items-center gap-1 ${
              dangerFilter === 'Bajo'
                ? 'bg-[#16a34a] text-white'
                : 'text-[#16a34a] hover:bg-green-50'
            }`}
          >
            🟢 Seguro
          </button>
        </div>

        {/* Detailed Layer Toggles */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-lg border border-[#dfe7e5] flex items-center gap-1 overflow-x-auto">
          <span className="text-[11px] font-black text-[#667573] px-2 flex items-center gap-1">
            <Layers size={13} className="text-[#3346a8]" /> Capas:
          </span>
          <button
            onClick={() => toggleLayer('cuencas')}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all flex items-center gap-1 ${
              layersState.cuencas
                ? 'bg-[#edf0ff] text-[#3346a8] border border-[#3346a8]/20'
                : 'text-[#667573] hover:bg-gray-100'
            }`}
            title="Límites de cuenca hidrográfica (Divisoria de aguas)"
          >
            <ShieldCheck size={12} /> Divisoria Cuencas
          </button>
          <button
            onClick={() => toggleLayer('corredores')}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all flex items-center gap-1 ${
              layersState.corredores
                ? 'bg-amber-50 text-[#a86408] border border-amber-300'
                : 'text-[#667573] hover:bg-gray-100'
            }`}
            title="Corredores fluviales de peligro geoquímico"
          >
            <AlertOctagon size={12} /> Corredores Fluviales
          </button>
          <button
            onClick={() => toggleLayer('hotspotsDAR')}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all flex items-center gap-1 ${
              layersState.hotspotsDAR
                ? 'bg-red-50 text-[#dc2626] border border-red-300'
                : 'text-[#667573] hover:bg-gray-100'
            }`}
            title="Zonas críticas de morrenas donde brota el drenaje ácido de roca"
          >
            <Flame size={12} /> Focos Morrena DAR
          </button>
          <button
            onClick={() => toggleLayer('bofedales')}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all flex items-center gap-1 ${
              layersState.bofedales
                ? 'bg-[#e8f5ed] text-[#21835b] border border-[#21835b]/20'
                : 'text-[#667573] hover:bg-gray-100'
            }`}
            title="Humedales de fondo de valle con retención biológica"
          >
            <Sparkles size={12} /> Bofedales
          </button>
          <button
            onClick={() => toggleLayer('monitoreo')}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all flex items-center gap-1 ${
              layersState.monitoreo
                ? 'bg-blue-50 text-[#2563eb] border border-blue-200'
                : 'text-[#667573] hover:bg-gray-100'
            }`}
            title="Puntos de monitoreo científico INAIGEM y UPCH"
          >
            <Droplet size={12} /> Monitoreo
          </button>
        </div>
      </div>

      {/* Right Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-[#dfe7e5] pointer-events-auto">
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#172726] hover:bg-[#edf0ff] hover:text-[#3346a8] transition-colors"
          title="Acercar mapa"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#172726] hover:bg-[#edf0ff] hover:text-[#3346a8] transition-colors"
          title="Alejar mapa"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={() => focusLocation(-9.52, -77.45, 11)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-[#667573] hover:bg-gray-100 transition-colors"
          title="Restablecer vista general"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Corridor Detailed Card (When a corridor is clicked) */}
      {selectedCorridor && (
        <div className="absolute top-20 right-4 z-30 w-80 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-[#dfe7e5] animate-in fade-in slide-in-from-top-3 pointer-events-auto">
          <div className="flex items-start justify-between border-b border-[#e2e8f0] pb-2.5 mb-2.5">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md text-white"
                  style={{ background: selectedCorridor.color }}
                >
                  Peligro {selectedCorridor.nivelPeligro}
                </span>
                <span className="text-xs font-bold text-gray-500">pH {selectedCorridor.phPromedio}</span>
              </div>
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                {selectedCorridor.nombre}
              </h3>
            </div>
            <button
              onClick={() => setSelectedCorridor(null)}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            {selectedCorridor.descripcion}
          </p>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">
              <span className="text-[10px] text-slate-500 font-bold block">Hierro (Fe)</span>
              <span className="text-xs font-black text-slate-800">{selectedCorridor.hierro}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">
              <span className="text-[10px] text-slate-500 font-bold block">Aluminio (Al)</span>
              <span className="text-xs font-black text-slate-800">{selectedCorridor.aluminio}</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mb-3">
            <div>
              <strong className="text-slate-900">Origen:</strong> {selectedCorridor.origenDrenaje}
            </div>
            <div>
              <strong className="text-slate-900">Impacto:</strong> {selectedCorridor.poblacionAfectada}
            </div>
            <div className="text-[#0f766e] font-bold">
              🌿 {selectedCorridor.bofedalAmortiguador}
            </div>
          </div>

          <button
            onClick={() => {
              const center = selectedCorridor.thalweg[Math.floor(selectedCorridor.thalweg.length / 2)]
              focusLocation(center[0], center[1], 13)
            }}
            className="w-full py-2 rounded-xl text-xs font-black text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            style={{ background: selectedCorridor.color }}
          >
            <Activity size={14} /> Enfocar este Corredor
          </button>
        </div>
      )}

      {/* Bottom Nav / Focus Hotspots Bar */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-[#dfe7e5] text-xs pointer-events-auto">
        <span className="font-black text-[#3346a8] flex items-center gap-1">
          <MapPin size={14} /> Enfocar:
        </span>
        <button
          onClick={() => focusLocation(-9.524, -77.410, 13)}
          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 font-bold text-[#b91c1c] border border-red-200 transition-colors flex items-center gap-1"
        >
          <Flame size={12} /> Quebrada Shallap (Crítico DAR)
        </button>
        <button
          onClick={() => focusLocation(-9.495, -77.420, 13)}
          className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 font-bold text-[#ea580c] border border-orange-200 transition-colors"
        >
          Quilcayhuanca (Alto)
        </button>
        <button
          onClick={() => focusLocation(-9.460, -77.445, 13)}
          className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 font-bold text-[#b45309] border border-amber-200 transition-colors"
        >
          Quebrada Cojup (Captación)
        </button>
        <button
          onClick={() => focusLocation(-9.920, -77.195, 13)}
          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 font-bold text-[#b91c1c] border border-red-200 transition-colors flex items-center gap-1"
        >
          <Flame size={12} /> Pastoruri (Morrena Pirita)
        </button>
        <button
          onClick={() => focusLocation(-9.882, -77.285, 13)}
          className="px-2.5 py-1 rounded-lg bg-green-50 hover:bg-green-100 font-bold text-[#15803d] border border-green-200 transition-colors flex items-center gap-1"
        >
          <Sparkles size={12} /> Bofedal Pumapampa
        </button>
        <button
          onClick={() => focusLocation(-8.980, -77.700, 12)}
          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 font-bold text-[#059669] border border-emerald-200 transition-colors"
        >
          Santa Cruz / Río Blanco (Seguro)
        </button>

        {mouseCoords && (
          <span className="hidden xl:inline-block ml-2 pl-2 border-l border-[#dfe7e5] text-[11px] text-[#667573] font-mono">
            {mouseCoords.lat.toFixed(4)}°, {mouseCoords.lng.toFixed(4)}°
          </span>
        )}
      </div>

      {/* Floating Glassmorphic Legend */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto flex flex-col items-end gap-2">
        {legendOpen && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-[#dfe7e5] w-72 text-xs space-y-2.5 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-[#dfe7e5] pb-2">
              <strong className="text-xs font-black text-[#172726] flex items-center gap-1.5">
                <Layers size={14} className="text-[#3346a8]" /> Simbología Hidro-Geoquímica
              </strong>
              <button
                onClick={() => setLegendOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-xs p-0.5"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-md bg-[#dc2626] border border-red-700 shrink-0 flex items-center justify-center text-[9px] text-white font-bold">
                  🔥
                </span>
                <div>
                  <strong className="text-[#dc2626] block leading-tight">Foco / Morrena DAR</strong>
                  <span className="text-[#667573] text-[9.5px]">Pirita expuesta, pH &lt; 4.0, lixiviación</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-md bg-[#dc2626]/40 border-2 border-[#dc2626] shrink-0" />
                <div>
                  <strong className="text-[#dc2626] block leading-tight">Corredor Crítico (Shallap/Pastoruri)</strong>
                  <span className="text-[#667573] text-[9.5px]">pH 3.8 - 4.1 · Fe &gt; 5x ECA · Agua naranja</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-md bg-[#ea580c]/35 border-2 border-[#ea580c] shrink-0" />
                <div>
                  <strong className="text-[#ea580c] block leading-tight">Corredor Alto (Quilcayhuanca)</strong>
                  <span className="text-[#667573] text-[9.5px]">pH 4.25 · Metales disueltos y aluminio</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-md bg-[#d97706]/35 border-2 border-[#d97706] shrink-0" />
                <div>
                  <strong className="text-[#d97706] block leading-tight">Corredor Moderado (Cojup)</strong>
                  <span className="text-[#667573] text-[9.5px]">pH 4.55 · Captación agua potable Huaraz</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-md bg-[#16a34a]/30 border-2 border-[#16a34a] shrink-0" />
                <div>
                  <strong className="text-[#16a34a] block leading-tight">Corredor Seguro (Santa Cruz)</strong>
                  <span className="text-[#667573] text-[9.5px]">pH 7.20 · Litología granítica sin sulfuros</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-md bg-[#10b981]/50 border-2 border-[#059669] shrink-0" />
                <div>
                  <strong className="text-[#059669] block leading-tight">Bofedal (Humedal Amortiguador)</strong>
                  <span className="text-[#667573] text-[9.5px]">Filtro natural depurador (atrapa 65% metales)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-5 h-1 bg-[#0284c7] rounded-full shrink-0" />
                <span className="text-[#172726] font-bold">Río Santa (Colector Central)</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-5 h-0.5 border-t-2 border-dashed border-[#475569] shrink-0" />
                <span className="text-[#667573] text-[10px]">Líneas de cresta / Divisoria de aguas</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setLegendOpen(!legendOpen)}
          className="bg-white/95 backdrop-blur-md hover:bg-white px-3 py-2 rounded-2xl shadow-lg border border-[#dfe7e5] text-xs font-black text-[#3346a8] flex items-center gap-1.5 transition-all"
        >
          <Layers size={14} />
          <span>Leyenda</span>
          <span className="text-[10px] text-gray-400">{legendOpen ? '▲' : '▼'}</span>
        </button>
      </div>
    </div>
  )
}
