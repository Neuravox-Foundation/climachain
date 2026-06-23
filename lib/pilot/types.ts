import type { DataQuality } from "@/lib/climate-api"

export type { DataQuality }

// ---- Registry ----

export type PowerSource = "grid_reliable" | "grid_intermittent" | "solar" | "generator" | "none"
export type ColdChainEquip = "sdd" | "ilr" | "gas_fridge" | "none" // solar direct drive, ice lined refrigerator
export type ColdChainStatus = "functional" | "intermittent" | "non_functional" | "unknown"
export type OutreachReliance = "fixed" | "mixed" | "outreach_heavy"
export type AccessTier = "ok" | "road_only" | "checkpoint" | "severe"
export type FacilityType = "phc" | "clinic" | "hospital" | "outreach_post"

export interface Lga {
  code: string
  name: string
  state: string
}

export interface Facility {
  id: string
  name: string
  lgaCode: string
  lat: number
  lon: number
  type: FacilityType
  powerSource: PowerSource
  coldChainEquip: ColdChainEquip
  coldChainStatus: ColdChainStatus
  outreachReliance: OutreachReliance
  accessTier: AccessTier
  under1Catchment: number
}

export interface ImmunizationRecord {
  facilityId: string
  period: string // "2026-06"
  dtp1: number
  dtp3: number
  dropoutPct: number
  sessionsPlanned: number
  sessionsHeld: number
  source: DataQuality
}

export interface HazardSignal {
  facilityId: string
  windowDays: number
  hotDays: number
  heatThresholdC: number
  rainfallAnomalyPct: number
  floodProbability: number // 0..1
  quality: DataQuality
}

// ---- ICRI ----

export type Band = "low" | "moderate" | "high" | "severe"

export interface Contribution {
  label: string
  component: "H" | "V" | "L"
  points: number // contribution to the final 0..100 score
}

export interface IcriResult {
  facilityId: string
  score: number
  band: Band
  H: number
  V: number
  L: number
  contributions: Contribution[] // sorted desc
  confidence: DataQuality
  computedAt: string
}

// ---- Brief + actions ----

export interface OperationalBrief {
  scope: { kind: "facility" | "lga"; id: string; name: string }
  headline?: string // plain-language one-liner (LGA theme); optional
  atRisk: string
  where: string
  why: string[]
  action: string
  band: Band
  score: number
  confidence: DataQuality
  text: string
  generatedAt: string
}

export type ActionStatus = "pending" | "reviewed" | "action_planned" | "action_completed"

export interface ActionRecord {
  facilityId: string
  category: string
  status: ActionStatus
  assignedRole: string
  lastReviewed: string
  notes: string
}

// ---- Composed view models ----

export interface FacilityView {
  facility: Facility
  lga: Lga
  immunization: ImmunizationRecord
  hazard: HazardSignal
  icri: IcriResult
  action: ActionRecord
}
