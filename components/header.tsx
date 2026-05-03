"use client"

import { Activity, Menu, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Country } from "@/lib/countries"

interface HeaderProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
  selectedCountry?: Country | null
}

export function Header({ onMenuClick, showMenuButton, selectedCountry }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center gap-3 px-4 md:px-6 lg:px-8">
        {showMenuButton && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Open navigation">
            <Menu className="size-5" />
          </Button>
        )}

        <a href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/90 to-accent/90 text-primary-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.06)_inset,0_8px_24px_-12px_rgba(0,0,0,0.5)]">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 12a9 9 0 0 1 9-9c4 0 7 2 8 5" strokeLinecap="round" />
              <path d="M21 12a9 9 0 0 1-9 9c-4 0-7-2-8-5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold tracking-tight">ClimaChain</span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
              Climate Intelligence · Africa
            </span>
          </div>
        </a>

        <div className="ml-3 hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
          <Badge variant="outline" className="rounded-md border-border/70 px-2 py-0.5 font-mono text-[10px]">
            v1.0
          </Badge>
          <span className="hidden lg:inline">·</span>
          <span className="hidden lg:inline">World Bank · CMIP6 · Copernicus</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {selectedCountry && (
            <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 sm:flex">
              <span className="size-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-muted-foreground">Tracking</span>
              <span className="text-xs font-medium text-foreground">{selectedCountry.name}</span>
            </div>
          )}

          <div className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1 md:flex">
            <Activity className="size-3.5 text-success" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Live</span>
          </div>

          <a
            href="https://github.com/Neuravox-Foundation/climachain"
            target="_blank"
            rel="noreferrer noopener"
            className="hidden md:inline-flex"
          >
            <Button variant="ghost" size="icon" aria-label="GitHub repository">
              <Github className="size-4" />
            </Button>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
