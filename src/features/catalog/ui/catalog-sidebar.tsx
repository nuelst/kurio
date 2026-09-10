import nftFeatured from '@/assets/nft/nft-01.png'
import type { CatalogSearch } from '@/features/catalog/model/nft'
import { CatalogFilterGroups } from '@/features/catalog/ui/catalog-filter-groups'
import { CatalogSearchInput } from '@/features/catalog/ui/catalog-search-input'

interface CatalogSidebarProps {
  search: CatalogSearch
  categoryCounts: Record<string, number>
  onSearchTextChange: (value: string) => void
  onCategoryChange: (category: string | undefined) => void
  onPriceRangeApply: (minPrice: string | undefined, maxPrice: string | undefined) => void
}

export function CatalogSidebar({
  search,
  categoryCounts,
  onSearchTextChange,
  onCategoryChange,
  onPriceRangeApply,
}: CatalogSidebarProps) {
  return (
    <aside className="flex flex-col gap-8">
      <CatalogSearchInput value={search.q ?? ''} onChange={onSearchTextChange} />

      <CatalogFilterGroups
        search={search}
        categoryCounts={categoryCounts}
        onCategoryChange={onCategoryChange}
        onPriceRangeApply={onPriceRangeApply}
      />

      <div
        className="flex flex-col gap-2.5 rounded-2xl pt-6 pb-1"
        style={{
          background:
            'linear-gradient(180deg, rgba(210, 138, 76, 0.1) 0%, rgba(210, 138, 76, 0.03) 100%)',
        }}
      >
        <p className="text-center text-2xl leading-8 font-bold text-primary">NFT em destaque</p>
        <p className="text-center text-[22px] leading-4 font-bold text-foreground uppercase">
          Oferta limitada
        </p>
        <div className="aspect-[310/368] overflow-hidden rounded-[22px]">
          <img
            src={nftFeatured}
            alt="NFT em destaque com oferta por tempo limitado"
            className="size-full object-cover"
            width={310}
            height={368}
          />
        </div>
      </div>
    </aside>
  )
}
