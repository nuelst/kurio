import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws } from 'msw'

import type { NftUpdatedEvent } from '@/features/catalog/model/nft'
import type { OrderUpdatedEvent } from '@/features/checkout/model/checkout'

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

export function broadcastOrderUpdated(event: OrderUpdatedEvent): void {
  activeClients.forEach((client) => {
    client.emit('order.updated', event)
  })
}
