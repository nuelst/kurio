import type { NftUpdatedEvent } from '@/features/catalog/model/nft'
import { db, persistDb } from '@/mocks/db'
import { broadcastNftUpdated } from '@/mocks/socket/socket-handlers'

/**
 * Demo/test-only hook exposed on `window.__mocks__` (see `enableMocking`). Lets DevTools or
 * Playwright simulate the "price/availability changes while the cart/catalog is open" scenario
 * from section 7 of the challenge — it mutates the mock db (so REST refetches stay consistent)
 * and broadcasts the same `nft.updated` event real reconciliation would receive.
 */
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
