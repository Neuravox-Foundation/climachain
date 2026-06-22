import type React from "react"
import Link from "next/link"
import { PilotBadge } from "@/components/pilot/pilot-badge"

export default function PilotLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/pilot" className="font-display text-lg font-bold text-[#00236f]">
              ClimaChain
            </Link>
            <PilotBadge />
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/pilot" className="text-muted-foreground hover:text-[#0058be]">Overview</Link>
            <Link href="/pilot/actions" className="text-muted-foreground hover:text-[#0058be]">Action queue</Link>
            <Link href="/pilot/brief" className="text-muted-foreground hover:text-[#0058be]">Weekly brief</Link>
            <Link href="/" className="text-muted-foreground hover:text-[#0058be]">Backbone →</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
