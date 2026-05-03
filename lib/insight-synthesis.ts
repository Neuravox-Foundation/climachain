/**
 * Deterministic, data-grounded climate brief synthesis. Used as a substitute
 * for an LLM call when no OPENAI_API_KEY is configured, so the panel always
 * shows real numbers and country-specific commentary instead of placeholder
 * boilerplate.
 *
 * Each generator pulls actual values out of the request payload (the same
 * shape that ai-insights-panel.tsx sends) and assembles a 4–5 sentence brief
 * structured like a policy memo: signal, magnitude, sectoral exposure,
 * recommended action.
 */

import { getClimateBaseline, type Country } from "./countries"

export type DataType = "temperature" | "rainfall" | "co2" | "ndvi"

interface SynthesisInput {
  countryName: string
  countryCode: string
  region?: Country["region"]
  data: any
  analysis?: any
}

export function synthesiseInsight(dataType: DataType, input: SynthesisInput): string {
  switch (dataType) {
    case "temperature":
      return temperatureBrief(input)
    case "rainfall":
      return rainfallBrief(input)
    case "co2":
      return co2Brief(input)
    case "ndvi":
      return ndviBrief(input)
    default:
      return `Data analysis is not configured for ${dataType}.`
  }
}

/* -------------------------------------------------------------------------- */

function temperatureBrief({ countryName, countryCode, data, analysis }: SynthesisInput): string {
  const baseline = getClimateBaseline(countryCode)
  const a = analysis ?? data?.analysis
  const histSeries: any[] = data?.historical?.data ?? []
  const projSeries: any[] = data?.projection?.data ?? []

  if (!a || histSeries.length === 0) {
    return `Temperature data for ${countryName} is unavailable. The expected long-term mean for the country is approximately ${baseline.meanTempC.toFixed(1)}°C with a regional warming pace of ${baseline.warmingPerDecadeC.toFixed(2)}°C per decade. Re-run once the World Bank series resolves.`
  }

  const startYear = histSeries[0]?.year
  const endYear = histSeries[histSeries.length - 1]?.year
  const projAvg = projSeries.length
    ? projSeries.reduce((s, d) => s + d.temperature, 0) / projSeries.length
    : null

  const trendVerb =
    a.trend === "warming" ? "warming" : a.trend === "cooling" ? "cooling" : "broadly stable"
  const decadalSign = a.changePerDecade > 0 ? "+" : ""
  const totalSign = a.temperatureChange > 0 ? "+" : ""

  const versusBaseline = a.averageTemperature - baseline.meanTempC
  const baselineLine =
    Math.abs(versusBaseline) > 0.3
      ? `That is ${Math.abs(versusBaseline).toFixed(1)}°C ${versusBaseline > 0 ? "above" : "below"} the 1991–2020 climatological normal.`
      : `That tracks the 1991–2020 climatological normal closely.`

  const projLine =
    projAvg != null
      ? `Projection mean through ${projSeries[projSeries.length - 1]?.year} sits at ${projAvg.toFixed(1)}°C, implying an additional ${(projAvg - a.averageTemperature).toFixed(1)}°C above the historical mean.`
      : ""

  const exposureLine = exposureForTemperature(a, baseline.meanTempC)
  const recommendationLine = recommendationForTemperature(a)

  return [
    `${countryName} (${countryCode}) records a ${trendVerb} signal across ${startYear}–${endYear}, with a mean of ${a.averageTemperature.toFixed(1)}°C and a linear trend of ${decadalSign}${a.changePerDecade.toFixed(2)}°C per decade (cumulative ${totalSign}${a.temperatureChange.toFixed(2)}°C over the record).`,
    baselineLine,
    projLine,
    exposureLine,
    recommendationLine,
  ]
    .filter(Boolean)
    .join(" ")
}

function exposureForTemperature(a: any, mean: number): string {
  if (a.trend === "warming") {
    if (mean > 26) {
      return "Sector exposures concentrate in outdoor labour productivity, irrigation demand, livestock heat stress and rising peak-demand for cooling — particularly in informal urban settlements with limited shade and ventilation."
    }
    return "Exposures cluster around agricultural growing-degree-day shifts, water-stress in highland catchments and altered disease-vector ranges as winters shorten."
  }
  if (a.trend === "cooling") {
    return "Although unusual, the cooling signal warrants a closer look at off-season frost risk for tree crops and possible attribution to land-use change rather than large-scale climate forcing."
  }
  return "Stability hides interannual variability — the planning risk is heatwave clustering rather than a steady mean shift."
}

