import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws } from 'msw'

import type { NftUpdatedEvent } from '@/features/catalog/model/nft'

const realtime = ws.link('*/socket.io/*')

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
