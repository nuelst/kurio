import { createRootRoute, Outlet } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useState } from 'react'

import { MobileTabBar } from '@/app/layout/mobile-tab-bar'
import { SiteFooter } from '@/app/layout/site-footer'
import { SiteHeader } from '@/app/layout/site-header'
import { authModalStore } from '@/features/auth'
import { useSessionExpiryModal } from '@/shared/hooks/use-session-expiry-modal'
import { useSocketReconnectReconciliation } from '@/shared/hooks/use-socket-reconnect-reconciliation'
import { NotFound } from '@/shared/ui/not-found'

const AuthModal = lazy(() =>
  import('@/features/auth/ui/auth-modal').then((module) => ({ default: module.AuthModal })),
)

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

function RootLayout() {
  useSocketReconnectReconciliation()
  useSessionExpiryModal()

  const isAuthModalOpen = authModalStore((state) => state.isOpen)
  const [shouldRenderAuthModal, setShouldRenderAuthModal] = useState(false)
  useEffect(() => {
    if (isAuthModalOpen) setShouldRenderAuthModal(true)
  }, [isAuthModalOpen])

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="bg-background text-foreground focus:ring-ring sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:ring-2 focus:outline-none"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
      <div className="h-[95px] md:hidden" aria-hidden="true" />
      {shouldRenderAuthModal ? (
        <Suspense fallback={null}>
          <AuthModal />
        </Suspense>
      ) : null}
      <MobileTabBar />
    </div>
  )
}
