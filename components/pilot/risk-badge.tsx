import type { Band } from "@/lib/pilot/types"

const MAP: Record<Band, { label: string; cls: string }> = {
  low: { label: "Low", cls: "bg-emerald-50 text-emerald-800 ring-emerald-600/20" },
  moderate: { label: "Moderate", cls: "bg-amber-50 text-amber-800 ring-amber-600/25" },
  high: { label: "High", cls: "bg-orange-50 text-orange-800 ring-orange-600/25" },
  severe: { label: "Severe", cls: "bg-red-50 text-red-800 ring-red-600/25" },
}

/** Solid band colours for accent dots / chart marks. */
export const BAND_DOT: Record<Band, string> = {
  low: "#15803d",
  moderate: "#c98a1e",
  high: "#cf6a1f",
  severe: "#ba1a1a",
}

export function RiskBadge({ band, score }: { band: Band; score?: number }) {
  const m = MAP[band]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${m.cls}`}
    >
      <span className="size-1.5 rounded-full" style={{ background: BAND_DOT[band] }} />
      {m.label}
      {typeof score === "number" ? <span className="font-numeric opacity-70">{score}</span> : null}
    </span>
  )
}
