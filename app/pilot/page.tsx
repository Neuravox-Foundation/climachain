import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { FacilityTable } from "@/components/pilot/facility-table"
import { RiskBadge, BAND_DOT } from "@/components/pilot/risk-badge"
import { Tile, SectionHeading } from "@/components/pilot/ui"
import { getOverview } from "@/lib/pilot/data"
import type { Band } from "@/lib/pilot/types"

export const metadata = { title: "Yobe Pilot Overview" }

const BANDS: { band: Band; label: string }[] = [
  { band: "severe", label: "Severe" },
  { band: "high", label: "High" },
  { band: "moderate", label: "Moderate" },
  { band: "low", label: "Low" },
]

export default function PilotOverview() {
  const o = getOverview()
  const totalFacilities = o.lgas.reduce((n, l) => n + l.total, 0)

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section>
        <p className="label-tech">Yobe State · Readiness console</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-[3rem]">
          Climate risk to routine
          <span className="block text-primary">child immunization.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          {o.flaggedFacilities} of {totalFacilities} facilities across {o.lgas.length} pilot LGAs are flagged for
          climate-related disruption to immunization continuity. Scoring and the action workflow are live; pilot
          inputs are seeded for the demo.
        </p>
      </section>

      {/* Severity counts – hairline-divided stat grid */}
      <section className="grid grid-cols-2 gap-px bg-outline-variant/20 lg:grid-cols-4">
        {BANDS.map(({ band, label }) => (
          <div key={band} className="bg-surface-container-low px-6 py-7">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full" style={{ background: BAND_DOT[band] }} />
              <p className="label-tech-sm">{label}</p>
            </div>
            <p className="mt-2 font-numeric text-4xl font-semibold tracking-tight text-foreground">{o.counts[band]}</p>
            <p className="mt-1 text-xs text-muted-foreground">facilities</p>
          </div>
        ))}
      </section>

      {/* LGA tiles */}
      <section className="space-y-5">
        <SectionHeading eyebrow="Pilot LGAs" title="Two stories, one engine" />
        <div className="grid gap-px bg-outline-variant/20 sm:grid-cols-2">
          {o.lgas.map((l) => (
            <Link
              key={l.code}
              href={`/pilot/lga/${l.code}`}
              className="group bg-surface-container-low p-8 transition-colors hover:bg-surface-container"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="label-tech-sm">LGA</p>
                <RiskBadge band={l.topBand} />
              </div>
              <h3 className="mt-2 flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-foreground">
                {l.name}
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{l.tagline}</p>
              <p className="mt-6 text-sm">
                <span className="font-numeric text-2xl font-semibold text-foreground">{l.flagged}</span>
                <span className="text-muted-foreground"> / {l.total} flagged (high · severe)</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Top flagged facilities */}
      <section className="space-y-5">
        <SectionHeading
          eyebrow="Priority"
          title="Top flagged facilities"
          description="High and severe risk, most urgent first"
        />
        <Tile className="px-2 py-1 sm:px-4 sm:py-2">
          <FacilityTable rows={o.topSevere} />
        </Tile>
      </section>
    </div>
  )
}
