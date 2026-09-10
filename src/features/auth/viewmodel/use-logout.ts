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
      // ...
    }
    sessionStore.getState().clear()
    resetSocket()
    queryClient.clear()
    toast('Você saiu da sua conta.')
  }
}
