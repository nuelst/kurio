import { delay, HttpResponse, http } from 'msw'

import { recomputeQuote } from '@/features/cart/lib/cart-quote'
import type { CartCoupon, CartLine, CartQuote } from '@/features/cart/model/cart'
import { getCartOwnerId } from '@/mocks/auth'
import { db, persistDb } from '@/mocks/db'
import { tokenNumberFor } from '@/mocks/handlers/nft-mapper'
import { getScenario } from '@/mocks/scenarios'
import { multiply } from '@/shared/lib/money'

function getActiveCoupon(ownerId: string): CartCoupon | null {
  const applied = db.cartCoupon.findFirst({ where: { id: { equals: ownerId } } })
  if (!applied) return null

  const coupon = db.coupon.findFirst({ where: { code: { equals: applied.code } } })
  if (!coupon) return null
  if (new Date(coupon.expiresAt).getTime() < Date.now()) return null

  return { code: coupon.code, discountPercent: coupon.discountPercent }
}

function buildQuote(ownerId: string): CartQuote {
  const cartItems = db.cartItem.findMany({ where: { cartOwnerId: { equals: ownerId } } })
  let mutated = false

  const lines: CartLine[] = []
  for (const item of cartItems) {
    const nft = db.nft.findFirst({ where: { id: { equals: item.nftId } } })
    const edition = db.edition.findFirst({ where: { id: { equals: item.editionId } } })
    if (!nft || !edition) continue

    let quantity = item.quantity
    if (edition.available > 0 && quantity > edition.available) {
      quantity = edition.available
      db.cartItem.update({ where: { id: { equals: item.id } }, data: { quantity } })
      mutated = true
    }

    const isSoldOut = edition.available <= 0
    lines.push({
      nftId: nft.id,
      editionId: edition.id,
      title: nft.title,
      imageUrl: nft.imageUrl,
      tokenNumber: tokenNumberFor(nft.id),
      priceEth: edition.priceEth,
      available: edition.available,
      quantity,
      isSoldOut,
      lineTotalEth: isSoldOut ? '0' : multiply(edition.priceEth, quantity),
    })
  }

  if (mutated) persistDb()

  return recomputeQuote(lines, getActiveCoupon(ownerId))
}

/** Called from the login/register handlers so a visitor's cart survives authenticating. */
export function mergeGuestCart(guestId: string | null, userId: string): void {
  if (!guestId || guestId === userId) return

  const guestItems = db.cartItem.findMany({ where: { cartOwnerId: { equals: guestId } } })
  for (const guestItem of guestItems) {
    const edition = db.edition.findFirst({ where: { id: { equals: guestItem.editionId } } })
    const cap = edition ? Math.max(edition.available, guestItem.quantity) : guestItem.quantity
    const existing = db.cartItem.findFirst({
      where: { cartOwnerId: { equals: userId }, nftId: { equals: guestItem.nftId } },
    })

    if (existing) {
      db.cartItem.update({
        where: { id: { equals: existing.id } },
        data: { quantity: Math.min(existing.quantity + guestItem.quantity, cap) },
      })
    } else {
      db.cartItem.create({
        id: crypto.randomUUID(),
        cartOwnerId: userId,
        nftId: guestItem.nftId,
        editionId: guestItem.editionId,
        quantity: Math.min(guestItem.quantity, cap),
      })
    }
    db.cartItem.delete({ where: { id: { equals: guestItem.id } } })
  }

  const guestCoupon = db.cartCoupon.findFirst({ where: { id: { equals: guestId } } })
  if (guestCoupon) {
    if (!db.cartCoupon.findFirst({ where: { id: { equals: userId } } })) {
      db.cartCoupon.create({ id: userId, code: guestCoupon.code })
    }
    db.cartCoupon.delete({ where: { id: { equals: guestId } } })
  }

  persistDb()
}

function notFound(message: string) {
  return HttpResponse.json({ message }, { status: 404 })
}

