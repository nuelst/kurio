import { Card, CardContent } from '@/components/ui/card'
import { SkeletonShimmer } from '@/shared/ui/skeleton-shimmer'

export function CatalogSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Carregando NFTs"
      className="grid grid-cols-2 gap-x-3 gap-y-[72px] sm:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder count, never reorders
        <Card key={index} className="gap-3 overflow-hidden bg-sidebar py-0">
          <SkeletonShimmer className="aspect-square w-full rounded-none" />
          <CardContent className="space-y-2 pb-4">
            <SkeletonShimmer className="h-3 w-1/2" />
            <SkeletonShimmer className="h-4 w-3/4" />
            <div className="flex justify-between pt-1">
              <SkeletonShimmer className="h-4 w-16" />
              <SkeletonShimmer className="h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
