import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

type DataType = "temperature" | "rainfall" | "co2" | "ndvi"

interface InsightRequestBody {
  countryName: string
  countryCode: string
  dataType: DataType
  data: unknown
  analysis?: unknown
}

const FALLBACK_BY_TYPE: Record<DataType, string> = {
  temperature:
    "Temperature trends suggest a continued warming trajectory consistent with regional climate normals. Monitor heatwave frequency, irrigation demand and labour-productivity exposure during peak months. Cooling-centre planning, climate-resilient crop varieties and targeted public-health surveillance are recommended adaptation levers.",
  rainfall:
    "Precipitation variability is the dominant near-term risk. Anchor planning to multi-year rolling averages rather than annual values, and prioritise water-storage capacity, flood-conveyance infrastructure and rain-fed agriculture diversification. Where rainfall trends are negative, accelerate drought-contingency plans.",
  co2: "Emissions trajectories should be benchmarked against per-capita and per-GDP intensity, not just absolute volume. Decoupling growth from emissions typically begins in the power sector — distributed renewables, grid storage and clean-cooking transitions are the highest-leverage interventions for the region.",
  ndvi: "Vegetation greenness reflects the combined signal of rainfall, land use and management. Persistent declines in NDVI outside the dry season usually indicate degradation rather than seasonality — combine with land-cover maps to localise hotspots and design targeted restoration or agroforestry programmes.",
}

export async function POST(request: NextRequest) {
  let body: InsightRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { countryName, countryCode, dataType, data, analysis } = body
  if (!countryName || !countryCode || !dataType) {
    return NextResponse.json({ error: "countryName, countryCode and dataType are required" }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      insight: FALLBACK_BY_TYPE[dataType] ?? FALLBACK_BY_TYPE.temperature,
      dataType,
      country: countryName,
      generatedAt: new Date().toISOString(),
      attribution: "Heuristic baseline (set OPENAI_API_KEY for live AI analysis)",
      model: "fallback",
    })
  }

  try {
    const openai = createOpenAI({ apiKey })
    const prompt = buildPrompt(countryName, countryCode, dataType, data, analysis)
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system:
        "You are a climate-policy analyst writing for African ministries, multilateral lenders and development banks. Be concrete, quantitative and actionable. Avoid generic platitudes. Output 110-160 words.",
      prompt,
      temperature: 0.3,
    })
    return NextResponse.json({
      insight: text.trim(),
      dataType,
      country: countryName,
      generatedAt: new Date().toISOString(),
      attribution: "Generated with OpenAI gpt-4o-mini",
      model: "gpt-4o-mini",
    })
  } catch (error) {
    return NextResponse.json({
      insight: FALLBACK_BY_TYPE[dataType] ?? FALLBACK_BY_TYPE.temperature,
      dataType,
      country: countryName,
      generatedAt: new Date().toISOString(),
      attribution: "Heuristic baseline (AI generation failed)",
      model: "fallback",
      note: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

function buildPrompt(
  countryName: string,
  countryCode: string,
  dataType: DataType,
  data: any,
  analysis: any,
): string {
  switch (dataType) {
    case "temperature": {
      const avg = analysis?.averageTemperature
      const change = analysis?.temperatureChange
      const trend = analysis?.trend
      const decadal = analysis?.changePerDecade
      return `Country: ${countryName} (${countryCode}). Temperature: avg ${avg}°C, total change ${change}°C, trend ${trend}, ${decadal}°C/decade.

Cover: (1) what the trend means physically for this region, (2) sector exposures (agriculture, water, energy, health, labour), (3) two concrete adaptation priorities with rough cost-of-inaction signal.`
    }
    case "rainfall": {
      const series: any[] = data?.historical?.data ?? []
      const avg = series.length ? series.reduce((s, d) => s + d.rainfall, 0) / series.length : 0
      const startYear = data?.historical?.startYear
      const endYear = data?.historical?.endYear
      return `Country: ${countryName} (${countryCode}). Annual precipitation avg ${Math.round(avg)} mm over ${startYear}–${endYear}.

Cover: (1) wet/dry-season implications, (2) flood and drought risk, (3) water-security and food-security knock-ons, (4) two adaptation priorities (e.g. storage, drainage, drought-tolerant crops).`
    }
    case "co2": {
      const series: any[] = data?.data ?? []
      const latest = series[series.length - 1]?.co2 ?? 0
      const earliest = series[0]?.co2 ?? 0
      return `Country: ${countryName} (${countryCode}). CO₂ emissions: ${Math.round(earliest)} kt → ${Math.round(latest)} kt over the recorded period (source: ${data?.source ?? "World Bank"}).

Cover: (1) trajectory and primary drivers, (2) per-capita context for the region, (3) two highest-leverage mitigation levers (power sector, transport, AFOLU as relevant), (4) NDC-alignment signal.`
    }
    case "ndvi": {
      const series: any[] = Array.isArray(data) ? data : data?.data ?? []
      const avg = series.length ? series.reduce((s, d) => s + d.ndvi, 0) / series.length : 0
      return `Country: ${countryName} (${countryCode}). NDVI three-year mean ≈ ${avg.toFixed(3)}.

Cover: (1) vegetation health signal, (2) seasonality vs. degradation interpretation, (3) implications for pastoralists, smallholder agriculture and biodiversity, (4) two nature-based interventions.`
    }
    default:
      return `Provide a concise climate analysis for ${countryName}.`
  }
}
