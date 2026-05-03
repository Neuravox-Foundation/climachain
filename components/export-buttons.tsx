"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ExportButtonsProps {
  countryName: string
  countryCode: string
  dataType: "temperature" | "rainfall" | "co2" | "ndvi"
  data: any
  insights?: string
}

export function ExportButtons({ countryName, countryCode, dataType, data, insights }: ExportButtonsProps) {
  const [busy, setBusy] = useState<"pdf" | "xlsx" | null>(null)

  const handlePdf = async () => {
    if (!data) return
    setBusy("pdf")
    try {
      const [{ default: jsPDF }, autoTableMod] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ])
      const autoTable = (autoTableMod as any).default ?? (autoTableMod as any)
      const doc = new jsPDF({ unit: "pt", format: "a4" })

      doc.setFont("helvetica", "bold")
      doc.setFontSize(20)
      doc.text("ClimaChain Climate Intelligence Report", 40, 60)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)
      doc.setTextColor(110)
      doc.text(`${countryName} (${countryCode})  ·  ${labelFor(dataType)}`, 40, 82)
      doc.text(`Generated ${new Date().toLocaleString()}`, 40, 98)

      const summary = computeSummary(dataType, data)
      doc.setTextColor(20)
      doc.setFontSize(13)
      doc.text("Summary", 40, 130)
      doc.setFontSize(11)
      let y = 150
      for (const [key, value] of summary) {
        doc.text(`${key}:`, 40, y)
        doc.setTextColor(80)
        doc.text(String(value), 200, y)
        doc.setTextColor(20)
        y += 18
      }

      const tableData = buildTableRows(dataType, data)
      if (tableData) {
        autoTable(doc, {
          head: [tableData.head],
          body: tableData.rows,
          startY: y + 12,
          theme: "striped",
          headStyles: { fillColor: [40, 95, 80], textColor: 255 },
          styles: { fontSize: 9, cellPadding: 4 },
        })
        y = (doc as any).lastAutoTable?.finalY ?? y + 12
      }

      if (insights) {
        if (y > 700) {
          doc.addPage()
          y = 60
        } else {
          y += 28
        }
        doc.setFontSize(13)
        doc.text("AI policy brief", 40, y)
        doc.setFontSize(11)
        doc.setTextColor(60)
        const lines = doc.splitTextToSize(insights, 515)
        doc.text(lines, 40, y + 18)
      }

      doc.save(`${slug(countryName)}_${dataType}_climachain.pdf`)
      toast.success("PDF report ready")
    } catch (err) {
      toast.error("PDF export failed", { description: err instanceof Error ? err.message : "Unknown error" })
    } finally {
      setBusy(null)
    }
  }

  const handleXlsx = async () => {
    if (!data) return
    setBusy("xlsx")
    try {
      const writeXlsxFile = (await import("write-excel-file")).default

      const rows = buildTableRows(dataType, data)
      const dataSheet = rows
        ? [
            rows.head.map((value) => ({ value, fontWeight: "bold", backgroundColor: "#285F50", color: "#FFFFFF" })),
            ...rows.rows.map((row) => row.map((value) => ({ value }))),
          ]
        : [[{ value: "No data", fontWeight: "bold" as const }]]

      const metaSheet = [
        [{ value: "Field", fontWeight: "bold" }, { value: "Value", fontWeight: "bold" }],
        [{ value: "Country" }, { value: countryName }],
        [{ value: "ISO Code" }, { value: countryCode }],
        [{ value: "Series" }, { value: labelFor(dataType) }],
        [{ value: "Source" }, { value: sourceFor(dataType, data) }],
        [{ value: "Generated" }, { value: new Date().toISOString() }],
        [{ value: "Tool" }, { value: "ClimaChain" }],
      ]

      await writeXlsxFile([dataSheet as any, metaSheet as any], {
        sheets: [labelFor(dataType).slice(0, 31), "Metadata"],
        fileName: `${slug(countryName)}_${dataType}_climachain.xlsx`,
      })
      toast.success("Workbook downloaded")
    } catch (err) {
      toast.error("Excel export failed", { description: err instanceof Error ? err.message : "Unknown error" })
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card className="surface-1">
      <CardContent className="flex flex-col items-start justify-between gap-4 pt-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm">
          <Download className="size-4 text-muted-foreground" />
          <span className="font-medium">Export this view</span>
          <span className="hidden text-muted-foreground sm:inline">— PDF brief or Excel workbook with raw series</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handlePdf} disabled={busy !== null}>
            {busy === "pdf" ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <FileText className="mr-1.5 size-3.5" />
            )}
            PDF report
          </Button>
          <Button variant="outline" size="sm" onClick={handleXlsx} disabled={busy !== null}>
            {busy === "xlsx" ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-1.5 size-3.5" />
            )}
            Excel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function labelFor(dataType: string): string {
  switch (dataType) {
    case "temperature":
      return "Temperature"
    case "rainfall":
      return "Precipitation"
    case "co2":
      return "CO₂ Emissions"
    case "ndvi":
      return "Vegetation (NDVI)"
    default:
      return dataType
  }
}

