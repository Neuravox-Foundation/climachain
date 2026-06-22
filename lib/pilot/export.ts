import type { FacilityRow } from "./data"
import type { OperationalBrief } from "./types"

/** CSV of the facility risk list – low bandwidth, opens anywhere. */
export function rowsToCsv(rows: FacilityRow[]): string {
  const header = ["facility_id", "facility", "lga", "type", "score", "band", "top_driver", "confidence"]
  const esc = (v: string | number) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = rows.map((r) =>
    [r.id, r.name, r.lgaName, r.type, r.score, r.band, r.topDriver, r.confidence].map(esc).join(","),
  )
  return [header.join(","), ...lines].join("\n")
}

/** Short SMS / WhatsApp-ready text block from a brief. */
export function briefToSms(brief: OperationalBrief): string {
  const why = brief.why.slice(0, 2).join("; ")
  return [
    `${brief.scope.name}: ${brief.band.toUpperCase()} risk (score ${brief.score}).`,
    why ? `Drivers: ${why}.` : "",
    `Action: ${brief.action}`,
  ]
    .filter(Boolean)
    .join(" ")
}

/** Plain-text weekly summary from flagged rows. */
export function weeklySummaryText(rows: FacilityRow[], state = "Yobe"): string {
  const flagged = rows.filter((r) => r.band === "high" || r.band === "severe")
  const head = `${state} immunization continuity – weekly watch. ${flagged.length} facilities flagged.`
  const body = flagged
    .map((r) => `- ${r.name} (${r.lgaName}): ${r.band} ${r.score} – ${r.topDriver}`)
    .join("\n")
  return `${head}\n\n${body}`
}
