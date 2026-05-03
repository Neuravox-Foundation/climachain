"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

const TABS: Array<{ id: TabId; label: string; icon: typeof Thermometer; tone: string }> = [
  { id: "temperature", label: "Temperature", icon: Thermometer, tone: "text-chart-1" },
  { id: "rainfall", label: "Precipitation", icon: CloudRain, tone: "text-chart-2" },
  { id: "co2", label: "CO₂ Emissions", icon: Factory, tone: "text-chart-4" },
  { id: "ndvi", label: "Vegetation", icon: Leaf, tone: "text-chart-3" },
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
    <Card className="surface-1">
      <CardHeader className="space-y-3 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2.5 text-base font-medium">
            Climate signals
            <Badge variant="outline" className="rounded-md border-border/70 px-2 py-0.5 font-mono text-[10px]">
              {selectedCountry.code}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)} className="w-full">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-lg bg-muted/40 p-1">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm sm:flex-none"
                >
                  <Icon className={`size-3.5 ${tab.tone}`} />
                  <span>{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="temperature" className="mt-6 space-y-6 focus-visible:outline-none">
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

          <TabsContent value="rainfall" className="mt-6 space-y-6 focus-visible:outline-none">
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

          <TabsContent value="co2" className="mt-6 space-y-6 focus-visible:outline-none">
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

          <TabsContent value="ndvi" className="mt-6 space-y-6 focus-visible:outline-none">
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
      </CardContent>
    </Card>
  )
}

function EmptyState({ icon: Icon, label }: { icon: typeof Thermometer; label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
      <Icon className="mx-auto mb-3 size-6 opacity-50" />
      {label}
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
      {message}
    </div>
  )
}
