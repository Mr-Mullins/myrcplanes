'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { Session } from '@supabase/supabase-js'
import Header from '@/components/layout/Header'
import LocationChecker from '@/components/locations/LocationChecker'
import LocationForm from '@/components/locations/LocationForm'
import SavedLocationsList from '@/components/locations/SavedLocationsList'
import { useSafetyCheck } from '@/hooks/useSafetyCheck'
import { useLocations } from '@/hooks/useLocations'

// Dynamic import of LocationMap to avoid SSR issues with Leaflet
const LocationMap = dynamic(
  () => import('@/components/locations/LocationMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-600">Laster kart...</div>
      </div>
    )
  }
)

/**
 * Flying Locations Page
 *
 * Main page for checking drone/RC plane flying locations in Norway.
 *
 * Features:
 * - Interactive map with click-to-select and geolocation
 * - Safety checks for airport proximity and nature reserves
 * - Save favorite locations
 * - View and manage saved locations
 */
export default function LocationsPage() {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [shouldZoomToSelected, setShouldZoomToSelected] = useState(false)

  // Custom hooks
  const { result, loading: checkingLocation, checkSafety } = useSafetyCheck()
  const {
    locations,
    loading: loadingLocations,
    saveLocation,
    deleteLocation
  } = useLocations()

  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Handle location selection from map
  const handleLocationSelect = async (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng })
    setShowSaveForm(false)
    await checkSafety(lat, lng)
  }

  // Handle location selection from saved list
  const handleSelectSavedLocation = async (
    location: (typeof locations)[0]
  ) => {
    setShouldZoomToSelected(true)
    setSelectedLocation({
      lat: location.latitude,
      lng: location.longitude
    })
    setShowSaveForm(false)
    await checkSafety(location.latitude, location.longitude)
    // Reset zoom flag after a short delay
    setTimeout(() => setShouldZoomToSelected(false), 200)
  }

  // Handle save location
  const handleSaveLocation = async (data: {
    name: string
    description?: string
    notes?: string
  }) => {
    if (!selectedLocation || !result) return false

    const success = await saveLocation({
      name: data.name,
      description: data.description,
      notes: data.notes,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
      last_checked_at: new Date().toISOString(),
      last_status: result.status,
      nearest_airport_name: result.nearestAirport.name,
      nearest_airport_distance: result.nearestAirport.distance,
      in_nature_reserve: result.natureReserve?.isProtected,
      nature_reserve_name: result.natureReserve?.name
    })

    if (success) {
      setShowSaveForm(false)
    }

    return success
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Laster...</div>
      </div>
    )
  }

  // Redirect if not logged in
  if (!session) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main content - 2 column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left column - Map and checker */}
          <div className="lg:col-span-3 space-y-6">
            {/* Map */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Sikker flyving
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Sjekk om en lokasjon er trygg for å fly drone eller modellfly
                </p>
              </div>
              <LocationMap
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation}
                height="500px"
                shouldZoomOnSelect={shouldZoomToSelected}
                natureReserveGeometry={result?.natureReserve?.geometry}
                safetyStatus={result?.status}
                safetyWarnings={result?.warnings}
              />
            </div>

            {/* Safety checker */}
            <LocationChecker
              result={result}
              loading={checkingLocation}
              selectedLocation={selectedLocation}
            />

            {/* Save button */}
            {result && selectedLocation && !showSaveForm && (
              <div className="bg-white rounded-lg shadow p-4">
                <button
                  onClick={() => setShowSaveForm(true)}
                  className="
                    w-full px-4 py-3 bg-blue-600 text-white rounded-lg
                    font-medium hover:bg-blue-700 transition-colors
                    flex items-center justify-center gap-2
                  "
                >
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
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  <span>Lagre denne lokasjonen</span>
                </button>
              </div>
            )}

            {/* Save form */}
            {showSaveForm && result && selectedLocation && (
              <LocationForm
                location={selectedLocation}
                safetyResult={result}
                onSave={handleSaveLocation}
                onCancel={() => setShowSaveForm(false)}
              />
            )}
          </div>

          {/* Right column - Saved locations */}
          <div className="lg:col-span-1">
            <SavedLocationsList
              locations={locations}
              loading={loadingLocations}
              onSelectLocation={handleSelectSavedLocation}
              onDeleteLocation={deleteLocation}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
