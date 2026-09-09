import type { NftSummary } from '@/features/catalog/model/nft'

interface NftRecord {
  id: string
  title: string
  imageUrl: string
  category: string
  creatorName: string
}

interface EditionRecord {
  id: string
  priceEth: string
  totalSupply: number
  available: number
  updatedVersion: number
}

export function toNftSummary(
  nft: NftRecord,
  edition: EditionRecord,
  isFavorite: boolean,
): NftSummary {
  return {
    id: nft.id,
    title: nft.title,
    imageUrl: nft.imageUrl,
    category: nft.category,
    creatorName: nft.creatorName,
    edition: {
      id: edition.id,
      priceEth: edition.priceEth,
      totalSupply: edition.totalSupply,
      available: edition.available,
      version: edition.updatedVersion,
    },
    isFavorite,
  }
}
