import { SkeletonShimmer } from '@/shared/ui/skeleton-shimmer'

export function CartSkeleton() {
  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
      <div className="flex-1">
        {Array.from({ length: 3 }).map((_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder count, never reorders
          <div key={index} className="flex items-center gap-4 border-b border-border py-4">
            <SkeletonShimmer className="size-16 shrink-0 rounded-lg" />
            <SkeletonShimmer className="h-5 flex-1" />
            <SkeletonShimmer className="hidden h-5 w-16 sm:block" />
            <SkeletonShimmer className="h-8 w-24 rounded-full" />
            <SkeletonShimmer className="h-5 w-16" />
          </div>
        ))}
      </div>
      <SkeletonShimmer className="h-[420px] w-full rounded-2xl lg:w-[332px]" />
    </div>
  )
}
