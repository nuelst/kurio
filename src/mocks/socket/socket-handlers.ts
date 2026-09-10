import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws } from 'msw'

import type { NftUpdatedEvent } from '@/features/catalog/model/nft'

/**
 * MSW strips the leading `/socket.io/` segment from the client URL before matching
 * (native Socket.IO support), so the pattern must describe the path *without* it —
 * our client connects at the bare origin, so the remaining path is just `/`. A pattern
 * that still spells out the `/socket.io/` segment never matches, which silently falls
 * back to a real (and here, always failing) passthrough connection per the
 * `onUnhandledRequest: 'bypass'` policy — no console warning either.
 */
const realtime = ws.link('/')

type SocketIoClient = ReturnType<typeof toSocketIo>['client']

const activeClients = new Set<SocketIoClient>()

export const socketHandlers = [
  realtime.addEventListener('connection', (connection) => {
    const { client } = toSocketIo(connection)
    activeClients.add(client)

    connection.client.addEventListener('close', () => {
      activeClients.delete(client)
    })
  }),
]

export function broadcastNftUpdated(event: NftUpdatedEvent): void {
  activeClients.forEach((client) => {
    client.emit('nft.updated', event)
  })
}
