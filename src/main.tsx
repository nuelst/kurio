import robotoMonoLatinWoff2 from '@fontsource-variable/roboto-mono/files/roboto-mono-latin-wght-normal.woff2?url'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/globals.css'

function preloadPrimaryFont() {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'font'
  link.type = 'font/woff2'
  link.href = robotoMonoLatinWoff2
  link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
}

async function bootstrap() {
  preloadPrimaryFont()

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
