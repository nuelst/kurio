import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { catalogQueries } from '@/features/catalog/api/catalog-queries'
import type {
  CatalogPage,
  CatalogSearch,
  CatalogSort,
  NftSummary,
  NftUpdatedEvent,
} from '@/features/catalog/model/nft'
import { useToggleFavorite } from '@/features/favorites/viewmodel/use-toggle-favorite'
import { createEventVersionTracker } from '@/shared/lib/realtime-event'
import { getSocket } from '@/shared/lib/socket'

export interface CatalogViewModelParams {
  search: CatalogSearch
  onSearchChange: (
    updater: (previous: CatalogSearch) => CatalogSearch,
    options?: { replace?: boolean },
  ) => void
}

export function useCatalogViewModel({ search, onSearchChange }: CatalogViewModelParams) {
  const queryClient = useQueryClient()

  const query = useQuery({
    ...catalogQueries.list(search),
    placeholderData: keepPreviousData,
  })

  const toggleFavorite = useToggleFavorite()

  useEffect(() => {
    const socket = getSocket()
    const tracker = createEventVersionTracker()

    function handleNftUpdated(event: NftUpdatedEvent) {
      if (!tracker.accept(event)) return

      queryClient.setQueriesData<CatalogPage>({ queryKey: ['catalog'] }, (page) => {
        if (!page) return page
        return {
          ...page,
          items: page.items.map((item) =>
            item.id === event.data.nftId
              ? {
                  ...item,
                  edition: {
                    ...item.edition,
                    priceEth: event.data.priceEth,
                    available: event.data.available,
                    version: event.version,
                  },
                }
              : item,
          ),
        }
      })
    }

    socket.on('nft.updated', handleNftUpdated)
    return () => {
      socket.off('nft.updated', handleNftUpdated)
    }
  }, [queryClient])

  function setSearchText(q: string) {
    onSearchChange((previous) => ({ ...previous, q: q.trim() || undefined, page: 1 }), {
      replace: true,
    })
  }

  function setCategory(category: string | undefined) {
    onSearchChange((previous) => ({ ...previous, category, page: 1 }))
  }

  function setSort(sort: CatalogSort) {
    onSearchChange((previous) => ({ ...previous, sort, page: 1 }))
  }

  function setPage(page: number) {
    onSearchChange((previous) => ({ ...previous, page }))
  }

  function setPriceRange(minPrice: string | undefined, maxPrice: string | undefined) {
    onSearchChange((previous) => ({ ...previous, minPrice, maxPrice, page: 1 }))
  }

  function toggleFavoriteFor(item: NftSummary) {
    toggleFavorite.mutate({ nftId: item.id, isFavorite: item.isFavorite })
  }

  return {
    search,
    page: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    setSearchText,
    setCategory,
    setSort,
    setPage,
    setPriceRange,
    toggleFavoriteFor,
  }
}
