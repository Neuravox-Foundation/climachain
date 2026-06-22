import { NextResponse } from "next/server"
import { getLgaModel, briefForLga } from "@/lib/pilot/data"

export async function GET(_request: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params
  const model = getLgaModel(code)
  if (!model) {
    return NextResponse.json({ error: `Unknown LGA: ${code}` }, { status: 404 })
  }
  return NextResponse.json(
    { ...model, brief: briefForLga(code) },
    { headers: { "Cache-Control": "public, max-age=300, s-maxage=900" } },
  )
}
