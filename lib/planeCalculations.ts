/**
 * Beregner Aerodynamiske data for et RC-fly.
 * Alle mål bør være i samme enhet (f.eks. cm).
 */

export interface PlaneData {
  vingespenn: number
  rotKorde: number
  tippKorde: number
  sweep?: number // Avstand fremkant rot til fremkant tipp (0 for rette vinger)
  haleSpenn?: number // Halens vingespenn
  haleRotKorde?: number // Halens rotkorde
  haleTippKorde?: number // Halens tippkorde (valgfri, bruker rotkorde hvis ikke satt)
  avstandVingeHale?: number // Fra AC vinge til AC hale
}

export interface CalculatedData {
  vingeAreal: number
  haleAreal: number
  mac: number
  macStart: number
  anbefaltCG: {
    fra: number
    til: number
  }
  beskjed: string
}

export function beregnFlyData(fly: PlaneData): CalculatedData {
  const { 
    vingespenn, 
    rotKorde, 
    tippKorde, 
    sweep = 0,
    haleSpenn = 0,
    haleRotKorde = 0,
    haleTippKorde,
    avstandVingeHale = 0
  } = fly

  // --- STEG A: Beregn Arealer ---
  
  // Vingeareal (Trapes-formel): ((Rot + Tipp) / 2) * Spenn
  const vingeAreal = ((rotKorde + tippKorde) / 2) * vingespenn

  // Haleareal (Samme formel for halen)
  // Hvis brukeren bare skriver inn én bredde for halen, antar vi den er firkantet
  const faktiskHaleTipp = haleTippKorde || haleRotKorde
  const haleAreal = ((haleRotKorde + faktiskHaleTipp) / 2) * haleSpenn

  // --- STEG B: Beregn MAC (Mean Aerodynamic Chord) for vingen ---
  const mac = (2/3) * (
    (Math.pow(rotKorde, 2) + (rotKorde * tippKorde) + Math.pow(tippKorde, 2)) / 
    (rotKorde + tippKorde)
  )

  // Finn hvor MAC starter (avstand fra vingens fremkant inne ved kroppen)
  const macLE = (rotKorde - mac) / 6 + (sweep * 0.5) // Forbedret sweep-justering

  // --- STEG C: Beregn anbefalt CG (tyngdepunkt) ---
  // Trygg start (Beginner): 25% av MAC
  // Aggressiv (Expert): 33% av MAC
  const cgFremre = macLE + (mac * 0.25)
  const cgBakre = macLE + (mac * 0.33)

  return {
    vingeAreal: parseFloat(vingeAreal.toFixed(0)),
    haleAreal: parseFloat(haleAreal.toFixed(0)),
    mac: parseFloat(mac.toFixed(1)),
    macStart: parseFloat(macLE.toFixed(2)),
    anbefaltCG: {
      fra: parseFloat(cgFremre.toFixed(1)),
      til: parseFloat(cgBakre.toFixed(1))
    },
    beskjed: "Mål dette fra der vingen starter (fremkant) inne ved kroppen."
  }
}

// Type for plane med beregnede verdier
export interface PlaneWithCalculations extends PlaneData {
  vingeAreal: number
  haleAreal: number
  mac: number
  cgFremre: number
  cgBakre: number
}

// Helper funksjon for å legge til beregninger til plane data
export function addCalculations(planeData: PlaneData): PlaneWithCalculations {
  const calculated = beregnFlyData(planeData)
  
  return {
    ...planeData,
    vingeAreal: calculated.vingeAreal,
    haleAreal: calculated.haleAreal,
    mac: calculated.mac,
    cgFremre: calculated.anbefaltCG.fra,
    cgBakre: calculated.anbefaltCG.til
  }
}

