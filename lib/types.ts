export interface PlaneImage {
  id: number
  plane_id: number
  image_url: string
  is_thumbnail: boolean
  display_order: number
  uploaded_at: string
}

export interface RCPlane {
  id: number
  user_id: string
  name: string
  manufacturer?: string
  model?: string
  
  // Aerodynamic measurements
  vingespenn?: number
  rot_korde?: number
  tipp_korde?: number
  sweep?: number
  hale_spenn?: number
  hale_rot_korde?: number
  hale_tipp_korde?: number
  avstand_vinge_hale?: number
  
  // Calculated values
  vinge_areal?: number
  hale_areal?: number
  mac?: number
  cg_fremre?: number
  cg_bakre?: number
  
  notes?: string
  created_at: string
  updated_at: string
  
  // Relationer
  images?: PlaneImage[]
}

export interface PlaneFormData {
  name: string
  manufacturer: string
  model: string
  vingespenn: string
  rot_korde: string
  tipp_korde: string
  sweep: string
  hale_spenn: string
  hale_rot_korde: string
  hale_tipp_korde: string
  avstand_vinge_hale: string
  notes: string
}

// ============================================
// FLYING LOCATIONS TYPES
// ============================================

export interface FlyingLocation {
  id: number
  user_id: string
  name: string
  description?: string
  latitude: number
  longitude: number
  last_checked_at?: string
  last_status?: 'GRØNN' | 'RØD'
  nearest_airport_name?: string
  nearest_airport_distance?: number
  in_nature_reserve?: boolean
  nature_reserve_name?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Airport {
  name: string
  code: string
  latitude: number
  longitude: number
  type?: 'primary' | 'regional' | 'private'
}

export interface SafetyCheckResult {
  status: 'GRØNN' | 'RØD'
  nearestAirport: {
    name: string
    code: string
    distance: number // in kilometers
  }
  natureReserve?: {
    isProtected: boolean
    name?: string
    geometry?: any // GeoJSON geometry from Geonorge API
  }
  warnings: string[]
  error?: string
}

export interface NatureReserveCheckResult {
  isProtected: boolean
  reserveName?: string
  geometry?: any // GeoJSON geometry from Geonorge API
  error?: string
}

