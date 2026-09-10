import { create } from 'zustand'

export type AuthModalMode = 'login' | 'signup'

interface AuthModalState {
  isOpen: boolean
  mode: AuthModalMode
  triggerElement: HTMLElement | null
  open: (mode?: AuthModalMode) => void
  close: () => void
  setMode: (mode: AuthModalMode) => void
}

export const authModalStore = create<AuthModalState>()((set, get) => ({
  isOpen: false,
  mode: 'login',
  triggerElement: null,
  // the modal is opened from plain buttons all over the app, not a Radix DialogTrigger, so Radix
  // has no element to return focus to on close — track whatever was focused right before opening
  // ourselves (see AuthModal's onCloseAutoFocus) so focus doesn't fall back to <body>.
  open: (mode = 'login') => {
    const active = document.activeElement
    set({
      isOpen: true,
      mode,
      triggerElement: active instanceof HTMLElement ? active : get().triggerElement,
    })
  },
  close: () => set({ isOpen: false }),
  setMode: (mode) => set({ mode }),
}))
