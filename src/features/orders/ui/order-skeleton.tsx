import { SkeletonShimmer } from '@/shared/ui/skeleton-shimmer'

export function OrderSkeleton() {
  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card p-8">
      <SkeletonShimmer className="mx-auto size-20 rounded-full" />
      <SkeletonShimmer className="mx-auto mt-4 h-5 w-64" />
      <SkeletonShimmer className="mt-6 h-20 w-full" />
      <SkeletonShimmer className="mt-6 h-40 w-full" />
      <SkeletonShimmer className="mt-6 h-11 w-full" />
    </div>
  )
}
