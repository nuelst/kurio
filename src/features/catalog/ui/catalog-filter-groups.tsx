import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { type CatalogSearch, catalogPriceBounds } from '@/features/catalog/model/nft'
import { catalogCategories } from '@/features/catalog/ui/catalog-categories'
import { cn } from '@/lib/utils'
import { notImplementedToast } from '@/shared/lib/not-implemented'

const networks = [
  { label: 'Ethereum', count: 119 },
  { label: 'Polygon', count: 78 },
  { label: 'Solana', count: 86 },
]

const filterRowClasses =
  'flex w-full items-center justify-between text-[15px] leading-10 text-muted-foreground transition-colors hover:text-primary'

interface CatalogFilterGroupsProps {
  search: CatalogSearch
  categoryCounts: Record<string, number>
  onCategoryChange: (category: string | undefined) => void
  onPriceRangeApply: (minPrice: string | undefined, maxPrice: string | undefined) => void
}

/** Coleções/Faixa de preço/Rede — reaproveitado pela sidebar (desktop/tablet) e pelo drawer de
 * filtros (mobile), pra não duplicar a lógica dos filtros em dois lugares. */
export function CatalogFilterGroups({
  search,
  categoryCounts,
  onCategoryChange,
  onPriceRangeApply,
}: CatalogFilterGroupsProps) {
  const [range, setRange] = useState<[number, number]>([
    search.minPrice ? Number(search.minPrice) : catalogPriceBounds.min,
    search.maxPrice ? Number(search.maxPrice) : catalogPriceBounds.max,
  ])

  return (
    <div className="flex flex-col gap-8 rounded-2xl bg-sidebar p-5">
      <div>
        <h2 className="text-lg leading-4 font-bold text-foreground">Coleções</h2>
        <ul className="mt-4 flex flex-col">
          <li>
            <button
              type="button"
              onClick={() => onCategoryChange(undefined)}
              className={cn(filterRowClasses, !search.category && 'text-primary')}
            >
              Todas as coleções
            </button>
          </li>
          {catalogCategories.map((category) => (
            <li key={category.value}>
              <button
                type="button"
                onClick={() => onCategoryChange(category.value)}
                className={cn(
                  filterRowClasses,
                  search.category === category.value && 'text-primary',
                )}
              >
                <span>{category.label}</span>
                <span>({categoryCounts[category.value] ?? 0})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-lg leading-4 font-bold text-foreground">Faixa de preço</h2>
        <Slider
          value={range}
          min={catalogPriceBounds.min}
          max={catalogPriceBounds.max}
          step={0.01}
          className="mt-4"
          onValueChange={(value) => setRange([value[0] ?? range[0], value[1] ?? range[1]])}
        />
        <p className="mt-3 text-sm text-muted-foreground">
          Preço: {range[0].toFixed(2)} - {range[1].toFixed(2)} ETH
        </p>
        <Button
          type="button"
          size="sm"
          className="mt-3"
          onClick={() => onPriceRangeApply(String(range[0]), String(range[1]))}
        >
          Aplicar
        </Button>
      </div>

      <div>
        <h2 className="text-lg leading-4 font-bold text-foreground">Rede</h2>
        <ul className="mt-4 flex flex-col">
          {networks.map((network) => (
            <li key={network.label}>
              <button
                type="button"
                onClick={() => notImplementedToast(`Filtro por rede ${network.label}`)}
                className={filterRowClasses}
              >
                <span>{network.label}</span>
                <span>({network.count})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
