import type { Band } from "@/lib/pilot/types"

const MAP: Record<Band, { label: string; cls: string }> = {
  low: { label: "Low", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  moderate: { label: "Moderate", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  high: { label: "High", cls: "bg-orange-100 text-orange-800 border-orange-200" },
  severe: { label: "Severe", cls: "bg-red-100 text-red-800 border-red-200" },
}

export function RiskBadge({ band, score }: { band: Band; score?: number }) {
  const m = MAP[band]
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${m.cls}`}>
      {m.label}
      {typeof score === "number" ? <span className="font-mono opacity-70">{score}</span> : null}
    </span>
  )
}
