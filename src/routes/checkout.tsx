import { createFileRoute } from '@tanstack/react-router'

import { CheckoutView, useCheckoutViewModel } from '@/features/checkout'
import { requireAuth } from '@/shared/lib/require-auth'

export const Route = createFileRoute('/checkout')({
  beforeLoad: requireAuth,
  component: CheckoutRoute,
})

function CheckoutRoute() {
  const viewModel = useCheckoutViewModel()
  return <CheckoutView {...viewModel} />
}
