import type { Airport } from './types'

/**
 * Norwegian Airports Dataset
 *
 * Comprehensive list of Norwegian airports for drone safety checking.
 * Coordinates are in WGS84 (EPSG:4326) format - standard GPS coordinates.
 *
 * Sources:
 * - Avinor AIS: https://partner.avinor.no/en/ais/
 * - Wikipedia: List of airports in Norway
 * - ICAO Location Indicators
 */

export const NORWEGIAN_AIRPORTS: Airport[] = [
  // ============================================
  // PRIMARY AIRPORTS (Major airports with jet capacity)
  // ============================================
  {
    name: 'Oslo Lufthavn, Gardermoen',
    code: 'ENGM',
    latitude: 60.1939,
    longitude: 11.1004,
    type: 'primary'
  },
  {
    name: 'Bergen Lufthavn, Flesland',
    code: 'ENBR',
    latitude: 60.2934,
    longitude: 5.2181,
    type: 'primary'
  },
  {
    name: 'Stavanger Lufthavn, Sola',
    code: 'ENZV',
    latitude: 58.8767,
    longitude: 5.6378,
    type: 'primary'
  },
  {
    name: 'Trondheim Lufthavn, Værnes',
    code: 'ENVA',
    latitude: 63.4578,
    longitude: 10.9242,
    type: 'primary'
  },
  {
    name: 'Bodø Lufthavn',
    code: 'ENBO',
    latitude: 67.2692,
    longitude: 14.3653,
    type: 'primary'
  },
  {
    name: 'Tromsø Lufthavn, Langnes',
    code: 'ENTC',
    latitude: 69.6833,
    longitude: 18.9167,
    type: 'primary'
  },
  {
    name: 'Kristiansand Lufthavn, Kjevik',
    code: 'ENCN',
    latitude: 58.2044,
    longitude: 8.0853,
    type: 'primary'
  },
  {
    name: 'Haugesund Lufthavn, Karmøy',
    code: 'ENHD',
    latitude: 59.3453,
    longitude: 5.2084,
    type: 'primary'
  },
  {
    name: 'Ålesund Lufthavn, Vigra',
    code: 'ENAL',
    latitude: 62.5625,
    longitude: 6.1197,
    type: 'primary'
  },
  {
    name: 'Sandefjord Lufthavn, Torp',
    code: 'ENTO',
    latitude: 59.1867,
    longitude: 10.2586,
    type: 'primary'
  },

  // ============================================
  // REGIONAL AIRPORTS - NORD-NORGE
  // ============================================
  {
    name: 'Alta Lufthavn',
    code: 'ENAT',
    latitude: 69.9761,
    longitude: 23.3717,
    type: 'regional'
  },
  {
    name: 'Bardufoss Lufthavn',
    code: 'ENDU',
    latitude: 69.0558,
    longitude: 18.5404,
    type: 'regional'
  },
  {
    name: 'Brønnøysund Lufthavn, Brønnøy',
    code: 'ENBN',
    latitude: 65.4611,
    longitude: 12.2175,
    type: 'regional'
  },
  {
    name: 'Harstad/Narvik Lufthavn, Evenes',
    code: 'ENEV',
    latitude: 68.4913,
    longitude: 16.6781,
    type: 'regional'
  },
  {
    name: 'Hasvik Lufthavn',
    code: 'ENHK',
    latitude: 70.4867,
    longitude: 22.1397,
    type: 'regional'
  },
  {
    name: 'Hammerfest Lufthavn',
    code: 'ENHF',
    latitude: 70.6797,
    longitude: 23.6686,
    type: 'regional'
  },
  {
    name: 'Kirkenes Lufthavn, Høybuktmoen',
    code: 'ENKR',
    latitude: 69.7258,
    longitude: 29.8922,
    type: 'regional'
  },
  {
    name: 'Mehamn Lufthavn',
    code: 'ENMH',
    latitude: 71.0297,
    longitude: 27.8267,
    type: 'regional'
  },
  {
    name: 'Mo i Rana Lufthavn, Røssvoll',
    code: 'ENRA',
    latitude: 66.3639,
    longitude: 14.3014,
    type: 'regional'
  },
  {
    name: 'Molde Lufthavn, Årø',
    code: 'ENML',
    latitude: 62.7447,
    longitude: 7.2625,
    type: 'regional'
  },
  {
    name: 'Mosjøen Lufthavn, Kjærstad',
    code: 'ENMS',
    latitude: 65.7839,
    longitude: 13.2149,
    type: 'regional'
  },
  // Narvik Framnes - CLOSED 2017, replaced by Harstad/Narvik Evenes (ENEV)
  // {
  //   name: 'Narvik Lufthavn, Framnes (CLOSED)',
  //   code: 'ENNK',
  //   latitude: 68.4367,
  //   longitude: 17.3867,
  //   type: 'regional'
  // },
  {
    name: 'Røros Lufthavn',
    code: 'ENRS',
    latitude: 62.5781,
    longitude: 11.3425,
    type: 'regional'
  },
  {
    name: 'Svolvær Lufthavn, Helle',
    code: 'ENSH',
    latitude: 68.2433,
    longitude: 14.6692,
    type: 'regional'
  },
  {
    name: 'Sørkjosen Lufthavn',
    code: 'ENSR',
    latitude: 69.7868,
    longitude: 20.9594,
    type: 'regional'
  },
  {
    name: 'Stokmarknes Lufthavn, Skagen',
    code: 'ENST',
    latitude: 68.5789,
    longitude: 15.0334,
    type: 'regional'
  },
  {
    name: 'Sandnessjøen Lufthavn, Stokka',
    code: 'ENST',
    latitude: 65.9568,
    longitude: 12.4689,
    type: 'regional'
  },
  {
    name: 'Leknes Lufthavn',
    code: 'ENLK',
    latitude: 68.1525,
    longitude: 13.6094,
    type: 'regional'
  },
  {
    name: 'Vardø Lufthavn, Svartnes',
    code: 'ENSS',
    latitude: 70.3554,
    longitude: 31.0449,
    type: 'regional'
  },
  {
    name: 'Vadsø Lufthavn',
    code: 'ENVD',
    latitude: 70.0653,
    longitude: 29.8447,
    type: 'regional'
  },
  {
    name: 'Andøya Lufthavn',
    code: 'ENAN',
    latitude: 69.2925,
    longitude: 16.1442,
    type: 'regional'
  },
  {
    name: 'Berlevåg Lufthavn',
    code: 'ENBV',
    latitude: 70.8714,
    longitude: 29.0342,
    type: 'regional'
  },
  {
    name: 'Båtsfjord Lufthavn',
    code: 'ENBS',
    latitude: 70.6005,
    longitude: 29.6914,
    type: 'regional'
  },
  {
    name: 'Honningsvåg Lufthavn, Valan',
    code: 'ENHV',
    latitude: 71.0097,
    longitude: 25.9836,
    type: 'regional'
  },
  {
    name: 'Lakselv Lufthavn, Banak',
    code: 'ENNA',
    latitude: 70.0688,
    longitude: 24.9735,
    type: 'regional'
  },
  {
    name: 'Værøy Helikopterhavn',
    code: 'ENVR',
    latitude: 67.6547,
    longitude: 12.7258,
    type: 'regional'
  },

  // ============================================
  // REGIONAL AIRPORTS - VESTLANDET
  // ============================================
  {
    name: 'Florø Lufthavn',
    code: 'ENFL',
    latitude: 61.5836,
    longitude: 5.0247,
    type: 'regional'
  },
  {
    name: 'Førde Lufthavn, Bringeland',
    code: 'ENBL',
    latitude: 61.3911,
    longitude: 5.7572,
    type: 'regional'
  },
  {
    name: 'Ørsta-Volda Lufthavn, Hovden',
    code: 'ENOV',
    latitude: 62.1800,
    longitude: 6.0747,
    type: 'regional'
  },
  {
    name: 'Sandane Lufthavn, Anda',
    code: 'ENSD',
    latitude: 61.8300,
    longitude: 6.1058,
    type: 'regional'
  },
  {
    name: 'Sunndalsøra Lufthavn, Vinnu',
    code: 'ENSU',
    latitude: 62.6567,
    longitude: 8.6811,
    type: 'regional'
  },

  // ============================================
  // REGIONAL AIRPORTS - MIDT-NORGE
  // ============================================
  {
    name: 'Kristiansund Lufthavn, Kvernberget',
    code: 'ENKB',
    latitude: 63.1118,
    longitude: 7.8245,
    type: 'regional'
  },
  {
    name: 'Ørland Lufthavn',
    code: 'ENOL',
    latitude: 63.6989,
    longitude: 9.6040,
    type: 'regional'
  },
  {
    name: 'Rørvik Lufthavn, Ryum',
    code: 'ENRM',
    latitude: 64.8383,
    longitude: 11.1461,
    type: 'regional'
  },
  {
    name: 'Namsos Lufthavn, Høknesøra',
    code: 'ENNM',
    latitude: 64.4722,
    longitude: 11.5786,
    type: 'regional'
  },
  {
    name: 'Oppdal Lufthavn, Fagerhaug',
    code: 'ENOP',
    latitude: 62.6513,
    longitude: 9.8516,
    type: 'regional'
  },

  // ============================================
  // REGIONAL AIRPORTS - ØSTLANDET
  // ============================================
  {
    name: 'Sogndal Lufthavn, Haukåsen',
    code: 'ENSG',
    latitude: 61.1561,
    longitude: 7.1378,
    type: 'regional'
  },
  {
    name: 'Notodden Lufthavn',
    code: 'ENNO',
    latitude: 59.5656,
    longitude: 9.2122,
    type: 'regional'
  },
  {
    name: 'Fagernes Lufthavn, Leirin',
    code: 'ENFG',
    latitude: 61.0156,
    longitude: 9.2881,
    type: 'regional'
  },
  {
    name: 'Skien Lufthavn, Geiteryggen',
    code: 'ENSN',
    latitude: 59.1850,
    longitude: 9.5669,
    type: 'regional'
  },
  {
    name: 'Dagali Lufthavn',
    code: 'ENDI',
    latitude: 60.4167,
    longitude: 8.5077,
    type: 'regional'
  },

  // ============================================
  // REGIONAL AIRPORTS - SØRLANDET
  // ============================================
  {
    name: 'Lista Lufthavn',
    code: 'ENLI',
    latitude: 58.0994,
    longitude: 6.6261,
    type: 'regional'
  },

  // ============================================
  // REGIONAL AIRPORTS - SVALBARD
  // ============================================
  {
    name: 'Svalbard Lufthavn, Longyear',
    code: 'ENSB',
    latitude: 78.2461,
    longitude: 15.4656,
    type: 'regional'
  },

  // ============================================
  // PRIVATE AIRPORTS & AIRFIELDS (relevant for drone safety)
  // ============================================
  {
    name: 'Moss Lufthavn, Rygge',
    code: 'ENRY',
    latitude: 59.3789,
    longitude: 10.7856,
    type: 'private'
  },
  {
    name: 'Stord Lufthavn, Sørstokken',
    code: 'ENSO',
    latitude: 59.7919,
    longitude: 5.3408,
    type: 'private'
  },
  {
    name: 'Kjeller Flyplass',
    code: 'ENKJ',
    latitude: 59.9683,
    longitude: 11.0367,
    type: 'private'
  },
  {
    name: 'Rakkestad Flyplass, Åstorp',
    code: 'ENRK',
    latitude: 59.3686,
    longitude: 11.3450,
    type: 'private'
  },
  {
    name: 'Tønsberg Flyplass, Jarlsberg',
    code: 'ENJB',
    latitude: 59.2842,
    longitude: 10.2592,
    type: 'private'
  },
]

/**
 * Get airport count by type
 */
export const getAirportStats = () => {
  const primary = NORWEGIAN_AIRPORTS.filter(a => a.type === 'primary').length
  const regional = NORWEGIAN_AIRPORTS.filter(a => a.type === 'regional').length
  const privateAirports = NORWEGIAN_AIRPORTS.filter(a => a.type === 'private').length

  return {
    primary,
    regional,
    private: privateAirports,
    total: NORWEGIAN_AIRPORTS.length
  }
}
