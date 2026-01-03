'use client'

import { useState } from 'react'
import type { FlyingLocation } from '@/lib/types'
import SafetyStatusBadge from './SafetyStatusBadge'

interface SavedLocationsListProps {
  locations: FlyingLocation[]
  loading: boolean
  onSelectLocation: (location: FlyingLocation) => void
  onDeleteLocation: (id: number) => Promise<boolean>
}

/**
 * Saved Locations List Component
 *
 * Displays a list of user's saved flying locations.
 *
 * Features:
 * - Click to load location on map
 * - Delete location
 * - Show last safety status
 * - Show nearest airport info
 *
 * @example
 * <SavedLocationsList
 *   locations={locations}
 *   loading={false}
 *   onSelectLocation={(loc) => { ... }}
 *   onDeleteLocation={async (id) => { ... }}
 * />
 */
export default function SavedLocationsList({
  locations,
  loading,
  onSelectLocation,
  onDeleteLocation
}: SavedLocationsListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Er du sikker på at du vil slette "${name}"?`)) {
      return
    }

    setDeletingId(id)
    const success = await onDeleteLocation(id)

    if (!success) {
      alert('Kunne ikke slette lokasjon. Prøv igjen.')
    }

    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Lagrede lokasjoner
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Lagrede lokasjoner
        </h2>
        <div className="text-center py-8 text-gray-500">
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
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
            />
          </svg>
          <p className="font-medium">Ingen lagrede lokasjoner</p>
          <p className="text-sm mt-1">
            Velg en lokasjon på kartet og lagre den
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">
          Lagrede lokasjoner
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {locations.length} {locations.length === 1 ? 'lokasjon' : 'lokasjoner'}
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {locations.map((location) => (
          <div
            key={location.id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Location info */}
              <button
                onClick={() => onSelectLocation(location)}
                className="flex-1 text-left min-w-0 cursor-pointer"
              >
                <div className="flex items-start gap-2">
                  <svg
                    className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0"
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

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">
                        {location.name}
                      </h3>
                      {location.last_status && (
                        <span
                          className={`
                            flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                            ${
                              location.last_status === 'GRØNN'
                                ? 'bg-green-500 text-white'
                                : 'bg-red-500 text-white'
                            }
                          `}
                          title={location.last_status}
                        >
                          {location.last_status === 'GRØNN' ? '✓' : '✕'}
                        </span>
                      )}
                    </div>

                    {location.description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {location.description}
                      </p>
                    )}

                    <div className="text-[11px] text-gray-500 space-y-0.5">
                      <div className="flex items-start gap-1">
                        <svg className="h-3 w-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">
                          {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
                        </span>
                      </div>
                      {location.nearest_airport_name && (
                        <div className="flex items-start gap-1">
                          <svg className="h-3 w-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                          </svg>
                          <span className="truncate">
                            {location.nearest_airport_name} ({location.nearest_airport_distance?.toFixed(1)} km)
                          </span>
                        </div>
                      )}
                      {location.in_nature_reserve && (
                        <div className="flex items-start gap-1 text-amber-600">
                          <svg className="h-3 w-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                          </svg>
                          <span className="truncate">
                            {location.nature_reserve_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(location.id, location.name)}
                disabled={deletingId === location.id}
                className="
                  p-2 text-gray-400 hover:text-red-600 hover:bg-red-50
                  rounded-lg transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                title="Slett lokasjon"
              >
                {deletingId === location.id ? (
                  <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full" />
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
