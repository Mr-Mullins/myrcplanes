import proj4 from 'proj4'
import type { Airport } from './types'

/**
 * Coordinate Utilities for Drone Safety Checking
 *
 * This module provides:
 * 1. Haversine distance calculation (great-circle distance)
 * 2. Coordinate transformation (WGS84 ↔ UTM Zone 33N)
 * 3. Airport proximity calculations
 */

// ============================================
// COORDINATE SYSTEM DEFINITIONS
// ============================================

// WGS84 - Standard GPS coordinate system (latitude/longitude in degrees)
// Used by: GPS, Leaflet maps, browser geolocation API
const WGS84 = 'EPSG:4326'

// UTM Zone 33N - Projected coordinate system for Norway (easting/northing in meters)
// Used by: Geonorge API, Norwegian government map data
const UTM33N = 'EPSG:25833'

// Define coordinate systems for proj4
proj4.defs([
  [WGS84, '+proj=longlat +datum=WGS84 +no_defs'],
  [UTM33N, '+proj=utm +zone=33 +ellps=GRS80 +units=m +no_defs']
])

// ============================================
// COORDINATE TRANSFORMATION
// ============================================

/**
 * Transform WGS84 coordinates (lat/lng) to UTM Zone 33N (easting/northing)
 *
 * CRITICAL: Geonorge API requires coordinates in UTM33N format.
 * Querying with WGS84 coordinates will return incorrect or no results.
 *
 * @param lat Latitude in degrees (-90 to 90)
 * @param lng Longitude in degrees (-180 to 180)
 * @returns [easting, northing] in meters
 *
 * @example
 * const [easting, northing] = wgs84ToUtm33(60.1939, 11.1004)
 * // Returns: [599292.46, 6672933.15] (Oslo Airport in UTM33N)
 */
export function wgs84ToUtm33(lat: number, lng: number): [number, number] {
  // IMPORTANT: proj4 expects [longitude, latitude] order (x, y)
  // NOT [latitude, longitude] like most JS libraries!
  const [easting, northing] = proj4(WGS84, UTM33N, [lng, lat])
  return [easting, northing]
}

/**
 * Transform UTM Zone 33N coordinates to WGS84 (lat/lng)
 *
 * @param easting Easting in meters
 * @param northing Northing in meters
 * @returns [latitude, longitude] in degrees
 */
export function utm33ToWgs84(easting: number, northing: number): [number, number] {
  const [lng, lat] = proj4(UTM33N, WGS84, [easting, northing])
  return [lat, lng]
}

// ============================================
// HAVERSINE DISTANCE CALCULATION
// ============================================

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Calculate great-circle distance between two points on Earth
 * using the Haversine formula
 *
 * This is more accurate than simple Euclidean distance for geographic coordinates,
 * especially over longer distances, as it accounts for Earth's curvature.
 *
 * @param lat1 First point latitude
 * @param lng1 First point longitude
 * @param lat2 Second point latitude
 * @param lng2 Second point longitude
 * @returns Distance in kilometers
 *
 * @example
 * const distance = haversineDistance(60.1939, 11.1004, 59.9139, 10.7522)
 * // Returns: ~37.4 km (Oslo Airport to Oslo city center)
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

// ============================================
// AIRPORT PROXIMITY CALCULATIONS
// ============================================

/**
 * Find the nearest airport to a given location
 *
 * @param lat Target latitude
 * @param lng Target longitude
 * @param airports Array of airports to check
 * @returns Object with nearest airport and distance in km
 *
 * @example
 * const { airport, distance } = findNearestAirport(60.5, 10.5, NORWEGIAN_AIRPORTS)
 * // Returns: { airport: { name: "Oslo Gardermoen", ... }, distance: 47.4 }
 */
export function findNearestAirport(
  lat: number,
  lng: number,
  airports: Airport[]
): { airport: Airport; distance: number } {
  if (airports.length === 0) {
    throw new Error('No airports provided')
  }

  let nearestAirport = airports[0]
  let minDistance = haversineDistance(
    lat,
    lng,
    airports[0].latitude,
    airports[0].longitude
  )

  for (let i = 1; i < airports.length; i++) {
    const airport = airports[i]
    const distance = haversineDistance(
      lat,
      lng,
      airport.latitude,
      airport.longitude
    )

    if (distance < minDistance) {
      minDistance = distance
      nearestAirport = airport
    }
  }

  // Round distance to 2 decimal places
  return {
    airport: nearestAirport,
    distance: Math.round(minDistance * 100) / 100
  }
}

/**
 * Check if a location is within a specified radius of any airport
 *
 * @param lat Target latitude
 * @param lng Target longitude
 * @param airports Array of airports to check
 * @param radiusKm Radius in kilometers (default: 5km per Norwegian regulations)
 * @returns True if location is within radius of any airport
 */
export function isNearAirport(
  lat: number,
  lng: number,
  airports: Airport[],
  radiusKm: number = 5
): boolean {
  return airports.some((airport) => {
    const distance = haversineDistance(
      lat,
      lng,
      airport.latitude,
      airport.longitude
    )
    return distance <= radiusKm
  })
}

// ============================================
// COORDINATE VALIDATION
// ============================================

/**
 * Validate if coordinates are within Norwegian bounds
 *
 * Norway's approximate geographic bounds:
 * - Latitude: 57°N to 72°N (mainland + Svalbard)
 * - Longitude: 4°E to 32°E
 *
 * @param lat Latitude to check
 * @param lng Longitude to check
 * @returns True if coordinates are within Norwegian bounds
 */
export function isWithinNorway(lat: number, lng: number): boolean {
  return lat >= 57 && lat <= 72 && lng >= 4 && lng <= 32
}

/**
 * Validate coordinate format
 *
 * @param lat Latitude to check
 * @param lng Longitude to check
 * @returns True if coordinates are valid
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}
