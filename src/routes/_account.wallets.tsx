import { createFileRoute } from '@tanstack/react-router'

import { useWalletsViewModel, WalletsView } from '@/features/wallets'

export const Route = createFileRoute('/_account/wallets')({
  component: WalletsRoute,
})

function WalletsRoute() {
  const viewModel = useWalletsViewModel()
  return <WalletsView {...viewModel} />
}
