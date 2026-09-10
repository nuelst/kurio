import type { NftUpdatedEvent } from '@/features/catalog/model/nft'
import { revokeSession } from '@/mocks/auth'
import { db, persistDb } from '@/mocks/db'
import { broadcastNftUpdated } from '@/mocks/socket/socket-handlers'

export function simulateNftUpdate(
  nftId: string,
  changes: { priceEth?: string; available?: number },
): void {
  const edition = db.edition.findFirst({ where: { nftId: { equals: nftId } } })
  if (!edition) return

  const priceEth = changes.priceEth ?? edition.priceEth
  const available = changes.available ?? edition.available
  const version = edition.updatedVersion + 1

  db.edition.update({
    where: { id: { equals: edition.id } },
    data: { priceEth, available, updatedVersion: version },
  })
  persistDb()

  const event: NftUpdatedEvent = {
    id: nftId,
    resource: 'nft',
    version,
    data: { nftId, editionId: edition.id, priceEth, available },
  }
  broadcastNftUpdated(event)
}

export function expireSession(userId: string): void {
  revokeSession(userId)
}

async function getSocket() {
  const { getSocket: get } = await import('@/shared/lib/socket')
  return get()
}

export async function simulateSocketReconnect(): Promise<void> {
  const socket = await getSocket()
  socket.disconnect()
  socket.connect()
}

export async function disconnectSocket(): Promise<void> {
  const socket = await getSocket()
  socket.disconnect()
}

export async function reconnectSocket(): Promise<void> {
  const socket = await getSocket()
  socket.connect()
}
