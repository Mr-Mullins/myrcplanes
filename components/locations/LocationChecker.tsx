import type { SafetyCheckResult } from '@/lib/types'
import SafetyStatusBadge from './SafetyStatusBadge'

interface LocationCheckerProps {
  result: SafetyCheckResult | null
  loading: boolean
  selectedLocation?: { lat: number; lng: number } | null
}

/**
 * Location Checker Component
 *
 * Displays safety check results for a selected location:
 * - Overall status (GRØNN/RØD)
 * - Nearest airport with distance
 * - Nature reserve information (if applicable)
 * - Warnings
 * - MANDATORY NOTAM disclaimer
 *
 * @example
 * <LocationChecker result={safetyResult} loading={false} />
 */
export default function LocationChecker({
  result,
  loading,
  selectedLocation
}: LocationCheckerProps) {
  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
          <span className="text-gray-600">Sjekker sikkerhet...</span>
        </div>
      </div>
    )
  }

  // No location selected
  if (!result) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <svg
            className="h-12 w-12 mx-auto mb-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="font-medium">Velg en lokasjon på kartet</p>
          <p className="text-sm mt-1">
            Klikk på kartet eller bruk "Bruk min posisjon"
          </p>
        </div>
      </div>
    )
  }

  // Show results
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header with status */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Sikkerhetssjekk</h2>
          <SafetyStatusBadge status={result.status} size="lg" />
        </div>

        {selectedLocation && (
          <p className="text-sm text-gray-600">
            📍 {selectedLocation.lat.toFixed(4)}°N, {selectedLocation.lng.toFixed(4)}°E
          </p>
        )}
      </div>

      {/* Results */}
      <div className="p-6 space-y-4">
        {/* Airport proximity */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Nærmeste flyplass
          </h3>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <svg
              className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {result.nearestAirport.name}
              </p>
              <p className="text-sm text-gray-600">
                {result.nearestAirport.code} • {result.nearestAirport.distance.toFixed(1)} km unna
              </p>
            </div>
          </div>
        </div>

        {/* Nature reserve */}
        {result.natureReserve && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Naturreservat
            </h3>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <svg
                className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                />
              </svg>
              <div className="flex-1">
                {result.natureReserve.isProtected ? (
                  <>
                    <p className="font-medium text-red-700">
                      ⚠️ Innenfor vernområde
                    </p>
                    <p className="text-sm text-gray-600">
                      {result.natureReserve.name}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">
                    ✅ Ingen vernområder registrert
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Warnings */}
        {result.warnings.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Advarsler
            </h3>
            <ul className="space-y-2">
              {result.warnings.map((warning, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-red-700"
                >
                  <svg
                    className="h-5 w-5 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Error message */}
        {result.error && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ {result.error}
            </p>
          </div>
        )}
      </div>

      {/* MANDATORY NOTAM Disclaimer */}
      <div className="p-6 bg-yellow-50 border-t border-yellow-200">
        <div className="flex items-start gap-3">
          <svg
            className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div className="flex-1 text-sm text-yellow-900">
            <p className="font-semibold mb-2">Viktig informasjon</p>
            <p className="mb-3">
              Dette verktøyet sjekker kun <strong>statiske data</strong>{' '}
              (flyplasser og naturreservater). Du MÅ alltid sjekke følgende FØR
              du flyr:
            </p>
            <ol className="list-decimal list-inside space-y-1 mb-3">
              <li>
                Midlertidige restriksjoner (NOTAMs):{' '}
                <a
                  href="https://ippc.no"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-700 underline hover:text-yellow-800 font-medium"
                >
                  ippc.no
                </a>
              </li>
              <li>Avidrone appen (ny Avinor-app desember 2024)</li>
              <li>Værmeldingen og vindforhold</li>
              <li>At du har nødvendige sertifiseringer (A1/A2/A3)</li>
              <li>
                At dronen din er registrert på{' '}
                <a
                  href="https://flydrone.no"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-700 underline hover:text-yellow-800 font-medium"
                >
                  flydrone.no
                </a>
              </li>
            </ol>
            <p className="text-xs font-semibold">
              Dette verktøyet erstatter IKKE pilotens ansvar for å sjekke alle
              restriksjoner!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
