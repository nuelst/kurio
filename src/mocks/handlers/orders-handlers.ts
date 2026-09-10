import { delay, HttpResponse, http } from 'msw'

import type {
  CreateOrderInput,
  Order,
  OrderSnapshot,
  OrderStatus,
} from '@/features/checkout/model/checkout'
import type { WalletProvider } from '@/features/wallets/model/wallet'
import { getUserIdFromRequest } from '@/mocks/auth'
import { db, persistDb } from '@/mocks/db'
import { buildQuote, clearCart } from '@/mocks/handlers/cart-handlers'
import { getScenario } from '@/mocks/scenarios'
import { broadcastNftUpdated } from '@/mocks/socket/socket-handlers'

function unauthorized() {
  return HttpResponse.json({ message: 'Sessão inválida ou expirada.' }, { status: 401 })
}

function randomTxHash(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return `0x${Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')}`
}

function toOrder(record: { id: string; status: string; snapshot: string }): Order {
  return {
    id: record.id,
    status: record.status as OrderStatus,
    snapshot: JSON.parse(record.snapshot) as OrderSnapshot,
  }
}

export const ordersHandlers = [
  http.post('/api/orders', async ({ request }) => {
    const userId = getUserIdFromRequest(request)
    if (!userId) return unauthorized()

    if (getScenario() === 'latency') {
      await delay(800 + Math.random() * 800)
    }

    const body = (await request.json()) as CreateOrderInput
    if (!body.idempotencyKey) {
      return HttpResponse.json({ message: 'idempotencyKey é obrigatório.' }, { status: 422 })
    }

    const existing = db.order.findFirst({
      where: { userId: { equals: userId }, idempotencyKey: { equals: body.idempotencyKey } },
    })
    if (existing) {
      return HttpResponse.json(toOrder(existing))
    }

    const quote = buildQuote(userId)
    const purchasable = quote.items.filter((item) => !item.isSoldOut)
    if (purchasable.length === 0) {
      return HttpResponse.json({ message: 'Seu carrinho está vazio.' }, { status: 422 })
    }

    const expected = body.expectedTotals
    const quoteChanged =
      !expected ||
      expected.subtotalEth !== quote.subtotalEth ||
      expected.discountEth !== quote.discountEth ||
      expected.networkFeeEth !== quote.networkFeeEth ||
      expected.totalEth !== quote.totalEth
    if (quoteChanged) {
      return HttpResponse.json(
        { message: 'A cotação mudou. Revise os valores antes de confirmar.' },
        { status: 409 },
      )
    }

    const wallet = db.wallet.findFirst({
      where: { userId: { equals: userId }, isPrimary: { equals: body.walletSlot === 'primary' } },
    })
    if (!wallet) return HttpResponse.json({ message: 'Carteira não encontrada.' }, { status: 422 })
    if (wallet.network !== 'Ethereum') {
      return HttpResponse.json({ message: 'Rede incompatível com esta coleção.' }, { status: 409 })
    }

    const user = db.user.findFirst({ where: { id: { equals: userId } } })
    const isDeclined = getScenario() === 'declined'
    const orderId = `order-${crypto.randomUUID()}`

    const snapshot: OrderSnapshot = {
      items: purchasable,
      subtotalEth: quote.subtotalEth,
      discountEth: quote.discountEth,
      networkFeeEth: quote.networkFeeEth,
      totalEth: quote.totalEth,
      coupon: quote.coupon,
      collector: {
        name: body.collector?.name?.trim() || user?.name || '',
        email: body.collector?.email?.trim() || user?.email || '',
        ensName: body.collector?.ensName?.trim() ?? '',
        note: body.collector?.note?.trim() ?? '',
      },
      wallet: {
        label: wallet.label,
        network: wallet.network,
        type: wallet.type as WalletProvider,
        address: wallet.address,
      },
      txHash: randomTxHash(),
      confirmedAt: new Date().toISOString(),
    }

    db.order.create({
      id: orderId,
      userId,
      idempotencyKey: body.idempotencyKey,
      status: isDeclined ? 'declined' : 'confirmed',
      snapshot: JSON.stringify(snapshot),
      createdAt: new Date().toISOString(),
    })

    if (!isDeclined) {
      for (const item of purchasable) {
        const edition = db.edition.findFirst({ where: { id: { equals: item.editionId } } })
        if (!edition) continue

        const available = Math.max(0, edition.available - item.quantity)
        const version = edition.updatedVersion + 1
        db.edition.update({
          where: { id: { equals: edition.id } },
          data: { available, updatedVersion: version },
        })
        broadcastNftUpdated({
          id: item.nftId,
          resource: 'nft',
          version,
          data: { nftId: item.nftId, editionId: edition.id, priceEth: edition.priceEth, available },
        })
      }
      clearCart(userId)
    }
    persistDb()

    const created = db.order.findFirst({ where: { id: { equals: orderId } } })
    if (!created) return unauthorized()

    return HttpResponse.json(toOrder(created), { status: 201 })
  }),

  http.get('/api/orders/:id', ({ request, params }) => {
    const userId = getUserIdFromRequest(request)
    if (!userId) return unauthorized()

    const order = db.order.findFirst({
      where: { id: { equals: params.id as string }, userId: { equals: userId } },
    })
    if (!order) return HttpResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 })

    return HttpResponse.json(toOrder(order))
  }),
]
