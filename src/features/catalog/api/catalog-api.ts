import type { CatalogPage, CatalogSearch } from '@/features/catalog/model/nft'
import { http } from '@/shared/lib/http'

export async function fetchCatalog(
  search: CatalogSearch,
  signal?: AbortSignal,
): Promise<CatalogPage> {
  const { data } = await http.get<CatalogPage>('/nfts', { params: search, signal })
  return data
}
