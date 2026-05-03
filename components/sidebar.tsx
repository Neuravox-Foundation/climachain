"use client"

import { useMemo, useState } from "react"
import { Search, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { AFRICAN_COUNTRIES, type AfricanRegion, type Country } from "@/lib/countries"
import { cn } from "@/lib/utils"

interface SidebarProps {
  onCountrySelect?: (country: Country) => void
  selectedCountry?: string
  isOpen?: boolean
  onClose?: () => void
  isMobile?: boolean
}

const REGION_ORDER: AfricanRegion[] = [
  "North Africa",
  "West Africa",
  "East Africa",
  "Central Africa",
  "Southern Africa",
]

export function Sidebar({ onCountrySelect, selectedCountry, isOpen, onClose, isMobile }: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return AFRICAN_COUNTRIES
    return AFRICAN_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q),
    )
  }, [searchTerm])

  const grouped = useMemo(() => {
    const acc = {} as Record<AfricanRegion, Country[]>
    REGION_ORDER.forEach((r) => (acc[r] = []))
    for (const country of filtered) acc[country.region].push(country)
    return acc
  }, [filtered])

  const selected = AFRICAN_COUNTRIES.find((c) => c.code === selectedCountry)

  const Body = (
    <div className="flex h-full min-h-0 flex-col gap-7">
      <div>
        <p className="label-tech">Catalog</p>
        <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-foreground">
          African nations
        </h2>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {AFRICAN_COUNTRIES.length} sovereign states, by region
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search countries"
          className="h-11 bg-surface-container-lowest pl-9 pr-9 text-sm ghost-border focus-visible:bg-surface-bright"
          aria-label="Search countries"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="-mx-4 min-h-0 flex-1 overflow-y-auto px-4 scrollbar-thin">
        <div className="space-y-8 pb-4">
          {REGION_ORDER.map((region) => {
            const list = grouped[region]
            if (!list || list.length === 0) return null
            return (
              <div key={region} className="space-y-2.5">
                <div className="flex items-baseline justify-between px-1">
                  <span className="label-tech-sm">{region}</span>
                  <span className="font-numeric text-[10px] text-muted-foreground/80">{list.length}</span>
                </div>
                <ul className="space-y-1">
                  {list.map((country) => {
                    const isSelected = selectedCountry === country.code
                    return (
                      <li key={country.code}>
                        <button
                          type="button"
                          onClick={() => onCountrySelect?.(country)}
                          className={cn(
                            "group flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                            isSelected
                              ? "bg-secondary-container text-on-secondary-container"
                              : "text-foreground/90 hover:bg-surface-container",
                          )}
                          aria-pressed={isSelected}
                        >
                          <span className="min-w-0 flex-1 truncate">{country.name}</span>
                          <span className="flex shrink-0 items-center gap-1.5">
                            <span
                              className={cn(
                                "font-numeric text-[11px] uppercase tracking-wider",
                                isSelected ? "text-on-secondary-container" : "text-muted-foreground",
                              )}
                            >
                              {country.code}
                            </span>
                            {isSelected && <Check className="size-3.5" />}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No countries match &ldquo;{searchTerm}&rdquo;.
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="rounded-md bg-secondary-container p-4 text-on-secondary-container">
          <p className="label-tech-sm" style={{ color: "currentColor", opacity: 0.7 }}>
            Active selection
          </p>
          <p className="mt-1 font-display text-base font-semibold">{selected.name}</p>
          <div className="mt-1 flex items-center justify-between text-xs opacity-80">
            <span>{selected.region}</span>
            <span className="font-numeric">{selected.code}</span>
          </div>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-[20rem] border-r-0 bg-surface-container-low p-7">
          <SheetHeader>
            <SheetTitle className="text-left font-display">Browse countries</SheetTitle>
          </SheetHeader>
          <div className="mt-4 h-[calc(100vh-7rem)]">{Body}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-14rem)] w-[20rem] shrink-0 flex-col self-start rounded-lg bg-surface-container-low p-7 md:flex">
      {Body}
    </aside>
  )
}
