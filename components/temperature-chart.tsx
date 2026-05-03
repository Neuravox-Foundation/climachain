"use client"

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import type { ClimateDataResponse, TemperatureAnalysis, TemperatureData } from "@/lib/climate-api"
import { cn } from "@/lib/utils"

interface TemperatureChartProps {
  historicalData?: ClimateDataResponse<TemperatureData> | null
  projectionData?: ClimateDataResponse<TemperatureData> | null
  analysis?: TemperatureAnalysis | null
  countryName?: string
}

interface ChartPoint {
  year: number
  historical?: number
  projection?: number
}

export function TemperatureChart({ historicalData, projectionData, analysis, countryName }: TemperatureChartProps) {
  if (!historicalData && !projectionData) return null

  const map = new Map<number, ChartPoint>()
  historicalData?.data.forEach((p) => {
    map.set(p.year, { ...(map.get(p.year) ?? { year: p.year }), historical: p.temperature })
  })
  projectionData?.data.forEach((p) => {
    map.set(p.year, { ...(map.get(p.year) ?? { year: p.year }), projection: p.temperature })
  })
  const chartData = Array.from(map.values()).sort((a, b) => a.year - b.year)

  const TrendIcon =
    analysis?.trend === "warming"
      ? TrendingUp
      : analysis?.trend === "cooling"
        ? TrendingDown
        : Minus
  const trendTone =
    analysis?.trend === "warming"
      ? "text-destructive"
      : analysis?.trend === "cooling"
        ? "text-success"
        : "text-muted-foreground"

  return (
    <article className="bg-surface-container-low p-8 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-6 pb-8">
        <div className="max-w-md">
          <p className="label-tech">Temperature</p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
            {countryName ? `${countryName} surface temperature` : "Surface temperature"}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Historical record paired with CMIP6-anchored projections through 2050.
          </p>
        </div>
        {analysis && (
          <div className={cn("flex items-center gap-2 font-numeric text-xs", trendTone)}>
            <TrendIcon className="size-4" />
            <span className="uppercase tracking-wider">{analysis.trend}</span>
          </div>
        )}
      </header>

      {analysis && (
        <div className="grid grid-cols-1 gap-px bg-outline-variant/20 sm:grid-cols-3">
          <Stat label="Mean" value={`${analysis.averageTemperature.toFixed(1)}°C`} />
          <Stat label="Total Δ" value={`${signed(analysis.temperatureChange, 2)}°C`} />
          <Stat label="Per decade" value={`${signed(analysis.changePerDecade, 2)}°C`} />
        </div>
      )}

      <div className="mt-10 h-80 w-full">
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 6, right: 12, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="projGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-outline-variant)" strokeDasharray="2 4" opacity={0.4} />
            <XAxis
              dataKey="year"
              stroke="var(--color-on-surface-variant)"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tick={{ fontFamily: "var(--font-mono)" }}
            />
            <YAxis
              stroke="var(--color-on-surface-variant)"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={(v) => `${v}°`}
              tick={{ fontFamily: "var(--font-mono)" }}
              width={40}
            />
            <Tooltip content={<TempTooltip />} cursor={{ stroke: "var(--color-outline-variant)" }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 16 }} iconSize={8} />
            <Area
              type="monotone"
              dataKey="historical"
              stroke="var(--color-chart-1)"
              fill="url(#histGradient)"
              strokeWidth={2}
              connectNulls={false}
              name="Historical"
            />
            <Area
              type="monotone"
              dataKey="projection"
              stroke="var(--color-chart-2)"
              fill="url(#projGradient)"
              strokeWidth={2}
              strokeDasharray="4 4"
              connectNulls={false}
              name="Projection"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        <span className="label-tech-sm">Source</span>{" "}
        <span className="ml-2">{historicalData?.source ?? projectionData?.source ?? "—"}</span>
      </p>
    </article>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-low px-6 py-7">
      <p className="label-tech-sm">{label}</p>
      <p className="mt-2 font-numeric text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  )
}

function signed(value: number, places: number): string {
  if (!Number.isFinite(value)) return "—"
  return `${value > 0 ? "+" : ""}${value.toFixed(places)}`
}

function TempTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="ambient-shadow rounded-md bg-surface-bright px-4 py-3 ghost-border-strong">
      <p className="label-tech-sm">Year {label}</p>
      <div className="mt-2 space-y-1">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-3 text-xs">
            <span className="size-1.5 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-numeric font-medium text-foreground">
              {Number(entry.value).toFixed(2)}°C
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
