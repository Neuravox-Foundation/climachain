import type { Band, FacilityView, IcriResult, OperationalBrief } from "./types"
import { PILOT_LGAS, getLga } from "./lgas.seed"
import { PILOT_FACILITIES, PILOT_MAX_CATCHMENT, facilitiesByLga, getFacility } from "./facilities.seed"
import { getImmunization } from "./immunization.seed"
import { getHazardSignal } from "./hazard"
import { computeIcri } from "./icri"
import { getAction } from "./actions"
import { buildStructuredBrief } from "./brief"

const RANK: Record<Band, number> = { severe: 0, high: 1, moderate: 2, low: 3 }

// Short one-line story for each pilot LGA – keeps the heat-vs-flood contrast
// legible at a glance on the overview and LGA screens.
export const LGA_TAGLINE: Record<string, string> = {
  "YB-DAM": "Heat & power stress – supervision and cold chain verification priority",
  "YB-POT": "Flood & outreach disruption – rescheduling and pre-positioning priority",
}

/** Compute the ICRI for one facility from seed + hazard (no I/O, deterministic). */
export function icriForFacility(facilityId: string): IcriResult | undefined {
  const f = getFacility(facilityId)
  const im = getImmunization(facilityId)
  if (!f || !im) return undefined
  const hz = getHazardSignal(f)
  return computeIcri({
    facilityId: f.id,
    hotDays: hz.hotDays,
    floodProbability: hz.floodProbability,
    rainfallAnomalyPct: hz.rainfallAnomalyPct,
    powerSource: f.powerSource,
    coldChainEquip: f.coldChainEquip,
    coldChainStatus: f.coldChainStatus,
    accessTier: f.accessTier,
    dropoutPct: im.dropoutPct,
    under1Catchment: f.under1Catchment,
    maxCatchment: PILOT_MAX_CATCHMENT,
    outreachReliance: f.outreachReliance,
    hazardQuality: hz.quality,
    immunizationQuality: im.source,
  })
}

/** Full composed view for the facility detail screen / endpoint. */
export async function getFacilityView(facilityId: string): Promise<FacilityView | undefined> {
  const facility = getFacility(facilityId)
  const immunization = getImmunization(facilityId)
  const icri = icriForFacility(facilityId)
  if (!facility || !immunization || !icri) return undefined
  const lga = getLga(facility.lgaCode)!
  const hazard = getHazardSignal(facility)
  const action = await getAction(facilityId, icri.band)
  return { facility, lga, immunization, hazard, icri, action }
}

export interface FacilityRow {
  id: string
  name: string
  lgaCode: string
  lgaName: string
  type: string
  score: number
  band: Band
  topDriver: string
  confidence: string
}

export function listFacilityRows(opts: { lga?: string; band?: Band } = {}): FacilityRow[] {
  let facilities = PILOT_FACILITIES
  if (opts.lga) facilities = facilities.filter((f) => f.lgaCode === opts.lga)
  const rows: FacilityRow[] = facilities.flatMap((f) => {
    const icri = icriForFacility(f.id)
    if (!icri) return []
    return [{
      id: f.id,
      name: f.name,
      lgaCode: f.lgaCode,
      lgaName: getLga(f.lgaCode)?.name ?? f.lgaCode,
      type: f.type,
      score: icri.score,
      band: icri.band,
      topDriver: icri.contributions[0]?.label ?? "",
      confidence: icri.confidence,
    }]
  })
  const filtered = opts.band ? rows.filter((r) => r.band === opts.band) : rows
  return filtered.sort((a, b) => RANK[a.band] - RANK[b.band] || b.score - a.score)
}

export interface OverviewModel {
  state: string
  lgas: Array<{ code: string; name: string; flagged: number; total: number; topBand: Band; tagline: string }>
  counts: Record<Band, number>
  flaggedFacilities: number
  topSevere: FacilityRow[]
  generatedAt: string
}