function sourceFor(dataType: string, data: any): string {
  if (dataType === "temperature") return data?.historical?.source ?? "—"
  if (dataType === "rainfall") return data?.historical?.source ?? "—"
  if (dataType === "co2") return data?.source ?? "—"
  if (dataType === "ndvi") return "Modeled NDVI baseline"
  return "—"
}

function computeSummary(dataType: string, data: any): Array<[string, string]> {
  switch (dataType) {
    case "temperature": {
      const series = data?.historical?.data ?? []
      const a = data?.analysis
      const avg = series.length ? series.reduce((s: number, d: any) => s + d.temperature, 0) / series.length : null
      return [
        ["Average", avg != null ? `${avg.toFixed(2)} °C` : "—"],
        ["Trend", a?.trend ?? "—"],
        ["Per decade", a?.changePerDecade != null ? `${a.changePerDecade > 0 ? "+" : ""}${a.changePerDecade} °C` : "—"],
        ["Period", `${series[0]?.year ?? "—"}–${series[series.length - 1]?.year ?? "—"}`],
      ]
    }
    case "rainfall": {
      const series = data?.historical?.data ?? []
      const avg = series.length ? series.reduce((s: number, d: any) => s + d.rainfall, 0) / series.length : null
      return [
        ["Average", avg != null ? `${Math.round(avg)} mm` : "—"],
        ["Period", `${series[0]?.year ?? "—"}–${series[series.length - 1]?.year ?? "—"}`],
        ["Source", data?.historical?.source ?? "—"],
      ]
    }
    case "co2": {
      const series = data?.data ?? []
      const latest = series[series.length - 1]?.co2
      const earliest = series[0]?.co2
      return [
        ["Latest", latest != null ? `${Math.round(latest)} kt` : "—"],
        ["Earliest", earliest != null ? `${Math.round(earliest)} kt` : "—"],
        ["Period", `${series[0]?.year ?? "—"}–${series[series.length - 1]?.year ?? "—"}`],
      ]
    }
    case "ndvi": {
      const series = Array.isArray(data) ? data : data?.data ?? []
      const avg = series.length ? series.reduce((s: number, d: any) => s + d.ndvi, 0) / series.length : null
      return [
        ["Mean NDVI", avg != null ? avg.toFixed(3) : "—"],
        ["Records", `${series.length}`],
      ]
    }
    default:
      return []
  }
}

function buildTableRows(
  dataType: string,
  data: any,
): { head: string[]; rows: Array<Array<string | number>> } | null {
  switch (dataType) {
    case "temperature": {
      const hist = data?.historical?.data ?? []
      const proj = data?.projection?.data ?? []
      return {
        head: ["Year", "Temperature (°C)", "Type"],
        rows: [
          ...hist.map((d: any) => [d.year, +d.temperature.toFixed(2), "Historical"]),
          ...proj.map((d: any) => [d.year, +d.temperature.toFixed(2), "Projection"]),
        ],
      }
    }
    case "rainfall": {
      const hist = data?.historical?.data ?? []
      const proj = data?.projection?.data ?? []
      return {
        head: ["Year", "Rainfall (mm)", "Type"],
        rows: [
          ...hist.map((d: any) => [d.year, +d.rainfall.toFixed(1), "Historical"]),
          ...proj.map((d: any) => [d.year, +d.rainfall.toFixed(1), "Projection"]),
        ],
      }
    }
    case "co2": {
      const series = data?.data ?? []
      return {
        head: ["Year", "CO₂ Emissions (kt)"],
        rows: series.map((d: any) => [d.year, Math.round(d.co2)]),
      }
    }
    case "ndvi": {
      const series = Array.isArray(data) ? data : data?.data ?? []
      return {
        head: ["Date", "Year", "Month", "NDVI"],
        rows: series.map((d: any) => [d.date, d.year, d.month, d.ndvi]),
      }
    }
    default:
      return null
  }
}

function slug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
