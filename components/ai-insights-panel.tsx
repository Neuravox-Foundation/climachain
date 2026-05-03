"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Brain, Loader2, RefreshCw, Sparkles } from "lucide-react"

interface AIInsightsPanelProps {
  countryName: string
  countryCode: string
  dataType: "temperature" | "rainfall" | "co2" | "ndvi"
  data: any
  analysis?: any
  onInsightsGenerated?: (insights: string) => void
}

interface AIInsight {
  insight: string
  dataType: string
  country: string
  generatedAt: string
  attribution?: string
  model?: string
  note?: string
}

const LABEL: Record<string, string> = {
  temperature: "Temperature",
  rainfall: "Precipitation",
  co2: "CO₂ Emissions",
  ndvi: "Vegetation",
}

export function AIInsightsPanel({
  countryName,
  countryCode,
  dataType,
  data,
  analysis,
  onInsightsGenerated,
}: AIInsightsPanelProps) {
  const [insight, setInsight] = useState<AIInsight | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryName, countryCode, dataType, data, analysis }),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error ?? `Request failed (${response.status})`)
      }
      const result: AIInsight = await response.json()
      setInsight(result)
      if (result.insight) onInsightsGenerated?.(result.insight)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate insights.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="bg-surface-container-low p-8 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-6 pb-8">
        <div className="max-w-md">
          <p className="label-tech">Brief</p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
            Policy synthesis · {LABEL[dataType] ?? dataType}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Computed directly from the loaded series, then refined by DeepSeek when available.
          </p>
        </div>
        <Button onClick={generate} disabled={loading} variant={insight ? "outline" : "default"} className="ghost-border">
          {loading ? (
            <>
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              Generating
            </>
          ) : insight ? (
            <>
              <RefreshCw className="mr-1.5 size-3.5" />
              Regenerate
            </>
          ) : (
            <>
              <Sparkles className="mr-1.5 size-3.5" />
              Generate brief
            </>
          )}
        </Button>
      </header>

      {error && (
        <div className="bg-error-container/30 px-6 py-4 text-sm text-destructive">
          <p className="label-tech-sm" style={{ color: "currentColor", opacity: 0.7 }}>
            Generation error
          </p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {insight ? (
        <div className="bg-surface-container-lowest p-8">
          <p className="text-base leading-relaxed text-pretty text-foreground">{insight.insight}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="label-tech-sm">{insight.attribution ?? "Synthesised from observed series"}</span>
            <span aria-hidden>·</span>
            <span className="font-numeric">
              {new Date(insight.generatedAt).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest p-8 text-center">
          <Brain className="mx-auto size-6 text-muted-foreground opacity-60" />
          <p className="mt-3 text-sm text-foreground">
            Synthesise a {LABEL[dataType]?.toLowerCase() ?? dataType} brief grounded in the actual {countryName} series above.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Output: 4-5 sentence policy memo with country-specific numbers and recommendations.
          </p>
        </div>
      )}
    </article>
  )
}
