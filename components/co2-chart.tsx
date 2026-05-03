"use client"

import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { ClimateDataResponse, CO2Data } from "@/lib/climate-api"
import { cn } from "@/lib/utils"

interface CO2ChartProps {
  data: ClimateDataResponse<CO2Data>
  countryName?: string
}

export function CO2Chart({ data, countryName }: CO2ChartProps) {
  if (!data?.data || data.data.length === 0) return null

  const series = data.data
  const total = series.reduce((s, d) => s + (Number.isFinite(d.co2) ? d.co2 : 0), 0)
  const avg = total / series.length
  const first = series[0]
  const last = series[series.length - 1]
  const change = last.co2 - first.co2
  const changePct = first.co2 > 0 ? (change / first.co2) * 100 : 0

  const enriched = series.map((point, idx) => {
    const window = series.slice(Math.max(0, idx - 4), idx + 1)
    const ma = window.reduce((s, p) => s + p.co2, 0) / window.length
    return { ...point, ma }
  })

  return (
    <article className="bg-surface-container-low p-8 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-6 pb-8">
        <div className="max-w-md">
          <p className="label-tech">Emissions</p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
            {countryName ? `${countryName} CO₂ trajectory` : "CO₂ trajectory"}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Total annual emissions in kilotons. The line is a five-year moving average.
          </p>
        </div>
        <p className="font-numeric text-xs text-muted-foreground">
          {data.startYear}–{data.endYear}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-px bg-outline-variant/20 sm:grid-cols-4">
        <Stat label="Mean" value={`${formatKt(avg)} kt`} />
        <Stat label="Latest" value={`${formatKt(last.co2)} kt`} />
        <Stat
          label="Δ since start"
          value={`${change > 0 ? "+" : ""}${formatKt(change)} kt`}
          tone={change > 0 ? "destructive" : "success"}
        />
        <Stat
          label="% change"
          value={`${change > 0 ? "+" : ""}${changePct.toFixed(1)}%`}
          tone={change > 0 ? "destructive" : "success"}
        />
      </div>

      <div className="mt-10 h-80 w-full">
        <ResponsiveContainer>
          <ComposedChart data={enriched} margin={{ top: 6, right: 12, left: -8, bottom: 0 }}>
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
              tickFormatter={(v) => formatKt(v)}
              tick={{ fontFamily: "var(--font-mono)" }}
              width={56}
            />
            <Tooltip content={<CO2Tooltip />} cursor={{ fill: "var(--color-surface-container)", opacity: 0.5 }} />
            <Bar dataKey="co2" fill="var(--color-chart-1)" name="Annual emissions" />
            <Line
              type="monotone"
              dataKey="ma"
              stroke="var(--color-chart-5)"
              strokeWidth={2}
              dot={false}
              name="5-year moving avg"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        <span className="label-tech-sm">Source</span>
        <span className="ml-2">{data.source}</span>
      </p>
    </article>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "destructive" | "success"
}) {
  return (
    <div className="bg-surface-container-low px-6 py-7">
      <p className="label-tech-sm">{label}</p>
      <p
        className={cn(
          "mt-2 font-numeric text-2xl font-semibold tracking-tight",
          tone === "destructive" ? "text-destructive" : tone === "success" ? "text-success" : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  )
}

function formatKt(value: number): string {
  if (!Number.isFinite(value)) return "—"
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return `${Math.round(value)}`
}

function CO2Tooltip({ active, payload, label }: any) {
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
              {formatKt(Number(entry.value))} kt
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
