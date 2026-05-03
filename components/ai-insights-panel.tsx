"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Loader2, Sparkles, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

  const isFallback = insight?.model === "fallback"

  return (
    <Card className="surface-1">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <span className="flex size-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Brain className="size-4" />
            </span>
            AI policy brief
            <Badge variant="outline" className="rounded-md border-border/70 px-2 py-0.5 text-[10px] font-mono">
              {LABEL[dataType] ?? dataType}
            </Badge>
          </CardTitle>
          <Button onClick={generate} disabled={loading} size="sm" variant={insight ? "outline" : "default"}>
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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
            <AlertCircle className="size-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {insight ? (
          <div className="space-y-3">
            {isFallback && (
              <Alert className="border-warning/30 bg-warning/5">
                <AlertCircle className="size-4 text-warning" />
                <AlertDescription className="text-xs">
                  Using a heuristic baseline. Set <code className="font-mono">OPENAI_API_KEY</code> to enable
                  on-demand AI synthesis.
                </AlertDescription>
              </Alert>
            )}
            <div className="rounded-xl border border-border/60 bg-background/40 p-5">
              <p className="text-sm leading-relaxed text-foreground">{insight.insight}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span>{insight.attribution}</span>
                <span aria-hidden>·</span>
                <span>{new Date(insight.generatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-6 text-center">
            <Brain className="mx-auto size-6 text-muted-foreground opacity-60" />
            <p className="mt-2 text-sm text-muted-foreground">
              Generate a policy-grade brief grounded in the {LABEL[dataType]?.toLowerCase() ?? dataType} series above.
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground/70">
              Output: 110–160 words, sector-specific, suitable for ministries and lenders.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
