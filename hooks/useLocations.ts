'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { FlyingLocation } from '@/lib/types'

/**
 * React Hook for Flying Locations CRUD Operations
 *
 * Provides functions to create, read, update, and delete flying locations
 * from the Supabase database.
 *
 * Features:
 * - Automatic fetching on mount
 * - RLS (Row Level Security) ensures users only see their own locations
 * - Error handling
 * - Loading states
 *
 * @example
 * const { locations, loading, saveLocation, deleteLocation, updateLocation } = useLocations()
 *
 * // Save a new location
 * await saveLocation({
 *   name: 'Min favorittplass',
 *   latitude: 60.5,
 *   longitude: 10.5,
 *   last_status: 'GRØNN'
 * })
 */
export function useLocations() {
  const [locations, setLocations] = useState<FlyingLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch all flying locations for the current user
   */
  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('flying_locations')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setLocations(data || [])
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Kunne ikke hente lokasjoner'
      setError(errorMessage)
      console.error('Error fetching locations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Save a new flying location
   */
  const saveLocation = useCallback(
    async (
      location: Omit<
        FlyingLocation,
        'id' | 'user_id' | 'created_at' | 'updated_at'
      >
    ): Promise<boolean> => {
      try {
        setError(null)

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          throw new Error('Du må være innlogget for å lagre lokasjoner')
        }

        const { error: insertError } = await supabase
          .from('flying_locations')
          .insert([{ ...location, user_id: user.id }])

        if (insertError) throw insertError

        // Refresh the list
        await fetchLocations()
        return true
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Kunne ikke lagre lokasjon'
        setError(errorMessage)
        console.error('Error saving location:', err)
        return false
      }
    },
    [fetchLocations]
  )

  /**
   * Update an existing flying location
   */
  const updateLocation = useCallback(
    async (
      id: number,
      updates: Partial<Omit<FlyingLocation, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
    ): Promise<boolean> => {
      try {
        setError(null)

        const { error: updateError } = await supabase
          .from('flying_locations')
          .update(updates)
          .eq('id', id)

        if (updateError) throw updateError

        // Refresh the list
        await fetchLocations()
        return true
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Kunne ikke oppdatere lokasjon'
        setError(errorMessage)
        console.error('Error updating location:', err)
        return false
      }
    },
    [fetchLocations]
  )

  /**
   * Delete a flying location
   */
  const deleteLocation = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        setError(null)

        const { error: deleteError } = await supabase
          .from('flying_locations')
          .delete()
          .eq('id', id)

        if (deleteError) throw deleteError

        // Refresh the list
        await fetchLocations()
        return true
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Kunne ikke slette lokasjon'
        setError(errorMessage)
        console.error('Error deleting location:', err)
        return false
      }
    },
    [fetchLocations]
  )

  /**
   * Get a single location by ID
   */
  const getLocation = useCallback(
    (id: number): FlyingLocation | undefined => {
      return locations.find((loc) => loc.id === id)
    },
    [locations]
  )

  // Fetch locations on mount
  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  return {
    locations,
    loading,
    error,
    saveLocation,
    updateLocation,
    deleteLocation,
    getLocation,
    refetch: fetchLocations
  }
}
