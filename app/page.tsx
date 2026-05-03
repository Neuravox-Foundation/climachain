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
    <div className="relative min-h-screen bg-background text-foreground">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 glow-bg" />
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[60vh] grid-pattern opacity-40" />

      <Header
        onMenuClick={() => setSidebarOpen((v) => !v)}
        showMenuButton={isMobile}
        selectedCountry={selectedCountry}
      />

      <div className="mx-auto flex w-full max-w-[1500px] gap-6 px-4 pb-16 md:px-6 lg:px-8">
        <Sidebar
          onCountrySelect={handleCountrySelect}
          selectedCountry={selectedCountry?.code}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />
        <MainContent selectedCountry={selectedCountry} onSelectCountry={handleCountrySelect} />
      </div>
    </div>
  )
}
