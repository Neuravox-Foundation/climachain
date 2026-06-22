import Link from "next/link"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { RiskBadge } from "./risk-badge"
import type { FacilityRow } from "@/lib/pilot/data"

export function FacilityTable({ rows, showLga = true }: { rows: FacilityRow[]; showLga?: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Facility</TableHead>
          {showLga ? <TableHead>LGA</TableHead> : null}
          <TableHead>Risk</TableHead>
          <TableHead>Top driver</TableHead>
          <TableHead className="text-right">Confidence</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell>
              <Link href={`/pilot/facility/${r.id}`} className="font-medium text-[#0058be] hover:underline">
                {r.name}
              </Link>
            </TableCell>
            {showLga ? <TableCell className="text-muted-foreground">{r.lgaName}</TableCell> : null}
            <TableCell><RiskBadge band={r.band} score={r.score} /></TableCell>
            <TableCell className="text-sm text-muted-foreground">{r.topDriver}</TableCell>
            <TableCell className="text-right text-xs text-muted-foreground">{r.confidence}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
