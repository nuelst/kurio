import { OrderConfirmedCard } from '@/features/orders/ui/order-confirmed-card'
import { OrderDeclinedCard } from '@/features/orders/ui/order-declined-card'
import { OrderNotFound } from '@/features/orders/ui/order-not-found'
import { OrderSkeleton } from '@/features/orders/ui/order-skeleton'
import type { useOrderViewModel } from '@/features/orders/viewmodel/use-order-view-model'
import { ErrorState } from '@/shared/ui/error-state'

type OrderViewModel = ReturnType<typeof useOrderViewModel>

export function OrderView({ order, isLoading, isError, error, refetch }: OrderViewModel) {
  return (
    <section className="mx-auto max-w-page px-4 py-12 sm:px-6">
      {isLoading ? <OrderSkeleton /> : null}

      {!isLoading && isError && error?.status === 404 ? <OrderNotFound /> : null}

      {!isLoading && isError && error?.status !== 404 ? (
        <ErrorState
          title="Não foi possível carregar este pedido"
          description={error?.message}
          onRetry={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError && order?.status === 'confirmed' ? (
        <OrderConfirmedCard snapshot={order.snapshot} />
      ) : null}

      {!isLoading && !isError && order?.status === 'declined' ? <OrderDeclinedCard /> : null}
    </section>
  )
}
