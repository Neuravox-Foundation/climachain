import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RiskBadge } from "@/components/pilot/risk-badge"
import { StatusBadge } from "@/components/pilot/status-badge"
import { FactorBars, TopDrivers } from "@/components/pilot/factor-bars"
import { BriefCard } from "@/components/pilot/brief-card"
import { ActionPanel } from "@/components/pilot/action-panel"
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href={`/pilot/lga/${lga.code}`} className="hover:underline">{lga.name} LGA</Link> · {facility.type.toUpperCase()}
          </p>
          <h1 className="font-display text-2xl font-bold text-[#00236f]">{facility.name}</h1>
        </div>
        <div className="flex flex-col items-end gap-1.5 text-right">
          <RiskBadge band={icri.band} score={icri.score} />
          <StatusBadge status={action.status} />
          <p className="text-xs text-muted-foreground">Confidence: {icri.confidence}</p>
        </div>
      </div>

      <div className="rounded-lg border-l-4 border-[#0058be] bg-[#0058be]/[0.06] p-4">
        <p className="text-sm">
          <span className="font-semibold text-[#00236f]">Flagged {BAND_LABEL[icri.band]}</span>
          {brief && brief.why.length ? <> — driven mainly by {brief.why.slice(0, 2).join(" and ")}.</> : "."}
        </p>
        {brief ? (
          <p className="mt-1 text-sm">
            <span className="text-muted-foreground">Suggested action this week: </span>
            {brief.action}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ICRI breakdown</CardTitle>
            <CardDescription>Transparent, rule-based score: 40% hazard · 35% vulnerability · 25% stakes</CardDescription>
          </CardHeader>
          <CardContent><FactorBars H={icri.H} V={icri.V} L={icri.L} /></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Why this score</CardTitle>
            <CardDescription>Top contributing factors</CardDescription>
          </CardHeader>
          <CardContent><TopDrivers contributions={icri.contributions} /></CardContent>
        </Card>
      </div>

      {brief ? <BriefCard brief={brief} /> : null}

      <Card>
        <CardHeader><CardTitle className="text-base">Action</CardTitle></CardHeader>
        <CardContent><ActionPanel initial={action} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Facility context</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <Field label="Power" value={facility.powerSource} />
          <Field label="Cold-chain" value={`${facility.coldChainEquip} (${facility.coldChainStatus})`} />
          <Field label="Access" value={facility.accessTier} />
          <Field label="Outreach reliance" value={facility.outreachReliance} />
          <Field label="Under-1 catchment" value={String(facility.under1Catchment)} />
          <Field label="DTP3 dropout" value={`${immunization.dropoutPct}%`} />
          <Field label="Hot days (forecast)" value={`${hazard.hotDays}/${hazard.windowDays}`} />
          <Field label="Flood probability" value={`${Math.round(hazard.floodProbability * 100)}%`} />
          <Field label="Rainfall anomaly" value={`${hazard.rainfallAnomalyPct}%`} />
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  )
}
