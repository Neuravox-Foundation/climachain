import type React from "react"
import Link from "next/link"

const NAV = [
  { href: "/pilot", label: "Overview" },
  { href: "/pilot/actions", label: "Action queue" },
  { href: "/pilot/brief", label: "Weekly brief" },
]

export default function PilotLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-background">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center gap-4 px-6 lg:px-10">
          <Link href="/pilot" className="flex items-center gap-3">
            <img src="/climachain-logo.png" alt="ClimaChain" width={40} height={40} className="size-10 shrink-0 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-semibold tracking-tight text-foreground">ClimaChain</span>
              <span className="label-tech-sm">Immunization Continuity · Yobe</span>
            </div>
          </Link>

          <nav className="ml-auto hidden items-center gap-6 text-sm sm:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-muted-foreground transition-colors hover:text-foreground">
                {n.label}
              </Link>
            ))}
            <Link href="/" className="text-muted-foreground transition-colors hover:text-foreground">
              Backbone →
            </Link>
          </nav>
        </div>
        <div className="mx-auto h-px w-full max-w-6xl px-6 lg:px-10">
          <div className="h-px w-full bg-outline-variant/30" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-24 pt-12 lg:px-10">{children}</main>

      <footer className="bg-surface-container-low">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="flex items-center gap-3">
            <span className="font-display text-foreground">ClimaChain</span>
            <span aria-hidden>·</span>
            <span>Yobe immunization-continuity pilot</span>
          </div>
          <div className="label-tech-sm">Prototype · seeded pilot inputs</div>
        </div>
      </footer>
    </div>
  )
}
