import { createFileRoute } from '@tanstack/react-router'

import { CartView, useCartViewModel } from '@/features/cart'

export const Route = createFileRoute('/cart')({
  component: CartRoute,
})

function CartRoute() {
  const viewModel = useCartViewModel()
  return <CartView {...viewModel} />
}
