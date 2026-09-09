import type { NftSummary } from '@/features/catalog/model/nft'

export type EditionTier = '1/1' | '1/10' | '1/50' | 'Aberta'

export interface NftReview {
  id: string
  authorName: string
  rating: number
  comment: string
}

export interface NftDetail extends NftSummary {
  tokenNumber: string
  summary: string
  description: string
  gallery: string[]
  attributes: string[]
  collectionName: string
  editionTier: EditionTier
  network: string
  contractAddress: string
  royaltyPercent: number
  rating: number
  reviewCount: number
  reviews: NftReview[]
}
