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

