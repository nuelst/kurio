import type { NftSummary } from '@/features/catalog/model/nft'
import { NftCard } from '@/features/catalog/ui/nft-card'

interface CatalogGridProps {
  items: NftSummary[]
  onToggleFavorite: (nft: NftSummary) => void
}

export function CatalogGrid({ items, onToggleFavorite }: CatalogGridProps) {
  return (
    <div
      data-testid="catalog-grid"
      className="grid grid-cols-2 gap-x-4 gap-y-[72px] [&>*:nth-child(2n)]:translate-y-8 sm:grid-cols-3 sm:[&>*:nth-child(2n)]:translate-y-0"
    >
      {items.map((item) => (
        <NftCard key={item.id} nft={item} onToggleFavorite={onToggleFavorite} />
      ))}
    </div>
  )
}
