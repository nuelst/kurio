import { queryOptions } from '@tanstack/react-query'

import { fetchOrder } from '@/features/checkout/api/checkout-api'

export const orderQueries = {
  detail: (orderId: string) =>
    queryOptions({
      queryKey: ['order', orderId],
      queryFn: () => fetchOrder(orderId),
      retry: (count, error) => error.status !== 404 && count < 2,
      refetchInterval: (query) => (query.state.data?.status === 'pending' ? 800 : false),
    }),
}
