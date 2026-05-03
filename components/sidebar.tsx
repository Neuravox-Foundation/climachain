"use client"

import { useMemo, useState } from "react"
import { Search, MapPin, Check, X, Globe2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe2 className="size-4 text-primary" />
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            African Nations
          </h2>
        </div>
        <Badge variant="outline" className="rounded-md border-border/70 px-2 py-0.5 font-mono text-[10px]">
          {AFRICAN_COUNTRIES.length}
        </Badge>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search country, region or ISO code…"
          className="h-9 pl-9 text-sm"
          aria-label="Search countries"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <ScrollArea className="-mx-2 flex-1 px-2 scrollbar-thin">
        <div className="space-y-5 pb-4">
          {REGION_ORDER.map((region) => {
            const list = grouped[region]
            if (!list || list.length === 0) return null
            return (
              <div key={region} className="space-y-1.5">
                <div className="flex items-center gap-2 px-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {region}
                  </span>
                  <span className="h-px flex-1 bg-border/60" />
                  <span className="font-mono text-[10px] text-muted-foreground/80">{list.length}</span>
                </div>
                <ul className="space-y-0.5">
                  {list.map((country) => {
                    const isSelected = selectedCountry === country.code
                    return (
                      <li key={country.code}>
                        <button
                          type="button"
                          onClick={() => onCountrySelect?.(country)}
                          className={cn(
                            "group flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm transition",
                            "hover:bg-sidebar-accent",
                            isSelected
                              ? "bg-primary/10 text-foreground ring-1 ring-primary/30"
                              : "text-foreground/85",
                          )}
                          aria-pressed={isSelected}
                        >
                          <span className="truncate">{country.name}</span>
                          <span className="ml-2 flex shrink-0 items-center gap-1.5">
                            <span
                              className={cn(
                                "font-mono text-[10px] uppercase tracking-wider",
                                isSelected ? "text-primary" : "text-muted-foreground",
                              )}
                            >
                              {country.code}
                            </span>
                            {isSelected && <Check className="size-3.5 text-primary" />}
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
              No countries match “{searchTerm}”.
            </div>
          )}
        </div>
      </ScrollArea>

      {selected && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-primary">
            <MapPin className="size-3" />
            Active selection
          </div>
          <p className="text-sm font-medium">{selected.name}</p>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{selected.region}</span>
            <span className="font-mono">{selected.code}</span>
          </div>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-80 border-r border-border bg-sidebar p-5">
          <SheetHeader>
            <SheetTitle className="text-left">Browse countries</SheetTitle>
          </SheetHeader>
          <div className="mt-4 h-[calc(100vh-7rem)]">{Body}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-72 shrink-0 flex-col rounded-xl border border-border/60 bg-sidebar/60 p-4 backdrop-blur-xl md:flex">
      {Body}
    </aside>
  )
}
