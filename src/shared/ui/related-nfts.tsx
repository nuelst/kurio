import type { NftSummary } from '@/features/catalog/model/nft'
import { NftCard } from '@/features/catalog/ui/nft-card'
import { SkeletonShimmer } from '@/shared/ui/skeleton-shimmer'

interface RelatedNftsProps {
  title: string
  items: NftSummary[]
  isLoading: boolean
  onToggleFavorite: (nft: NftSummary) => void
}

const SKELETON_SLOTS = ['a', 'b', 'c', 'd', 'e']

function RelatedNftsSkeleton() {
  return (
    <>
      <div
        className="scrollbar-hide mt-6 flex gap-6 overflow-x-auto pb-2"
        role="status"
        aria-label="Carregando NFTs"
      >
        {SKELETON_SLOTS.map((slot) => (
          <div
            key={slot}
            className="flex w-[219px] shrink-0 flex-col gap-3 rounded-[15px] bg-sidebar"
          >
            <SkeletonShimmer className="aspect-square w-full rounded-[15px]" />
            <div className="flex flex-col gap-1 px-4 pb-4">
              <SkeletonShimmer className="h-3 w-2/5" />
              <SkeletonShimmer className="h-4 w-4/5" />
              <div className="mt-2 flex items-center justify-between">
                <SkeletonShimmer className="h-4 w-12" />
                <SkeletonShimmer className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-2" aria-hidden="true">
        <span className="size-2 rounded-full border border-transparent" />
        <span className="size-2 rounded-full border border-transparent" />
        <span className="size-2 rounded-full border border-transparent" />
      </div>
    </>
  )
}

export function RelatedNfts({ title, items, isLoading, onToggleFavorite }: RelatedNftsProps) {
  if (!isLoading && items.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="border-b border-border pb-3 text-lg font-bold text-primary">{title}</h2>

      {isLoading ? (
        <RelatedNftsSkeleton />
      ) : (
        <>
          <div
            className="scrollbar-hide mt-6 flex gap-6 overflow-x-auto pb-2"
            style={{ scrollSnapType: 'x proximity' }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="w-[219px] shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <NftCard nft={item} onToggleFavorite={onToggleFavorite} />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-center gap-2" aria-hidden="true">
            <span className="size-2 rounded-full border border-primary" />
            <span className="size-2 rounded-full bg-primary" />
            <span className="size-2 rounded-full border border-primary" />
          </div>
        </>
      )}
    </section>
  )
}
