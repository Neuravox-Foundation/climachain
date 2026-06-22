import type { Contribution } from "@/lib/pilot/types"

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-foreground">{label}</span>
        <span className="font-numeric text-sm font-semibold text-foreground">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  )
}

export function FactorBars({ H, V, L }: { H: number; V: number; L: number }) {
  return (
    <div className="space-y-4">
      <Bar label="Hazard exposure (H)" value={H} />
      <Bar label="Facility vulnerability (V)" value={V} />
      <Bar label="Immunization stakes (L)" value={L} />
    </div>
  )
}

export function TopDrivers({ contributions }: { contributions: Contribution[] }) {
  const top = contributions.slice(0, 3)
  return (
    <ol className="space-y-3">
      {top.map((c, i) => (
        <li key={i} className="flex items-center justify-between gap-3 text-sm">
          <span className="flex items-center gap-2.5">
            <span className="label-tech-sm flex size-5 items-center justify-center rounded bg-surface-container-highest text-foreground">
              {c.component}
            </span>
            <span className="text-foreground">{c.label}</span>
          </span>
          <span className="font-numeric text-muted-foreground">+{c.points}</span>
        </li>
      ))}
    </ol>
  )
}
