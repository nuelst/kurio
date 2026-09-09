import { queryOptions } from '@tanstack/react-query'
import { fetchNftDetail } from '@/features/nft-detail/api/nft-detail-api'

export const nftDetailQueries = {
  detail: (id: string) =>
    queryOptions({
      queryKey: ['nft-detail', id] as const,
      queryFn: ({ signal }) => fetchNftDetail(id, signal),
      retry: (failureCount, error) => error.status !== 404 && failureCount < 2,
    }),
}
