import { delay, HttpResponse, http } from 'msw'
import type { NftDetail, NftReview } from '@/features/nft-detail/model/nft-detail'
import { getUserIdFromRequest } from '@/mocks/auth'
import { db } from '@/mocks/db'
import { nftArtworks } from '@/mocks/fixtures/nft-artworks'
import { tokenNumberFor, toNftSummary } from '@/mocks/handlers/nft-mapper'
import { getScenario } from '@/mocks/scenarios'

const accessories = ['Óculos', 'Chapéu', 'Fone de ouvido', 'Colar', 'Boné', 'Jaqueta']
const materials = ['Esmeralda', 'Ouro', 'Prata', 'Ônix', 'Safira', 'Jade']
const rarities = ['Comum', 'Raro', 'Épico', 'Lendário']
const reviewers = ['Studio Nova', 'Aria Chen', 'Marco Reyes', 'Nadia Kobe', 'Pixel Union']
const reviewComments = [
  'Peça incrível, a qualidade da arte é impressionante de perto.',
  'Processo de compra tranquilo e a procedência ficou bem documentada.',
  'Virou uma das peças favoritas da minha coleção.',
  'Recomendo — atendimento do criador foi ótimo e a entrega foi rápida.',
]

function sequenceOf(nftId: string): number {
  return Number(nftId.slice(4))
}

function pick<T>(items: readonly T[], index: number): T {
  const value = items[index % items.length]
  if (value === undefined) throw new Error('pick() called with an empty array')
  return value
}

function editionTierFor(totalSupply: number): NftDetail['editionTier'] {
  if (totalSupply <= 1) return '1/1'
  if (totalSupply <= 10) return '1/10'
  if (totalSupply <= 50) return '1/50'
  return 'Aberta'
}

function buildReviews(seq: number, count: number): NftReview[] {
  return Array.from({ length: Math.min(count, 4) }, (_, index) => ({
    id: `review-${seq}-${index}`,
    authorName: pick(reviewers, seq + index),
    rating: 4 + ((seq + index) % 2),
    comment: pick(reviewComments, seq + index),
  }))
}

export const nftDetailHandlers = [
  http.get('/api/nfts/:id', async ({ request, params }) => {
    const scenario = getScenario()
    if (scenario === 'error') {
      return HttpResponse.json({ message: 'Falha ao carregar o NFT.' }, { status: 500 })
    }
    if (scenario === 'latency') {
      await delay(1200 + Math.random() * 1200)
    }

    const id = params.id as string
    const nft = db.nft.findFirst({ where: { id: { equals: id } } })
    const edition = nft ? db.edition.findFirst({ where: { nftId: { equals: id } } }) : null

    if (!nft || !edition) {
      return HttpResponse.json({ message: 'NFT não encontrado.' }, { status: 404 })
    }

    const userId = getUserIdFromRequest(request)
    const isFavorite = userId
      ? Boolean(
          db.favorite.findFirst({
            where: { userId: { equals: userId }, nftId: { equals: id } },
          }),
        )
      : false

    const seq = sequenceOf(id)
    const summary = toNftSummary(nft, edition, isFavorite)
    const attributes = [pick(accessories, seq), pick(materials, seq + 1), pick(rarities, seq + 2)]
    const tokenNumber = tokenNumberFor(id)
    const contractAddress = `0x${(seq * 104729).toString(16).padStart(8, '0')}...${tokenNumber}`
    const rating = 4 + (seq % 10) / 10
    const reviewCount = 5 + (seq % 40)

    const gallery = [nft.imageUrl, ...nftArtworks.filter((artwork) => artwork !== nft.imageUrl)]

    const detail: NftDetail = {
      ...summary,
      tokenNumber,
      summary: nft.description,
      description: `${nft.title} é uma obra digital ${editionTierFor(edition.totalSupply)} finalizada à mão da coleção Kurio Editions. Cada atributo fica armazenado nos metadados do token e verificado na Ethereum. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.\n\nA propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede. ${nft.creatorName} recebe 5% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.`,
      gallery,
      attributes,
      collectionName: 'Kurio Apes',
      editionTier: editionTierFor(edition.totalSupply),
      network: 'Ethereum',
      contractAddress,
      royaltyPercent: 5,
      rating,
      reviewCount,
      reviews: buildReviews(seq, 3),
    }

    return HttpResponse.json(detail)
  }),
]
