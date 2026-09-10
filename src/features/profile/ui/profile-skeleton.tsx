import { SkeletonShimmer } from '@/shared/ui/skeleton-shimmer'

export function ProfileSkeleton() {
  return (
    <div className="flex-1">
      <SkeletonShimmer className="h-7 w-64" />
      <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder count, never reorders
          <SkeletonShimmer key={index} className="h-16 w-full" />
        ))}
      </div>
      <SkeletonShimmer className="mt-8 h-14 w-48" />
      <SkeletonShimmer className="mt-8 h-40 w-full max-w-md" />
    </div>
  )
}
