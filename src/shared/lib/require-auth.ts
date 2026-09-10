import { redirect } from '@tanstack/react-router'

import { authModalStore } from '@/features/auth'
import { sessionStore } from '@/shared/stores/session-store'

export function requireAuth(): void {
  if (!sessionStore.getState().user) {
    authModalStore.getState().open('login')
    throw redirect({ to: '/' })
  }
}
