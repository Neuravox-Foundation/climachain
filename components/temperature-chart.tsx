"use client"

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

  const trendIcon =
    analysis?.trend === "warming" ? (
      <TrendingUp className="size-4 text-destructive" />
    ) : analysis?.trend === "cooling" ? (
      <TrendingDown className="size-4 text-success" />
    ) : (
      <Minus className="size-4 text-muted-foreground" />
    )

  const histRange = historicalData ? `${historicalData.startYear}–${historicalData.endYear}` : null
  const projRange = projectionData ? `${projectionData.startYear}–${projectionData.endYear}` : null

  return (
    <Card className="surface-1">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            {trendIcon}
            Temperature trends
            {countryName && <span className="text-muted-foreground">· {countryName}</span>}
          </CardTitle>
          <div className="flex flex-wrap gap-1.5">
            {histRange && (
              <Badge variant="outline" className="rounded-md border-border/70 px-2 py-0.5 text-[10px] font-mono">
                <span className="mr-1.5 inline-block size-1.5 rounded-full bg-chart-1" />
                Hist {histRange}
              </Badge>
            )}
            {projRange && (
              <Badge variant="outline" className="rounded-md border-border/70 px-2 py-0.5 text-[10px] font-mono">
                <span className="mr-1.5 inline-block size-1.5 rounded-full bg-chart-2" />
                Proj {projRange}
              </Badge>
            )}
          </div>
        </div>
        {analysis && (
          <div className="grid grid-cols-3 gap-3 text-xs">
            <Stat label="Mean" value={`${analysis.averageTemperature.toFixed(1)} °C`} />
            <Stat label="Total Δ" value={`${signed(analysis.temperatureChange, 2)} °C`} />
            <Stat label="Per decade" value={`${signed(analysis.changePerDecade, 2)} °C`} />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 6, right: 18, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="projGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.02} />
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
                tickFormatter={(v) => `${v}°`}
                width={48}
              />
              <Tooltip content={<TempTooltip />} cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
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
                strokeDasharray="5 5"
                connectNulls={false}
                name="Projection"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Source: {historicalData?.source ?? projectionData?.source ?? "—"}
        </p>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-mono text-base font-semibold tracking-tight", accent)}>{value}</div>
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
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 shadow-lg backdrop-blur">
      <p className="text-xs font-medium text-foreground">Year {label}</p>
      <div className="mt-1.5 space-y-1">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
            <span className="size-1.5 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-mono font-medium">{Number(entry.value).toFixed(2)} °C</span>
          </div>
        ))}
      </div>
    </div>
  )
}
