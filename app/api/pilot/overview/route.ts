import { NextResponse } from "next/server"
import { getOverview } from "@/lib/pilot/data"

export async function GET() {
  return NextResponse.json(getOverview(), {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=900" },
  })
}
