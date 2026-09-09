import type { NftSummary } from '@/features/catalog/model/nft'
import { NftCard } from '@/features/catalog/ui/nft-card'

interface CatalogGridProps {
  items: NftSummary[]
  onToggleFavorite: (nft: NftSummary) => void
}

export function CatalogGrid({ items, onToggleFavorite }: CatalogGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-[72px] sm:grid-cols-3">
      {items.map((item) => (
        <NftCard key={item.id} nft={item} onToggleFavorite={onToggleFavorite} />
      ))}
    </div>
  )
}
