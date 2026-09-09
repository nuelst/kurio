import type { NftDetail } from '@/features/nft-detail/model/nft-detail'
import { http } from '@/shared/lib/http'

export async function fetchNftDetail(id: string, signal?: AbortSignal): Promise<NftDetail> {
  const { data } = await http.get<NftDetail>(`/nfts/${id}`, { signal })
  return data
}
