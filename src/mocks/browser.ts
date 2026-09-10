import {
  broadcastRawNftUpdate,
  disconnectSocket,
  expireSession,
  reconnectSocket,
  simulateNftUpdate,
  simulateSocketReconnect,
} from '@/mocks/dev-tools'
import { handlers } from '@/mocks/handlers'
import { seedDb } from '@/mocks/seed'
import { setupWorker } from 'msw/browser'

export const worker = setupWorker(...handlers)

declare global {
  interface Window {
    __mocks__?: {
      simulateNftUpdate: typeof simulateNftUpdate
      simulateSocketReconnect: typeof simulateSocketReconnect
      disconnectSocket: typeof disconnectSocket
      reconnectSocket: typeof reconnectSocket
      expireSession: typeof expireSession
      broadcastRawNftUpdate: typeof broadcastRawNftUpdate
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
    expireSession,
    broadcastRawNftUpdate,
  }
  const { socketHandlers } = await import('@/mocks/socket/socket-handlers')
  worker.use(...socketHandlers)
}
