import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FacilityTable } from "@/components/pilot/facility-table"
import { RiskBadge } from "@/components/pilot/risk-badge"
import { getOverview } from "@/lib/pilot/data"
import type { Band } from "@/lib/pilot/types"

export const metadata = { title: "Yobe Pilot Overview" }

const BANDS: Band[] = ["severe", "high", "moderate", "low"]

export default function PilotOverview() {
  const o = getOverview()
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Yobe immunization continuity — readiness console</h1>
        <p className="text-sm text-muted-foreground">
          Facilities and LGAs at risk of climate-related disruption to routine child immunization.{" "}
          <span className="font-medium text-foreground">{o.flaggedFacilities} of {o.lgas.reduce((n, l) => n + l.total, 0)} facilities flagged</span> (high or severe) across {o.lgas.length} pilot LGAs.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Prototype operational layer. Risk scoring and the action workflow are live; pilot inputs (facility registry, immunization, hazard forecast) are seeded for the demo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BANDS.map((b) => (
          <Card key={b}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <RiskBadge band={b} />
                <span className="font-mono text-2xl font-bold">{o.counts[b]}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {o.lgas.map((l) => (
          <Card key={l.code}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <Link href={`/pilot/lga/${l.code}`} className="text-secondary hover:underline">{l.name} LGA</Link>
                <RiskBadge band={l.topBand} />
              </CardTitle>
              <CardDescription>{l.tagline}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm">
                <span className="font-medium text-foreground">{l.flagged} of {l.total}</span>{" "}
                <span className="text-muted-foreground">facilities flagged (high / severe)</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top flagged facilities</CardTitle>
          <CardDescription>High and severe risk, most urgent first</CardDescription>
        </CardHeader>
        <CardContent>
          <FacilityTable rows={o.topSevere} />
        </CardContent>
      </Card>
    </div>
  )
}
