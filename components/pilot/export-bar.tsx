"use client"

import { Button } from "@/components/ui/button"
import { Download, FileText, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import type { FacilityRow } from "@/lib/pilot/data"

export function ExportBar({ rows, lga }: { rows: FacilityRow[]; lga?: string }) {
  const csvHref = `/api/pilot/export?type=csv${lga ? `&lga=${lga}` : ""}`

  async function copySms() {
    try {
      const url = `/api/pilot/export?type=summary${lga ? `&lga=${lga}` : ""}`
      const text = await fetch(url).then((r) => r.text())
      await navigator.clipboard.writeText(text)
      toast.success("Weekly summary copied (SMS-ready)")
    } catch {
      toast.error("Could not copy summary")
    }
  }

  async function downloadPdf() {
    try {
      const [{ default: jsPDF }, autoTableMod] = await Promise.all([import("jspdf"), import("jspdf-autotable")])
      const autoTable = (autoTableMod as any).default ?? (autoTableMod as any)
      const doc = new jsPDF({ unit: "pt", format: "a4" })
      doc.setFont("helvetica", "bold"); doc.setFontSize(16)
      doc.text("Yobe Immunization Continuity — Weekly Watch", 40, 50)
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(110)
      doc.text(`Generated ${new Date().toLocaleString()} · UNICEF pilot`, 40, 68)
      autoTable(doc, {
        startY: 86,
        head: [["Facility", "LGA", "Score", "Band", "Top driver"]],
        body: rows.map((r) => [r.name, r.lgaName, String(r.score), r.band, r.topDriver]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [0, 35, 111] },
      })
      doc.save("yobe_pilot_weekly_brief.pdf")
    } catch {
      toast.error("Could not generate PDF")
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm" variant="outline">
        <a href={csvHref}><Download className="mr-1.5 h-4 w-4" /> CSV</a>
      </Button>
      <Button size="sm" variant="outline" onClick={downloadPdf}>
        <FileText className="mr-1.5 h-4 w-4" /> PDF
      </Button>
      <Button size="sm" variant="outline" onClick={copySms}>
        <MessageSquare className="mr-1.5 h-4 w-4" /> Copy SMS text
      </Button>
    </div>
  )
}
