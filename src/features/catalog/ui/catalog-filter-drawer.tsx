import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import type { CatalogSearch } from '@/features/catalog/model/nft'
import { CatalogFilterGroups } from '@/features/catalog/ui/catalog-filter-groups'
import { FilterIcon } from '@/shared/ui/icons'

interface CatalogFilterDrawerProps {
  search: CatalogSearch
  categoryCounts: Record<string, number>
  onCategoryChange: (category: string | undefined) => void
  onPriceRangeApply: (minPrice: string | undefined, maxPrice: string | undefined) => void
}

export function CatalogFilterDrawer({
  search,
  categoryCounts,
  onCategoryChange,
  onPriceRangeApply,
}: CatalogFilterDrawerProps) {
  // controlado (não descontrolado) só pra poder fechar sozinho depois de escolher uma coleção
  // ou aplicar a faixa de preço — sem isso o drawer ficaria aberto cobrindo o resultado do
  // próprio filtro que acabou de ser aplicado.
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          type="button"
          size="icon"
          aria-label="Filtros"
          className="size-[45px] rounded-xl p-3 text-primary-foreground"
          style={{
            background: 'linear-gradient(137.05deg, rgba(210, 138, 76, 0.45) -24.6%, #D28A4C 100%)',
          }}
        >
          <FilterIcon className="size-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filtros</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-6">
          <CatalogFilterGroups
            search={search}
            categoryCounts={categoryCounts}
            onCategoryChange={(category) => {
              onCategoryChange(category)
              setOpen(false)
            }}
            onPriceRangeApply={(minPrice, maxPrice) => {
              onPriceRangeApply(minPrice, maxPrice)
              setOpen(false)
            }}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
