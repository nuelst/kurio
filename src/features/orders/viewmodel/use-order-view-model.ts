import { useQuery } from '@tanstack/react-query'

import { orderQueries } from '@/features/checkout/api/checkout-queries'

export function useOrderViewModel(orderId: string) {
  const query = useQuery(orderQueries.detail(orderId))

  return {
    order: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
