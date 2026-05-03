import { Skeleton } from "@/components/ui/skeleton"

export function ChartSkeleton() {
  return (
    <div className="bg-surface-container-low p-8">
      <div className="flex items-end justify-between">
        <Skeleton className="h-7 w-48 bg-surface-container" />
        <Skeleton className="h-5 w-24 bg-surface-container" />
      </div>
      <div className="mt-8 grid gap-px bg-outline-variant/20 sm:grid-cols-3">
        <Skeleton className="h-24 rounded-none bg-surface-container-low" />
        <Skeleton className="h-24 rounded-none bg-surface-container-low" />
        <Skeleton className="h-24 rounded-none bg-surface-container-low" />
      </div>
      <Skeleton className="mt-8 h-72 w-full bg-surface-container" />
    </div>
  )
}
