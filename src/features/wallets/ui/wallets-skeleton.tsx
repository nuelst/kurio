import { SkeletonShimmer } from '@/shared/ui/skeleton-shimmer'

export function WalletsSkeleton() {
  return (
    <div className="flex-1">
      <SkeletonShimmer className="h-7 w-64" />
      <SkeletonShimmer className="mt-2 h-4 w-96" />
      <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder count, never reorders
          <SkeletonShimmer key={index} className="h-16 w-full" />
        ))}
      </div>
      <SkeletonShimmer className="mt-6 h-11 w-40" />
    </div>
  )
}
