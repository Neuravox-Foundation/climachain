import {
  AlertTriangle, ListChecks, Sun, Zap, Droplets, Thermometer, Syringe, Users, MapPin, Activity,
} from "lucide-react"
import { RiskBadge } from "./risk-badge"
import type { Band, OperationalBrief } from "@/lib/pilot/types"

// Plain-language one-liner per band — written for semi-literate facility staff.
const BAND_LEAD: Record<Band, string> = {
  severe: "Severe risk. Children could miss vaccines or doses could spoil. Act now.",
  high: "High risk. This needs attention this week.",
  moderate: "Moderate risk. Keep a close watch.",
  low: "Low risk. Routine monitoring is enough.",
}

// Pick a simple icon for a driver line so it can be scanned without reading.
function iconFor(label: string) {
  const t = label.toLowerCase()
  if (t.includes("hot") || t.includes("heat")) return Sun
  if (t.includes("power") || t.includes("grid") || t.includes("generator")) return Zap
  if (t.includes("flood") || t.includes("rain")) return Droplets
  if (t.includes("cold chain") || t.includes("fridge")) return Thermometer
  if (t.includes("dropout") || t.includes("dose") || t.includes("catchment")) return Syringe
  if (t.includes("outreach")) return Users
  if (t.includes("access") || t.includes("road") || t.includes("checkpoint")) return MapPin
  return Activity
}

function steps(action: string): string[] {
  return action
    .split(/;\s*/)
    .map((s) => s.replace(/\.$/, "").trim())
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
}

export function BriefCard({ brief }: { brief: OperationalBrief }) {
  const lead = brief.headline ?? BAND_LEAD[brief.band]
  const actionSteps = steps(brief.action)

  return (
    <div className="bg-surface-container-low p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-tech-sm">{brief.scope.kind === "lga" ? "LGA brief" : "Facility brief"}</p>
          <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-foreground">{brief.scope.name}</h3>
        </div>
        <RiskBadge band={brief.band} score={brief.score} />
      </div>

      {/* Plain-language lead */}
      <p className="mt-5 flex items-start gap-2.5 text-pretty text-lg font-medium leading-snug text-foreground">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-primary" />
        <span>{lead}</span>
      </p>

      {/* Why it's flagged */}
      {brief.why.length ? (
        <div className="mt-7">
          <p className="label-tech-sm">Why it is flagged</p>
          <ul className="mt-3 space-y-2.5">
            {brief.why.map((w, i) => {
              const Icon = iconFor(w)
              return (
                <li key={i} className="flex items-center gap-3 text-base text-foreground">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-container-highest">
                    <Icon className="size-4 text-primary" />
                  </span>
                  <span className="capitalize">{w}</span>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      {/* What to do */}
      {actionSteps.length ? (
        <div className="mt-7">
          <p className="label-tech-sm flex items-center gap-1.5">
            <ListChecks className="size-3.5" /> Do this week
          </p>
          <ol className="mt-3 space-y-2.5">
            {actionSteps.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-base text-foreground">
                <span className="font-numeric mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {brief.confidence !== "live" ? (
        <p className="mt-6 border-t border-outline-variant/20 pt-4 text-xs text-muted-foreground">
          Confidence: {brief.confidence} – based on seeded / forecast inputs.
        </p>
      ) : null}
    </div>
  )
}
