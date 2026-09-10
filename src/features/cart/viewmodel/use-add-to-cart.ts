import { useMutation, useQueryClient } from '@tanstack/react-query'

import { addCartItem } from '@/features/cart/api/cart-api'
import type { CartQuote } from '@/features/cart/model/cart'

interface AddToCartInput {
  nftId: string
  quantity: number
}

export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nftId, quantity }: AddToCartInput) => addCartItem(nftId, quantity),
    onSuccess: (quote) => {
      queryClient.setQueryData<CartQuote>(['cart'], quote)
    },
  })
}
