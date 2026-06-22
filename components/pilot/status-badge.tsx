import type { ActionStatus } from "@/lib/pilot/types"

const MAP: Record<ActionStatus, { label: string; cls: string }> = {
  pending: { label: "Needs review", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  reviewed: { label: "Reviewed", cls: "bg-sky-100 text-sky-800 border-sky-200" },
  action_planned: { label: "Action planned", cls: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  action_completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" },
}

export function StatusBadge({ status }: { status: ActionStatus }) {
  const m = MAP[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${m.cls}`}>
      {m.label}
    </span>
  )
}
