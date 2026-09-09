import { delay, HttpResponse, http } from 'msw'
import type { CatalogPage, NftSummary } from '@/features/catalog/model/nft'
import { getUserIdFromRequest } from '@/mocks/auth'
import { db } from '@/mocks/db'
import { getScenario } from '@/mocks/scenarios'

const PAGE_SIZE = 9

export const catalogHandlers = [
  http.get('/api/nfts', async ({ request }) => {
    const scenario = getScenario()

    if (scenario === 'error') {
      return HttpResponse.json({ message: 'Falha ao carregar o catálogo' }, { status: 500 })
    }
    if (scenario === 'latency') {
      await delay(1200 + Math.random() * 1200)
    }
    const categoryCounts = countByCategory()

    if (scenario === 'empty') {
      const emptyPage: CatalogPage = {
        items: [],
        page: 1,
        pageSize: PAGE_SIZE,
        totalItems: 0,
        totalPages: 1,
        categoryCounts,
      }
      return HttpResponse.json(emptyPage)
    }

    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.toLowerCase()
    const category = url.searchParams.get('category')
    const sort = url.searchParams.get('sort') ?? 'relevance'
    const page = Number(url.searchParams.get('page') ?? '1')
    const minPrice = url.searchParams.get('minPrice')
    const maxPrice = url.searchParams.get('maxPrice')

    let nfts = db.nft.getAll()
    if (q) nfts = nfts.filter((nft) => nft.title.toLowerCase().includes(q))
    if (category) nfts = nfts.filter((nft) => nft.category === category)

    let withEditions = nfts.map((nft) => ({
      nft,
      edition: db.edition.findFirst({ where: { nftId: { equals: nft.id } } }),
    }))

    if (minPrice) {
      withEditions = withEditions.filter(
        (entry) => Number(entry.edition?.priceEth ?? 0) >= Number(minPrice),
      )
    }
    if (maxPrice) {
      withEditions = withEditions.filter(
        (entry) => Number(entry.edition?.priceEth ?? 0) <= Number(maxPrice),
      )
    }

    withEditions.sort((a, b) => {
      const primary = (() => {
        switch (sort) {
          case 'price_asc':
            return Number(a.edition?.priceEth ?? 0) - Number(b.edition?.priceEth ?? 0)
          case 'price_desc':
            return Number(b.edition?.priceEth ?? 0) - Number(a.edition?.priceEth ?? 0)
          case 'recent':
            return new Date(b.nft.createdAt).getTime() - new Date(a.nft.createdAt).getTime()
          default:
            return 0
        }
      })()
      return primary !== 0 ? primary : Number(a.nft.id.slice(4)) - Number(b.nft.id.slice(4))
    })

    const totalItems = withEditions.length
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
    const start = (page - 1) * PAGE_SIZE
    const pageEntries = withEditions.slice(start, start + PAGE_SIZE)

    const userId = getUserIdFromRequest(request)
    const favoriteIds = new Set(
      userId
        ? db.favorite
            .findMany({ where: { userId: { equals: userId } } })
            .map((favorite) => favorite.nftId)
        : [],
    )

    const items: NftSummary[] = pageEntries
      .filter((entry): entry is typeof entry & { edition: NonNullable<typeof entry.edition> } =>
        Boolean(entry.edition),
      )
      .map(({ nft, edition }) => ({
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
        isFavorite: favoriteIds.has(nft.id),
      }))

    const response: CatalogPage = {
      items,
      page,
      pageSize: PAGE_SIZE,
      totalItems,
      totalPages,
      categoryCounts,
    }
    return HttpResponse.json(response)
  }),
]

function countByCategory(): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const nft of db.nft.getAll()) {
    counts[nft.category] = (counts[nft.category] ?? 0) + 1
  }
  return counts
}
