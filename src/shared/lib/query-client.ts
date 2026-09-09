import { QueryClient } from '@tanstack/react-query'

import type { ApiError } from '@/shared/lib/http'

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError
  }
}

function isRetryableStatus(status: number | null) {
  return status === null || status >= 500
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (!isRetryableStatus(error.status)) return false
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})
