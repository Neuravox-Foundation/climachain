import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FacilityTable } from "@/components/pilot/facility-table"
import { BriefCard } from "@/components/pilot/brief-card"
import { ExportBar } from "@/components/pilot/export-bar"
import { listFacilityRows, briefForLga } from "@/lib/pilot/data"
import { PILOT_LGAS } from "@/lib/pilot/lgas.seed"

export const metadata = { title: "Weekly Operational Brief" }

export default function WeeklyBriefPage() {
  const all = listFacilityRows()
  const flagged = all.filter((r) => r.band === "high" || r.band === "severe")

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">Weekly operational brief</h1>
          <p className="text-sm text-muted-foreground">For state and LGA immunization teams. {flagged.length} facilities flagged this week.</p>
        </div>
        <ExportBar rows={flagged} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PILOT_LGAS.map((l) => {
          const b = briefForLga(l.code)
          return b ? <BriefCard key={l.code} brief={b} /> : null
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Flagged facilities</CardTitle>
          <CardDescription>Export as CSV, PDF, or SMS-ready text above</CardDescription>
        </CardHeader>
        <CardContent><FacilityTable rows={flagged} /></CardContent>
      </Card>
    </div>
  )
}
