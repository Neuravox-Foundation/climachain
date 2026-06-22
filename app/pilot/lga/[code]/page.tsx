import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FacilityTable } from "@/components/pilot/facility-table"
import { BriefCard } from "@/components/pilot/brief-card"
import { ExportBar } from "@/components/pilot/export-bar"
import { getLgaModel, briefForLga } from "@/lib/pilot/data"

export default async function LgaPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const model = getLgaModel(code)
  if (!model) notFound()
  const brief = briefForLga(code)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary">{model.lga.name} LGA</h1>
          {model.tagline ? <p className="text-sm font-medium text-secondary">{model.tagline}</p> : null}
          <p className="text-sm text-muted-foreground">
            {model.counts.severe} severe · {model.counts.high} high · {model.counts.moderate} moderate · {model.counts.low} low
          </p>
        </div>
        <ExportBar rows={model.facilities} lga={code} />
      </div>

      {model.topDrivers.length ? (
        <Card>
          <CardHeader><CardTitle className="text-base">Top risk drivers in this LGA</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {model.topDrivers.map((d, i) => (
                <span key={i} className="rounded-md bg-muted px-2.5 py-1 text-sm">{d}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {brief ? <BriefCard brief={brief} /> : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Facilities</CardTitle>
          <CardDescription>Ranked by immunization-continuity risk</CardDescription>
        </CardHeader>
        <CardContent><FacilityTable rows={model.facilities} showLga={false} /></CardContent>
      </Card>
    </div>
  )
}
