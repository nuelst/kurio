import { SkeletonShimmer } from '@/shared/ui/skeleton-shimmer'

export function NftDetailSkeleton() {
  return (
    <div className="flex flex-col gap-10 lg:flex-row">
      <div className="flex gap-7">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder count, never reorders
            <SkeletonShimmer key={index} className="size-[100px] rounded-lg" />
          ))}
        </div>
        <SkeletonShimmer className="h-[444px] w-[444px] rounded-md" />
      </div>
      <div className="flex flex-1 flex-col gap-6">
        <SkeletonShimmer className="h-8 w-2/3" />
        <SkeletonShimmer className="h-6 w-1/3" />
        <SkeletonShimmer className="h-20 w-full" />
        <SkeletonShimmer className="h-10 w-1/2" />
        <SkeletonShimmer className="h-11 w-full" />
      </div>
    </div>
  )
}
