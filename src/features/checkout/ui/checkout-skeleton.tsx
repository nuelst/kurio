import { SkeletonShimmer } from '@/shared/ui/skeleton-shimmer'

export function CheckoutSkeleton() {
  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
      <div className="flex-1">
        <SkeletonShimmer className="h-7 w-64" />
        <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {Array.from({ length: 3 }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder count, never reorders
            <SkeletonShimmer key={index} className="h-16 w-full" />
          ))}
        </div>
        <SkeletonShimmer className="mt-5 h-28 w-full" />
      </div>
      <SkeletonShimmer className="h-[520px] w-full rounded-2xl lg:w-[380px]" />
    </div>
  )
}
