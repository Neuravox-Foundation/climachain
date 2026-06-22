import { notFound } from "next/navigation"
import { FacilityTable } from "@/components/pilot/facility-table"
import { BriefCard } from "@/components/pilot/brief-card"
import { ExportBar } from "@/components/pilot/export-bar"
import { Tile, SectionHeading } from "@/components/pilot/ui"
import { BAND_DOT } from "@/components/pilot/risk-badge"
import { getLgaModel, briefForLga } from "@/lib/pilot/data"
import type { Band } from "@/lib/pilot/types"

const COUNT_BANDS: { band: Band; label: string }[] = [
  { band: "severe", label: "Severe" },
  { band: "high", label: "High" },
  { band: "moderate", label: "Moderate" },
  { band: "low", label: "Low" },
]

export default async function LgaPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const model = getLgaModel(code)
  if (!model) notFound()
  const brief = briefForLga(code)

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="label-tech">Local Government Area</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground md:text-[3rem] md:leading-[1.05]">
            {model.lga.name}
          </h1>
          {model.tagline ? <p className="mt-3 max-w-xl text-pretty text-base leading-relaxed text-secondary">{model.tagline}</p> : null}
        </div>
        <ExportBar rows={model.facilities} lga={code} />
      </section>

      {/* Counts */}
      <section className="grid grid-cols-2 gap-px bg-outline-variant/20 lg:grid-cols-4">
        {COUNT_BANDS.map(({ band, label }) => (
          <div key={band} className="bg-surface-container-low px-6 py-7">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full" style={{ background: BAND_DOT[band] }} />
              <p className="label-tech-sm">{label}</p>
            </div>
            <p className="mt-2 font-numeric text-3xl font-semibold tracking-tight text-foreground">{model.counts[band]}</p>
          </div>
        ))}
      </section>

      {/* Drivers */}
      {model.topDrivers.length ? (
        <section className="space-y-5">
          <SectionHeading eyebrow="Signal" title="Top risk drivers in this LGA" />
          <div className="flex flex-wrap gap-2">
            {model.topDrivers.map((d, i) => (
              <span key={i} className="rounded-md bg-surface-container-low px-3 py-1.5 text-sm text-foreground">{d}</span>
            ))}
          </div>
        </section>
      ) : null}

      {/* Brief */}
      {brief ? (
        <section className="space-y-5">
          <SectionHeading eyebrow="This week" title="Operational brief" />
          <BriefCard brief={brief} />
        </section>
      ) : null}

      {/* Facilities */}
      <section className="space-y-5">
        <SectionHeading eyebrow="Facilities" title="Ranked by continuity risk" />
        <Tile className="px-2 py-1 sm:px-4 sm:py-2">
          <FacilityTable rows={model.facilities} showLga={false} />
        </Tile>
      </section>
    </div>
  )
}
