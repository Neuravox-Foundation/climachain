import type { ActionStatus } from "@/lib/pilot/types"

const MAP: Record<ActionStatus, { label: string; cls: string }> = {
  pending: { label: "Needs review", cls: "bg-amber-50 text-amber-800 ring-amber-600/25" },
  reviewed: { label: "Reviewed", cls: "bg-secondary/10 text-on-secondary-container ring-secondary/25" },
  action_planned: { label: "Action planned", cls: "bg-secondary/15 text-on-secondary-container ring-secondary/30" },
  action_completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-800 ring-emerald-600/25" },
}

export function StatusBadge({ status }: { status: ActionStatus }) {
  const m = MAP[status]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${m.cls}`}
    >
      {m.label}
    </span>
  )
}
