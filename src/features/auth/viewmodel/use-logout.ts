import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { logout as logoutRequest } from '@/features/auth/api/auth-api'
import { resetSocket } from '@/shared/lib/socket'
import { sessionStore } from '@/shared/stores/session-store'

export function useLogout() {
  const queryClient = useQueryClient()

  return async function logout() {
    try {
      await logoutRequest()
    } catch {
      // Best-effort: the mock endpoint doesn't fail, but a client-side logout
      // should still clear local session state even if the request did.
    }
    sessionStore.getState().clear()
    resetSocket()
    queryClient.invalidateQueries({ queryKey: ['catalog'] })
    queryClient.invalidateQueries({ queryKey: ['cart'] })
    toast('Você saiu da sua conta.')
  }
}
