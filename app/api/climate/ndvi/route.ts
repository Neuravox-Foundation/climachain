import { type NextRequest, NextResponse } from "next/server"
import { getNDVISeries } from "@/lib/climate-api"
import { COUNTRY_BBOX, getCountryByCode } from "@/lib/countries"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const country = params.get("country")?.toUpperCase()

  if (!country) {
    return NextResponse.json({ error: "Country code is required" }, { status: 400 })
  }
  if (!getCountryByCode(country)) {
    return NextResponse.json({ error: `Unsupported country code: ${country}` }, { status: 400 })
  }

  try {
    const result = getNDVISeries(country)
    const bounds = COUNTRY_BBOX[country]
    return NextResponse.json(
      { ...result, bounds: bounds ?? null },
      { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch NDVI data" },
      { status: 502 },
    )
  }
}
