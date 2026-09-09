import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CatalogSort } from '@/features/catalog/model/nft'

const tabs = [
  { value: 'all', label: 'Todos os NFTs', sort: 'relevance' as const },
  { value: 'new', label: 'Novos lançamentos', sort: 'recent' as const },
  { value: 'trending', label: 'Em alta', sort: 'price_desc' as const },
]

const sortLabels: Record<CatalogSort, string> = {
  relevance: 'Listados recentemente',
  price_asc: 'Menor preço',
  price_desc: 'Maior preço',
  recent: 'Mais recentes',
}

interface CatalogToolbarProps {
  sort: CatalogSort
  onSortChange: (sort: CatalogSort) => void
}

export function CatalogToolbar({ sort, onSortChange }: CatalogToolbarProps) {
  const activeTab = tabs.find((tab) => tab.sort === sort)?.value ?? 'all'

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          const tab = tabs.find((item) => item.value === value)
          if (tab) onSortChange(tab.sort)
        }}
      >
        <TabsList className="gap-6 bg-transparent p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:border-b-primary data-[state=active]:text-primary rounded-none border-b-2 border-transparent bg-transparent px-0 pb-2 text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Ordenar por:</span>
        <Select value={sort} onValueChange={(value) => onSortChange(value as CatalogSort)}>
          <SelectTrigger aria-label="Ordenar por" className="w-auto border-none shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sortLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
