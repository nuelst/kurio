import { HttpResponse, http } from 'msw'

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
import { broadcastNftUpdated, broadcastOrderUpdated } from '@/mocks/socket/socket-handlers'

const PROCESSING_MS = 1500

type OrderRecord = NonNullable<ReturnType<typeof db.order.findFirst>>

function unauthorized() {
  return HttpResponse.json({ message: 'Sessão inválida ou expirada.' }, { status: 401 })
}

function randomTxHash(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return `0x${Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')}`
}

function toOrder(record: { id: string; status: string; version: number; snapshot: string }): Order {
  return {
    id: record.id,
    status: record.status as OrderStatus,
    version: record.version,
    snapshot: JSON.parse(record.snapshot) as OrderSnapshot,
  }
}

function buildRequestFingerprint(body: CreateOrderInput): string {
  return JSON.stringify({
    walletSlot: body.walletSlot,
    collector: {
      name: body.collector?.name?.trim() ?? '',
      email: body.collector?.email?.trim() ?? '',
      ensName: body.collector?.ensName?.trim() ?? '',
      note: body.collector?.note?.trim() ?? '',
    },
    expectedTotals: {
      subtotalEth: body.expectedTotals?.subtotalEth ?? '',
      discountEth: body.expectedTotals?.discountEth ?? '',
      networkFeeEth: body.expectedTotals?.networkFeeEth ?? '',
      totalEth: body.expectedTotals?.totalEth ?? '',
    },
  })
}

function resolveOrder(record: OrderRecord): OrderRecord {
  if (record.status !== 'pending') return record
  if (Date.now() < record.processingCompletesAt) return record

  const isDeclined = getScenario() === 'declined'
  const snapshot = JSON.parse(record.snapshot) as OrderSnapshot

  if (!isDeclined) {
    for (const item of snapshot.items) {
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
    clearCart(record.userId)
  }

  const resolvedSnapshot: OrderSnapshot = {
    ...snapshot,
    txHash: isDeclined ? null : randomTxHash(),
    confirmedAt: isDeclined ? null : new Date().toISOString(),
  }
  const status: OrderStatus = isDeclined ? 'declined' : 'confirmed'
  const version = record.version + 1

  db.order.update({
    where: { id: { equals: record.id } },
    data: { status, version, snapshot: JSON.stringify(resolvedSnapshot) },
  })
  persistDb()

  broadcastOrderUpdated({
    id: record.id,
    resource: 'order',
    version,
    data: { orderId: record.id, status },
  })

  return db.order.findFirst({ where: { id: { equals: record.id } } }) ?? record
}

export const ordersHandlers = [
  http.post('/api/orders', async ({ request }) => {
    const userId = getUserIdFromRequest(request)
    if (!userId) return unauthorized()

    const scenario = getScenario()
    const body = (await request.json()) as CreateOrderInput
    if (!body.idempotencyKey) {
      return HttpResponse.json({ message: 'idempotencyKey é obrigatório.' }, { status: 422 })
    }

    const fingerprint = buildRequestFingerprint(body)
    const existing = db.order.findFirst({
      where: { userId: { equals: userId }, idempotencyKey: { equals: body.idempotencyKey } },
    })
    if (existing) {
      if (existing.requestFingerprint !== fingerprint) {
        return HttpResponse.json(
          {
            message: 'Esta chave de idempotência já foi usada para um pedido com dados diferentes.',
          },
          { status: 409 },
        )
      }
      return HttpResponse.json(toOrder(resolveOrder(existing)))
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
      txHash: null,
      confirmedAt: null,
    }

    db.order.create({
      id: orderId,
      userId,
      idempotencyKey: body.idempotencyKey,
      requestFingerprint: fingerprint,
      status: 'pending',
      version: 1,
      processingCompletesAt: Date.now() + PROCESSING_MS,
      snapshot: JSON.stringify(snapshot),
      createdAt: new Date().toISOString(),
    })
    persistDb()

    setTimeout(() => {
      const record = db.order.findFirst({ where: { id: { equals: orderId } } })
      if (record) resolveOrder(record)
    }, PROCESSING_MS)

    const created = db.order.findFirst({ where: { id: { equals: orderId } } })
    if (!created) return unauthorized()

    if (scenario === 'timeout') {
      await new Promise<never>(() => { })
    }

    return HttpResponse.json(toOrder(created), { status: 201 })
  }),

  http.get('/api/orders/:id', ({ request, params }) => {
    const userId = getUserIdFromRequest(request)
    if (!userId) return unauthorized()

    const order = db.order.findFirst({
      where: { id: { equals: params.id as string }, userId: { equals: userId } },
    })
    if (!order) return HttpResponse.json({ message: 'Pedido não encontrado.' }, { status: 404 })

    return HttpResponse.json(toOrder(resolveOrder(order)))
  }),
]
