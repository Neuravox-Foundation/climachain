import { NextResponse } from "next/server"
import { getFacilityView, briefForFacility } from "@/lib/pilot/data"

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const view = await getFacilityView(id)
  if (!view) {
    return NextResponse.json({ error: `Unknown facility: ${id}` }, { status: 404 })
  }
  return NextResponse.json(
    { ...view, brief: briefForFacility(id) },
    { headers: { "Cache-Control": "public, max-age=120, s-maxage=600" } },
  )
}
