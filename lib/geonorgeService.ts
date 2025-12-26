import { wgs84ToUtm33 } from './coordinateUtils'
import type { NatureReserveCheckResult } from './types'

/**
 * Geonorge API Service
 *
 * Checks if a location is inside a Norwegian nature reserve (naturreservat)
 * using Miljødirektoratet's ArcGIS REST API.
 *
 * API Documentation:
 * - Base URL: https://kart.miljodirektoratet.no/arcgis/rest/services/vern/MapServer
 * - Layer 0: Naturvernområder (Nature reserves)
 *
 * IMPORTANT: The API requires coordinates in UTM Zone 33N (EPSG:25833),
 * NOT WGS84. Always transform coordinates before querying!
 */

const GEONORGE_API_URL =
  'https://kart.miljodirektoratet.no/arcgis/rest/services/vern/MapServer/0/query'

// Timeout for API requests (10 seconds)
const API_TIMEOUT = 10000

/**
 * Check if a location is inside a Norwegian nature reserve
 *
 * @param lat Latitude in WGS84 (EPSG:4326)
 * @param lng Longitude in WGS84 (EPSG:4326)
 * @param includeGeometry Whether to include geometry in response (default: true)
 * @returns Promise with protection status and optional geometry
 *
 * @example
 * const result = await checkNatureReserve(60.5, 7.5)
 * if (result.isProtected) {
 *   console.log(`Inside ${result.reserveName}`)
 * }
 */
export async function checkNatureReserve(
  lat: number,
  lng: number,
  includeGeometry: boolean = true
): Promise<NatureReserveCheckResult> {
  try {
    // Step 1: Transform WGS84 coordinates to UTM33N
    const [easting, northing] = wgs84ToUtm33(lat, lng)

    // Step 2: Build query parameters
    const params = new URLSearchParams({
      // Geometry: Point in UTM33N coordinates
      geometry: `${easting},${northing}`,
      geometryType: 'esriGeometryPoint',

      // Spatial reference: UTM Zone 33N (EPSG:25833)
      inSR: '25833',
      outSR: '4326', // Return geometry in WGS84 for Leaflet

      // Spatial relationship: Check if point intersects protected area
      spatialRel: 'esriSpatialRelIntersects',

      // Fields to return from the database
      outFields: 'navn,offisieltNavn,verneform,iucn,kommune',

      // Response format
      f: 'json',

      // Return geometry if requested
      returnGeometry: includeGeometry ? 'true' : 'false',

      // Return attributes for all matching features
      returnIdsOnly: 'false',
      returnCountOnly: 'false'
    })

    // Step 3: Make API request with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    const response = await fetch(`${GEONORGE_API_URL}?${params}`, {
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`)
    }

    // Step 4: Parse response
    const data = await response.json()

    // Step 5: Check if location is in a protected area
    if (data.features && data.features.length > 0) {
      const feature = data.features[0]
      const attributes = feature.attributes

      return {
        isProtected: true,
        reserveName: attributes.offisieltNavn || attributes.navn || 'Ukjent vernområde',
        geometry: includeGeometry ? feature.geometry : undefined
      }
    }

    // No protected areas found
    return {
      isProtected: false
    }
  } catch (error) {
    // Handle errors gracefully
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          isProtected: false,
          error: 'Tidsavbrudd ved sjekk av naturreservater'
        }
      }

      return {
        isProtected: false,
        error: 'Kunne ikke sjekke naturreservater'
      }
    }

    return {
      isProtected: false,
      error: 'Ukjent feil ved sjekk av naturreservater'
    }
  }
}

/**
 * Batch check multiple locations for nature reserves
 * (Useful for checking saved locations)
 *
 * @param locations Array of {lat, lng} coordinates
 * @returns Promise with array of results
 */
export async function checkMultipleNatureReserves(
  locations: Array<{ lat: number; lng: number }>
): Promise<NatureReserveCheckResult[]> {
  const promises = locations.map((loc) =>
    checkNatureReserve(loc.lat, loc.lng)
  )
  return Promise.all(promises)
}
