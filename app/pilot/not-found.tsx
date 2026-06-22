import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PilotNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-28 text-center">
      <p className="label-tech">Not found</p>
      <p className="font-numeric text-6xl font-semibold tracking-tight text-primary">404</p>
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Not in the Yobe pilot</h1>
        <p className="mt-2 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
          That LGA or facility is not part of the current pilot set. The pilot covers Damaturu (YB-DAM) and
          Potiskum (YB-POT).
        </p>
      </div>
      <Button asChild size="sm">
        <Link href="/pilot">Back to overview</Link>
      </Button>
    </div>
  )
}
