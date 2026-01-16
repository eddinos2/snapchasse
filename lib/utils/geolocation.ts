/**
 * Geolocation utilities
 */

export type Coordinates = [number, number] // [longitude, latitude]

/**
 * Parse PostGIS POINT format to coordinates
 * Format: "POINT(lng lat)" or "SRID=4326;POINT(lng lat)"
 */
export function parsePostGISPoint(locationStr: string | null): Coordinates | null {
  if (!locationStr) return null
  
  // Handle SRID prefix
  const pointMatch = locationStr.match(/POINT\(([\d.]+)\s+([\d.]+)\)/)
  if (!pointMatch) return null
  
  const [, lng, lat] = pointMatch
  return [parseFloat(lng), parseFloat(lat)]
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371000 // Earth radius in meters
  const [lng1, lat1] = coord1
  const [lng2, lat2] = coord2
  
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lng2 - lng1) * Math.PI) / 180
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

/**
 * Check if user is within radius of target location
 */
export function isWithinRadius(
  userLocation: Coordinates,
  targetLocation: Coordinates,
  radiusMeters: number
): boolean {
  const distance = calculateDistance(userLocation, targetLocation)
  return distance <= radiusMeters
}
