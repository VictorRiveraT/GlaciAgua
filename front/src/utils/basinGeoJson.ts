import { BasinData } from '../types'
import { LatLngCoord } from './geoSmoothing'

export interface GeoJsonBasinFeature {
  type: 'Feature'
  id: string
  properties: {
    id: string
    nombre: string
    provincia?: string
    distrito?: string
    area_km2?: number
    nivel_riesgo_seca?: string
    nivel_riesgo_humeda?: string
  }
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
}

export interface GeoJsonBasinCollection {
  type: 'FeatureCollection'
  features: GeoJsonBasinFeature[]
}

/**
 * Fetch microcuencas GeoJSON from /data/microcuencas.geojson
 * Falls back to basins data in memory if offline or unavailable.
 */
export async function loadBasinsGeoJson(): Promise<Record<string, LatLngCoord[]> | null> {
  try {
    const res = await fetch('/data/microcuencas.geojson', {
      headers: {
        Accept: 'application/json',
      },
      cache: 'default',
    })
    if (!res.ok) return null

    const data: GeoJsonBasinCollection = await res.json()
    if (!data || !Array.isArray(data.features)) return null

    const polygonsById: Record<string, LatLngCoord[]> = {}

    for (const feature of data.features) {
      const id = feature.id || feature.properties?.id
      if (!id) continue

      if (feature.geometry.type === 'Polygon' && feature.geometry.coordinates?.[0]) {
        // GeoJSON uses [longitude, latitude], Leaflet needs [latitude, longitude]
        const ring = feature.geometry.coordinates[0] as [number, number][]
        const leafletCoords: LatLngCoord[] = ring.map(([lng, lat]) => [lat, lng])
        polygonsById[id] = leafletCoords
      }
    }

    return polygonsById
  } catch (err) {
    console.warn('[GlaciAgua] No se pudo cargar /data/microcuencas.geojson, usando datos locales:', err)
    return null
  }
}

/**
 * Resolves polygon coordinates for a basin with GeoJSON priority and fallback
 */
export function getBasinPolygonCoords(
  basin: BasinData,
  geoJsonPolygons: Record<string, LatLngCoord[]> | null
): LatLngCoord[] {
  if (geoJsonPolygons && geoJsonPolygons[basin.id] && geoJsonPolygons[basin.id].length > 0) {
    return geoJsonPolygons[basin.id]
  }
  return basin.poligonoGeo || []
}
