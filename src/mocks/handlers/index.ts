import { authHandlers } from '@/mocks/handlers/auth-handlers'
import { cartHandlers } from '@/mocks/handlers/cart-handlers'
import { catalogHandlers } from '@/mocks/handlers/catalog-handlers'
import { favoritesHandlers } from '@/mocks/handlers/favorites-handlers'
import { nftDetailHandlers } from '@/mocks/handlers/nft-detail-handlers'
import { ordersHandlers } from '@/mocks/handlers/orders-handlers'
import { profileHandlers } from '@/mocks/handlers/profile-handlers'
import { walletsHandlers } from '@/mocks/handlers/wallets-handlers'
import { socketHandlers } from '@/mocks/socket/socket-handlers'

export const handlers = [
  ...authHandlers,
  ...catalogHandlers,
  ...nftDetailHandlers,
  ...favoritesHandlers,
  ...cartHandlers,
  ...profileHandlers,
  ...walletsHandlers,
  ...ordersHandlers,
  ...socketHandlers,
]
