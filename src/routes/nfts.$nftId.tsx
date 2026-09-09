import { createFileRoute } from '@tanstack/react-router'

import { NftDetailView, useNftDetailViewModel } from '@/features/nft-detail'

export const Route = createFileRoute('/nfts/$nftId')({
  component: NftDetailRoute,
})

function NftDetailRoute() {
  const { nftId } = Route.useParams()
  return <NftDetailPage key={nftId} nftId={nftId} />
}

function NftDetailPage({ nftId }: { nftId: string }) {
  const viewModel = useNftDetailViewModel(nftId)
  return <NftDetailView {...viewModel} />
}