function recommendationForTemperature(a: any): string {
  if (a.trend === "warming" && Math.abs(a.changePerDecade) > 0.4) {
    return "Recommended priorities: (1) integrate +1.5–2°C stress tests into all multi-decade infrastructure procurement and (2) operationalise district-level heat-action plans with cooling-centre triggers."
  }
  if (a.trend === "warming") {
    return "Recommended priorities: (1) tighten thermal-comfort standards in public buildings and (2) climate-proof key irrigation schemes for higher evapotranspiration."
  }
  return "Recommended priorities: (1) maintain a cross-sector climate-monitoring dashboard and (2) re-evaluate planting calendars on a five-year cycle."
}

/* -------------------------------------------------------------------------- */

function rainfallBrief({ countryName, countryCode, data }: SynthesisInput): string {
  const baseline = getClimateBaseline(countryCode)
  const histSeries: any[] = data?.historical?.data ?? []
  const projSeries: any[] = data?.projection?.data ?? []

  if (histSeries.length === 0) {
    return `Precipitation data for ${countryName} is unavailable. The country's long-term mean is approximately ${Math.round(baseline.meanPrecipMm)} mm/year with a regional trend of ${baseline.precipTrendMmPerDecade > 0 ? "+" : ""}${baseline.precipTrendMmPerDecade.toFixed(0)} mm/decade.`
  }

  const histAvg = histSeries.reduce((s, d) => s + d.rainfall, 0) / histSeries.length
  const projAvg = projSeries.length ? projSeries.reduce((s, d) => s + d.rainfall, 0) / projSeries.length : null
  const startYear = histSeries[0]?.year
  const endYear = histSeries[histSeries.length - 1]?.year

  const recent = histSeries.slice(-10)
  const recentAvg = recent.reduce((s, d) => s + d.rainfall, 0) / recent.length
  const recentDelta = recentAvg - histAvg
  const recentPct = histAvg > 0 ? (recentDelta / histAvg) * 100 : 0

  const projDelta = projAvg != null ? projAvg - histAvg : null
  const projPct = projDelta != null && histAvg > 0 ? (projDelta / histAvg) * 100 : null

  const climateBand = climateBandFor(histAvg)
  const projLine =
    projDelta != null && projPct != null
      ? `Projection mean ${projDelta > 0 ? "rises to" : "falls to"} ${Math.round(projAvg!)} mm/year (${projPct > 0 ? "+" : ""}${projPct.toFixed(1)}% versus baseline).`
      : ""

  const exposure = exposureForRainfall(histAvg, projDelta)
  const recommendation = recommendationForRainfall(histAvg, projDelta)

  return [
    `${countryName} (${countryCode}) averages ${Math.round(histAvg)} mm of annual precipitation across ${startYear}–${endYear}, placing it in the ${climateBand} band.`,
    `The most recent decade averages ${Math.round(recentAvg)} mm — a ${recentDelta > 0 ? "+" : ""}${recentDelta.toFixed(0)} mm shift (${recentPct > 0 ? "+" : ""}${recentPct.toFixed(1)}%) versus the long-run mean.`,
    projLine,
    exposure,
    recommendation,
  ]
    .filter(Boolean)
    .join(" ")
}

function climateBandFor(mm: number): string {
  if (mm < 250) return "arid"
  if (mm < 600) return "semi-arid"
  if (mm < 1000) return "sub-humid"
  if (mm < 1800) return "humid"
  return "very humid"
}

