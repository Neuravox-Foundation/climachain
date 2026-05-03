"use client"

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CloudRain } from "lucide-react"
import type { ClimateDataResponse, RainfallData } from "@/lib/climate-api"

interface RainfallChartProps {
  historicalData?: ClimateDataResponse<RainfallData> | null
  projectionData?: ClimateDataResponse<RainfallData> | null
  countryName?: string
}

interface ChartPoint {
  year: number
  historical?: number
  projection?: number
}

export function RainfallChart({ historicalData, projectionData, countryName }: RainfallChartProps) {
  if (!historicalData && !projectionData) return null

  const map = new Map<number, ChartPoint>()
  historicalData?.data.forEach((p) => {
    map.set(p.year, { ...(map.get(p.year) ?? { year: p.year }), historical: p.rainfall })
  })
  projectionData?.data.forEach((p) => {
    map.set(p.year, { ...(map.get(p.year) ?? { year: p.year }), projection: p.rainfall })
  })
  const chartData = Array.from(map.values()).sort((a, b) => a.year - b.year)

  const histAvg = mean(historicalData?.data.map((d) => d.rainfall))
  const projAvg = mean(projectionData?.data.map((d) => d.rainfall))
  const change = histAvg != null && projAvg != null ? projAvg - histAvg : null
  const changePct = change != null && histAvg && histAvg !== 0 ? (change / histAvg) * 100 : null

  const histRange = historicalData ? `${historicalData.startYear}–${historicalData.endYear}` : null
  const projRange = projectionData ? `${projectionData.startYear}–${projectionData.endYear}` : null

  return (
    <Card className="surface-1">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <CloudRain className="size-4 text-chart-2" />
            Annual precipitation
            {countryName && <span className="text-muted-foreground">· {countryName}</span>}
          </CardTitle>
          <div className="flex flex-wrap gap-1.5">
            {histRange && (
              <Badge variant="outline" className="rounded-md border-border/70 px-2 py-0.5 text-[10px] font-mono">
                <span className="mr-1.5 inline-block size-1.5 rounded-full bg-chart-2" />
                Hist {histRange}
              </Badge>
            )}
            {projRange && (
              <Badge variant="outline" className="rounded-md border-border/70 px-2 py-0.5 text-[10px] font-mono">
                <span className="mr-1.5 inline-block size-1.5 rounded-full bg-chart-5" />
                Proj {projRange}
              </Badge>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <Tile label="Historical mean" value={histAvg != null ? `${Math.round(histAvg)} mm` : "—"} />
          <Tile label="Projection mean" value={projAvg != null ? `${Math.round(projAvg)} mm` : "—"} />
          <Tile
            label="Δ"
            value={
              change != null && changePct != null
                ? `${change > 0 ? "+" : ""}${Math.round(change)} mm  (${change > 0 ? "+" : ""}${changePct.toFixed(1)}%)`
                : "—"
            }
            accent={change != null && change < 0 ? "text-destructive" : "text-success"}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 6, right: 18, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="rainHistGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="rainProjGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-5)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-chart-5)" stopOpacity={0.02} />
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
                tickFormatter={(v) => `${v}`}
                width={48}
              />
              <Tooltip content={<RainTooltip />} cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
              <Area
                type="monotone"
                dataKey="historical"
                stroke="var(--color-chart-2)"
                fill="url(#rainHistGradient)"
                strokeWidth={2}
                connectNulls={false}
                name="Historical"
              />
              <Area
                type="monotone"
                dataKey="projection"
                stroke="var(--color-chart-5)"
                fill="url(#rainProjGradient)"
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

function Tile({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`mt-1 font-mono text-base font-semibold tracking-tight ${accent ?? ""}`}>{value}</div>
    </div>
  )
}

function mean(arr?: number[]): number | null {
  if (!arr || arr.length === 0) return null
  const s = arr.reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0)
  return s / arr.length
}

function RainTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 shadow-lg backdrop-blur">
      <p className="text-xs font-medium text-foreground">Year {label}</p>
      <div className="mt-1.5 space-y-1">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
            <span className="size-1.5 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-mono font-medium">{Math.round(entry.value)} mm</span>
          </div>
        ))}
      </div>
    </div>
  )
}
