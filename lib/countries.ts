export interface Country {
  name: string
  code: string
  region: AfricanRegion
}

export type AfricanRegion =
  | "North Africa"
  | "West Africa"
  | "East Africa"
  | "Central Africa"
  | "Southern Africa"

export const AFRICAN_COUNTRIES: Country[] = [
  // North Africa
  { name: "Algeria", code: "DZA", region: "North Africa" },
  { name: "Egypt", code: "EGY", region: "North Africa" },
  { name: "Libya", code: "LBY", region: "North Africa" },
  { name: "Morocco", code: "MAR", region: "North Africa" },
  { name: "Sudan", code: "SDN", region: "North Africa" },
  { name: "Tunisia", code: "TUN", region: "North Africa" },

  // West Africa
  { name: "Benin", code: "BEN", region: "West Africa" },
  { name: "Burkina Faso", code: "BFA", region: "West Africa" },
  { name: "Cape Verde", code: "CPV", region: "West Africa" },
  { name: "Côte d'Ivoire", code: "CIV", region: "West Africa" },
  { name: "Gambia", code: "GMB", region: "West Africa" },
  { name: "Ghana", code: "GHA", region: "West Africa" },
  { name: "Guinea", code: "GIN", region: "West Africa" },
  { name: "Guinea-Bissau", code: "GNB", region: "West Africa" },
  { name: "Liberia", code: "LBR", region: "West Africa" },
  { name: "Mali", code: "MLI", region: "West Africa" },
  { name: "Mauritania", code: "MRT", region: "West Africa" },
  { name: "Niger", code: "NER", region: "West Africa" },
  { name: "Nigeria", code: "NGA", region: "West Africa" },
  { name: "Senegal", code: "SEN", region: "West Africa" },
  { name: "Sierra Leone", code: "SLE", region: "West Africa" },
  { name: "Togo", code: "TGO", region: "West Africa" },

  // East Africa
  { name: "Burundi", code: "BDI", region: "East Africa" },
  { name: "Comoros", code: "COM", region: "East Africa" },
  { name: "Djibouti", code: "DJI", region: "East Africa" },
  { name: "Eritrea", code: "ERI", region: "East Africa" },
  { name: "Ethiopia", code: "ETH", region: "East Africa" },
  { name: "Kenya", code: "KEN", region: "East Africa" },
  { name: "Madagascar", code: "MDG", region: "East Africa" },
  { name: "Malawi", code: "MWI", region: "East Africa" },
  { name: "Mauritius", code: "MUS", region: "East Africa" },
  { name: "Mozambique", code: "MOZ", region: "East Africa" },
  { name: "Rwanda", code: "RWA", region: "East Africa" },
  { name: "Seychelles", code: "SYC", region: "East Africa" },
  { name: "Somalia", code: "SOM", region: "East Africa" },
  { name: "South Sudan", code: "SSD", region: "East Africa" },
  { name: "Tanzania", code: "TZA", region: "East Africa" },
  { name: "Uganda", code: "UGA", region: "East Africa" },
  { name: "Zambia", code: "ZMB", region: "East Africa" },
  { name: "Zimbabwe", code: "ZWE", region: "East Africa" },

  // Central Africa
  { name: "Cameroon", code: "CMR", region: "Central Africa" },
  { name: "Central African Republic", code: "CAF", region: "Central Africa" },
  { name: "Chad", code: "TCD", region: "Central Africa" },
  { name: "Democratic Republic of Congo", code: "COD", region: "Central Africa" },
  { name: "Equatorial Guinea", code: "GNQ", region: "Central Africa" },
  { name: "Gabon", code: "GAB", region: "Central Africa" },
  { name: "Republic of Congo", code: "COG", region: "Central Africa" },
  { name: "São Tomé and Príncipe", code: "STP", region: "Central Africa" },

  // Southern Africa
  { name: "Angola", code: "AGO", region: "Southern Africa" },
  { name: "Botswana", code: "BWA", region: "Southern Africa" },
  { name: "Eswatini", code: "SWZ", region: "Southern Africa" },
  { name: "Lesotho", code: "LSO", region: "Southern Africa" },
  { name: "Namibia", code: "NAM", region: "Southern Africa" },
  { name: "South Africa", code: "ZAF", region: "Southern Africa" },
]

export function getCountryByCode(code: string): Country | undefined {
  return AFRICAN_COUNTRIES.find((c) => c.code === code)
}

/**
 * Climate baselines per ISO3 country code, derived from public climatological
 * normals (World Bank CCKP / WMO regional summaries). Used as deterministic
 * priors when live API data is unavailable so the same country always returns
 * the same numbers.
 */
