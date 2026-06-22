import { type NextRequest, NextResponse } from "next/server"
import { listFacilityRows, briefForFacility, briefForLga } from "@/lib/pilot/data"
import type { Band } from "@/lib/pilot/types"
import { rowsToCsv, briefToSms, weeklySummaryText } from "@/lib/pilot/export"

// GET /api/pilot/export?type=csv|sms|summary&lga=&band=&scope=&id=&code=
// PDF is generated client-side via jspdf (see components/pilot export bar).
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams
  const type = p.get("type") ?? "csv"
  const lga = p.get("lga") ?? undefined
  const band = (p.get("band") as Band | null) ?? undefined

  if (type === "csv") {
    const csv = rowsToCsv(listFacilityRows({ lga, band }))
    return new NextResponse(csv, {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="yobe_pilot_risk.csv"' },
    })
  }

  if (type === "summary") {
    return new NextResponse(weeklySummaryText(listFacilityRows({ lga })), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }

  if (type === "sms") {
    const scope = p.get("scope")
    const brief = scope === "lga" ? briefForLga(p.get("code") ?? "") : briefForFacility(p.get("id") ?? "")
    if (!brief) return NextResponse.json({ error: "brief not found" }, { status: 404 })
    return new NextResponse(briefToSms(brief), { headers: { "Content-Type": "text/plain; charset=utf-8" } })
  }

  return NextResponse.json({ error: "type must be csv, sms or summary" }, { status: 400 })
}
