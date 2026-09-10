import { setupWorker } from 'msw/browser'
import {
  disconnectSocket,
  reconnectSocket,
  simulateNftUpdate,
  simulateSocketReconnect,
} from '@/mocks/dev-tools'
import { handlers } from '@/mocks/handlers'
import { seedDb } from '@/mocks/seed'

export const worker = setupWorker(...handlers)

declare global {
  interface Window {
    __mocks__?: {
      simulateNftUpdate: typeof simulateNftUpdate
      simulateSocketReconnect: typeof simulateSocketReconnect
      disconnectSocket: typeof disconnectSocket
      reconnectSocket: typeof reconnectSocket
    }
  }
}

export async function enableMocking(): Promise<void> {
  await seedDb()
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: '/mockServiceWorker.js' },
  })
  window.__mocks__ = {
    simulateNftUpdate,
    simulateSocketReconnect,
    disconnectSocket,
    reconnectSocket,
  }
}
