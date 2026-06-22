import { Progress } from "@/components/ui/progress"
import type { Contribution } from "@/lib/pilot/types"

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{value}</span>
      </div>
      <Progress value={value} />
    </div>
  )
}

export function FactorBars({ H, V, L }: { H: number; V: number; L: number }) {
  return (
    <div className="space-y-3">
      <Bar label="Hazard exposure (H)" value={H} />
      <Bar label="Facility vulnerability (V)" value={V} />
      <Bar label="Immunization stakes (L)" value={L} />
    </div>
  )
}

export function TopDrivers({ contributions }: { contributions: Contribution[] }) {
  const top = contributions.slice(0, 3)
  return (
    <ul className="space-y-1.5">
      {top.map((c, i) => (
        <li key={i} className="flex items-center justify-between text-sm">
          <span>
            <span className="mr-2 inline-block w-5 rounded bg-muted text-center font-mono text-xs">{c.component}</span>
            {c.label}
          </span>
          <span className="font-mono text-muted-foreground">+{c.points}</span>
        </li>
      ))}
    </ul>
  )
}
