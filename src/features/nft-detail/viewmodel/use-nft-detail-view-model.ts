import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { catalogQueries } from '@/features/catalog/api/catalog-queries'
import type { NftSummary } from '@/features/catalog/model/nft'
import { useToggleFavorite } from '@/features/favorites/viewmodel/use-toggle-favorite'
import { nftDetailQueries } from '@/features/nft-detail/api/nft-detail-queries'
import { notImplementedToast } from '@/shared/lib/not-implemented'

export type NftDetailTab = 'details' | 'reviews'

const RELATED_LIMIT = 10

export function useNftDetailViewModel(nftId: string) {
  const query = useQuery(nftDetailQueries.detail(nftId))
  const toggleFavorite = useToggleFavorite()

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<NftDetailTab>('details')

  const nft = query.data
  const available = nft?.edition.available ?? 0

  useEffect(() => {
    setQuantity((current) => Math.min(current, Math.max(available, 1)))
  }, [available])

  const relatedQuery = useQuery({
    ...catalogQueries.list({ sort: 'relevance', page: 1, category: nft?.category }),
    enabled: Boolean(nft),
  })
  const relatedItems = (relatedQuery.data?.items ?? [])
    .filter((item) => item.id !== nftId)
    .slice(0, RELATED_LIMIT)

  function incrementQuantity() {
    setQuantity((current) => Math.min(current + 1, Math.max(available, 1)))
  }

  function decrementQuantity() {
    setQuantity((current) => Math.max(1, current - 1))
  }

  function toggleFavoriteFor(item: NftSummary) {
    toggleFavorite.mutate({ nftId: item.id, isFavorite: item.isFavorite })
  }

  function buy() {
    notImplementedToast('Compra')
  }

  function shareOn(channel: 'twitter' | 'linkedin' | 'email') {
    const url = window.location.href
    const text = nft ? `Confira ${nft.title} na Kurio` : 'Confira este NFT na Kurio'
    const targets: Record<typeof channel, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
    }
    if (channel === 'email') {
      window.location.href = targets.email
    } else {
      window.open(targets[channel], '_blank', 'noopener,noreferrer')
    }
  }

  return {
    nft,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    selectedImageIndex,
    setSelectedImageIndex,
    quantity,
    incrementQuantity,
    decrementQuantity,
    activeTab,
    setActiveTab,
    toggleFavoriteFor,
    buy,
    shareOn,
    relatedItems,
    isRelatedLoading: relatedQuery.isLoading,
  }
}
