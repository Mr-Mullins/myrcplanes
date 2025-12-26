'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Circle, Polygon, Tooltip, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { NORWEGIAN_AIRPORTS } from '@/lib/airportData'

// Create a custom airport icon
const airportIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNlZjQ0NDQiLz4KPHBhdGggZD0iTTggMTJMMTIgOEwxNiAxMkwxMiAxNkw4IDEyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8]
})

// Fix Leaflet default marker icon issue with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

/**
 * Available map layer types
 */
type MapLayerType = 'osm' | 'satellite' | 'terrain'

/**
 * Map layer configurations
 */
const MAP_LAYERS = {
  osm: {
    name: 'Kart',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  },
  satellite: {
    name: 'Flyfoto',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    maxZoom: 19
  },
  terrain: {
    name: 'Terreng',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17
  }
}

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void
  selectedLocation?: { lat: number; lng: number } | null
  height?: string
  shouldZoomOnSelect?: boolean
  showAirportZones?: boolean
  natureReserveGeometry?: any
  safetyStatus?: 'GRØNN' | 'RØD' | null
  safetyWarnings?: string[]
}

/**
 * Map Click Handler Component
 * Handles click events on the map
 */
function MapClickHandler({
  onLocationSelect
}: {
  onLocationSelect: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}

/**
 * Map Center Controller
 * Updates map center when selectedLocation changes
 */
function MapCenterController({
  location,
  shouldZoom
}: {
  location?: { lat: number; lng: number } | null
  shouldZoom?: boolean
}) {
  const map = useMap()

  useEffect(() => {
    if (location) {
      if (shouldZoom) {
        // Zoom to level 14 when using "my location" for better detail
        map.setView([location.lat, location.lng], 14)
      } else {
        // Keep current zoom when clicking on map or selecting saved location
        map.setView([location.lat, location.lng], map.getZoom())
      }
    }
  }, [location, shouldZoom, map])

  return null
}

/**
 * Location Map Component
 *
 * Interactive Leaflet map for selecting flying locations.
 *
 * Features:
 * - Click on map to select location
 * - "Use my location" button (browser geolocation)
 * - Marker shows selected location
 * - Centered on Norway by default
 *
 * @example
 * <LocationMap
 *   onLocationSelect={(lat, lng) => console.log(lat, lng)}
 *   selectedLocation={{ lat: 60.5, lng: 10.5 }}
 * />
 */
export default function LocationMap({
  onLocationSelect,
  selectedLocation,
  height = '500px',
  shouldZoomOnSelect = false,
  showAirportZones = true,
  natureReserveGeometry,
  safetyStatus,
  safetyWarnings = []
}: LocationMapProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentLayer, setCurrentLayer] = useState<MapLayerType>('osm')
  const [shouldZoomToLocation, setShouldZoomToLocation] = useState(false)
  const [zonesVisible, setZonesVisible] = useState(showAirportZones)

  // Update zoom flag when shouldZoomOnSelect prop changes
  useEffect(() => {
    if (shouldZoomOnSelect && selectedLocation) {
      setShouldZoomToLocation(true)
      // Reset after applying zoom
      setTimeout(() => setShouldZoomToLocation(false), 100)
    }
  }, [shouldZoomOnSelect, selectedLocation])

  /**
   * Handle "Use My Location" button click
   * Uses browser geolocation API directly
   */
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation støttes ikke av din nettleser')
      return
    }

    setIsLoading(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setShouldZoomToLocation(true)
        onLocationSelect(position.coords.latitude, position.coords.longitude)
        setIsLoading(false)
        // Reset zoom flag after a short delay
        setTimeout(() => setShouldZoomToLocation(false), 100)
      },
      (error) => {
        let errorMessage = 'Kunne ikke hente posisjon'
        let helpText = ''

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Tillatelse til posisjon ble nektet'
            helpText = 'For å bruke denne funksjonen må du gi tillatelse i nettleserens innstillinger.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Posisjonen er ikke tilgjengelig'
            helpText = 'Sjekk at GPS/posisjonering er aktivert på enheten din.'
            break
          case error.TIMEOUT:
            errorMessage = 'Tidsavbrudd ved henting av posisjon'
            helpText = 'Prøv igjen. Sjekk at du har god forbindelse.'
            break
        }

        alert(errorMessage + (helpText ? '\n\n' + helpText : ''))
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const layer = MAP_LAYERS[currentLayer]

  return (
    <div className="relative">
      <MapContainer
        center={[60.472, 8.469]} // Center of Norway
        zoom={6}
        style={{ height, width: '100%' }}
        className="rounded-lg z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          key={currentLayer}
          url={layer.url}
          attribution={layer.attribution}
          maxZoom={layer.maxZoom}
        />

        <MapClickHandler onLocationSelect={onLocationSelect} />
        <MapCenterController location={selectedLocation} shouldZoom={shouldZoomToLocation} />

        {/* Airport red zones (5km radius) */}
        {zonesVisible && NORWEGIAN_AIRPORTS.map((airport, index) => (
          <Circle
            key={`zone-${airport.code}-${index}`}
            center={[airport.latitude, airport.longitude]}
            radius={5000} // 5km in meters
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.15,
              weight: 1.5,
              opacity: 0.5
            }}
          >
            <Tooltip>
              <div className="text-xs">
                <div className="font-semibold">{airport.name}</div>
                <div className="text-gray-600">{airport.code}</div>
                <div className="text-red-600 mt-1">Rød sone: 5 km radius</div>
              </div>
            </Tooltip>
          </Circle>
        ))}

        {/* Airport markers */}
        {zonesVisible && NORWEGIAN_AIRPORTS.map((airport, index) => (
          <Marker
            key={`marker-${airport.code}-${index}`}
            position={[airport.latitude, airport.longitude]}
            icon={airportIcon}
          >
            <Tooltip>
              <div className="text-xs">
                <div className="font-semibold">{airport.name}</div>
                <div className="text-gray-600">{airport.code}</div>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
        )}

        {/* Nature reserve boundary (only shown when checked location is inside one) */}
        {natureReserveGeometry && (() => {
          try {
            // Convert Esri JSON geometry to Leaflet coordinate format
            let coordinates: [number, number][] | [number, number][][] = []

            if (natureReserveGeometry.rings) {
              // Polygon with rings (may have holes)
              coordinates = natureReserveGeometry.rings[0].map((coord: number[]) => [coord[1], coord[0]] as [number, number])
            } else if (natureReserveGeometry.coordinates) {
              // GeoJSON format
              if (natureReserveGeometry.type === 'Polygon') {
                coordinates = natureReserveGeometry.coordinates[0].map((coord: number[]) => [coord[1], coord[0]] as [number, number])
              } else if (natureReserveGeometry.type === 'MultiPolygon') {
                // Use first polygon for now
                coordinates = natureReserveGeometry.coordinates[0][0].map((coord: number[]) => [coord[1], coord[0]] as [number, number])
              }
            }

            if (coordinates.length > 0) {
              return (
                <Polygon
                  positions={coordinates}
                  pathOptions={{
                    color: '#f59e0b',
                    fillColor: '#fbbf24',
                    fillOpacity: 0.2,
                    weight: 2,
                    opacity: 0.7
                  }}
                >
                  <Tooltip>
                    <div className="text-xs">
                      <div className="font-semibold text-amber-700">Naturreservat</div>
                      <div className="text-gray-600 mt-1">Rød sone</div>
                    </div>
                  </Tooltip>
                </Polygon>
              )
            }
          } catch (error) {
            console.error('Error rendering nature reserve geometry:', error)
          }
          return null
        })()}
      </MapContainer>

      {/* Safety Status Badge - shown on map */}
      {safetyStatus && selectedLocation && (
        <div className="absolute top-24 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2 max-w-xs">
          <div className="flex items-start gap-2">
            {/* Status indicator */}
            <div
              className={`
                flex items-center gap-1.5 px-2 py-1 rounded-full border font-semibold text-xs flex-shrink-0
                ${
                  safetyStatus === 'GRØNN'
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }
              `}
            >
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  safetyStatus === 'GRØNN' ? 'bg-green-600' : 'bg-red-600'
                }`}
              />
              <span>{safetyStatus}</span>
            </div>

            {/* Warnings */}
            {safetyWarnings.length > 0 && (
              <div className="flex-1 text-xs text-gray-700 leading-tight">
                {safetyWarnings.map((warning, index) => (
                  <div key={index} className="flex items-start gap-1">
                    <span className="text-red-600 flex-shrink-0 mt-0.5">•</span>
                    <span className="text-[11px]">{warning}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Control Panel - Layer Selector and Zone Toggle */}
      <div className="absolute bottom-8 left-4 z-[1000] flex flex-col gap-2">
        {/* Layer Selector */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex">
          {(Object.keys(MAP_LAYERS) as MapLayerType[]).map((layerType) => (
            <button
              key={layerType}
              onClick={() => setCurrentLayer(layerType)}
              className={`
                px-4 py-2 text-sm font-medium transition-colors
                border-r border-gray-200 last:border-r-0
                ${
                  currentLayer === layerType
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {MAP_LAYERS[layerType].name}
            </button>
          ))}
        </div>

        {/* Zone Toggle */}
        <button
          onClick={() => setZonesVisible(!zonesVisible)}
          className={`
            px-4 py-2 text-sm font-medium rounded-lg shadow-lg transition-colors
            flex items-center gap-2
            ${
              zonesVisible
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          <div className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${zonesVisible ? 'bg-white' : 'bg-red-500'}`} />
            <span>Flyplasssoner (5km)</span>
          </div>
        </button>
      </div>

      {/* Use My Location Button */}
      <button
        onClick={handleUseMyLocation}
        disabled={isLoading}
        className="
          absolute top-4 right-4 z-[1000]
          bg-white px-4 py-2 rounded-lg shadow-lg
          hover:bg-gray-50 transition-colors
          flex items-center gap-2
          disabled:opacity-50 disabled:cursor-not-allowed
          font-medium text-gray-700
        "
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
            <span>Henter...</span>
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5 text-blue-600"
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
            <span>Bruk min posisjon</span>
          </>
        )}
      </button>

      {/* Instructions */}
      <div className="mt-3 text-sm text-gray-600 flex items-start gap-2">
        <svg
          className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>
          Klikk på kartet for å velge en lokasjon, eller bruk "Bruk min posisjon"-knappen
        </p>
      </div>
    </div>
  )
}
