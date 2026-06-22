import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RiskBadge } from "@/components/pilot/risk-badge"
import { StatusBadge } from "@/components/pilot/status-badge"
import { ActionPanel } from "@/components/pilot/action-panel"
import { listFacilityRows, icriForFacility } from "@/lib/pilot/data"
import { getAction } from "@/lib/pilot/actions"

export const dynamic = "force-dynamic"
export const metadata = { title: "Action Queue" }

export default async function ActionsPage() {
  const rows = listFacilityRows().filter((r) => r.band === "high" || r.band === "severe")
  const items = await Promise.all(
    rows.map(async (r) => {
      const icri = icriForFacility(r.id)!
      const action = await getAction(r.id, icri.band)
      return { row: r, action }
    }),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-primary">Action queue</h1>
        <p className="text-sm text-muted-foreground">{items.length} high/severe facilities, most urgent first. Manage the response, not just the risk.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Severe facilities lead. <span className="font-medium text-amber-700">Needs review</span> = not yet actioned this week.
        </p>
      </div>

      <div className="space-y-4">
        {items.map(({ row, action }) => (
          <Card key={row.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{row.name}</CardTitle>
                <CardDescription>{row.lgaName} · {row.topDriver}</CardDescription>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <RiskBadge band={row.band} score={row.score} />
                <StatusBadge status={action.status} />
              </div>
            </CardHeader>
            <CardContent><ActionPanel initial={action} /></CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
