import { createFileRoute } from '@tanstack/react-router'

import { OrderView, useOrderViewModel } from '@/features/orders'
import { requireAuth } from '@/shared/lib/require-auth'

export const Route = createFileRoute('/orders/$orderId')({
  beforeLoad: requireAuth,
  component: OrderRoute,
})

function OrderRoute() {
  const { orderId } = Route.useParams()
  const viewModel = useOrderViewModel(orderId)
  return <OrderView {...viewModel} />
}
