"use client"

import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Factory, TrendingDown, TrendingUp } from "lucide-react"
import type { ClimateDataResponse, CO2Data } from "@/lib/climate-api"

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
  const trendUp = change > 0

  const enriched = series.map((point, idx) => {
    const window = series.slice(Math.max(0, idx - 4), idx + 1)
    const ma = window.reduce((s, p) => s + p.co2, 0) / window.length
    return { ...point, ma }
  })

  return (
    <Card className="surface-1">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Factory className="size-4 text-chart-4" />
            CO₂ emissions
            {countryName && <span className="text-muted-foreground">· {countryName}</span>}
          </CardTitle>
          <Badge variant="outline" className="rounded-md border-border/70 px-2 py-0.5 text-[10px] font-mono">
            {data.startYear}–{data.endYear}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <Tile label="Mean" value={`${formatKt(avg)} kt`} />
          <Tile label="Latest" value={`${formatKt(last.co2)} kt`} />
          <Tile
            label="Δ since start"
            value={`${trendUp ? "+" : ""}${formatKt(change)} kt`}
            accent={trendUp ? "text-destructive" : "text-success"}
            iconRight={trendUp ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
          />
          <Tile
            label="% change"
            value={`${trendUp ? "+" : ""}${changePct.toFixed(1)}%`}
            accent={trendUp ? "text-destructive" : "text-success"}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer>
            <ComposedChart data={enriched} margin={{ top: 6, right: 18, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="co2BarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-4)" stopOpacity={0.85} />
                  <stop offset="100%" stopColor="var(--color-chart-4)" stopOpacity={0.25} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" opacity={0.5} />
              <XAxis
                dataKey="year"
                stroke="var(--color-muted-foreground)"
                tickLine={false}
                axisLine={false}
                fontSize={11}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                tickFormatter={(v) => formatKt(v)}
                width={56}
              />
              <Tooltip content={<CO2Tooltip />} cursor={{ fill: "var(--color-muted)", opacity: 0.4 }} />
              <Bar dataKey="co2" fill="url(#co2BarGradient)" radius={[3, 3, 0, 0]} name="Annual emissions" />
              <Line
                type="monotone"
                dataKey="ma"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                dot={false}
                name="5-year moving avg"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Source: {data.source}</p>
      </CardContent>
    </Card>
  )
}

function Tile({
  label,
  value,
  accent,
  iconRight,
}: {
  label: string
  value: string
  accent?: string
  iconRight?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`mt-1 flex items-center gap-1.5 font-mono text-base font-semibold tracking-tight ${accent ?? ""}`}>
        {value}
        {iconRight}
      </div>
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
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 shadow-lg backdrop-blur">
      <p className="text-xs font-medium text-foreground">Year {label}</p>
      <div className="mt-1.5 space-y-1">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
            <span className="size-1.5 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-mono font-medium">{formatKt(Number(entry.value))} kt</span>
          </div>
        ))}
      </div>
    </div>
  )
}
