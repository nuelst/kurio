import { z } from 'zod'

export const catalogSortOptions = ['relevance', 'price_asc', 'price_desc', 'recent'] as const
export type CatalogSort = (typeof catalogSortOptions)[number]
export const catalogSearchSchema = z.object({
  q: z.string().trim().min(1).optional().catch(undefined),
  category: z.string().min(1).optional().catch(undefined),
  sort: z.enum(catalogSortOptions).optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(undefined),
  minPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .optional()
    .catch(undefined),
  maxPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .optional()
    .catch(undefined),
})

export type CatalogSearchInput = z.infer<typeof catalogSearchSchema>
export type CatalogSearch = Required<Pick<CatalogSearchInput, 'sort' | 'page'>> &
  Pick<CatalogSearchInput, 'q' | 'category' | 'minPrice' | 'maxPrice'>

export const defaultCatalogSearch: CatalogSearch = {
  sort: 'relevance',
  page: 1,
}

export function resolveCatalogSearch(input: CatalogSearchInput): CatalogSearch {
  return {
    q: input.q,
    category: input.category,
    sort: input.sort ?? defaultCatalogSearch.sort,
    page: input.page ?? defaultCatalogSearch.page,
    minPrice: input.minPrice,
    maxPrice: input.maxPrice,
  }
}

export const catalogPriceBounds = { min: 0, max: 12.3 } as const

export interface NftEdition {
  id: string
  priceEth: string
  totalSupply: number
  available: number
  version: number
}

export interface NftSummary {
  id: string
  title: string
  imageUrl: string
  category: string
  creatorName: string
  edition: NftEdition
  isFavorite: boolean
}

export interface CatalogPage {
  items: NftSummary[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  categoryCounts: Record<string, number>
}

export interface NftUpdatedEvent {
  id: string
  resource: 'nft'
  version: number
  data: {
    nftId: string
    editionId: string
    priceEth: string
    available: number
  }
}