export interface ClimateBaseline {
  /** Mean annual temperature in °C, 1991–2020 normal */
  meanTempC: number
  /** Mean annual precipitation in mm, 1991–2020 normal */
  meanPrecipMm: number
  /** Long-term warming trend in °C per decade */
  warmingPerDecadeC: number
  /** Long-term precipitation trend in mm per decade */
  precipTrendMmPerDecade: number
  /** Approximate latest annual CO2 emissions in kt (most recent World Bank year) */
  co2Kt: number
  /** Annual CO2 growth rate (fractional) */
  co2GrowthRate: number
  /** Vegetation greenness baseline (NDVI 0–1) */
  ndviBase: number
  /** Seasonal NDVI amplitude */
  ndviAmplitude: number
  /** Seasonal phase offset (radians) */
  ndviPhase: number
}

const DEFAULT_BASELINE: ClimateBaseline = {
  meanTempC: 24.5,
  meanPrecipMm: 700,
  warmingPerDecadeC: 0.25,
  precipTrendMmPerDecade: -8,
  co2Kt: 12000,
  co2GrowthRate: 0.025,
  ndviBase: 0.35,
  ndviAmplitude: 0.18,
  ndviPhase: 0,
}

const BASELINES: Record<string, Partial<ClimateBaseline>> = {
  // North Africa — hot, arid
  DZA: { meanTempC: 22.5, meanPrecipMm: 89, co2Kt: 178000, ndviBase: 0.18, ndviAmplitude: 0.08 },
  EGY: { meanTempC: 22.1, meanPrecipMm: 51, co2Kt: 250000, ndviBase: 0.15, ndviAmplitude: 0.06 },
  LBY: { meanTempC: 22.8, meanPrecipMm: 56, co2Kt: 60000, ndviBase: 0.12, ndviAmplitude: 0.05 },
  MAR: { meanTempC: 17.1, meanPrecipMm: 346, co2Kt: 75000, ndviBase: 0.28, ndviAmplitude: 0.14 },
  SDN: { meanTempC: 26.9, meanPrecipMm: 416, co2Kt: 21000, ndviBase: 0.25, ndviAmplitude: 0.16 },
  TUN: { meanTempC: 19.2, meanPrecipMm: 207, co2Kt: 32000, ndviBase: 0.22, ndviAmplitude: 0.12 },

  // West Africa — tropical, monsoon
  BEN: { meanTempC: 27.5, meanPrecipMm: 1037, co2Kt: 7500, ndviBase: 0.5, ndviAmplitude: 0.22 },
  BFA: { meanTempC: 28.3, meanPrecipMm: 748, co2Kt: 4400, ndviBase: 0.36, ndviAmplitude: 0.24 },
  CPV: { meanTempC: 23.3, meanPrecipMm: 228, co2Kt: 700, ndviBase: 0.18, ndviAmplitude: 0.1 },
  CIV: { meanTempC: 26.1, meanPrecipMm: 1348, co2Kt: 14500, ndviBase: 0.58, ndviAmplitude: 0.18 },
  GMB: { meanTempC: 27.8, meanPrecipMm: 836, co2Kt: 600, ndviBase: 0.42, ndviAmplitude: 0.22 },
  GHA: { meanTempC: 27.2, meanPrecipMm: 1187, co2Kt: 16500, ndviBase: 0.55, ndviAmplitude: 0.2 },
  GIN: { meanTempC: 25.7, meanPrecipMm: 1651, co2Kt: 3300, ndviBase: 0.6, ndviAmplitude: 0.18 },
  GNB: { meanTempC: 26.7, meanPrecipMm: 1577, co2Kt: 320, ndviBase: 0.6, ndviAmplitude: 0.2 },
  LBR: { meanTempC: 25.3, meanPrecipMm: 2391, co2Kt: 1400, ndviBase: 0.66, ndviAmplitude: 0.14 },
  MLI: { meanTempC: 28.7, meanPrecipMm: 282, co2Kt: 4200, ndviBase: 0.22, ndviAmplitude: 0.18 },
  MRT: { meanTempC: 28.0, meanPrecipMm: 92, co2Kt: 7500, ndviBase: 0.16, ndviAmplitude: 0.1 },
  NER: { meanTempC: 28.3, meanPrecipMm: 151, co2Kt: 2400, ndviBase: 0.18, ndviAmplitude: 0.16 },
  NGA: { meanTempC: 26.9, meanPrecipMm: 1150, co2Kt: 130000, ndviBase: 0.48, ndviAmplitude: 0.22 },
  SEN: { meanTempC: 27.9, meanPrecipMm: 686, co2Kt: 11000, ndviBase: 0.34, ndviAmplitude: 0.22 },
  SLE: { meanTempC: 26.4, meanPrecipMm: 2526, co2Kt: 1100, ndviBase: 0.62, ndviAmplitude: 0.18 },
  TGO: { meanTempC: 27.4, meanPrecipMm: 1168, co2Kt: 3300, ndviBase: 0.52, ndviAmplitude: 0.2 },

  // East Africa — equatorial highlands
  BDI: { meanTempC: 19.9, meanPrecipMm: 1274, co2Kt: 600, ndviBase: 0.54, ndviAmplitude: 0.14 },
  COM: { meanTempC: 25.5, meanPrecipMm: 1903, co2Kt: 250, ndviBase: 0.6, ndviAmplitude: 0.1 },
  DJI: { meanTempC: 28.4, meanPrecipMm: 220, co2Kt: 700, ndviBase: 0.14, ndviAmplitude: 0.06 },
  ERI: { meanTempC: 25.5, meanPrecipMm: 384, co2Kt: 700, ndviBase: 0.22, ndviAmplitude: 0.16 },
  ETH: { meanTempC: 22.2, meanPrecipMm: 803, co2Kt: 18000, ndviBase: 0.42, ndviAmplitude: 0.22 },
  KEN: { meanTempC: 24.7, meanPrecipMm: 630, co2Kt: 22000, ndviBase: 0.4, ndviAmplitude: 0.2 },
  MDG: { meanTempC: 22.6, meanPrecipMm: 1513, co2Kt: 4400, ndviBase: 0.52, ndviAmplitude: 0.18 },
  MWI: { meanTempC: 21.9, meanPrecipMm: 1181, co2Kt: 1700, ndviBase: 0.45, ndviAmplitude: 0.22 },
  MUS: { meanTempC: 22.4, meanPrecipMm: 2041, co2Kt: 4400, ndviBase: 0.62, ndviAmplitude: 0.14 },
  MOZ: { meanTempC: 24.0, meanPrecipMm: 1032, co2Kt: 8800, ndviBase: 0.48, ndviAmplitude: 0.22 },
  RWA: { meanTempC: 17.9, meanPrecipMm: 1212, co2Kt: 1100, ndviBase: 0.55, ndviAmplitude: 0.14 },
  SYC: { meanTempC: 27.0, meanPrecipMm: 2330, co2Kt: 600, ndviBase: 0.62, ndviAmplitude: 0.1 },
  SOM: { meanTempC: 27.1, meanPrecipMm: 282, co2Kt: 700, ndviBase: 0.2, ndviAmplitude: 0.16 },
  SSD: { meanTempC: 27.6, meanPrecipMm: 904, co2Kt: 1700, ndviBase: 0.4, ndviAmplitude: 0.22 },
  TZA: { meanTempC: 22.4, meanPrecipMm: 1071, co2Kt: 14000, ndviBase: 0.46, ndviAmplitude: 0.2 },
  UGA: { meanTempC: 22.8, meanPrecipMm: 1180, co2Kt: 6600, ndviBase: 0.52, ndviAmplitude: 0.16 },
  ZMB: { meanTempC: 21.4, meanPrecipMm: 1020, co2Kt: 7500, ndviBase: 0.48, ndviAmplitude: 0.22 },
  ZWE: { meanTempC: 21.0, meanPrecipMm: 657, co2Kt: 11000, ndviBase: 0.4, ndviAmplitude: 0.22 },

  // Central Africa — equatorial rainforest
  CMR: { meanTempC: 24.6, meanPrecipMm: 1604, co2Kt: 9500, ndviBase: 0.62, ndviAmplitude: 0.14 },
  CAF: { meanTempC: 24.9, meanPrecipMm: 1343, co2Kt: 700, ndviBase: 0.58, ndviAmplitude: 0.18 },
  TCD: { meanTempC: 26.8, meanPrecipMm: 322, co2Kt: 1700, ndviBase: 0.24, ndviAmplitude: 0.18 },
  COD: { meanTempC: 24.0, meanPrecipMm: 1543, co2Kt: 4400, ndviBase: 0.66, ndviAmplitude: 0.12 },
  GNQ: { meanTempC: 24.6, meanPrecipMm: 2156, co2Kt: 5500, ndviBase: 0.66, ndviAmplitude: 0.1 },
  GAB: { meanTempC: 25.1, meanPrecipMm: 1831, co2Kt: 4400, ndviBase: 0.68, ndviAmplitude: 0.1 },
  COG: { meanTempC: 24.6, meanPrecipMm: 1646, co2Kt: 4400, ndviBase: 0.62, ndviAmplitude: 0.14 },
  STP: { meanTempC: 25.4, meanPrecipMm: 3200, co2Kt: 150, ndviBase: 0.66, ndviAmplitude: 0.1 },

  // Southern Africa — varied
  AGO: { meanTempC: 21.6, meanPrecipMm: 1010, co2Kt: 22000, ndviBase: 0.46, ndviAmplitude: 0.22 },
  BWA: { meanTempC: 21.5, meanPrecipMm: 416, co2Kt: 7500, ndviBase: 0.28, ndviAmplitude: 0.2 },
  SWZ: { meanTempC: 17.5, meanPrecipMm: 788, co2Kt: 1100, ndviBase: 0.44, ndviAmplitude: 0.2 },
  LSO: { meanTempC: 11.9, meanPrecipMm: 788, co2Kt: 2500, ndviBase: 0.36, ndviAmplitude: 0.22 },
  NAM: { meanTempC: 19.8, meanPrecipMm: 285, co2Kt: 4400, ndviBase: 0.22, ndviAmplitude: 0.18 },
  ZAF: { meanTempC: 17.6, meanPrecipMm: 495, co2Kt: 460000, ndviBase: 0.34, ndviAmplitude: 0.2 },
}

