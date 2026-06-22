import { type NextRequest, NextResponse } from "next/server"
import { listFacilityRows } from "@/lib/pilot/data"
import type { Band } from "@/lib/pilot/types"

const BANDS: Band[] = ["low", "moderate", "high", "severe"]

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const lga = params.get("lga") ?? undefined
  const bandParam = params.get("band")
  const band = bandParam && BANDS.includes(bandParam as Band) ? (bandParam as Band) : undefined

  const rows = listFacilityRows({ lga, band })
  return NextResponse.json(
    { state: "Yobe", count: rows.length, facilities: rows },
    { headers: { "Cache-Control": "public, max-age=300, s-maxage=900" } },
  )
}
