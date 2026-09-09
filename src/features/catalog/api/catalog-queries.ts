import { queryOptions } from '@tanstack/react-query'

import { fetchCatalog } from '@/features/catalog/api/catalog-api'
import type { CatalogSearch } from '@/features/catalog/model/nft'

export const catalogQueries = {
  list: (search: CatalogSearch) =>
    queryOptions({
      queryKey: ['catalog', 'list', search] as const,
      queryFn: ({ signal }) => fetchCatalog(search, signal),
    }),
}
