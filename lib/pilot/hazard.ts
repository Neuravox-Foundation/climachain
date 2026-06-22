import type { Facility, HazardSignal } from "./types"

// Hazard adapter. For the pilot/demo this produces a deterministic, stable
// signal seeded from the facility id, with a hard-coded contrast between the two
// pilot LGAs so the ICRI engine visibly shows range:
//   Damaturu (YB-DAM) – heat + power-stress dominant, low flood.
//   Potiskum (YB-POT) – flood + rainfall-disruption dominant, moderate heat.
// Replace the body with a real adapter over backbone climate + forecast feeds
// (NiMet, GPM/IMERG, flood/heat products) without changing the HazardSignal shape.

export const DEFAULT_WINDOW_DAYS = 10
const DEFAULT_HEAT_THRESHOLD_C = 40

/** Deterministic value in [0,1] from a string seed. */
function seeded(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 0xffffffff
}

const lerp = (lo: number, hi: number, t: number) => lo + (hi - lo) * t

export function getHazardSignal(facility: Facility, windowDays = DEFAULT_WINDOW_DAYS): HazardSignal {
  const tHeat = seeded(`${facility.id}:heat`)
  const tFlood = seeded(`${facility.id}:flood`)
  const tRain = seeded(`${facility.id}:rain`)

  let hotDays: number
  let floodProbability: number
  let rainfallAnomalyPct: number

  if (facility.lgaCode === "YB-POT") {
    // Potiskum: flood/rainfall-dominant.
    hotDays = Math.round(lerp(3, 6, tHeat))
    floodProbability = Math.round(lerp(0.4, 0.62, tFlood) * 100) / 100
    rainfallAnomalyPct = Math.round(lerp(30, 58, tRain))
  } else {
    // Damaturu (and default): heat/power-stress dominant, low flood.
    hotDays = Math.round(lerp(6, 9, tHeat))
    floodProbability = Math.round(lerp(0.03, 0.18, tFlood) * 100) / 100
    rainfallAnomalyPct = Math.round(lerp(-25, 25, tRain))
  }

  return {
    facilityId: facility.id,
    windowDays,
    hotDays,
    heatThresholdC: DEFAULT_HEAT_THRESHOLD_C,
    rainfallAnomalyPct,
    floodProbability,
    quality: "estimated",
  }
}
