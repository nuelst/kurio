import { hashPassword } from '@/mocks/auth'
import { clearDb, db, persistDb, restoreDb } from '@/mocks/db'
import { nftArtworks } from '@/mocks/fixtures/nft-artworks'
import { placeholderImage } from '@/mocks/fixtures/placeholder-image'

/** Category sizes mirror the Figma sidebar counts (Arte digital 33, Fotografia 12, ...). */
const categorySizes: Record<string, string> = {
  art: 'Arte digital',
  photography: 'Fotografia',
  music: 'Música',
  art3d: 'Arte 3D',
  collectibles: 'Colecionáveis',
  generative: 'Generativa',
  gaming: 'Jogos',
  subscriptions: 'Assinaturas',
  utility: 'Utilidade',
}
const categoryCounts: Record<string, number> = {
  art: 33,
  photography: 12,
  music: 65,
  art3d: 39,
  collectibles: 23,
  generative: 17,
  gaming: 19,
  subscriptions: 13,
  utility: 18,
}

const adjectives = [
  'Emerald',
  'Sage',
  'Neon',
  'Cosmic',
  'Violet',
  'Ivory',
  'Golden',
  'Crimson',
  'Azure',
  'Obsidian',
  'Amber',
  'Jade',
]
const nouns = [
  'Ape',
  'Nomad',
  'Vessel',
  'Bloom',
  'Baron',
  'Beat',
  'Signal',
  'Voyager',
  'Oracle',
  'Cipher',
  'Relic',
  'Echo',
]
const creators = ['Studio Nova', 'Aria Chen', 'Marco Reyes', 'Nadia Kobe', 'Pixel Union']

function cycle<T>(items: readonly T[], index: number): T {
  const value = items[index % items.length]
  if (value === undefined) throw new Error('cycle() called with an empty array')
  return value
}

async function seedFixtures() {
  db.user.create({
    id: 'user-ana',
    name: 'Ana Souza',
    username: 'anasouza',
    email: 'ana@example.com',
    ensName: 'ana.eth',
    password: await hashPassword('demo1234'),
    avatarUrl: placeholderImage('ana'),
  })
  db.user.create({
    id: 'user-bruno',
    name: 'Bruno Lima',
    username: 'brunolima',
    email: 'bruno@example.com',
    ensName: '',
    password: await hashPassword('demo1234'),
    avatarUrl: placeholderImage('bruno'),
  })

  db.wallet.create({
    id: 'wallet-ana-primary',
    userId: 'user-ana',
    label: 'Carteira principal',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976',
    network: 'Ethereum',
    type: 'MetaMask',
    ensName: 'ana.eth',
    isPrimary: true,
  })

  let sequence = 0
  for (const [category, label] of Object.entries(categorySizes)) {
    const count = categoryCounts[category] ?? 0
    for (let i = 0; i < count; i++) {
      sequence += 1
      const id = `nft-${sequence}`
      const displayNumber = String((sequence * 53 + 7) % 999).padStart(3, '0')
      const title = `${cycle(adjectives, sequence)} ${cycle(nouns, sequence + 3)} #${displayNumber}`

      db.nft.create({
        id,
        title,
        description: `Peça digital exclusiva da coleção ${label}.`,
        imageUrl: cycle(nftArtworks, sequence),
        category,
        creatorName: cycle(creators, sequence),
        createdAt: new Date(Date.now() - sequence * 3_600_000).toISOString(),
      })
      db.edition.create({
        id: `edition-${sequence}`,
        nftId: id,
        priceEth: (0.05 + (sequence % 40) * 0.03).toFixed(2),
        totalSupply: 10 + (sequence % 5),
        available: sequence % 11 === 0 ? 0 : 3 + (sequence % 6),
        updatedVersion: 1,
      })
    }
  }

  db.favorite.create({ id: 'favorite-1', userId: 'user-ana', nftId: 'nft-2' })
  db.favorite.create({ id: 'favorite-2', userId: 'user-ana', nftId: 'nft-5' })

  db.coupon.create({
    id: 'coupon-launch10',
    code: 'LAUNCH10',
    discountPercent: 10,
    expiresAt: new Date(Date.now() + 365 * 24 * 3_600_000).toISOString(),
  })
  db.coupon.create({
    id: 'coupon-expired5',
    code: 'EXPIRED5',
    discountPercent: 5,
    expiresAt: new Date(Date.now() - 24 * 3_600_000).toISOString(),
  })

  persistDb()
}

const SEED_VERSION = '6'
const SEED_VERSION_KEY = 'nft-marketplace.seed-version'

export async function seedDb(): Promise<void> {
  if (localStorage.getItem(SEED_VERSION_KEY) === SEED_VERSION && restoreDb()) return
  clearDb()
  await seedFixtures()
  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
}

export async function resetScenario(): Promise<void> {
  clearDb()
  await seedFixtures()
  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
}
