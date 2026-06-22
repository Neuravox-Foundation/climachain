import { FacilityTable } from "@/components/pilot/facility-table"
import { BriefCard } from "@/components/pilot/brief-card"
import { ExportBar } from "@/components/pilot/export-bar"
import { Tile, SectionHeading } from "@/components/pilot/ui"
import { listFacilityRows, briefForLga } from "@/lib/pilot/data"
import { PILOT_LGAS } from "@/lib/pilot/lgas.seed"

export const metadata = { title: "Weekly Operational Brief" }

export default function WeeklyBriefPage() {
  const all = listFacilityRows()
  const flagged = all.filter((r) => r.band === "high" || r.band === "severe")

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="label-tech">For state & LGA teams</p>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-foreground md:text-[3rem] md:leading-[1.05]">
            Weekly operational brief
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            {flagged.length} facilities flagged this week. Export as a PDF brief for the meeting, or an SMS-ready block
            for low-bandwidth field use.
          </p>
        </div>
        <ExportBar rows={flagged} />
      </section>

      {/* Per-LGA briefs */}
      <section className="space-y-5">
        <SectionHeading eyebrow="By LGA" title="This week's framing" />
        <div className="grid gap-px bg-outline-variant/20 sm:grid-cols-2">
          {PILOT_LGAS.map((l) => {
            const b = briefForLga(l.code)
            return b ? <BriefCard key={l.code} brief={b} /> : null
          })}
        </div>
      </section>

      {/* Flagged facilities */}
      <section className="space-y-5">
        <SectionHeading eyebrow="Detail" title="Flagged facilities" description="Export as CSV, PDF or SMS text above" />
        <Tile className="px-2 py-1 sm:px-4 sm:py-2">
          <FacilityTable rows={flagged} />
        </Tile>
      </section>
    </div>
  )
}
