import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { orderQueries } from '@/features/checkout/api/checkout-queries'
import type { OrderUpdatedEvent } from '@/features/checkout/model/checkout'
import { createEventVersionTracker } from '@/shared/lib/realtime-event'
import { getSocket } from '@/shared/lib/socket'

export function useOrderViewModel(orderId: string) {
  const queryClient = useQueryClient()
  const query = useQuery(orderQueries.detail(orderId))

  useEffect(() => {
    const socket = getSocket()
    const tracker = createEventVersionTracker()

    function handleOrderUpdated(event: OrderUpdatedEvent) {
      if (event.data.orderId !== orderId) return
      if (!tracker.accept(event)) return
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    }

    socket.on('order.updated', handleOrderUpdated)
    return () => {
      socket.off('order.updated', handleOrderUpdated)
    }
  }, [orderId, queryClient])

  return {
    order: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
