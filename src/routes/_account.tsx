import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { AccountSidebar } from '@/app/layout/account-sidebar'
import { authModalStore } from '@/features/auth'
import { sessionStore } from '@/shared/stores/session-store'

export const Route = createFileRoute('/_account')({
  beforeLoad: () => {
    if (!sessionStore.getState().user) {
      authModalStore.getState().open('login')
      throw redirect({ to: '/' })
    }
  },
  component: AccountLayout,
})

function AccountLayout() {
  return (
    <section className="mx-auto flex max-w-page flex-col gap-10 px-4 py-8 sm:px-6 lg:flex-row">
      <AccountSidebar />
      <Outlet />
    </section>
  )
}
