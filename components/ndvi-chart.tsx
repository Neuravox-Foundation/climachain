"use client"

import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import type { NDVIData } from "@/lib/climate-api"
import { cn } from "@/lib/utils"

interface NDVIChartProps {
  data: NDVIData[]
  countryName: string
  source?: string
  note?: string
}

interface VegetationHealth {
  label: string
  tone: "success" | "warning" | "destructive" | "muted"
}

export function NDVIChart({ data, countryName, source, note }: NDVIChartProps) {
  const analysis = useMemo(() => {
    if (!data || data.length === 0) return null
    const valid = data.filter((d) => Number.isFinite(d.ndvi))
    if (valid.length === 0) return null

    const currentYear = Math.max(...valid.map((d) => d.year))
    const prevYear = currentYear - 1
    const currentSeries = valid.filter((d) => d.year === currentYear)
    const prevSeries = valid.filter((d) => d.year === prevYear)

    const avg = (arr: NDVIData[]) =>
      arr.length === 0 ? null : arr.reduce((s, d) => s + d.ndvi, 0) / arr.length

    const avgCurrent = avg(currentSeries)
    const avgPrev = avg(prevSeries)
    const ndviValues = valid.map((d) => d.ndvi)
    const max = Math.max(...ndviValues)
    const min = Math.min(...ndviValues)

    const change = avgCurrent != null && avgPrev != null && avgPrev > 0 ? ((avgCurrent - avgPrev) / avgPrev) * 100 : null
    const trend: "up" | "down" | "flat" =
      change == null ? "flat" : change > 1 ? "up" : change < -1 ? "down" : "flat"

    return {
      avgCurrent: avgCurrent ?? 0,
      avgPrev: avgPrev ?? 0,
      max,
      min,
      change,
      trend,
      health: classifyHealth(avgCurrent ?? 0),
    }
  }, [data])

  const chartData = useMemo(
    () =>
      (data ?? []).map((d) => ({
        ...d,
        displayDate: `${d.month} '${String(d.year).slice(-2)}`,
        ndvi: Number.isFinite(d.ndvi) ? d.ndvi : 0,
      })),
    [data],
  )

  if (!data || data.length === 0 || !analysis) return null

  const TrendIcon = analysis.trend === "up" ? TrendingUp : analysis.trend === "down" ? TrendingDown : Minus
  const trendTone =
    analysis.trend === "up" ? "text-success" : analysis.trend === "down" ? "text-destructive" : "text-muted-foreground"

  return (
    <article className="bg-surface-container-low p-8 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-6 pb-8">
        <div className="max-w-md">
          <p className="label-tech">Vegetation</p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
            {countryName} vegetation index
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Three-year monthly NDVI baseline. 0 = bare soil/water, 1 = dense canopy.
          </p>
        </div>
        {source && (
          <p className="font-numeric text-xs text-muted-foreground">{truncate(source, 48)}</p>
        )}
      </header>

      <div className="grid grid-cols-2 gap-px bg-outline-variant/20 sm:grid-cols-4">
        <Stat label="Mean (current yr)" value={analysis.avgCurrent.toFixed(3)} />
        <Stat
          label="YoY change"
          value={analysis.change != null ? `${analysis.change > 0 ? "+" : ""}${analysis.change.toFixed(1)}%` : "-"}
          tone={trendTone}
          icon={<TrendIcon className="size-3.5" />}
        />
        <Stat label="Range" value={`${analysis.min.toFixed(2)} - ${analysis.max.toFixed(2)}`} />
        <Stat label="Health" value={analysis.health.label} tone={healthTone(analysis.health.tone)} />
      </div>

      <div className="mt-10 h-72 w-full">
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 6, right: 12, left: -8, bottom: 24 }}>
            <defs>
              <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-chart-3)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-outline-variant)" strokeDasharray="2 4" opacity={0.4} />
            <XAxis
              dataKey="displayDate"
              stroke="var(--color-on-surface-variant)"
              tickLine={false}
              axisLine={false}
              fontSize={10}
              tick={{ fontFamily: "var(--font-mono)" }}
              interval={2}
              angle={-30}
              textAnchor="end"
            />
            <YAxis
              domain={[0, 1]}
              stroke="var(--color-on-surface-variant)"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tick={{ fontFamily: "var(--font-mono)" }}
              width={40}
            />
            <Tooltip content={<NDVITooltip />} cursor={{ stroke: "var(--color-outline-variant)" }} />
            <Area
              type="monotone"
              dataKey="ndvi"
              stroke="var(--color-chart-3)"
              fill="url(#ndviGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {note && (
        <p className="mt-8 text-xs text-muted-foreground">
          <span className="label-tech-sm">Note</span>
          <span className="ml-2">{note}</span>
        </p>
      )}
    </article>
  )
}

function classifyHealth(value: number): VegetationHealth {
  if (value > 0.6) return { label: "Excellent", tone: "success" }
  if (value > 0.4) return { label: "Good", tone: "success" }
  if (value > 0.25) return { label: "Fair", tone: "warning" }
  if (value > 0.15) return { label: "Sparse", tone: "warning" }
  return { label: "Poor", tone: "destructive" }
}

function healthTone(tone: VegetationHealth["tone"]): string {
  switch (tone) {
    case "success":
      return "text-success"
    case "warning":
      return "text-warning"
    case "destructive":
      return "text-destructive"
    default:
      return "text-muted-foreground"
  }
}

function truncate(value: string, max: number): string {
  return value.length > max ? value.slice(0, max - 1) + "…" : value
}

function Stat({
  label,
  value,
  tone,
  icon,
}: {
  label: string
  value: string
  tone?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="bg-surface-container-low px-6 py-7">
      <p className="label-tech-sm">{label}</p>
      <p
        className={cn(
          "mt-2 inline-flex items-center gap-1.5 font-numeric text-2xl font-semibold tracking-tight text-foreground",
          tone,
        )}
      >
        {value}
        {icon}
      </p>
    </div>
  )
}

function NDVITooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="ambient-shadow rounded-md bg-surface-bright px-4 py-3 ghost-border-strong">
      <p className="label-tech-sm">{label}</p>
      <div className="mt-2 flex items-center gap-3 text-xs">
        <span className="size-1.5 rounded-full bg-chart-3" />
        <span className="text-muted-foreground">NDVI</span>
        <span className="ml-auto font-numeric font-medium text-foreground">
          {Number(payload[0].value).toFixed(3)}
        </span>
      </div>
    </div>
  )
}
