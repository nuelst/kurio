import { SkeletonShimmer } from '@/shared/ui/skeleton-shimmer'

const RELATED_SKELETON_SLOTS = ['a', 'b', 'c', 'd', 'e']

export function NftDetailSkeleton() {
  return (
    <div className="flex flex-col">
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

      <div className="mt-12">
        <div className="flex gap-8 border-b border-border pb-3">
          <SkeletonShimmer className="h-5 w-32" />
          <SkeletonShimmer className="h-5 w-56" />
        </div>
        <div className="mt-6 max-w-3xl space-y-4">
          <SkeletonShimmer className="h-4 w-full" />
          <SkeletonShimmer className="h-4 w-full" />
          <SkeletonShimmer className="h-4 w-3/4" />
        </div>
      </div>

      <div className="mt-16">
        <SkeletonShimmer className="h-6 w-56" />
        <div className="mt-6 flex gap-6 overflow-x-auto pb-2">
          {RELATED_SKELETON_SLOTS.map((slot) => (
            <SkeletonShimmer key={slot} className="aspect-square w-[219px] shrink-0 rounded-[15px]" />
          ))}
        </div>
      </div>
    </div>
  )
}
