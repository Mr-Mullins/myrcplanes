import { findNearestAirport, isValidCoordinate, isWithinNorway } from './coordinateUtils'
import { checkNatureReserve } from './geonorgeService'
import { NORWEGIAN_AIRPORTS } from './airportData'
import type { SafetyCheckResult } from './types'

/**
 * Location Safety Service
 *
 * Main orchestration service for checking if a location is safe for flying drones/RC planes.
 *
 * Checks performed:
 * 1. Airport proximity - RED ZONE if within 5km of any Norwegian airport
 * 2. Nature reserves - RED ZONE if inside protected nature reserve
 *
 * Returns: GRØNN (green/safe) or RØD (red/unsafe)
 *
 * IMPORTANT: Always display NOTAM disclaimer - this tool does NOT check temporary restrictions!
 */

// Red zone radius around airports (Norwegian regulations)
const RED_ZONE_RADIUS_KM = 5

/**
 * Check location safety for drone/RC plane flying
 *
 * @param lat Latitude in WGS84 (EPSG:4326)
 * @param lng Longitude in WGS84 (EPSG:4326)
 * @returns Promise with complete safety check result
 *
 * @example
 * const result = await checkLocationSafety(60.1939, 11.1004)
 * console.log(result.status) // 'RØD' - This is Oslo Airport!
 */
export async function checkLocationSafety(
  lat: number,
  lng: number
): Promise<SafetyCheckResult> {
  try {
    // Step 1: Validate coordinates
    if (!isValidCoordinate(lat, lng)) {
      return {
        status: 'RØD',
        nearestAirport: {
          name: 'Ukjent',
          code: '',
          distance: 0
        },
        warnings: ['Ugyldige koordinater'],
        error: 'Koordinatene er ikke gyldige'
      }
    }

    if (!isWithinNorway(lat, lng)) {
      return {
        status: 'RØD',
        nearestAirport: {
          name: 'Ukjent',
          code: '',
          distance: 0
        },
        warnings: ['Koordinatene er utenfor Norge'],
        error: 'Disse koordinatene er ikke innenfor Norges grenser'
      }
    }

    // Step 2: Check airport proximity (synchronous, fast)
    const { airport, distance } = findNearestAirport(
      lat,
      lng,
      NORWEGIAN_AIRPORTS
    )

    const isNearAirport = distance <= RED_ZONE_RADIUS_KM

    // Step 3: Check nature reserves (asynchronous, requires API call)
    const reserveCheck = await checkNatureReserve(lat, lng)

    // Step 4: Determine overall status
    const isRed = isNearAirport || reserveCheck.isProtected
    const status = isRed ? 'RØD' : 'GRØNN'

    // Step 5: Build warnings array
    const warnings: string[] = []

    if (isNearAirport) {
      warnings.push(
        `Innenfor ${RED_ZONE_RADIUS_KM} km av ${airport.name} (${distance.toFixed(1)} km)`
      )
    }

    if (reserveCheck.isProtected) {
      warnings.push(`Innenfor naturreservat: ${reserveCheck.reserveName}`)
    }

    // Step 6: Return complete result
    return {
      status,
      nearestAirport: {
        name: airport.name,
        code: airport.code,
        distance
      },
      natureReserve: {
        isProtected: reserveCheck.isProtected,
        name: reserveCheck.reserveName,
        geometry: reserveCheck.geometry
      },
      warnings,
      error: reserveCheck.error
    }
  } catch (error) {
    // Handle unexpected errors gracefully
    console.error('Safety check error:', error)

    return {
      status: 'RØD',
      nearestAirport: {
        name: 'Ukjent',
        code: '',
        distance: 0
      },
      warnings: ['Kunne ikke fullføre sikkerhetssjekk'],
      error: 'En uventet feil oppstod under sikkerhetssjekk'
    }
  }
}

/**
 * Get a human-readable status message
 *
 * @param result Safety check result
 * @returns Norwegian status message
 */
export function getStatusMessage(result: SafetyCheckResult): string {
  if (result.status === 'RØD') {
    return 'RØD SONE - Ikke trygt å fly her'
  }
  return 'GRØNN SONE - Trygt å fly (husk å sjekk NOTAMs)'
}

/**
 * Check if location requires NOTAM check
 * (Answer: Always yes! NOTAMs are mandatory to check)
 *
 * @returns Always true - NOTAM checking is always required
 */
export function requiresNotamCheck(): boolean {
  return true
}

/**
 * Get NOTAM disclaimer text
 *
 * @returns Norwegian disclaimer text
 */
export function getNotamDisclaimer(): string {
  return `Dette verktøyet sjekker kun STATISKE data (flyplasser og naturreservater).
Du MÅ alltid sjekke følgende FØR du flyr:

1. Midlertidige restriksjoner (NOTAMs): https://ippc.no
2. Avidrone appen (ny Avinor-app lansert desember 2024)
3. Værmeldingen og vindforhold
4. At du har nødvendige sertifiseringer (A1/A2/A3)
5. At dronen din er registrert på flydrone.no

Dette verktøyet erstatter IKKE pilotens ansvar for å sjekke alle restriksjoner!`
}