export function getClimateBaseline(code: string): ClimateBaseline {
  const override = BASELINES[code]
  return { ...DEFAULT_BASELINE, ...(override ?? {}) }
}

export const COUNTRY_BBOX: Record<string, { minLon: number; minLat: number; maxLon: number; maxLat: number }> = {
  DZA: { minLon: -8.7, minLat: 19.1, maxLon: 12.0, maxLat: 37.1 },
  EGY: { minLon: 24.7, minLat: 22.0, maxLon: 36.9, maxLat: 31.7 },
  LBY: { minLon: 9.4, minLat: 19.5, maxLon: 25.1, maxLat: 33.2 },
  MAR: { minLon: -13.2, minLat: 21.4, maxLon: -1.0, maxLat: 35.9 },
  SDN: { minLon: 21.8, minLat: 8.7, maxLon: 38.6, maxLat: 22.0 },
  TUN: { minLon: 7.5, minLat: 30.2, maxLon: 11.6, maxLat: 37.5 },
  NGA: { minLon: 2.6, minLat: 4.2, maxLon: 14.7, maxLat: 13.9 },
  GHA: { minLon: -3.3, minLat: 4.7, maxLon: 1.2, maxLat: 11.2 },
  CIV: { minLon: -8.6, minLat: 4.4, maxLon: -2.5, maxLat: 10.7 },
  SEN: { minLon: -17.5, minLat: 12.3, maxLon: -11.4, maxLat: 16.7 },
  KEN: { minLon: 33.9, minLat: -4.7, maxLon: 41.9, maxLat: 5.5 },
  ETH: { minLon: 32.9, minLat: 3.4, maxLon: 48.0, maxLat: 14.9 },
  TZA: { minLon: 29.3, minLat: -11.7, maxLon: 40.4, maxLat: -1.0 },
  UGA: { minLon: 29.6, minLat: -1.5, maxLon: 35.0, maxLat: 4.2 },
  RWA: { minLon: 28.9, minLat: -2.8, maxLon: 30.9, maxLat: -1.0 },
  CMR: { minLon: 8.5, minLat: 1.7, maxLon: 16.2, maxLat: 13.1 },
  COD: { minLon: 12.2, minLat: -13.5, maxLon: 31.3, maxLat: 5.4 },
  GAB: { minLon: 8.7, minLat: -3.9, maxLon: 14.5, maxLat: 2.3 },
  ZAF: { minLon: 16.3, minLat: -34.8, maxLon: 32.9, maxLat: -22.1 },
  AGO: { minLon: 11.7, minLat: -18.0, maxLon: 24.1, maxLat: -4.4 },
  NAM: { minLon: 11.7, minLat: -28.9, maxLon: 25.3, maxLat: -16.9 },
  BWA: { minLon: 19.9, minLat: -26.9, maxLon: 29.4, maxLat: -17.8 },
  ZWE: { minLon: 25.2, minLat: -22.4, maxLon: 33.1, maxLat: -15.6 },
  ZMB: { minLon: 21.9, minLat: -18.1, maxLon: 33.7, maxLat: -8.2 },
  MOZ: { minLon: 30.2, minLat: -26.9, maxLon: 40.8, maxLat: -10.5 },
  MDG: { minLon: 43.2, minLat: -25.6, maxLon: 50.5, maxLat: -11.9 },
}
