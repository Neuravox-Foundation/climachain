import { type NextRequest, NextResponse } from "next/server"
import { briefForFacility, briefForLga } from "@/lib/pilot/data"
import { polishBrief } from "@/lib/pilot/brief"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const scope = params.get("scope")
  const polish = params.get("polish") === "1"

  let brief
  if (scope === "facility") {
    const id = params.get("id")
    if (!id) return NextResponse.json({ error: "id is required for scope=facility" }, { status: 400 })
    brief = briefForFacility(id)
  } else if (scope === "lga") {
    const code = params.get("code")
    if (!code) return NextResponse.json({ error: "code is required for scope=lga" }, { status: 400 })
    brief = briefForLga(code)
  } else {
    return NextResponse.json({ error: "scope must be 'facility' or 'lga'" }, { status: 400 })
  }

  if (!brief) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const out = polish ? await polishBrief(brief) : brief
  return NextResponse.json(out, { headers: { "Cache-Control": "public, max-age=120, s-maxage=600" } })
}
