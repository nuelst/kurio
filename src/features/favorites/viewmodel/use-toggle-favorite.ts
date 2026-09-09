import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CatalogPage } from '@/features/catalog/model/nft'
import { addFavorite, removeFavorite } from '@/features/favorites/api/favorites-api'

interface ToggleFavoriteInput {
  nftId: string
  isFavorite: boolean
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nftId, isFavorite }: ToggleFavoriteInput) =>
      isFavorite ? removeFavorite(nftId) : addFavorite(nftId),
    onMutate: async ({ nftId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ['catalog'] })

      const previousQueries = queryClient.getQueriesData<CatalogPage>({
        queryKey: ['catalog'],
      })

      queryClient.setQueriesData<CatalogPage>({ queryKey: ['catalog'] }, (page) =>
        page === undefined
          ? page
          : {
              ...page,
              items: page.items.map((item) =>
                item.id === nftId ? { ...item, isFavorite: !isFavorite } : item,
              ),
            },
      )

      return { previousQueries }
    },
    onError: (_error, _input, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
    },
  })
}