function exposureForRainfall(histAvg: number, projDelta: number | null): string {
  if (histAvg < 600) {
    return "Water security is the binding constraint: rain-fed agriculture is marginal, livestock watering points are a recurring conflict trigger and reservoir reliability degrades quickly when consecutive dry years coincide."
  }
  if (histAvg > 1500) {
    return "Flood exposure dominates: peak-runoff loads stress urban drainage, road-network resilience drops sharply in the wet season and landslide risk concentrates in deforested watersheds."
  }
  if (projDelta != null && projDelta < -50) {
    return "The drying signal exposes rain-fed agriculture, hydropower output and small-town water supplies — sectors with limited substitution options at short notice."
  }
  return "Variability — rather than the mean — is the critical exposure: clustered dry years and intense rain spells challenge planning anchored to long-term averages."
}

function recommendationForRainfall(histAvg: number, projDelta: number | null): string {
  if (projDelta != null && projDelta < 0) {
    return "Recommended priorities: (1) accelerate water-storage build-out (multi-purpose reservoirs and managed aquifer recharge) and (2) shift agricultural advisories toward drought-tolerant cultivars and supplemental irrigation."
  }
  if (projDelta != null && projDelta > 50) {
    return "Recommended priorities: (1) upgrade urban drainage and floodplain zoning and (2) revise hydraulic-design return periods for transport infrastructure."
  }
  return "Recommended priorities: (1) anchor planning to multi-year rolling averages and (2) maintain real-time hydrological monitoring to catch variability early."
}

/* -------------------------------------------------------------------------- */

function co2Brief({ countryName, countryCode, data }: SynthesisInput): string {
  const series: any[] = data?.data ?? []
  if (series.length === 0) {
    return `CO₂ emissions data for ${countryName} is unavailable from the World Bank indicator. Re-run once the API resolves.`
  }

  const startYear = series[0]?.year
  const endYear = series[series.length - 1]?.year
  const startVal = series[0]?.co2
  const endVal = series[series.length - 1]?.co2
  const peak = series.reduce((max, d) => (d.co2 > max.co2 ? d : max), series[0])

  const totalDelta = endVal - startVal
  const totalPct = startVal > 0 ? (totalDelta / startVal) * 100 : 0
  const cagr = startVal > 0 ? (Math.pow(endVal / startVal, 1 / Math.max(1, endYear - startYear)) - 1) * 100 : 0

  const recent = series.slice(-5)
  const earlier = series.slice(0, 5)
  const recentAvg = recent.reduce((s, d) => s + d.co2, 0) / recent.length
  const olderAvg = earlier.reduce((s, d) => s + d.co2, 0) / earlier.length
  const recentDirection = recentAvg > olderAvg ? "rising" : recentAvg < olderAvg ? "declining" : "flat"

  const scaleNote =
    endVal > 100_000
      ? "a regionally significant emitter"
      : endVal > 25_000
        ? "a mid-tier emitter"
        : "a low-volume emitter on a global ledger"

  const exposure =
    totalPct > 100
      ? "The carbon liability is rising fast enough to attract scrutiny under emerging border-adjustment regimes and to weigh on sovereign-credit narratives if mitigation policy lags."
      : totalPct > 0
        ? "Decoupling growth from emissions is the central question — without policy intervention the trajectory continues into trade-policy and climate-finance friction."
        : "Continued mitigation is feasible if the recent decline is policy-driven; if it reflects economic stagnation the rebound risk is high."

  const recommendation =
    endVal > 50_000
      ? "Recommended priorities: (1) accelerate grid decarbonisation through firm renewables and storage and (2) tighten the NDC ambition cycle ahead of the next stocktake."
      : "Recommended priorities: (1) lock in clean-energy access programmes that avoid future emissions lock-in and (2) build measurement, reporting and verification capacity for carbon-market participation."

  return [
    `${countryName} (${countryCode}) is ${scaleNote}: emissions moved from ${formatKt(startVal)} kt in ${startYear} to ${formatKt(endVal)} kt in ${endYear} — a ${totalDelta > 0 ? "rise" : "decline"} of ${formatKt(Math.abs(totalDelta))} kt (${totalPct > 0 ? "+" : ""}${totalPct.toFixed(0)}%, CAGR ${cagr > 0 ? "+" : ""}${cagr.toFixed(1)}%).`,
    `Peak emissions of ${formatKt(peak.co2)} kt were recorded in ${peak.year}; the most recent five years are ${recentDirection} relative to the earliest five-year baseline.`,
    exposure,
    recommendation,
  ].join(" ")
}

/* -------------------------------------------------------------------------- */

