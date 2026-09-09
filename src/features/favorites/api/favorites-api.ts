import { http } from '@/shared/lib/http'

export async function fetchFavoriteIds(signal?: AbortSignal): Promise<string[]> {
  const { data } = await http.get<{ nftId: string }[]>('/favorites', { signal })
  return data.map((favorite) => favorite.nftId)
}

export async function addFavorite(nftId: string): Promise<void> {
  await http.post('/favorites', { nftId })
}

export async function removeFavorite(nftId: string): Promise<void> {
  await http.delete(`/favorites/${nftId}`)
}
