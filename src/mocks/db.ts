import { factory, primaryKey } from '@mswjs/data'

export const db = factory({
  user: {
    id: primaryKey(String),
    name: String,
    username: String,
    email: String,
    ensName: String,
    password: String,
    avatarUrl: String,
  },
  nft: {
    id: primaryKey(String),
    title: String,
    description: String,
    imageUrl: String,
    category: String,
    creatorName: String,
    createdAt: String,
  },
  edition: {
    id: primaryKey(String),
    nftId: String,
    priceEth: String,
    totalSupply: Number,
    available: Number,
    updatedVersion: Number,
  },
  favorite: {
    id: primaryKey(String),
    userId: String,
    nftId: String,
  },
  cartItem: {
    id: primaryKey(String),
    cartOwnerId: String,
    nftId: String,
    editionId: String,
    quantity: Number,
  },
  coupon: {
    id: primaryKey(String),
    code: String,
    discountPercent: Number,
    expiresAt: String,
  },
  cartCoupon: {
    id: primaryKey(String),
    code: String,
  },
  order: {
    id: primaryKey(String),
    userId: String,
    idempotencyKey: String,
    status: String,
    snapshot: String,
    createdAt: String,
  },
  wallet: {
    id: primaryKey(String),
    userId: String,
    label: String,
    address: String,
    network: String,
    type: String,
    ensName: String,
    isPrimary: Boolean,
  },
})

const STORAGE_KEY = 'nft-marketplace.mock-db'

function dump() {
  return {
    user: db.user.getAll(),
    nft: db.nft.getAll(),
    edition: db.edition.getAll(),
    favorite: db.favorite.getAll(),
    cartItem: db.cartItem.getAll(),
    coupon: db.coupon.getAll(),
    cartCoupon: db.cartCoupon.getAll(),
    order: db.order.getAll(),
    wallet: db.wallet.getAll(),
  }
}

export function persistDb() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dump()))
}

export function restoreDb(): boolean {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return false

  const snapshot = JSON.parse(raw) as ReturnType<typeof dump>
  snapshot.user.forEach((entity) => {
    db.user.create(entity)
  })
  snapshot.nft.forEach((entity) => {
    db.nft.create(entity)
  })
  snapshot.edition.forEach((entity) => {
    db.edition.create(entity)
  })
  snapshot.favorite.forEach((entity) => {
    db.favorite.create(entity)
  })
  snapshot.cartItem.forEach((entity) => {
    db.cartItem.create(entity)
  })
  snapshot.coupon.forEach((entity) => {
    db.coupon.create(entity)
  })
  snapshot.cartCoupon.forEach((entity) => {
    db.cartCoupon.create(entity)
  })
  snapshot.order.forEach((entity) => {
    db.order.create(entity)
  })
  snapshot.wallet.forEach((entity) => {
    db.wallet.create(entity)
  })
  return true
}

export function clearDb() {
  const snapshot = dump()
  snapshot.user.forEach((entity) => {
    db.user.delete({ where: { id: { equals: entity.id } } })
  })
  snapshot.nft.forEach((entity) => {
    db.nft.delete({ where: { id: { equals: entity.id } } })
  })
  snapshot.edition.forEach((entity) => {
    db.edition.delete({ where: { id: { equals: entity.id } } })
  })
  snapshot.favorite.forEach((entity) => {
    db.favorite.delete({ where: { id: { equals: entity.id } } })
  })
  snapshot.cartItem.forEach((entity) => {
    db.cartItem.delete({ where: { id: { equals: entity.id } } })
  })
  snapshot.coupon.forEach((entity) => {
    db.coupon.delete({ where: { id: { equals: entity.id } } })
  })
  snapshot.cartCoupon.forEach((entity) => {
    db.cartCoupon.delete({ where: { id: { equals: entity.id } } })
  })
  snapshot.order.forEach((entity) => {
    db.order.delete({ where: { id: { equals: entity.id } } })
  })
  snapshot.wallet.forEach((entity) => {
    db.wallet.delete({ where: { id: { equals: entity.id } } })
  })
  localStorage.removeItem(STORAGE_KEY)
}
