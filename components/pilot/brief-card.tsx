import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RiskBadge } from "./risk-badge"
import type { OperationalBrief } from "@/lib/pilot/types"

export function BriefCard({ brief }: { brief: OperationalBrief }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">
          {brief.scope.name}
          <span className="ml-1.5 font-normal text-muted-foreground">
            — {brief.scope.kind === "lga" ? "LGA brief" : "facility brief"}
          </span>
        </CardTitle>
        <RiskBadge band={brief.band} score={brief.score} />
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed">{brief.text}</p>
        {brief.why.length ? (
          <div className="text-sm">
            <span className="text-muted-foreground">Why: </span>
            {brief.why.join("; ")}
          </div>
        ) : null}
        <div className="text-sm">
          <span className="text-muted-foreground">Action this week: </span>
          {brief.action}
        </div>
        {brief.confidence !== "live" ? (
          <p className="text-xs text-muted-foreground">Confidence: {brief.confidence} — based on seeded/forecast inputs.</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
