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

  // --- STEG C: Beregn anbefalt CG med hensyn til halen ---
  let cgFremre: number
  let cgBakre: number

  // Sjekk om vi har nok data til å beregne med hale-påvirkning
  if (haleAreal > 0 && avstandVingeHale > 0 && vingeAreal > 0) {
    // Avansert metode: Beregn nøytralpunkt (NP) basert på Tail Volume Coefficient
    
    // Tail Volume Coefficient (Vbar)
    // Vbar = (haleAreal * avstandVingeHale) / (vingeAreal * mac)
    const tailVolume = (haleAreal * avstandVingeHale) / (vingeAreal * mac)
    
    // Estimer nøytralpunkt som prosent av MAC
    // For konvensjonelle fly er NP typisk rundt 25% + (tailVolume * 15-20%)
    // Dette er en forenklet tilnærming basert på empiriske data
    const npPercent = 0.25 + (tailVolume * 0.18)
    
    // Beregn nøytralpunkt posisjon
    const neutralPoint = macLE + (mac * npPercent)
    
    // CG skal være foran nøytralpunktet for stabilitet
    // Static Margin: 5-10% for stabile fly, 10-15% for veldig stabile trenere
    const staticMarginMin = 0.05  // 5% for sportsfly
    const staticMarginMax = 0.12  // 12% for stabile trenere
    
    // Beregn CG-område basert på static margin
    cgFremre = neutralPoint - (mac * staticMarginMax) // Mer stabilt (12% margin)
    cgBakre = neutralPoint - (mac * staticMarginMin)  // Mer agilt (5% margin)
    
    // Sørg for at CG ikke går bak 35% MAC (sikkerhet)
    const maxCG = macLE + (mac * 0.35)
    if (cgBakre > maxCG) {
      cgBakre = maxCG
    }
    
    // Sørg for at CG ikke går foran 15% MAC (for langt frem)
    const minCG = macLE + (mac * 0.15)
    if (cgFremre < minCG) {
      cgFremre = minCG
    }
  } else {
    // Enkel metode hvis hale-data mangler: bruk standard 25-33% MAC
    cgFremre = macLE + (mac * 0.25) // 25% MAC (Veldig stabilt)
    cgBakre = macLE + (mac * 0.33)  // 33% MAC (Nøytralt/Acro)
  }

  return {
    vingeAreal: parseFloat(vingeAreal.toFixed(0)),
    haleAreal: parseFloat(haleAreal.toFixed(0)),
    mac: parseFloat(mac.toFixed(1)),
    macStart: parseFloat(macLE.toFixed(2)),
    anbefaltCG: {
      fra: parseFloat(cgFremre.toFixed(1)),
      til: parseFloat(cgBakre.toFixed(1))
    },
    beskjed: haleAreal > 0 && avstandVingeHale > 0
      ? "Beregnet med hale-påvirkning. Mål fra vingens fremkant ved kroppen."
      : "Forenklet beregning (25-33% MAC). Legg inn hale-målinger for mer nøyaktig CG."
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

