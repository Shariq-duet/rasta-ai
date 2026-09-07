import { cn } from '@/lib/cn'

/** Shimmering placeholder block used while a client-only screen settles. */
export function Skeleton({ className }) {
  return (
    <div aria-hidden className={cn('relative overflow-hidden rounded-xl bg-line/70', className)}>
      <span className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  )
}

/** Matches the shape of a transaction row so lists do not jump on hydration. */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3.5">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-2.5 w-3/5" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  )
}

export function SkeletonScreen() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      <Skeleton className="h-44 w-full rounded-3xl" />
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-20 rounded-2xl" />
        ))}
      </div>
      <div className="surface-card p-4">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </div>
  )
}
