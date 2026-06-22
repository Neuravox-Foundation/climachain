"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { StatusBadge } from "./status-badge"
import type { ActionRecord, ActionStatus } from "@/lib/pilot/types"

const STATUSES: { value: ActionStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "reviewed", label: "Reviewed" },
  { value: "action_planned", label: "Action planned" },
  { value: "action_completed", label: "Action completed" },
]

export function ActionPanel({ initial }: { initial: ActionRecord }) {
  const [status, setStatus] = useState<ActionStatus>(initial.status)
  const [notes, setNotes] = useState(initial.notes)
  const [assignedRole, setAssignedRole] = useState(initial.assignedRole)
  const [saving, setSaving] = useState(false)
  const [lastReviewed, setLastReviewed] = useState(initial.lastReviewed)

  async function save() {
    setSaving(true)
    try {
      const res = await fetch("/api/pilot/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facilityId: initial.facilityId, status, notes, assignedRole, category: initial.category }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const next = (await res.json()) as ActionRecord
      setLastReviewed(next.lastReviewed)
      toast.success("Action updated")
    } catch (e) {
      toast.error("Could not save action")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="label-tech-sm">Action status</span>
        <StatusBadge status={status} />
      </div>
      <div className="text-sm">
        <span className="text-muted-foreground">Recommended: </span>
        {initial.category}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="label-tech-sm">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ActionStatus)}
            className="focus-ring w-full rounded-md border border-input bg-surface-container-lowest px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="label-tech-sm">Assigned role</span>
          <input
            value={assignedRole}
            onChange={(e) => setAssignedRole(e.target.value)}
            className="focus-ring w-full rounded-md border border-input bg-surface-container-lowest px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="space-y-1.5">
        <span className="label-tech-sm">Notes</span>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Field notes, decisions taken…"
          className="bg-surface-container-lowest"
        />
      </label>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {lastReviewed ? `Last reviewed ${new Date(lastReviewed).toLocaleString()}` : "Not yet reviewed"}
        </span>
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  )
}