export function getOverview(): OverviewModel {
  const rows = listFacilityRows()
  const counts: Record<Band, number> = { low: 0, moderate: 0, high: 0, severe: 0 }
  rows.forEach((r) => { counts[r.band]++ })
  const lgas = PILOT_LGAS.map((l) => {
    const sub = rows.filter((r) => r.lgaCode === l.code)
    const flagged = sub.filter((r) => r.band === "high" || r.band === "severe").length
    const topBand = sub.reduce<Band>((acc, r) => (RANK[r.band] < RANK[acc] ? r.band : acc), "low")
    return { code: l.code, name: l.name, flagged, total: sub.length, topBand, tagline: LGA_TAGLINE[l.code] ?? "" }
  })
  return {
    state: "Yobe",
    lgas,
    counts,
    flaggedFacilities: counts.high + counts.severe,
    topSevere: rows.filter((r) => r.band === "high" || r.band === "severe").slice(0, 6),
    generatedAt: new Date().toISOString(),
  }
}

export interface LgaModel {
  lga: { code: string; name: string }
  tagline: string
  facilities: FacilityRow[]
  topDrivers: string[]
  counts: Record<Band, number>
}

export function getLgaModel(code: string): LgaModel | undefined {
  const lga = getLga(code)
  if (!lga) return undefined
  const facilities = listFacilityRows({ lga: code })
  const counts: Record<Band, number> = { low: 0, moderate: 0, high: 0, severe: 0 }
  facilities.forEach((r) => { counts[r.band]++ })
  // most common top drivers across flagged facilities
  const driverCount = new Map<string, number>()
  facilities.filter((r) => r.band !== "low").forEach((r) => driverCount.set(r.topDriver, (driverCount.get(r.topDriver) ?? 0) + 1))
  const topDrivers = [...driverCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([d]) => d)
  return { lga: { code: lga.code, name: lga.name }, tagline: LGA_TAGLINE[code] ?? "", facilities, topDrivers, counts }
}

export function briefForFacility(facilityId: string): OperationalBrief | undefined {
  const f = getFacility(facilityId)
  const icri = icriForFacility(facilityId)
  if (!f || !icri) return undefined
  const lga = getLga(f.lgaCode)
  return buildStructuredBrief({
    kind: "facility", id: f.id, name: f.name, band: icri.band, score: icri.score,
    confidence: icri.confidence, topDrivers: icri.contributions, where: `${f.name}, ${lga?.name ?? ""}`,
  })
}

// Per-LGA operational theme – keeps the two pilot LGAs telling different stories.
const LGA_THEME: Record<string, { headline: string; action: string }> = {
  "YB-DAM": {
    headline: "Damaturu this week: supervision and cold chain verification priority.",
    action: "Prioritize supportive supervision and verify cold chain temperature logs at flagged facilities.",
  },
  "YB-POT": {
    headline: "Potiskum this week: outreach rescheduling and pre-positioning priority.",
    action: "Reschedule outreach around the hazard window; pre-position vaccines and ice packs at flagged posts.",
  },
}

export function briefForLga(code: string): OperationalBrief | undefined {
  const model = getLgaModel(code)
  if (!model) return undefined
  const flagged = model.facilities.filter((r) => r.band !== "low")
  const worst = model.facilities[0]
  const band: Band = worst?.band ?? "low"
  const topDrivers = model.topDrivers.map((d) => ({ label: d, component: "V" as const, points: 0 }))
  const score = Math.round(model.facilities.reduce((s, r) => s + r.score, 0) / Math.max(1, model.facilities.length))
  const brief = buildStructuredBrief({
    kind: "lga", id: model.lga.code, name: model.lga.name, band, score,
    confidence: "estimated", topDrivers,
    where: `${model.lga.name} LGA (${flagged.length} facilities flagged)`,
  })
  const theme = LGA_THEME[code]
  if (theme) {
    brief.action = theme.action
    brief.text = `${theme.headline} ${brief.text}`
  }
  return brief
}
