import Link from "next/link"
import { RiskBadge } from "./risk-badge"
import type { FacilityRow } from "@/lib/pilot/data"

export function FacilityTable({ rows, showLga = true }: { rows: FacilityRow[]; showLga?: boolean }) {
  if (!rows.length) {
    return <p className="px-4 py-8 text-center text-sm text-muted-foreground">No facilities to show.</p>
  }
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-outline-variant/30 text-left">
            <th className="label-tech-sm px-4 py-3 font-normal">Facility</th>
            {showLga ? <th className="label-tech-sm px-4 py-3 font-normal">LGA</th> : null}
            <th className="label-tech-sm px-4 py-3 font-normal">Risk</th>
            <th className="label-tech-sm px-4 py-3 font-normal">Top driver</th>
            <th className="label-tech-sm px-4 py-3 text-right font-normal">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className="border-b border-outline-variant/15 transition-colors last:border-0 hover:bg-surface-container/50"
            >
              <td className="px-4 py-3">
                <Link href={`/pilot/facility/${r.id}`} className="font-medium text-primary hover:underline">
                  {r.name}
                </Link>
              </td>
              {showLga ? <td className="px-4 py-3 text-muted-foreground">{r.lgaName}</td> : null}
              <td className="px-4 py-3"><RiskBadge band={r.band} score={r.score} /></td>
              <td className="px-4 py-3 text-muted-foreground">{r.topDriver}</td>
              <td className="px-4 py-3 text-right font-numeric text-xs uppercase tracking-wide text-muted-foreground">
                {r.confidence}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
