import { notFound } from "next/navigation"
import Link from "next/link"
import { RiskBadge } from "@/components/pilot/risk-badge"
import { StatusBadge } from "@/components/pilot/status-badge"
import { FactorBars, TopDrivers } from "@/components/pilot/factor-bars"
import { BriefCard } from "@/components/pilot/brief-card"
import { ActionPanel } from "@/components/pilot/action-panel"
import { SectionHeading } from "@/components/pilot/ui"
import { getFacilityView, briefForFacility } from "@/lib/pilot/data"
import type { Band } from "@/lib/pilot/types"

export const dynamic = "force-dynamic" // reads mutable action state

const BAND_LABEL: Record<Band, string> = { low: "Low", moderate: "Moderate", high: "High", severe: "Severe" }

export default async function FacilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const view = await getFacilityView(id)
  if (!view) notFound()
  const { facility, lga, immunization, hazard, icri, action } = view
  const brief = briefForFacility(id)

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="label-tech">
            <Link href={`/pilot/lga/${lga.code}`} className="hover:text-foreground">{lga.name} LGA</Link>
            <span className="mx-1.5">·</span>
            {facility.type.replace("_", " ")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground md:text-[3rem] md:leading-[1.05]">
            {facility.name}
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <RiskBadge band={icri.band} score={icri.score} />
          <StatusBadge status={action.status} />
          <p className="label-tech-sm">Confidence · {icri.confidence}</p>
        </div>
      </section>

      {/* Why flagged – one-line headline; the brief below carries the detail */}
      <section className="border-l-2 border-primary bg-surface-container-low p-6 sm:p-8">
        <p className="label-tech-sm">Why flagged</p>
        <p className="mt-2 text-pretty text-lg leading-relaxed text-foreground">
          <span className="font-semibold text-primary">Flagged {BAND_LABEL[icri.band]}</span>
          {brief && brief.why.length ? <> – driven mainly by {brief.why.slice(0, 2).join(" and ")}.</> : "."}
        </p>
      </section>

      {/* ICRI breakdown + drivers */}
      <section className="space-y-5">
        <SectionHeading
          eyebrow="Score"
          title="How this score is built"
          description="Transparent, rule based: 40% hazard · 35% vulnerability · 25% stakes"
        />
        <div className="grid gap-px bg-outline-variant/20 lg:grid-cols-2">
          <div className="bg-surface-container-low p-6 sm:p-8">
            <p className="label-tech-sm">Components</p>
            <div className="mt-4"><FactorBars H={icri.H} V={icri.V} L={icri.L} /></div>
          </div>
          <div className="bg-surface-container-low p-6 sm:p-8">
            <p className="label-tech-sm">Top contributing factors</p>
            <div className="mt-4"><TopDrivers contributions={icri.contributions} /></div>
          </div>
        </div>
      </section>

      {/* Brief */}
      {brief ? (
        <section className="space-y-5">
          <SectionHeading eyebrow="This week" title="Operational brief" />
          <BriefCard brief={brief} />
        </section>
      ) : null}

      {/* Action */}
      <section className="space-y-5">
        <SectionHeading eyebrow="Response" title="Manage the action" />
        <div className="bg-surface-container-low p-6 sm:p-8"><ActionPanel initial={action} /></div>
      </section>

      {/* Context */}
      <section className="space-y-5">
        <SectionHeading eyebrow="Registry" title="Facility context" />
        <dl className="grid grid-cols-2 gap-px bg-outline-variant/20 sm:grid-cols-3">
          <Field label="Power" value={facility.powerSource.replace("_", " ")} />
          <Field label="Cold chain" value={`${facility.coldChainEquip} (${facility.coldChainStatus})`} />
          <Field label="Access" value={facility.accessTier.replace("_", " ")} />
          <Field label="Outreach reliance" value={facility.outreachReliance.replace("_", " ")} />
          <Field label="Under-1 catchment" value={String(facility.under1Catchment)} />
          <Field label="DTP3 dropout" value={`${immunization.dropoutPct}%`} />
          <Field label="Hot days (forecast)" value={`${hazard.hotDays} / ${hazard.windowDays}`} />
          <Field label="Flood probability" value={`${Math.round(hazard.floodProbability * 100)}%`} />
          <Field label="Rainfall anomaly" value={`${hazard.rainfallAnomalyPct}%`} />
        </dl>
      </section>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-low px-5 py-4">
      <dt className="label-tech-sm">{label}</dt>
      <dd className="mt-1 font-medium capitalize text-foreground">{value}</dd>
    </div>
  )
}