function ndviBrief({ countryName, countryCode, data }: SynthesisInput): string {
  const baseline = getClimateBaseline(countryCode)
  const series: any[] = Array.isArray(data) ? data : data?.data ?? []
  if (series.length === 0) {
    return `Vegetation index data for ${countryName} is unavailable. The country's expected NDVI baseline is ${baseline.ndviBase.toFixed(2)} with seasonal amplitude ${baseline.ndviAmplitude.toFixed(2)}.`
  }

  const valid = series.filter((d) => Number.isFinite(d.ndvi))
  const overallMean = valid.reduce((s, d) => s + d.ndvi, 0) / valid.length
  const max = Math.max(...valid.map((d) => d.ndvi))
  const min = Math.min(...valid.map((d) => d.ndvi))
  const amplitude = max - min

  const years = Array.from(new Set(valid.map((d) => d.year))).sort((a, b) => a - b)
  const currentYear = years[years.length - 1]
  const prevYear = years.length >= 2 ? years[years.length - 2] : null
  const cur = valid.filter((d) => d.year === currentYear)
  const prev = prevYear != null ? valid.filter((d) => d.year === prevYear) : []
  const curMean = cur.length ? cur.reduce((s, d) => s + d.ndvi, 0) / cur.length : 0
  const prevMean = prev.length ? prev.reduce((s, d) => s + d.ndvi, 0) / prev.length : 0
  const yoyDelta = prev.length > 0 && prevMean > 0 ? ((curMean - prevMean) / prevMean) * 100 : null

  const wetMonth = valid.reduce((m, d) => (d.ndvi > m.ndvi ? d : m), valid[0])
  const dryMonth = valid.reduce((m, d) => (d.ndvi < m.ndvi ? d : m), valid[0])

  const healthBand =
    overallMean > 0.6
      ? "dense, productive vegetation cover"
      : overallMean > 0.4
        ? "healthy, productive vegetation cover"
        : overallMean > 0.25
          ? "moderate vegetation, dominated by mixed cropping and savanna"
          : overallMean > 0.15
            ? "sparse vegetation typical of arid-zone economies"
            : "near-bare-soil cover with limited vegetative biomass"

  const yoyLine =
    yoyDelta != null
      ? `Year-on-year, mean greenness moved ${yoyDelta > 0 ? "up" : "down"} ${Math.abs(yoyDelta).toFixed(1)}% (${currentYear} vs ${prevYear}).`
      : ""

  const exposure =
    overallMean < 0.25
      ? "Pastoralist livelihoods, dryland-cropping yields and biodiversity are all strained — degradation hotspots typically cluster around expanding settlement edges and over-grazed rangelands."
      : amplitude > 0.4
        ? "Strong seasonality is the signal: the wet-season peak supports significant biological productivity, but the dry-season trough exposes shallow-rooted crops and concentrates wildfire risk."
        : "Vegetation cover is comparatively buffered against seasonal swings, suggesting either rainforest persistence or significant irrigated production."

  const recommendation =
    overallMean < 0.25
      ? "Recommended priorities: (1) target restoration finance to identifiable degradation hotspots using the seasonal NDVI trough and (2) integrate satellite greenness into pastoralist early-warning systems."
      : "Recommended priorities: (1) protect existing vegetation through tenure-secure community forestry and (2) cross-reference NDVI declines with land-cover maps before attributing to climate alone."

  return [
    `${countryName} (${countryCode}) presents ${healthBand}, with a three-year mean NDVI of ${overallMean.toFixed(3)} (range ${min.toFixed(2)}–${max.toFixed(2)}, seasonal amplitude ${amplitude.toFixed(2)}).`,
    `The greenness peak falls in ${wetMonth.month} ${wetMonth.year} (${wetMonth.ndvi.toFixed(3)}) with a trough in ${dryMonth.month} ${dryMonth.year} (${dryMonth.ndvi.toFixed(3)}).`,
    yoyLine,
    exposure,
    recommendation,
  ]
    .filter(Boolean)
    .join(" ")
}

/* -------------------------------------------------------------------------- */

function formatKt(value: number): string {
  if (!Number.isFinite(value)) return "—"
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return `${Math.round(value)}`
}
