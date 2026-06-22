import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PilotNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="font-mono text-5xl font-bold text-[#00236f]">404</p>
      <div>
        <h1 className="font-display text-xl font-bold text-[#00236f]">Not found in the Yobe pilot</h1>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          That LGA or facility is not part of the current pilot set. The pilot covers Damaturu
          (YB-DAM) and Potiskum (YB-POT).
        </p>
      </div>
      <Button asChild size="sm">
        <Link href="/pilot">Back to overview</Link>
      </Button>
    </div>
  )
}
