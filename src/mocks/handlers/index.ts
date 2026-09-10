import { authHandlers } from '@/mocks/handlers/auth-handlers'
import { cartHandlers } from '@/mocks/handlers/cart-handlers'
import { catalogHandlers } from '@/mocks/handlers/catalog-handlers'
import { favoritesHandlers } from '@/mocks/handlers/favorites-handlers'
import { nftDetailHandlers } from '@/mocks/handlers/nft-detail-handlers'
import { ordersHandlers } from '@/mocks/handlers/orders-handlers'
import { profileHandlers } from '@/mocks/handlers/profile-handlers'
import { walletsHandlers } from '@/mocks/handlers/wallets-handlers'

// socketHandlers (src/mocks/socket/socket-handlers.ts) is intentionally not
// included here — it pulls in @mswjs/socket.io-binding, which isn't needed for
// the very first REST response, so `enableMocking()` registers it separately in
// the background instead of putting it on the critical path to first paint.
export const handlers = [
  ...authHandlers,
  ...catalogHandlers,
  ...nftDetailHandlers,
  ...favoritesHandlers,
  ...cartHandlers,
  ...profileHandlers,
  ...walletsHandlers,
  ...ordersHandlers,
]
