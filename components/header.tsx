"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import type { Country } from "@/lib/countries"

interface HeaderProps {
  onMenuClick?: () => void
  showMenuButton?: boolean
  selectedCountry?: Country | null
}

export function Header({ onMenuClick, showMenuButton, selectedCountry }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-background">
      <div className="mx-auto flex h-20 w-full max-w-[1480px] items-center gap-4 px-6 lg:px-10">
        {showMenuButton && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Open navigation">
            <Menu className="size-5" />
          </Button>
        )}

        <a href="/" className="group flex items-center gap-3">
          <img
            src="/climachain-logo.png"
            alt="ClimaChain"
            width={44}
            height={44}
            className="size-11 shrink-0 object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-semibold tracking-tight text-foreground">ClimaChain</span>
            <span className="label-tech-sm">Climate Intelligence · Africa</span>
          </div>
        </a>

        <div className="ml-auto flex items-center gap-3">
          {selectedCountry && (
            <div className="hidden items-center gap-2 rounded-md bg-surface-container-low px-3 py-1.5 sm:flex">
              <span className="size-1.5 rounded-full bg-success" />
              <span className="label-tech-sm">Tracking</span>
              <span className="font-numeric text-xs font-medium text-foreground">{selectedCountry.code}</span>
            </div>
          )}

          <ThemeToggle />
        </div>
      </div>
      <div className="mx-auto h-px w-full max-w-[1480px] px-6 lg:px-10">
        <div className="h-px w-full bg-outline-variant/25" />
      </div>
    </header>
  )
}
