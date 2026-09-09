import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SessionUser {
  id: string
  name: string
  email: string
  avatarUrl: string
}

interface SessionState {
  accessToken: string | null
  user: SessionUser | null
  isExpired: boolean
  authenticate: (token: string, user: SessionUser) => void
  expire: () => void
  clear: () => void
}

export const sessionStore = create<SessionState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isExpired: false,
      authenticate: (accessToken, user) => set({ accessToken, user, isExpired: false }),
      expire: () => set({ isExpired: true }),
      clear: () => set({ accessToken: null, user: null, isExpired: false }),
    }),
    { name: 'nft-marketplace.session' },
  ),
)

export const useSession = sessionStore
