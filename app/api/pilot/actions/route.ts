import { type NextRequest, NextResponse } from "next/server"
import { getAction, setAction, ACTION_STATUSES } from "@/lib/pilot/actions"
import { icriForFacility, listFacilityRows } from "@/lib/pilot/data"
import { getFacility } from "@/lib/pilot/facilities.seed"
import type { ActionRecord, ActionStatus } from "@/lib/pilot/types"

// GET /api/pilot/actions?status=pending — the action queue (high/severe first).
export async function GET(request: NextRequest) {
  const statusFilter = request.nextUrl.searchParams.get("status") as ActionStatus | null
  const rows = listFacilityRows().filter((r) => r.band === "high" || r.band === "severe")
  const queue = await Promise.all(
    rows.map(async (r) => {
      const icri = icriForFacility(r.id)!
      const action = await getAction(r.id, icri.band)
      return { facility: { id: r.id, name: r.name, lgaName: r.lgaName }, score: r.score, band: r.band, topDriver: r.topDriver, action }
    }),
  )
  const filtered = statusFilter ? queue.filter((q) => q.action.status === statusFilter) : queue
  return NextResponse.json({ count: filtered.length, queue: filtered }, { headers: { "Cache-Control": "no-store" } })
}

// POST /api/pilot/actions — upsert one action record (KV write).
export async function POST(request: NextRequest) {
  let body: Partial<ActionRecord>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  if (!body.facilityId || !getFacility(body.facilityId)) {
    return NextResponse.json({ error: "Valid facilityId is required" }, { status: 400 })
  }
  if (body.status && !ACTION_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: `status must be one of ${ACTION_STATUSES.join(", ")}` }, { status: 400 })
  }
  const icri = icriForFacility(body.facilityId)
  const current = await getAction(body.facilityId, icri?.band ?? "low")
  const next = await setAction({
    facilityId: body.facilityId,
    category: body.category ?? current.category,
    status: body.status ?? current.status,
    assignedRole: body.assignedRole ?? current.assignedRole,
    lastReviewed: current.lastReviewed,
    notes: body.notes ?? current.notes,
  })
  return NextResponse.json(next, { headers: { "Cache-Control": "no-store" } })
}
