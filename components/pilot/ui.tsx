import type React from "react"
import { cn } from "@/lib/utils"

/** Flat tonal surface block — the pilot's primary "tile" (no border, no shadow). */
export function Tile({
  className,
  as: Tag = "div",
  ...props
}: React.ComponentProps<"div"> & { as?: React.ElementType }) {
  return <Tag className={cn("bg-surface-container-low", className)} {...props} />
}

/** Eyebrow label + display heading, optional right-aligned slot. Matches the backbone. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  right,
  className,
}: {
  eyebrow: string
  title: React.ReactNode
  description?: React.ReactNode
  right?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        <p className="label-tech">{eyebrow}</p>
        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? <p className="mt-1.5 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  )
}

/** A single metric cell for hairline-divided stat grids. */
export function Stat({
  label,
  value,
  accent,
  hint,
}: {
  label: string
  value: React.ReactNode
  accent?: string
  hint?: React.ReactNode
}) {
  return (
    <div className="bg-surface-container-low px-6 py-7">
      <div className="flex items-center gap-2">
        {accent ? <span className="size-1.5 rounded-full" style={{ background: accent }} /> : null}
        <p className="label-tech-sm">{label}</p>
      </div>
      <p className="mt-2 font-numeric text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
