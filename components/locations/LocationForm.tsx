'use client'

import { useState } from 'react'
import type { SafetyCheckResult } from '@/lib/types'

interface LocationFormProps {
  location: { lat: number; lng: number }
  safetyResult: SafetyCheckResult
  onSave: (data: {
    name: string
    description?: string
    notes?: string
  }) => Promise<boolean>
  onCancel: () => void
}

/**
 * Location Form Component
 *
 * Form for saving a flying location with name, description, and notes.
 * Automatically includes safety check results.
 *
 * @example
 * <LocationForm
 *   location={{ lat: 60.5, lng: 10.5 }}
 *   safetyResult={result}
 *   onSave={async (data) => { ... }}
 *   onCancel={() => { ... }}
 * />
 */
export default function LocationForm({
  location,
  safetyResult,
  onSave,
  onCancel
}: LocationFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError('Navn er påkrevd')
      return
    }

    setSaving(true)
    setError(null)

    const success = await onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      notes: notes.trim() || undefined
    })

    if (!success) {
      setError('Kunne ikke lagre lokasjon. Prøv igjen.')
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Lagre flyplassering
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location coordinates (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Koordinater
          </label>
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            📍 {location.lat.toFixed(5)}°N, {location.lng.toFixed(5)}°E
          </div>
        </div>

        {/* Safety status (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <span
              className={`font-semibold ${
                safetyResult.status === 'GRØNN'
                  ? 'text-green-700'
                  : 'text-red-700'
              }`}
            >
              {safetyResult.status}
            </span>
            {' • '}
            <span className="text-gray-600">
              {safetyResult.nearestAirport.name} ({safetyResult.nearestAirport.distance.toFixed(1)} km)
            </span>
          </div>
        </div>

        {/* Name (required) */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Navn <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="F.eks. Min favoritt flyplass"
            className="
              w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-shadow
            "
            maxLength={100}
            required
          />
        </div>

        {/* Description (optional) */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Beskrivelse
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="En kort beskrivelse av stedet..."
            rows={3}
            className="
              w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-shadow resize-none
            "
            maxLength={500}
          />
        </div>

        {/* Notes (optional) */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notater
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ekstra notater, tips, eller viktig informasjon..."
            rows={4}
            className="
              w-full px-4 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-shadow resize-none
            "
            maxLength={1000}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="
              flex-1 px-4 py-2 border border-gray-300 rounded-lg
              text-gray-700 font-medium
              hover:bg-gray-50 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            Avbryt
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="
              flex-1 px-4 py-2 bg-blue-600 rounded-lg
              text-white font-medium
              hover:bg-blue-700 transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Lagrer...</span>
              </>
            ) : (
              <>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Lagre lokasjon</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