export const cartHandlers = [
  http.get('/api/cart', async ({ request }) => {
    const scenario = getScenario()
    if (scenario === 'error') {
      return HttpResponse.json({ message: 'Falha ao carregar o carrinho.' }, { status: 500 })
    }
    if (scenario === 'latency') {
      await delay(1200 + Math.random() * 1200)
    }

    return HttpResponse.json(buildQuote(getCartOwnerId(request)))
  }),

  http.post('/api/cart/items', async ({ request }) => {
    const ownerId = getCartOwnerId(request)
    const body = (await request.json()) as { nftId?: string; quantity?: number }
    const nftId = body.nftId
    if (!nftId) return HttpResponse.json({ message: 'nftId é obrigatório.' }, { status: 422 })

    const requestedQuantity = Math.max(1, Math.trunc(body.quantity ?? 1))
    const nft = db.nft.findFirst({ where: { id: { equals: nftId } } })
    const edition = nft ? db.edition.findFirst({ where: { nftId: { equals: nftId } } }) : null
    if (!nft || !edition) return notFound('NFT não encontrado.')
    if (edition.available <= 0) {
      return HttpResponse.json({ message: 'Esta edição está esgotada.' }, { status: 409 })
    }

    const existing = db.cartItem.findFirst({
      where: { cartOwnerId: { equals: ownerId }, nftId: { equals: nftId } },
    })
    const quantity = Math.min((existing?.quantity ?? 0) + requestedQuantity, edition.available)

    if (existing) {
      db.cartItem.update({ where: { id: { equals: existing.id } }, data: { quantity } })
    } else {
      db.cartItem.create({
        id: crypto.randomUUID(),
        cartOwnerId: ownerId,
        nftId,
        editionId: edition.id,
        quantity,
      })
    }
    persistDb()

    return HttpResponse.json(buildQuote(ownerId), { status: 201 })
  }),

  http.patch('/api/cart/items/:nftId', async ({ request, params }) => {
    const ownerId = getCartOwnerId(request)
    const nftId = params.nftId as string
    const body = (await request.json()) as { quantity?: number }

    const item = db.cartItem.findFirst({
      where: { cartOwnerId: { equals: ownerId }, nftId: { equals: nftId } },
    })
    if (!item) return notFound('Item não encontrado no carrinho.')

    const edition = db.edition.findFirst({ where: { id: { equals: item.editionId } } })
    const maxAvailable = edition ? Math.max(edition.available, 1) : 1
    const quantity = Math.min(Math.max(1, Math.trunc(body.quantity ?? item.quantity)), maxAvailable)

    db.cartItem.update({ where: { id: { equals: item.id } }, data: { quantity } })
    persistDb()

    return HttpResponse.json(buildQuote(ownerId))
  }),

  http.delete('/api/cart/items/:nftId', ({ request, params }) => {
    const ownerId = getCartOwnerId(request)
    const nftId = params.nftId as string

    const item = db.cartItem.findFirst({
      where: { cartOwnerId: { equals: ownerId }, nftId: { equals: nftId } },
    })
    if (item) {
      db.cartItem.delete({ where: { id: { equals: item.id } } })
      persistDb()
    }

    return HttpResponse.json(buildQuote(ownerId))
  }),

  http.post('/api/cart/coupon', async ({ request }) => {
    const ownerId = getCartOwnerId(request)
    const body = (await request.json()) as { code?: string }
    const code = body.code?.trim().toUpperCase()
    if (!code) {
      return HttpResponse.json({ message: 'Informe um código promocional.' }, { status: 422 })
    }

    const coupon = db.coupon.findFirst({ where: { code: { equals: code } } })
    if (!coupon) return HttpResponse.json({ message: 'Cupom inválido.' }, { status: 404 })
    if (new Date(coupon.expiresAt).getTime() < Date.now()) {
      return HttpResponse.json({ message: 'Este cupom expirou.' }, { status: 410 })
    }

    const existing = db.cartCoupon.findFirst({ where: { id: { equals: ownerId } } })
    if (existing) {
      db.cartCoupon.update({ where: { id: { equals: ownerId } }, data: { code } })
    } else {
      db.cartCoupon.create({ id: ownerId, code })
    }
    persistDb()

    return HttpResponse.json(buildQuote(ownerId))
  }),

  http.delete('/api/cart/coupon', ({ request }) => {
    const ownerId = getCartOwnerId(request)
    const existing = db.cartCoupon.findFirst({ where: { id: { equals: ownerId } } })
    if (existing) {
      db.cartCoupon.delete({ where: { id: { equals: ownerId } } })
      persistDb()
    }

    return HttpResponse.json(buildQuote(ownerId))
  }),
]
