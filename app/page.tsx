"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { MainContent } from "@/components/main-content"
import { useIsMobile } from "@/hooks/use-mobile"
import type { Country } from "@/lib/countries"

export default function HomePage() {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    if (isMobile) setSidebarOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header
        onMenuClick={() => setSidebarOpen((v) => !v)}
        showMenuButton={isMobile}
        selectedCountry={selectedCountry}
      />

      <div className="mx-auto flex w-full max-w-[1480px] flex-1 gap-10 px-6 pb-24 lg:px-10">
        <Sidebar
          onCountrySelect={handleCountrySelect}
          selectedCountry={selectedCountry?.code}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />
        <MainContent selectedCountry={selectedCountry} onSelectCountry={handleCountrySelect} />
      </div>

      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="bg-surface-container-low">
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-3 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <div className="flex items-center gap-3">
          <img src="/icon.png" alt="" width={20} height={20} className="opacity-80" />
          <span className="font-display text-foreground">ClimaChain</span>
          <span aria-hidden>·</span>
          <span>A Neuravox Foundation platform</span>
        </div>
        <div className="label-tech-sm flex items-center gap-3">
          <span>Sources: World Bank, CMIP6, Copernicus</span>
        </div>
      </div>
    </footer>
  )
}
