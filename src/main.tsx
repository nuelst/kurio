import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/globals.css'

async function bootstrap() {
  if (import.meta.env.VITE_ENABLE_MOCKS !== 'false') {
    const { enableMocking } = await import('@/mocks/browser')
    await enableMocking()
  }

  const [{ RouterProvider }, { AppProviders }, { router }] = await Promise.all([
    import('@tanstack/react-router'),
    import('@/app/providers/app-providers'),
    import('@/app/router'),
  ])

  const rootElement = document.getElementById('root')
  if (!rootElement) throw new Error('Root element (#root) not found')

  createRoot(rootElement).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  )
}

bootstrap()
