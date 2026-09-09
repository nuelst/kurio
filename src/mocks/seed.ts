import nftArt01 from '@/assets/nft/nft-01.png'
import nftArt02 from '@/assets/nft/nft-02.png'
import nftArt03 from '@/assets/nft/nft-03.png'
import nftArt04 from '@/assets/nft/nft-04.png'
import { hashPassword } from '@/mocks/auth'
import { clearDb, db, persistDb, restoreDb } from '@/mocks/db'
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

const artworks = [nftArt01, nftArt02, nftArt03, nftArt04]
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
    email: 'ana@example.com',
    password: await hashPassword('demo1234'),
    avatarUrl: placeholderImage('ana'),
  })
  db.user.create({
    id: 'user-bruno',
    name: 'Bruno Lima',
    email: 'bruno@example.com',
    password: await hashPassword('demo1234'),
    avatarUrl: placeholderImage('bruno'),
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
        imageUrl: cycle(artworks, sequence),
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

  persistDb()
}

const SEED_VERSION = '2'
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
