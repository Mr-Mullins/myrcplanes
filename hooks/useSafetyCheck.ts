'use client'

import { useState, useCallback } from 'react'
import { checkLocationSafety } from '@/lib/locationService'
import type { SafetyCheckResult } from '@/lib/types'

/**
 * React Hook for Location Safety Checking
 *
 * Provides an easy-to-use interface for checking if a location is safe
 * for flying drones/RC planes.
 *
 * @example
 * const { result, loading, checkSafety, reset } = useSafetyCheck()
 *
 * const handleLocationSelect = async (lat: number, lng: number) => {
 *   await checkSafety(lat, lng)
 * }
 *
 * if (result) {
 *   console.log(result.status) // 'GRØNN' or 'RØD'
 * }
 */
export function useSafetyCheck() {
  const [result, setResult] = useState<SafetyCheckResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Perform safety check for given coordinates
   */
  const checkSafety = useCallback(async (lat: number, lng: number) => {
    setLoading(true)
    setError(null)

    try {
      const safetyResult = await checkLocationSafety(lat, lng)
      setResult(safetyResult)

      // Set error if check failed but still returned a result
      if (safetyResult.error) {
        setError(safetyResult.error)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ukjent feil under sikkerhetssjekk'

      setError(errorMessage)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Reset the safety check state
   */
  const reset = useCallback(() => {
    setResult(null)
    setLoading(false)
    setError(null)
  }, [])

  return {
    result,
    loading,
    error,
    checkSafety,
    reset
  }
}
