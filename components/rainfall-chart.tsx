"use client"

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
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

  return (
    <article className="bg-surface-container-low p-8 md:p-10">
      <header className="pb-8">
        <p className="label-tech">Precipitation</p>
        <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
          {countryName ? `${countryName} annual precipitation` : "Annual precipitation"}
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Long-term normal anchored to country-level CCKP, modulated by interannual variability.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-px bg-outline-variant/20 sm:grid-cols-3">
        <Stat label="Historical mean" value={histAvg != null ? `${Math.round(histAvg)} mm` : "—"} />
        <Stat label="Projection mean" value={projAvg != null ? `${Math.round(projAvg)} mm` : "—"} />
        <Stat
          label="Δ vs baseline"
          value={
            change != null && changePct != null
              ? `${change > 0 ? "+" : ""}${Math.round(change)} mm  ·  ${change > 0 ? "+" : ""}${changePct.toFixed(1)}%`
              : "—"
          }
        />
      </div>

      <div className="mt-10 h-80 w-full">
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 6, right: 12, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="rainHistGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="rainProjGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-5)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-chart-5)" stopOpacity={0.02} />
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
              tick={{ fontFamily: "var(--font-mono)" }}
              width={48}
            />
            <Tooltip content={<RainTooltip />} cursor={{ stroke: "var(--color-outline-variant)" }} />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 16 }} iconSize={8} />
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
              strokeDasharray="4 4"
              connectNulls={false}
              name="Projection"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        <span className="label-tech-sm">Source</span>
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

function mean(arr?: number[]): number | null {
  if (!arr || arr.length === 0) return null
  const s = arr.reduce((acc, v) => acc + (Number.isFinite(v) ? v : 0), 0)
  return s / arr.length
}

function RainTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="ambient-shadow rounded-md bg-surface-bright px-4 py-3 ghost-border-strong">
      <p className="label-tech-sm">Year {label}</p>
      <div className="mt-2 space-y-1">
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-3 text-xs">
            <span className="size-1.5 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-numeric font-medium text-foreground">{Math.round(entry.value)} mm</span>
          </div>
        ))}
      </div>
    </div>
  )
}
