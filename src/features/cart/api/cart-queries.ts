import { queryOptions } from '@tanstack/react-query'

import { fetchCart } from '@/features/cart/api/cart-api'

export const cartQueries = {
  get: () =>
    queryOptions({
      queryKey: ['cart'],
      queryFn: fetchCart,
    }),
}
