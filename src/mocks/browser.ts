import { setupWorker } from 'msw/browser'

import { handlers } from '@/mocks/handlers'
import { seedDb } from '@/mocks/seed'

export const worker = setupWorker(...handlers)

export async function enableMocking(): Promise<void> {
  await seedDb()
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  })
}
