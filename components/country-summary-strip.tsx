"use client"

import { Minus, TrendingDown, TrendingUp } from "lucide-react"
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

  const coverage =
    temperature.historical?.startYear && temperature.projection?.endYear
      ? `${temperature.historical.startYear}–${temperature.projection.endYear}`
      : null

  return (
    <section className="bg-surface-container-low">
      <div className="grid grid-cols-1 gap-12 px-8 py-10 md:grid-cols-12 md:px-10 md:py-12">
        <div className="md:col-span-5">
          <p className="label-tech">Brief</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground md:text-[3rem] md:leading-[1.05]">
            {country.name}
          </h1>
          <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
            <span>{country.region}</span>
            <span aria-hidden>·</span>
            <span className="font-numeric uppercase tracking-wider">ISO {country.code}</span>
            {loading && (
              <>
                <span aria-hidden>·</span>
                <span className="label-tech-sm flex items-center gap-1.5" style={{ color: "currentColor" }}>
                  <span className="size-1.5 animate-pulse rounded-full bg-secondary" />
                  streaming
                </span>
              </>
            )}
          </div>
        </div>

        <div className="md:col-span-7">
          <div className="grid grid-cols-2 gap-px bg-outline-variant/20 lg:grid-cols-4">
            <Metric
              label="Mean temp"
              value={tempAvg != null ? `${tempAvg.toFixed(1)}°` : "—"}
              suffix="C"
              delta={
                tempDelta != null
                  ? { value: `${tempDelta > 0 ? "+" : ""}${tempDelta.toFixed(2)}°C`, trend: tempTrend ?? "stable" }
                  : null
              }
            />
            <Metric
              label="Annual rain"
              value={rainfallAvg != null ? `${Math.round(rainfallAvg)}` : "—"}
              suffix="mm"
              delta={null}
            />
            <Metric
              label="Latest CO₂"
              value={co2Latest != null ? formatKt(co2Latest) : "—"}
              suffix="kt"
              delta={
                co2Delta != null
                  ? {
                      value: `${co2Delta > 0 ? "+" : ""}${co2Delta.toFixed(0)}%`,
                      trend: Math.abs(co2Delta) < 5 ? "stable" : co2Delta > 0 ? "warming" : "cooling",
                    }
                  : null
              }
            />
            <Metric label="Coverage" value={coverage ?? "—"} suffix="" delta={null} mono />
          </div>
        </div>
      </div>
    </section>
  )
}

interface MetricProps {
  label: string
  value: string
  suffix: string
  delta: { value: string; trend: "warming" | "cooling" | "stable" } | null
  mono?: boolean
}

function Metric({ label, value, suffix, delta, mono }: MetricProps) {
  const Trend = delta
    ? delta.trend === "warming"
      ? TrendingUp
      : delta.trend === "cooling"
        ? TrendingDown
        : Minus
    : null
  const trendTone = delta
    ? delta.trend === "warming"
      ? "text-destructive"
      : delta.trend === "cooling"
        ? "text-success"
        : "text-muted-foreground"
    : ""
  return (
    <div className="bg-surface-container-low px-6 py-7">
      <p className="label-tech-sm">{label}</p>
      <p className={cn("mt-2 font-numeric text-3xl font-semibold tracking-tight text-foreground", mono && "text-2xl")}>
        {value}
        {suffix && <span className="ml-1 text-base font-normal text-muted-foreground">{suffix}</span>}
      </p>
      {delta && Trend && (
        <p className={cn("mt-2 inline-flex items-center gap-1 font-numeric text-xs", trendTone)}>
          <Trend className="size-3" />
          {delta.value}
        </p>
      )}
    </div>
  )
}

function formatKt(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return `${Math.round(value)}`
}
