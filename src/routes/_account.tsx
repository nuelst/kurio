import { createFileRoute, Outlet } from '@tanstack/react-router'

import { AccountSidebar } from '@/app/layout/account-sidebar'
import { requireAuth } from '@/shared/lib/require-auth'

export const Route = createFileRoute('/_account')({
  beforeLoad: requireAuth,
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
