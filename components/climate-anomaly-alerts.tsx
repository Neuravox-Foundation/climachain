"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  AlertTriangle,
  CloudRain,
  Factory,
  Leaf,
  Shield,
  Thermometer,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import type { ExtendedClimateData } from "@/hooks/use-climate-data-extended"
import { cn } from "@/lib/utils"

type Severity = "low" | "medium" | "high" | "critical"
type Direction = "increasing" | "decreasing" | "stable"

interface ClimateAnomaly {
  id: string
  type: "temperature" | "rainfall" | "co2" | "ndvi"
  severity: Severity
  title: string
  description: string
  impact: string
  recommendation: string
  trend: Direction
  metric: string
}

interface ClimateAnomalyAlertsProps {
  countryName: string
  temperatureData: ExtendedClimateData["temperature"]
  rainfallData: ExtendedClimateData["rainfall"]
  co2Data: ExtendedClimateData["co2"]
  ndviData: ExtendedClimateData["ndvi"]
}

export function ClimateAnomalyAlerts({
  countryName,
  temperatureData,
  rainfallData,
  co2Data,
  ndviData,
}: ClimateAnomalyAlertsProps) {
  const anomalies = useMemo<ClimateAnomaly[]>(() => {
    const out: ClimateAnomaly[] = []

    // Temperature
    if (temperatureData?.analysis) {
      const { temperatureChange, changePerDecade } = temperatureData.analysis
      const tc = Number.isFinite(temperatureChange) ? temperatureChange : 0
      const tpd = Number.isFinite(changePerDecade) ? changePerDecade : 0

      if (Math.abs(tc) > 1.5) {
        out.push({
          id: `temp-total-${tc}`,
          type: "temperature",
          severity: Math.abs(tc) > 3 ? "critical" : Math.abs(tc) > 2 ? "high" : "medium",
          title: `Long-run temperature ${tc > 0 ? "rise" : "decline"} of ${Math.abs(tc).toFixed(1)}°C`,
          description: `Linear trend over the historical record indicates a ${tc > 0 ? "warming" : "cooling"} pattern outside expected interannual variability.`,
          impact:
            tc > 0
              ? "Heat-stress exposure for outdoor labour, elevated cooling-energy demand, accelerated water loss from reservoirs."
              : "Reduced growing-degree days, heightened risk of off-season frosts, shifts in disease vector ranges.",
          recommendation:
            tc > 0
              ? "Stress-test infrastructure for higher peak temperatures and prioritise heat-action plans for vulnerable populations."
              : "Re-evaluate planting calendars and monitor cold-season weather pattern shifts.",
          trend: tc > 0 ? "increasing" : "decreasing",
          metric: `${tc > 0 ? "+" : ""}${tc.toFixed(2)}°C cumulative`,
        })
      }

      if (Math.abs(tpd) > 0.4) {
        out.push({
          id: `temp-decade-${tpd}`,
          type: "temperature",
          severity: Math.abs(tpd) > 0.8 ? "high" : "medium",
          title: `Decadal warming pace of ${tpd.toFixed(2)}°C / decade`,
          description: "Pace of change exceeds the global mean, compressing the adaptation window.",
          impact: "Faster ecosystem shifts and infrastructure stress than long-range planning typically assumes.",
          recommendation: "Move adaptation milestones forward by one planning cycle and integrate climate stress tests into capital projects.",
          trend: tpd > 0 ? "increasing" : "decreasing",
          metric: `${tpd > 0 ? "+" : ""}${tpd.toFixed(2)}°C/decade`,
        })
      }
    }

    // Rainfall
    if (rainfallData?.historical?.data?.length && rainfallData?.projection?.data?.length) {
      const histAvg = mean(rainfallData.historical.data.map((d) => d.rainfall))
      const projAvg = mean(rainfallData.projection.data.map((d) => d.rainfall))
      if (histAvg && projAvg) {
        const pct = ((projAvg - histAvg) / histAvg) * 100
        if (Math.abs(pct) > 12) {
          out.push({
            id: `rain-${pct.toFixed(0)}`,
            type: "rainfall",
            severity: Math.abs(pct) > 30 ? "critical" : Math.abs(pct) > 20 ? "high" : "medium",
            title: `Projected precipitation ${pct > 0 ? "increase" : "decline"} of ${Math.abs(pct).toFixed(1)}%`,
            description: `Comparing the projection mean (${Math.round(projAvg)} mm) against the historical mean (${Math.round(histAvg)} mm).`,
            impact:
              pct > 0
                ? "Higher peak-runoff loads on drainage systems and growing flood-event frequency in low-lying basins."
                : "Drier baseline conditions stress rain-fed agriculture and shrink reservoir reliability.",
            recommendation:
              pct > 0
                ? "Upgrade urban drainage capacity and revisit floodplain planning assumptions."
                : "Accelerate water-storage build-out and shift agricultural advisories toward drought-tolerant cultivars.",
            trend: pct > 0 ? "increasing" : "decreasing",
            metric: `${pct > 0 ? "+" : ""}${pct.toFixed(1)}% vs baseline`,
          })
        }
      }
    }

    // CO₂
    if (co2Data?.data && co2Data.data.length >= 10) {
      const recent = co2Data.data.slice(-5)
      const earlier = co2Data.data.slice(0, 5)
      const recentAvg = mean(recent.map((d) => d.co2))
      const olderAvg = mean(earlier.map((d) => d.co2))
      if (recentAvg && olderAvg) {
        const pct = ((recentAvg - olderAvg) / olderAvg) * 100
        if (pct > 40) {
          out.push({
            id: `co2-${pct.toFixed(0)}`,
            type: "co2",
            severity: pct > 100 ? "critical" : pct > 60 ? "high" : "medium",
            title: `CO₂ emissions up ${pct.toFixed(0)}% over the record`,
            description: "Recent five-year mean significantly exceeds the earliest five-year baseline.",
            impact: "Growing carbon liability and rising exposure to border-adjustment mechanisms in trading partners.",
            recommendation: "Tighten NDC ambition cycle, prioritise grid decarbonisation and review fossil-fuel subsidy footprint.",
            trend: "increasing",
            metric: `${pct.toFixed(0)}% rise`,
          })
        } else if (pct < -10) {
          out.push({
            id: `co2-${pct.toFixed(0)}`,
            type: "co2",
            severity: "low",
            title: `Emissions decline of ${Math.abs(pct).toFixed(0)}% from baseline`,
            description: "Recent five-year mean below the earliest five-year baseline.",
            impact: "Positive trajectory; protect the trend against rebound effects during economic recovery.",
            recommendation: "Lock in gains through long-duration policy instruments and renewable-energy standards.",
            trend: "decreasing",
            metric: `${pct.toFixed(0)}%`,
          })
        }
      }
    }

    // NDVI
    if (ndviData?.data && ndviData.data.length > 12) {
      const years = Array.from(new Set(ndviData.data.map((d) => d.year))).sort((a, b) => a - b)
      const currentYear = years[years.length - 1]
      const prevYear = years.length >= 2 ? years[years.length - 2] : null
      if (prevYear !== null) {
        const cur = mean(ndviData.data.filter((d) => d.year === currentYear).map((d) => d.ndvi))
        const prev = mean(ndviData.data.filter((d) => d.year === prevYear).map((d) => d.ndvi))
        if (cur != null && prev != null && prev > 0) {
          const pct = ((cur - prev) / prev) * 100
          if (Math.abs(pct) > 8) {
            out.push({
              id: `ndvi-${pct.toFixed(0)}`,
              type: "ndvi",
              severity: Math.abs(pct) > 25 ? "high" : "medium",
              title: `Vegetation greenness ${pct > 0 ? "improvement" : "decline"} of ${Math.abs(pct).toFixed(1)}%`,
              description: `Year-on-year shift in mean NDVI between ${prevYear} and ${currentYear}.`,
              impact:
                pct > 0
                  ? "Healthier vegetative cover supports rangeland productivity and carbon sequestration."
                  : "Reduced vegetative cover increases erosion risk and depresses agricultural yields.",
              recommendation:
                pct > 0
                  ? "Document drivers of recovery and protect against future degradation pressures."
                  : "Map degradation hotspots, prioritise restoration funds, and engage pastoralist communities.",
              trend: pct > 0 ? "increasing" : "decreasing",
              metric: `${pct > 0 ? "+" : ""}${pct.toFixed(1)}% YoY`,
            })
          }
          if (cur < 0.18) {
            out.push({
              id: `ndvi-low-${cur.toFixed(2)}`,
              type: "ndvi",
              severity: cur < 0.1 ? "critical" : "high",
              title: `Persistently low vegetation cover (${cur.toFixed(2)})`,
              description: "Recent-year mean NDVI sits in the sparse-vegetation band.",
              impact: "Limited ecosystem services, soil-erosion risk and reduced carbon storage.",
              recommendation: "Initiate or scale reforestation, soil conservation and managed-grazing programmes.",
              trend: "stable",
              metric: `NDVI ${cur.toFixed(2)}`,
            })
          }
        }
      }
    }

    return out.sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
  }, [temperatureData, rainfallData, co2Data, ndviData])

  if (anomalies.length === 0) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="flex items-center gap-3 pt-5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-success/15 text-success">
            <Shield className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Climate signals nominal</p>
            <p className="text-xs text-muted-foreground">
              No significant anomalies detected for {countryName} on the loaded series.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const counts = anomalies.reduce<Record<Severity, number>>(
    (acc, a) => ({ ...acc, [a.severity]: (acc[a.severity] ?? 0) + 1 }),
    { critical: 0, high: 0, medium: 0, low: 0 },
  )

  return (
    <Card className="surface-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <AlertTriangle className="size-4 text-warning" />
          Anomaly alerts
          <Badge variant="outline" className="rounded-md border-border/70 px-2 py-0.5 text-[10px] font-mono">
            {anomalies.length}
          </Badge>
        </CardTitle>
        <div className="hidden gap-1.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground sm:flex">
          {(["critical", "high", "medium", "low"] as Severity[]).map((sev) =>
            counts[sev] > 0 ? (
              <span key={sev} className={cn("inline-flex items-center gap-1 rounded-full border border-border/70 px-2 py-0.5", sevTone(sev))}>
                <span className={cn("size-1.5 rounded-full", sevDot(sev))} />
                {sev} {counts[sev]}
              </span>
            ) : null,
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {anomalies.map((anomaly) => (
          <AnomalyRow key={anomaly.id} anomaly={anomaly} />
        ))}
      </CardContent>
    </Card>
  )
}

function AnomalyRow({ anomaly }: { anomaly: ClimateAnomaly }) {
  const TypeIcon =
    anomaly.type === "temperature"
      ? Thermometer
      : anomaly.type === "rainfall"
        ? CloudRain
        : anomaly.type === "co2"
          ? Factory
          : Leaf
  const TrendIcon = anomaly.trend === "increasing" ? TrendingUp : anomaly.trend === "decreasing" ? TrendingDown : null
  const SeverityIcon = anomaly.severity === "low" ? Shield : anomaly.severity === "critical" ? AlertTriangle : AlertCircle

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition",
        anomaly.severity === "critical" && "border-destructive/40 bg-destructive/5",
        anomaly.severity === "high" && "border-destructive/30 bg-destructive/[0.04]",
        anomaly.severity === "medium" && "border-warning/30 bg-warning/[0.04]",
        anomaly.severity === "low" && "border-success/30 bg-success/[0.04]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn("flex size-7 items-center justify-center rounded-md", sevBackground(anomaly.severity))}>
            <SeverityIcon className="size-3.5" />
          </span>
          <TypeIcon className={cn("size-4", typeTone(anomaly.type))} />
          <p className="text-sm font-medium">{anomaly.title}</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
          <Badge variant="outline" className={cn("rounded-md border-border/60 px-1.5 py-0", sevTone(anomaly.severity))}>
            {anomaly.severity}
          </Badge>
          <span className="rounded-md border border-border/60 bg-background/40 px-1.5 py-0.5 text-foreground">
            {anomaly.metric}
          </span>
          {TrendIcon && <TrendIcon className="size-3 text-muted-foreground" />}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{anomaly.description}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-background/40 p-2.5 text-xs">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Impact</div>
          <p className="mt-1 text-foreground/80">{anomaly.impact}</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/40 p-2.5 text-xs">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Recommendation</div>
          <p className="mt-1 text-foreground/80">{anomaly.recommendation}</p>
        </div>
      </div>
    </div>
  )
}

function mean(arr?: number[]): number | null {
  if (!arr || arr.length === 0) return null
  let total = 0
  let count = 0
  for (const v of arr) {
    if (Number.isFinite(v)) {
      total += v
      count += 1
    }
  }
  return count === 0 ? null : total / count
}

function severityRank(s: Severity): number {
  return { critical: 4, high: 3, medium: 2, low: 1 }[s]
}

function sevTone(s: Severity): string {
  switch (s) {
    case "critical":
      return "text-destructive"
    case "high":
      return "text-destructive"
    case "medium":
      return "text-warning"
    case "low":
      return "text-success"
  }
}

function sevDot(s: Severity): string {
  switch (s) {
    case "critical":
      return "bg-destructive"
    case "high":
      return "bg-destructive"
    case "medium":
      return "bg-warning"
    case "low":
      return "bg-success"
  }
}

function sevBackground(s: Severity): string {
  switch (s) {
    case "critical":
      return "bg-destructive/15 text-destructive"
    case "high":
      return "bg-destructive/10 text-destructive"
    case "medium":
      return "bg-warning/15 text-warning"
    case "low":
      return "bg-success/15 text-success"
  }
}

function typeTone(type: ClimateAnomaly["type"]): string {
  switch (type) {
    case "temperature":
      return "text-chart-1"
    case "rainfall":
      return "text-chart-2"
    case "co2":
      return "text-chart-4"
    case "ndvi":
      return "text-chart-3"
  }
}
