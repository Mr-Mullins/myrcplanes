import { useMemo } from 'react'
import { beregnFlyData, type PlaneData, type CalculatedData } from '@/lib/planeCalculations'

/**
 * Custom hook for real-time plane calculations
 * Automatically recalculates when input values change
 */
export function usePlaneCalculations(planeData: Partial<PlaneData>): CalculatedData | null {
  return useMemo(() => {
    // Check if we have minimum required data for calculations
    const { vingespenn, rotKorde, tippKorde } = planeData
    
    if (!vingespenn || !rotKorde || !tippKorde) {
      return null
    }

    // All required values exist, perform calculation
    return beregnFlyData({
      vingespenn,
      rotKorde,
      tippKorde,
      sweep: planeData.sweep ?? 0,
      haleSpenn: planeData.haleSpenn,
      haleRotKorde: planeData.haleRotKorde,
      haleTippKorde: planeData.haleTippKorde,
      avstandVingeHale: planeData.avstandVingeHale
    })
  }, [planeData.vingespenn, planeData.rotKorde, planeData.tippKorde, planeData.sweep, planeData.haleSpenn, planeData.haleRotKorde, planeData.haleTippKorde, planeData.avstandVingeHale])
}

