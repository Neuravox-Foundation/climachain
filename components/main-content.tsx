"use client"

import { useMemo } from "react"
import { ArrowRight, ArrowUpRight, CloudRain, Database, Factory, Leaf, Thermometer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useExtendedClimateData } from "@/hooks/use-climate-data-extended"
import { ClimateTabs } from "@/components/climate-tabs"
import { ClimateAnomalyAlerts } from "@/components/climate-anomaly-alerts"
import { CountrySummaryStrip } from "@/components/country-summary-strip"
import { AFRICAN_COUNTRIES, type Country } from "@/lib/countries"
import { cn } from "@/lib/utils"

interface MainContentProps {
  selectedCountry?: Country | null
  onSelectCountry?: (country: Country) => void
}

const QUICK_PICKS = ["NGA", "KEN", "ZAF", "EGY", "ETH", "GHA"]

export function MainContent({ selectedCountry, onSelectCountry }: MainContentProps) {
  const climateData = useExtendedClimateData(selectedCountry?.code ?? null)

  const anyError =
    climateData.error.temperature ||
    climateData.error.rainfall ||
    climateData.error.co2 ||
    climateData.error.ndvi

  const quickPickCountries = useMemo(
    () =>
      QUICK_PICKS.map((code) => AFRICAN_COUNTRIES.find((c) => c.code === code)).filter(
        Boolean,
      ) as Country[],
    [],
  )

  const anyLoading =
    climateData.loading.temperature ||
    climateData.loading.rainfall ||
    climateData.loading.co2 ||
    climateData.loading.ndvi

  return (
    <main className="flex-1 min-w-0 space-y-12 pt-12">
      {!selectedCountry && (
        <section className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8 xl:col-span-7">
            <p className="label-tech">Volume 01 · 2026</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-[3.5rem]">
              A platform of record for the African
              <span className="block text-primary">climate question.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              ClimaChain organises temperature, precipitation, emissions and vegetation data for all 54
              sovereign African states — paired with policy briefs designed for ministries, lenders and
              adaptation programmes.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-2">
              <span className="label-tech-sm mr-2">Begin with</span>
              {quickPickCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => onSelectCountry?.(country)}
                  className="group inline-flex items-center gap-1.5 rounded-md bg-surface-container-low px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-container"
                >
                  {country.name}
                  <ArrowRight className="size-3 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4 xl:col-span-5 lg:pt-2">
            <div className="bg-surface-container-low p-8">
              <p className="label-tech-sm">Current corpus</p>
              <p className="mt-2 font-numeric text-5xl font-semibold tracking-tight text-foreground">
                {AFRICAN_COUNTRIES.length}
                <span className="ml-2 text-base font-normal text-muted-foreground">nations</span>
              </p>
              <p className="mt-1 font-numeric text-sm text-muted-foreground">1960 — 2050</p>

              <div className="mt-8 space-y-5">
                <CorpusLine label="Temperature" detail="Annual mean, World Bank + CMIP6" />
                <CorpusLine label="Precipitation" detail="Long-term normals + projections" />
                <CorpusLine label="CO₂ emissions" detail="Total annual emissions, kt" />
                <CorpusLine label="Vegetation (NDVI)" detail="Three-year monthly index" />
              </div>
            </div>
          </aside>
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
        <div className="bg-error-container/30 px-6 py-4 text-sm text-destructive">
          <p className="label-tech-sm" style={{ color: "currentColor", opacity: 0.7 }}>
            Partial fetch
          </p>
          <p className="mt-1">{anyError}</p>
        </div>
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
        <section className="bg-surface-container-low">
          <div className="grid grid-cols-1 gap-px bg-outline-variant/20 md:grid-cols-4">
            <Capability icon={Thermometer} label="Temperature" body="Surface temperature anomalies, 1960 baseline." />
            <Capability icon={CloudRain} label="Precipitation" body="Annual normals and forward projections." />
            <Capability icon={Factory} label="Emissions" body="Country-level CO₂ in kilotons, 1990+." />
            <Capability icon={Leaf} label="Vegetation" body="NDVI greenness with seasonal modelling." />
          </div>
        </section>
      )}

      {!selectedCountry && (
        <section className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label-tech">Method</p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">
              Open data, deterministically reconstructed.
            </h2>
          </div>
          <div className="lg:col-span-7 lg:pt-1">
            <p className="text-base leading-relaxed text-pretty text-muted-foreground">
              We anchor each country to its long-term climatological mean (CCKP normal, 1991–2020) and
              modulate with live World Bank indicators where the source returns observation-grade values.
              Every series carries a transparent <span className="font-numeric text-foreground">quality</span>{" "}
              flag — <span className="font-numeric">live</span>,{" "}
              <span className="font-numeric">estimated</span> or{" "}
              <span className="font-numeric">unavailable</span> — so policy work can attribute correctly.
            </p>
            <Button
              variant="link"
              asChild
              className="mt-4 h-auto p-0 text-secondary"
            >
              <a
                href="https://github.com/Neuravox-Foundation/climachain"
                target="_blank"
                rel="noreferrer noopener"
              >
                Read the methodology
                <ArrowUpRight className="ml-1 size-4" />
              </a>
            </Button>
          </div>
        </section>
      )}

      {!selectedCountry && (
        <section className="bg-surface-container-low p-8 md:p-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="label-tech">Browse</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
                Open the full catalog.
              </h2>
            </div>
            <p className="font-numeric text-sm text-muted-foreground">
              {AFRICAN_COUNTRIES.length} countries · 5 regions
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
            {AFRICAN_COUNTRIES.map((country) => (
              <button
                key={country.code}
                onClick={() => onSelectCountry?.(country)}
                className="group flex items-center justify-between rounded-md py-1.5 text-left text-sm text-foreground transition-colors hover:bg-surface-container px-2"
              >
                <span className="truncate">{country.name}</span>
                <span className="font-numeric text-[10px] uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-primary">
                  {country.code}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

function CorpusLine({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      <span className="size-1.5 shrink-0 rounded-full bg-tertiary" aria-hidden />
    </div>
  )
}

function Capability({
  icon: Icon,
  label,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  body: string
}) {
  return (
    <div className={cn("bg-surface-container-low p-8")}>
      <Icon className="size-5 text-primary" />
      <p className="mt-5 font-display text-base font-semibold text-foreground">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  )
}
