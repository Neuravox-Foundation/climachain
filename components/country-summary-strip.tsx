"use client"

import { CloudRain, Factory, MapPin, Thermometer, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ExtendedClimateData } from "@/hooks/use-climate-data-extended"
import type { Country } from "@/lib/countries"

interface CountrySummaryStripProps {
  country: Country
  temperature: ExtendedClimateData["temperature"]
  rainfall: ExtendedClimateData["rainfall"]
  co2: ExtendedClimateData["co2"]
  loading: boolean
}

export function CountrySummaryStrip({ country, temperature, rainfall, co2, loading }: CountrySummaryStripProps) {
  const tempAvg = temperature.analysis?.averageTemperature
  const tempDelta = temperature.analysis?.temperatureChange
  const tempTrend = temperature.analysis?.trend

  const rainfallSeries = rainfall.historical?.data ?? []
  const rainfallAvg = rainfallSeries.length
    ? rainfallSeries.reduce((s, d) => s + d.rainfall, 0) / rainfallSeries.length
    : null

  const co2Series = co2?.data ?? []
  const co2Latest = co2Series[co2Series.length - 1]?.co2 ?? null
  const co2First = co2Series[0]?.co2 ?? null
  const co2Delta = co2Latest && co2First && co2First > 0 ? ((co2Latest - co2First) / co2First) * 100 : null

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card/50 backdrop-blur-xl">
      <div className="flex flex-col gap-4 border-b border-border/60 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MapPin className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{country.name}</h2>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{country.region}</span>
              <span aria-hidden>·</span>
              <span className="font-mono">ISO {country.code}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <Badge variant="outline" className="gap-1.5 rounded-full border-border/70 px-2.5 py-0.5 text-xs">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              Streaming
            </Badge>
          )}
          <Badge variant="outline" className="rounded-full border-border/70 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider">
            World Bank · CMIP6
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-border/60 sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
        <Metric
          icon={Thermometer}
          tone="text-chart-1"
          label="Mean temperature"
          value={tempAvg != null ? `${tempAvg.toFixed(1)}°C` : "—"}
          delta={
            tempDelta != null
              ? { value: `${tempDelta > 0 ? "+" : ""}${tempDelta.toFixed(2)}°C`, trend: tempTrend ?? "stable" }
              : null
          }
        />
        <Metric
          icon={CloudRain}
          tone="text-chart-2"
          label="Annual rainfall"
          value={rainfallAvg != null ? `${Math.round(rainfallAvg)} mm` : "—"}
          delta={null}
        />
        <Metric
          icon={Factory}
          tone="text-chart-4"
          label="Latest CO₂"
          value={co2Latest != null ? `${formatKt(co2Latest)} kt` : "—"}
          delta={
            co2Delta != null
              ? {
                  value: `${co2Delta > 0 ? "+" : ""}${co2Delta.toFixed(0)}%`,
                  trend: Math.abs(co2Delta) < 5 ? "stable" : co2Delta > 0 ? "warming" : "cooling",
                }
              : null
          }
        />
        <Metric
          icon={MapPin}
          tone="text-chart-3"
          label="Coverage"
          value={
            temperature.historical?.startYear && temperature.projection?.endYear
              ? `${temperature.historical.startYear}–${temperature.projection.endYear}`
              : "—"
          }
          delta={null}
        />
      </div>
    </section>
  )
}

interface MetricProps {
  icon: React.ComponentType<{ className?: string }>
  tone: string
  label: string
  value: string
  delta: { value: string; trend: "warming" | "cooling" | "stable" } | null
}

function Metric({ icon: Icon, tone, label, value, delta }: MetricProps) {
  const Trend = delta ? (delta.trend === "warming" ? TrendingUp : delta.trend === "cooling" ? TrendingDown : Minus) : null
  const trendTone = delta
    ? delta.trend === "warming"
      ? "text-destructive"
      : delta.trend === "cooling"
        ? "text-success"
        : "text-muted-foreground"
    : ""
  return (
    <div className="px-5 py-5 md:px-6 md:py-6">
      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Icon className={cn("size-3.5", tone)} />
          {label}
        </span>
        {Trend && delta && (
          <span className={cn("inline-flex items-center gap-1 text-[10px]", trendTone)}>
            <Trend className="size-3" />
            {delta.value}
          </span>
        )}
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}

function formatKt(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return `${Math.round(value)}`
}
