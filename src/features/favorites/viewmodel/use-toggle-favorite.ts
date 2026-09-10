import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import type { CatalogPage } from '@/features/catalog/model/nft'
import { addFavorite, removeFavorite } from '@/features/favorites/api/favorites-api'
import type { NftDetail } from '@/features/nft-detail/model/nft-detail'

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
      await queryClient.cancelQueries({ queryKey: ['nft-detail', nftId] })

      const previousQueries = queryClient.getQueriesData<CatalogPage>({
        queryKey: ['catalog'],
      })
      const previousDetail = queryClient.getQueryData<NftDetail>(['nft-detail', nftId])

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
      queryClient.setQueryData<NftDetail>(['nft-detail', nftId], (detail) =>
        detail === undefined ? detail : { ...detail, isFavorite: !isFavorite },
      )

      return { previousQueries, previousDetail, nftId }
    },
    onError: (error, _input, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
      if (context) {
        queryClient.setQueryData(['nft-detail', context.nftId], context.previousDetail)
      }
      toast('Não foi possível favoritar', { description: error.message })
    },
    onSettled: (_data, _error, { nftId }) => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
      queryClient.invalidateQueries({ queryKey: ['nft-detail', nftId] })
    },
  })
}
