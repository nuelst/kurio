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

/**
 * Cache policy (documented per README section 4):
 * - Catalog/detail reads: short staleTime (real-time price/availability updates
 *   arrive via socket.io and patch the cache directly; polling would fight that).
 * - Session/account reads: no background retries on 401/403/404/409 — those are
 *   terminal for the current request and must surface immediately.
 * - Mutations: never retried automatically (checkout must stay idempotent via
 *   an explicit idempotency key, not client-side retries).
 */
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
