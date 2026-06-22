import { RiskBadge } from "./risk-badge"
import type { OperationalBrief } from "@/lib/pilot/types"

export function BriefCard({ brief }: { brief: OperationalBrief }) {
  return (
    <div className="bg-surface-container-low p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-tech-sm">{brief.scope.kind === "lga" ? "LGA brief" : "Facility brief"}</p>
          <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-foreground">{brief.scope.name}</h3>
        </div>
        <RiskBadge band={brief.band} score={brief.score} />
      </div>

      <p className="mt-4 text-pretty leading-relaxed text-foreground">{brief.text}</p>

      {brief.why.length ? (
        <div className="mt-4">
          <p className="label-tech-sm">Why</p>
          <p className="mt-1 text-sm text-muted-foreground">{brief.why.join("; ")}</p>
        </div>
      ) : null}

      <div className="mt-4">
        <p className="label-tech-sm">Action this week</p>
        <p className="mt-1 text-sm text-foreground">{brief.action}</p>
      </div>

      {brief.confidence !== "live" ? (
        <p className="mt-4 text-xs text-muted-foreground">Confidence: {brief.confidence} — based on seeded / forecast inputs.</p>
      ) : null}
    </div>
  )
}
