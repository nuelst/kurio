import { useQuery } from '@tanstack/react-query'

import { cartQueries } from '@/features/cart/api/cart-queries'

export function useCartItemCount(): number {
  const { data } = useQuery({
    ...cartQueries.get(),
    select: (quote) => quote.items.reduce((total, item) => total + item.quantity, 0),
  })
  return data ?? 0
}
