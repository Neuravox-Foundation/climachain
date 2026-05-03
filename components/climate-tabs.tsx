"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CloudRain, Factory, Leaf, Thermometer } from "lucide-react"
import { TemperatureChart } from "@/components/temperature-chart"
import { RainfallChart } from "@/components/rainfall-chart"
import { CO2Chart } from "@/components/co2-chart"
import { NDVIChart } from "@/components/ndvi-chart"
import { AIInsightsPanel } from "@/components/ai-insights-panel"
import { ExportButtons } from "@/components/export-buttons"
import { ChartSkeleton } from "@/components/chart-skeleton"
import type { ExtendedClimateData } from "@/hooks/use-climate-data-extended"
import type { Country } from "@/lib/countries"

interface ClimateTabsProps {
  selectedCountry: Country
  temperatureData: ExtendedClimateData["temperature"]
  rainfallData: ExtendedClimateData["rainfall"]
  co2Data: ExtendedClimateData["co2"]
  ndviData: ExtendedClimateData["ndvi"]
  loading: ExtendedClimateData["loading"]
  error: ExtendedClimateData["error"]
}

type TabId = "temperature" | "rainfall" | "co2" | "ndvi"

const TABS: Array<{ id: TabId; label: string; icon: typeof Thermometer }> = [
  { id: "temperature", label: "Temperature", icon: Thermometer },
  { id: "rainfall", label: "Precipitation", icon: CloudRain },
  { id: "co2", label: "CO₂ Emissions", icon: Factory },
  { id: "ndvi", label: "Vegetation", icon: Leaf },
]

export function ClimateTabs({
  selectedCountry,
  temperatureData,
  rainfallData,
  co2Data,
  ndviData,
  loading,
  error,
}: ClimateTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("temperature")
  const [insightsByTab, setInsightsByTab] = useState<Record<TabId, string | undefined>>({
    temperature: undefined,
    rainfall: undefined,
    co2: undefined,
    ndvi: undefined,
  })

  const captureInsight = (id: TabId) => (text: string) =>
    setInsightsByTab((prev) => ({ ...prev, [id]: text }))

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-tech">Series</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
            Climate signals
          </h2>
        </div>
        <p className="font-numeric text-xs text-muted-foreground">{selectedCountry.code}</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)} className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-0 rounded-none bg-transparent p-0 border-b border-outline-variant/30">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="relative flex items-center gap-2 rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="temperature" className="mt-8 space-y-12 focus-visible:outline-none">
          {loading.temperature && !temperatureData.historical ? (
            <ChartSkeleton />
          ) : error.temperature ? (
            <ErrorState message={error.temperature} />
          ) : temperatureData.historical || temperatureData.projection ? (
            <>
              <TemperatureChart
                historicalData={temperatureData.historical}
                projectionData={temperatureData.projection}
                analysis={temperatureData.analysis}
                countryName={selectedCountry.name}
              />
              <AIInsightsPanel
                countryName={selectedCountry.name}
                countryCode={selectedCountry.code}
                dataType="temperature"
                data={temperatureData}
                analysis={temperatureData.analysis}
                onInsightsGenerated={captureInsight("temperature")}
              />
              <ExportButtons
                countryName={selectedCountry.name}
                countryCode={selectedCountry.code}
                dataType="temperature"
                data={temperatureData}
                insights={insightsByTab.temperature}
              />
            </>
          ) : (
            <EmptyState icon={Thermometer} label="No temperature data available" />
          )}
        </TabsContent>

        <TabsContent value="rainfall" className="mt-8 space-y-12 focus-visible:outline-none">
          {loading.rainfall && !rainfallData.historical ? (
            <ChartSkeleton />
          ) : error.rainfall ? (
            <ErrorState message={error.rainfall} />
          ) : rainfallData.historical || rainfallData.projection ? (
            <>
              <RainfallChart
                historicalData={rainfallData.historical}
                projectionData={rainfallData.projection}
                countryName={selectedCountry.name}
              />
              <AIInsightsPanel
                countryName={selectedCountry.name}
                countryCode={selectedCountry.code}
                dataType="rainfall"
                data={rainfallData}
                onInsightsGenerated={captureInsight("rainfall")}
              />
              <ExportButtons
                countryName={selectedCountry.name}
                countryCode={selectedCountry.code}
                dataType="rainfall"
                data={rainfallData}
                insights={insightsByTab.rainfall}
              />
            </>
          ) : (
            <EmptyState icon={CloudRain} label="No precipitation data available" />
          )}
        </TabsContent>

        <TabsContent value="co2" className="mt-8 space-y-12 focus-visible:outline-none">
          {loading.co2 && !co2Data ? (
            <ChartSkeleton />
          ) : error.co2 ? (
            <ErrorState message={error.co2} />
          ) : co2Data ? (
            <>
              <CO2Chart data={co2Data} countryName={selectedCountry.name} />
              <AIInsightsPanel
                countryName={selectedCountry.name}
                countryCode={selectedCountry.code}
                dataType="co2"
                data={co2Data}
                onInsightsGenerated={captureInsight("co2")}
              />
              <ExportButtons
                countryName={selectedCountry.name}
                countryCode={selectedCountry.code}
                dataType="co2"
                data={co2Data}
                insights={insightsByTab.co2}
              />
            </>
          ) : (
            <EmptyState icon={Factory} label="No CO₂ data available" />
          )}
        </TabsContent>

        <TabsContent value="ndvi" className="mt-8 space-y-12 focus-visible:outline-none">
          {loading.ndvi && !ndviData ? (
            <ChartSkeleton />
          ) : error.ndvi ? (
            <ErrorState message={error.ndvi} />
          ) : ndviData ? (
            <>
              <NDVIChart
                data={ndviData.data}
                countryName={selectedCountry.name}
                source={ndviData.source}
                note={ndviData.note}
              />
              <AIInsightsPanel
                countryName={selectedCountry.name}
                countryCode={selectedCountry.code}
                dataType="ndvi"
                data={ndviData.data}
                onInsightsGenerated={captureInsight("ndvi")}
              />
              <ExportButtons
                countryName={selectedCountry.name}
                countryCode={selectedCountry.code}
                dataType="ndvi"
                data={ndviData.data}
                insights={insightsByTab.ndvi}
              />
            </>
          ) : (
            <EmptyState icon={Leaf} label="No NDVI data available" />
          )}
        </TabsContent>
      </Tabs>
    </section>
  )
}

function EmptyState({ icon: Icon, label }: { icon: typeof Thermometer; label: string }) {
  return (
    <div className="bg-surface-container-low px-8 py-16 text-center text-sm text-muted-foreground">
      <Icon className="mx-auto mb-4 size-6 opacity-50" />
      {label}
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-error-container/30 p-6 text-sm text-destructive">
      <p className="label-tech-sm" style={{ color: "currentColor", opacity: 0.7 }}>
        Fetch error
      </p>
      <p className="mt-1">{message}</p>
    </div>
  )
}
