import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { ActionRecord, ActionStatus, Band } from "./types"
import { defaultActionFor } from "./icri"

// Action workflow store. Cloudflare KV in production (PILOT_KV binding), with an
// in-memory fallback for local dev / demo so the slice runs without a binding.

const memory = new Map<string, ActionRecord>()
const KEY = (facilityId: string) => `pilot:action:${facilityId}`

export const ACTION_STATUSES: ActionStatus[] = ["pending", "reviewed", "action_planned", "action_completed"]

function kv(): KVNamespace | undefined {
  try {
    const env = getCloudflareContext().env as unknown as Record<string, unknown>
    return (env.PILOT_KV ?? env.NDVI_KV) as KVNamespace | undefined
  } catch {
    return undefined
  }
}

function defaultRecord(facilityId: string, band: Band): ActionRecord {
  return {
    facilityId,
    category: defaultActionFor(band),
    status: "pending",
    assignedRole: band === "severe" || band === "high" ? "LGA cold chain officer" : "Facility in charge",
    lastReviewed: "",
    notes: "",
  }
}

export async function getAction(facilityId: string, band: Band): Promise<ActionRecord> {
  const store = kv()
  if (store) {
    try {
      const hit = await store.get<ActionRecord>(KEY(facilityId), "json")
      if (hit) return hit
    } catch (e) {
      console.error("PILOT_KV read failed:", e)
    }
  } else if (memory.has(facilityId)) {
    return memory.get(facilityId)!
  }
  return defaultRecord(facilityId, band)
}

export async function setAction(record: ActionRecord): Promise<ActionRecord> {
  const next: ActionRecord = { ...record, lastReviewed: new Date().toISOString() }
  const store = kv()
  if (store) {
    try {
      await store.put(KEY(record.facilityId), JSON.stringify(next))
    } catch (e) {
      console.error("PILOT_KV write failed:", e)
    }
  } else {
    memory.set(record.facilityId, next)
  }
  return next
}
