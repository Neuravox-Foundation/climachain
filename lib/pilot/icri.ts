import type {
  AccessTier, Band, ColdChainEquip, ColdChainStatus, Contribution,
  DataQuality, IcriResult, OutreachReliance, PowerSource,
} from "./types"

// Immunization Continuity Risk Index — transparent, rule-based, pure functions.
// ML may tune weights later; the core stays inspectable.

export interface IcriWeights { wH: number; wV: number; wL: number }
export const DEFAULT_WEIGHTS: IcriWeights = { wH: 0.40, wV: 0.35, wL: 0.25 }

// Caps used to normalize raw inputs to 0..100.
export const HEAT_DAYS_CAP = 7
export const RAIN_ANOMALY_CAP = 60 // % deviation that maps to 100
export const DROPOUT_CAP = 40 // % dropout that maps to 100

const clamp = (n: number) => Math.max(0, Math.min(100, n))
const round = (n: number) => Math.round(n)

export interface IcriInput {
  facilityId: string
  // hazard
  hotDays: number
  floodProbability: number // 0..1
  rainfallAnomalyPct: number
  // vulnerability
  powerSource: PowerSource
  coldChainEquip: ColdChainEquip
  coldChainStatus: ColdChainStatus
  accessTier: AccessTier
  // stakes
  dropoutPct: number
  under1Catchment: number
  maxCatchment: number
  outreachReliance: OutreachReliance
  // quality
  hazardQuality: DataQuality
  immunizationQuality: DataQuality
}

// ---- sub-score lookups ----
const POWER: Record<PowerSource, number> = {
  none: 100, grid_intermittent: 75, generator: 60, solar: 30, grid_reliable: 15,
}
const COLD_EQUIP: Record<ColdChainEquip, number> = { none: 90, gas_fridge: 60, ilr: 45, sdd: 20 }
const ACCESS: Record<AccessTier, number> = { severe: 100, checkpoint: 70, road_only: 55, ok: 20 }
const OUTREACH: Record<OutreachReliance, number> = { outreach_heavy: 100, mixed: 60, fixed: 20 }

function coldChainScore(equip: ColdChainEquip, status: ColdChainStatus): number {
  if (status === "non_functional") return 100
  if (status === "intermittent") return 70
  if (status === "unknown") return 60
  return COLD_EQUIP[equip] // functional → by equipment type
}

export function bandFor(score: number): Band {
  if (score >= 75) return "severe"
  if (score >= 50) return "high"
  if (score >= 25) return "moderate"
  return "low"
}

export function defaultActionFor(band: Band): string {
  switch (band) {
    case "severe":
      return "Pre-position vaccines and ice packs; alert LGA cold-chain officer; adjust session calendar."
    case "high":
      return "Prioritize supportive supervision; check power and cold-chain; consider outreach reschedule."
    case "moderate":
      return "Flag in weekly review; verify cold-chain temperature logs at next visit."
    default:
      return "Routine monitoring. No extra action."
  }
}

// quality ordering: worst wins
function worseQuality(a: DataQuality, b: DataQuality): DataQuality {
  const rank: Record<DataQuality, number> = { unavailable: 0, estimated: 1, live: 2 }
  return rank[a] <= rank[b] ? a : b
}

export function computeIcri(input: IcriInput, weights: IcriWeights = DEFAULT_WEIGHTS): IcriResult {
  // ----- Hazard exposure (H) -----
  const heat = clamp((input.hotDays / HEAT_DAYS_CAP) * 100)
  const flood = clamp(input.floodProbability * 100)
  const rain = clamp((Math.abs(input.rainfallAnomalyPct) / RAIN_ANOMALY_CAP) * 100)
  const H = clamp(0.45 * heat + 0.30 * flood + 0.25 * rain)

  // ----- Facility vulnerability (V) -----
  const power = POWER[input.powerSource]
  const cold = coldChainScore(input.coldChainEquip, input.coldChainStatus)
  const access = ACCESS[input.accessTier]
  const V = clamp(0.40 * power + 0.35 * cold + 0.25 * access)

  // ----- Immunization stakes (L) -----
  const dropout = clamp((input.dropoutPct / DROPOUT_CAP) * 100)
  const catchment = clamp((input.under1Catchment / Math.max(1, input.maxCatchment)) * 100)
  const outreach = OUTREACH[input.outreachReliance]
  const L = clamp(0.45 * dropout + 0.25 * catchment + 0.30 * outreach)

  const score = round(weights.wH * H + weights.wV * V + weights.wL * L)
  const band = bandFor(score)

  // ----- Contributions (each sub-signal's points toward the final score) -----
  const raw: Array<Omit<Contribution, "points"> & { sub: number; cWeight: number; subWeight: number }> = [
    { label: `${input.hotDays} hot days forecast`, component: "H", sub: heat, cWeight: weights.wH, subWeight: 0.45 },
    { label: `flood probability ${Math.round(input.floodProbability * 100)}%`, component: "H", sub: flood, cWeight: weights.wH, subWeight: 0.30 },
    { label: `rainfall anomaly ${input.rainfallAnomalyPct}%`, component: "H", sub: rain, cWeight: weights.wH, subWeight: 0.25 },
    { label: powerLabel(input.powerSource), component: "V", sub: power, cWeight: weights.wV, subWeight: 0.40 },
    { label: coldChainLabel(input.coldChainEquip, input.coldChainStatus), component: "V", sub: cold, cWeight: weights.wV, subWeight: 0.35 },
    { label: accessLabel(input.accessTier), component: "V", sub: access, cWeight: weights.wV, subWeight: 0.25 },
    { label: `DTP dropout ${input.dropoutPct}%`, component: "L", sub: dropout, cWeight: weights.wL, subWeight: 0.45 },
    { label: `catchment ${input.under1Catchment} under-1s`, component: "L", sub: catchment, cWeight: weights.wL, subWeight: 0.25 },
    { label: outreachLabel(input.outreachReliance), component: "L", sub: outreach, cWeight: weights.wL, subWeight: 0.30 },
  ]
  const contributions: Contribution[] = raw
    .map((r) => ({ label: r.label, component: r.component, points: Math.round(r.cWeight * r.subWeight * r.sub * 10) / 10 }))
    .sort((a, b) => b.points - a.points)

  const confidence = worseQuality(input.hazardQuality, input.immunizationQuality)

  return { facilityId: input.facilityId, score, band, H: round(H), V: round(V), L: round(L), contributions, confidence, computedAt: new Date().toISOString() }
}

// ---- human labels ----
function powerLabel(p: PowerSource): string {
  return p === "none" ? "no power source" : p === "grid_intermittent" ? "intermittent grid, no backup"
    : p === "generator" ? "generator-only power" : p === "solar" ? "solar power" : "reliable grid power"
}
function coldChainLabel(e: ColdChainEquip, s: ColdChainStatus): string {
  if (s === "non_functional") return "cold-chain non-functional"
  if (s === "intermittent") return "cold-chain intermittent"
  if (s === "unknown") return "cold-chain status unknown"
  return e === "none" ? "no cold-chain equipment" : e === "sdd" ? "solar cold-chain (functional)" : "cold-chain functional"
}
function accessLabel(a: AccessTier): string {
  return a === "severe" ? "severe access constraint" : a === "checkpoint" ? "checkpoint access risk"
    : a === "road_only" ? "road-only access" : "good access"
}
function outreachLabel(o: OutreachReliance): string {
  return o === "outreach_heavy" ? "outreach-heavy site" : o === "mixed" ? "mixed fixed/outreach" : "fixed-session site"
}
