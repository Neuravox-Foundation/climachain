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
    <div className="space-y-10">
      <section>
        <p className="label-tech">Response management</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-foreground md:text-[3rem] md:leading-[1.05]">
          Action queue
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          {items.length} high and severe facilities, most urgent first. Move from viewing risk to managing the response.
          <span className="text-foreground"> Needs review</span> means not yet actioned this week.
        </p>
      </section>

      <section className="space-y-px bg-outline-variant/20">
        {items.map(({ row, action }) => (
          <div key={row.id} className="bg-surface-container-low p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">{row.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{row.lgaName} · {row.topDriver}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <RiskBadge band={row.band} score={row.score} />
                <StatusBadge status={action.status} />
              </div>
            </div>
            <div className="mt-6 border-t border-outline-variant/20 pt-6">
              <ActionPanel initial={action} />
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
