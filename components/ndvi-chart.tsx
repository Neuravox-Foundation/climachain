"use client"

import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, Leaf, Minus, TrendingDown, TrendingUp } from "lucide-react"
import type { NDVIData } from "@/lib/climate-api"

interface NDVIChartProps {
  data: NDVIData[]
  countryName: string
  source?: string
  note?: string
}

interface VegetationHealth {
  label: string
  tone: string
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
        displayDate: `${d.month} ${String(d.year).slice(-2)}`,
        ndvi: Number.isFinite(d.ndvi) ? d.ndvi : 0,
      })),
    [data],
  )

  if (!data || data.length === 0 || !analysis) return null

  const TrendIcon = analysis.trend === "up" ? TrendingUp : analysis.trend === "down" ? TrendingDown : Minus
  const trendTone =
    analysis.trend === "up" ? "text-success" : analysis.trend === "down" ? "text-destructive" : "text-muted-foreground"

  return (
    <Card className="surface-1">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Leaf className="size-4 text-chart-3" />
            Vegetation index (NDVI) · {countryName}
          </CardTitle>
          {source && (
            <Badge variant="outline" className="rounded-md border-border/70 px-2 py-0.5 text-[10px] font-mono">
              {truncate(source, 38)}
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <Tile label="Mean (current yr)" value={analysis.avgCurrent.toFixed(3)} />
          <Tile
            label="YoY change"
            value={analysis.change != null ? `${analysis.change > 0 ? "+" : ""}${analysis.change.toFixed(1)}%` : "—"}
            accent={trendTone}
            icon={<TrendIcon className="size-3.5" />}
          />
          <Tile label="Range" value={`${analysis.min.toFixed(2)} – ${analysis.max.toFixed(2)}`} />
          <Tile label="Health" value={analysis.health.label} accent={analysis.health.tone} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 6, right: 18, left: -8, bottom: 28 }}>
              <defs>
                <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--color-chart-3)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" opacity={0.5} />
              <XAxis
                dataKey="displayDate"
                stroke="var(--color-muted-foreground)"
                tickLine={false}
                axisLine={false}
                fontSize={10}
                interval={2}
                angle={-30}
                textAnchor="end"
              />
              <YAxis
                domain={[0, 1]}
                stroke="var(--color-muted-foreground)"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                width={40}
              />
              <Tooltip content={<NDVITooltip />} cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }} />
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

        <div className="mt-4 grid gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-[11px] text-muted-foreground sm:grid-cols-5">
          <ScaleSwatch color="oklch(0.55 0.22 25)" range="0.0–0.2" label="Bare soil / water" />
          <ScaleSwatch color="oklch(0.7 0.18 75)" range="0.2–0.3" label="Sparse vegetation" />
          <ScaleSwatch color="oklch(0.78 0.16 90)" range="0.3–0.5" label="Moderate" />
          <ScaleSwatch color="oklch(0.6 0.14 155)" range="0.5–0.7" label="Dense" />
          <ScaleSwatch color="oklch(0.45 0.13 155)" range="0.7–1.0" label="Very dense" />
        </div>

        {note && (
          <Alert className="mt-4 border-border/60 bg-background/40">
            <Info className="size-4" />
            <AlertDescription className="text-xs">{note}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

function classifyHealth(value: number): VegetationHealth {
  if (value > 0.6) return { label: "Excellent", tone: "text-success" }
  if (value > 0.4) return { label: "Good", tone: "text-success" }
  if (value > 0.25) return { label: "Fair", tone: "text-warning" }
  if (value > 0.15) return { label: "Sparse", tone: "text-warning" }
  return { label: "Poor", tone: "text-destructive" }
}

function truncate(value: string, max: number): string {
  return value.length > max ? value.slice(0, max - 1) + "…" : value
}

function Tile({
  label,
  value,
  accent,
  icon,
}: {
  label: string
  value: string
  accent?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 px-3 py-2.5">
      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className={`mt-1 flex items-center gap-1.5 font-mono text-base font-semibold tracking-tight ${accent ?? ""}`}>
        {value}
        {icon}
      </div>
    </div>
  )
}

function ScaleSwatch({ color, range, label }: { color: string; range: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-full" style={{ background: color }} />
      <span className="font-mono text-[10px]">{range}</span>
      <span className="truncate">{label}</span>
    </div>
  )
}

function NDVITooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 shadow-lg backdrop-blur">
      <p className="text-xs font-medium">{label}</p>
      <div className="mt-1.5 flex items-center gap-2 text-xs">
        <span className="size-1.5 rounded-full bg-chart-3" />
        <span className="text-muted-foreground">NDVI</span>
        <span className="ml-auto font-mono font-medium">{Number(payload[0].value).toFixed(3)}</span>
      </div>
    </div>
  )
}
