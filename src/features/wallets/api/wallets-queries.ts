import { queryOptions } from '@tanstack/react-query'

import { fetchWallets } from '@/features/wallets/api/wallets-api'

export const walletsQueries = {
  get: () =>
    queryOptions({
      queryKey: ['wallets'],
      queryFn: fetchWallets,
    }),
}
