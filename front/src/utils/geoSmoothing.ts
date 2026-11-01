/**
 * Chaikin's corner cutting algorithm for visually smoothing geographic paths and polygons
 * without mutating or distorting original baseline coordinates.
 */

export type LatLngCoord = [number, number]

/**
 * Smooth an open line (e.g., river, thalweg, corridor)
 * @param points Array of [lat, lng] coordinates
 * @param iterations Number of subdivision passes (default: 2)
 */
export function chaikinSmoothLine(points: LatLngCoord[], iterations = 2): LatLngCoord[] {
  if (!points || points.length < 3) return points
  let current = points

  for (let it = 0; it < iterations; it++) {
    const next: LatLngCoord[] = [current[0]]
    for (let i = 0; i < current.length - 1; i++) {
      const p0 = current[i]
      const p1 = current[i + 1]

      // Q = 0.75 * P0 + 0.25 * P1
      const q: LatLngCoord = [
        0.75 * p0[0] + 0.25 * p1[0],
        0.75 * p0[1] + 0.25 * p1[1],
      ]
      // R = 0.25 * P0 + 0.75 * P1
      const r: LatLngCoord = [
        0.25 * p0[0] + 0.75 * p1[0],
        0.25 * p0[1] + 0.75 * p1[1],
      ]

      next.push(q, r)
    }
    next.push(current[current.length - 1])
    current = next
  }

  return current
}

/**
 * Smooth a closed polygon (e.g. basin watershed boundary)
 * @param points Array of [lat, lng] coordinates
 * @param iterations Number of subdivision passes (default: 2)
 */
export function chaikinSmoothPolygon(points: LatLngCoord[], iterations = 2): LatLngCoord[] {
  if (!points || points.length < 4) return points
  let current = points

  // Check if closed (first point equals last point)
  const isClosed =
    Math.abs(current[0][0] - current[current.length - 1][0]) < 0.00001 &&
    Math.abs(current[0][1] - current[current.length - 1][1]) < 0.00001
  const ring: LatLngCoord[] = isClosed ? current.slice(0, current.length - 1) : [...current]

  for (let it = 0; it < iterations; it++) {
    const next: LatLngCoord[] = []
    const n = ring.length
    for (let i = 0; i < n; i++) {
      const p0 = ring[i]
      const p1 = ring[(i + 1) % n]
      const q: LatLngCoord = [
        0.75 * p0[0] + 0.25 * p1[0],
        0.75 * p0[1] + 0.25 * p1[1],
      ]
      const r: LatLngCoord = [
        0.25 * p0[0] + 0.75 * p1[0],
        0.25 * p0[1] + 0.75 * p1[1],
      ]
      next.push(q, r)
    }
    ring.length = 0
    ring.push(...next)
  }

  // Ensure closed loop
  ring.push([ring[0][0], ring[0][1]])
  return ring
}
