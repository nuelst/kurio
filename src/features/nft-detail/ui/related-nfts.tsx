import type { NftSummary } from '@/features/catalog/model/nft'
import { CatalogSkeleton } from '@/features/catalog/ui/catalog-skeleton'
import { NftCard } from '@/features/catalog/ui/nft-card'

interface RelatedNftsProps {
  items: NftSummary[]
  isLoading: boolean
  onToggleFavorite: (nft: NftSummary) => void
}

export function RelatedNfts({ items, isLoading, onToggleFavorite }: RelatedNftsProps) {
  if (!isLoading && items.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="border-b border-border pb-3 text-lg font-bold text-primary">
        Mais desta coleção
      </h2>

      {isLoading ? (
        <div className="mt-6">
          <CatalogSkeleton count={5} />
        </div>
      ) : (
        <>
          <div
            className="mt-6 flex gap-6 overflow-x-auto pb-2"
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
