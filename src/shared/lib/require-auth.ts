import { redirect } from '@tanstack/react-router'

import { authModalStore } from '@/features/auth'
import { sessionStore } from '@/shared/stores/session-store'

/** Shared `beforeLoad` guard for routes that require a session — opens the login modal and sends the visitor home instead of rendering. */
export function requireAuth(): void {
  if (!sessionStore.getState().user) {
    authModalStore.getState().open('login')
    throw redirect({ to: '/' })
  }
}
