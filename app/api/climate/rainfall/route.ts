import { type NextRequest, NextResponse } from "next/server"
import { getRainfallSeries } from "@/lib/climate-api"
import { getCountryByCode } from "@/lib/countries"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const country = params.get("country")?.toUpperCase()
  const type = params.get("type") === "projection" ? "projection" : "historical"

  if (!country) {
    return NextResponse.json({ error: "Country code is required" }, { status: 400 })
  }
  if (!getCountryByCode(country)) {
    return NextResponse.json({ error: `Unsupported country code: ${country}` }, { status: 400 })
  }

  try {
    const result = await getRainfallSeries(country, type)
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch rainfall data" },
      { status: 502 },
    )
  }
}
