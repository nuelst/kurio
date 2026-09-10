import { useEffect } from 'react'

import { authModalStore } from '@/features/auth'
import { sessionStore } from '@/shared/stores/session-store'

// a 401 anywhere sets sessionStore.isExpired (shared/lib/http.ts). Reacting to it here — instead
// of redirecting or unmounting the current route — is what lets a screen like checkout keep its
// filled-in form/selection intact: the user only needs to log back in, not start over.
export function useSessionExpiryModal(): void {
  const isExpired = sessionStore((state) => state.isExpired)

  useEffect(() => {
    if (isExpired) {
      authModalStore.getState().open('login')
    }
  }, [isExpired])
}
