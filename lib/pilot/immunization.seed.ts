import type { ImmunizationRecord } from "./types"
import { PILOT_FACILITIES } from "./facilities.seed"

export const PILOT_PERIOD = "2026-06"

// MOCK immunization service records, shaped like DHIS2 RI-module output.
// dropoutPct = (dtp1 - dtp3) / dtp1 * 100. Marked "estimated" until real data lands.
const RAW: Record<string, { dtp1: number; dtp3: number; sessionsPlanned: number; sessionsHeld: number }> = {
  "YB-DAM-001": { dtp1: 142, dtp3: 96, sessionsPlanned: 8, sessionsHeld: 6 },
  "YB-DAM-002": { dtp1: 71, dtp3: 38, sessionsPlanned: 8, sessionsHeld: 4 },
  "YB-DAM-003": { dtp1: 110, dtp3: 92, sessionsPlanned: 8, sessionsHeld: 8 },
  "YB-DAM-004": { dtp1: 118, dtp3: 79, sessionsPlanned: 8, sessionsHeld: 6 },
  "YB-DAM-005": { dtp1: 58, dtp3: 27, sessionsPlanned: 8, sessionsHeld: 3 },
  "YB-DAM-006": { dtp1: 205, dtp3: 178, sessionsPlanned: 10, sessionsHeld: 10 },
  "YB-POT-001": { dtp1: 156, dtp3: 118, sessionsPlanned: 8, sessionsHeld: 7 },
  "YB-POT-002": { dtp1: 80, dtp3: 41, sessionsPlanned: 8, sessionsHeld: 4 },
  "YB-POT-003": { dtp1: 99, dtp3: 81, sessionsPlanned: 8, sessionsHeld: 8 },
  "YB-POT-004": { dtp1: 124, dtp3: 88, sessionsPlanned: 8, sessionsHeld: 6 },
  "YB-POT-005": { dtp1: 52, dtp3: 23, sessionsPlanned: 8, sessionsHeld: 3 },
  "YB-POT-006": { dtp1: 198, dtp3: 171, sessionsPlanned: 10, sessionsHeld: 10 },
}

export const PILOT_IMMUNIZATION: ImmunizationRecord[] = PILOT_FACILITIES.map((f) => {
  const r = RAW[f.id] ?? { dtp1: 100, dtp3: 70, sessionsPlanned: 8, sessionsHeld: 6 }
  const dropoutPct = r.dtp1 > 0 ? ((r.dtp1 - r.dtp3) / r.dtp1) * 100 : 0
  return {
    facilityId: f.id,
    period: PILOT_PERIOD,
    dtp1: r.dtp1,
    dtp3: r.dtp3,
    dropoutPct: Math.round(dropoutPct * 10) / 10,
    sessionsPlanned: r.sessionsPlanned,
    sessionsHeld: r.sessionsHeld,
    source: "estimated",
  }
})

export function getImmunization(facilityId: string): ImmunizationRecord | undefined {
  return PILOT_IMMUNIZATION.find((r) => r.facilityId === facilityId)
}
