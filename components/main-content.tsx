"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  Brain,
  CloudRain,
  Database,
  Factory,
  Leaf,
  MapPin,
  Sparkles,
  Thermometer,
  TrendingUp,
} from "lucide-react"
import { useExtendedClimateData } from "@/hooks/use-climate-data-extended"
import { ClimateTabs } from "@/components/climate-tabs"
import { ClimateAnomalyAlerts } from "@/components/climate-anomaly-alerts"
import { CountrySummaryStrip } from "@/components/country-summary-strip"
import { AFRICAN_COUNTRIES, type Country } from "@/lib/countries"

interface MainContentProps {
  selectedCountry?: Country | null
  onSelectCountry?: (country: Country) => void
}

const QUICK_PICKS = ["NGA", "KEN", "ZAF", "EGY", "ETH", "GHA"]

export function MainContent({ selectedCountry, onSelectCountry }: MainContentProps) {
  const climateData = useExtendedClimateData(selectedCountry?.code ?? null)

  const anyLoading =
    climateData.loading.temperature ||
    climateData.loading.rainfall ||
    climateData.loading.co2 ||
    climateData.loading.ndvi

  const anyError =
    climateData.error.temperature ||
    climateData.error.rainfall ||
    climateData.error.co2 ||
    climateData.error.ndvi

  const quickPickCountries = useMemo(
    () => QUICK_PICKS.map((code) => AFRICAN_COUNTRIES.find((c) => c.code === code)).filter(Boolean) as Country[],
    [],
  )

  return (
    <main className="flex-1 min-w-0 space-y-8 pt-6 md:pt-10">
      {!selectedCountry && (
        <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl md:p-10">
          <div aria-hidden className="absolute inset-0 -z-10 grid-pattern opacity-50" />
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <Sparkles className="size-3 text-primary" />
              Built on World Bank · CMIP6 · Copernicus
            </div>
            <h1 className="text-balance font-mono text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">
              Climate intelligence for every African nation.
            </h1>
            <p className="mt-4 max-w-2xl text-balance text-base text-muted-foreground md:text-lg">
              Stream real-time temperature, precipitation, emissions and vegetation signals — paired with
              AI-generated policy briefs for ministries, lenders and adaptation programmes.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Quick start
              </span>
              {quickPickCountries.map((country) => (
                <Button
                  key={country.code}
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full border-border/70 bg-background/60 px-3 text-xs"
                  onClick={() => onSelectCountry?.(country)}
                >
                  {country.name}
                  <ArrowRight className="ml-1.5 size-3 opacity-60" />
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureTile
              icon={Thermometer}
              title="Temperature"
              detail="1960 – 2050 historical and projected anomalies."
              tone="text-chart-1"
            />
            <FeatureTile
              icon={CloudRain}
              title="Precipitation"
              detail="Annual rainfall normals with drought signal."
              tone="text-chart-2"
            />
            <FeatureTile
              icon={Factory}
              title="CO₂ emissions"
              detail="Country-level emissions and intensity trends."
              tone="text-chart-4"
            />
            <FeatureTile
              icon={Leaf}
              title="Vegetation (NDVI)"
              detail="Greenness baselines and seasonality."
              tone="text-chart-3"
            />
          </div>
        </section>
      )}

      {selectedCountry && (
        <CountrySummaryStrip
          country={selectedCountry}
          temperature={climateData.temperature}
          rainfall={climateData.rainfall}
          co2={climateData.co2}
          loading={anyLoading}
        />
      )}

      {anyError && selectedCountry && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-start gap-3 pt-5 text-sm">
            <span className="mt-1 size-1.5 rounded-full bg-destructive" />
            <div>
              <p className="font-medium text-destructive">Some series did not load</p>
              <p className="mt-0.5 text-muted-foreground">{anyError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedCountry && (
        <ClimateAnomalyAlerts
          countryName={selectedCountry.name}
          temperatureData={climateData.temperature}
          rainfallData={climateData.rainfall}
          co2Data={climateData.co2}
          ndviData={climateData.ndvi}
        />
      )}

      {selectedCountry && (
        <ClimateTabs
          selectedCountry={selectedCountry}
          temperatureData={climateData.temperature}
          rainfallData={climateData.rainfall}
          co2Data={climateData.co2}
          ndviData={climateData.ndvi}
          loading={climateData.loading}
          error={climateData.error}
        />
      )}

      {!selectedCountry && (
        <div className="grid gap-4 md:grid-cols-3">
          <CapabilityCard
            icon={TrendingUp}
            title="Multi-parameter analysis"
            body="Cross-correlate temperature, precipitation, CO₂ and NDVI on the same timeline."
          />
          <CapabilityCard
            icon={Brain}
            title="AI policy briefs"
            body="Generate concise, sector-specific commentary tuned for ministries and lenders."
          />
          <CapabilityCard
            icon={Database}
            title="Edge-cached APIs"
            body="World Bank and CMIP6 data served from Cloudflare's global edge with HTTP caching."
          />
        </div>
      )}

      {!selectedCountry && (
        <Card className="surface-1">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <MapPin className="size-5 text-primary" />
            <div>
              <CardTitle className="text-base">Select a country to begin</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick any African nation from the sidebar to load live climate series.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {AFRICAN_COUNTRIES.slice(0, 18).map((country) => (
                <Badge
                  key={country.code}
                  variant="outline"
                  className="cursor-pointer rounded-md border-border/70 px-2 py-0.5 text-xs hover:bg-accent/10 hover:text-foreground"
                  onClick={() => onSelectCountry?.(country)}
                >
                  {country.name}
                </Badge>
              ))}
              <Badge variant="outline" className="rounded-md border-dashed px-2 py-0.5 text-xs text-muted-foreground">
                +{AFRICAN_COUNTRIES.length - 18} more
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}

interface FeatureTileProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  detail: string
  tone: string
}

function FeatureTile({ icon: Icon, title, detail, tone }: FeatureTileProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <Icon className={`size-5 ${tone}`} />
      <p className="mt-3 text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}

interface CapabilityCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
}

function CapabilityCard({ icon: Icon, title, body }: CapabilityCardProps) {
  return (
    <Card className="surface-1">
      <CardHeader className="space-y-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{body}</CardContent>
    </Card>
  )
}
