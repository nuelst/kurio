import { HttpResponse, http } from 'msw'

import type { Wallet, WalletsResponse } from '@/features/wallets/model/wallet'
import { getUserIdFromRequest } from '@/mocks/auth'
import { db, persistDb } from '@/mocks/db'

function unauthorized() {
  return HttpResponse.json({ message: 'Sessão inválida ou expirada.' }, { status: 401 })
}

function toWallet(record: {
  label: string
  network: string
  address: string
  type: string
  ensName: string
}): Wallet {
  return {
    label: record.label,
    network: record.network as Wallet['network'],
    address: record.address,
    type: record.type as Wallet['type'],
    ensName: record.ensName,
  }
}

function buildResponse(userId: string): WalletsResponse {
  const primary = db.wallet.findFirst({
    where: { userId: { equals: userId }, isPrimary: { equals: true } },
  })
  const secondary = db.wallet.findFirst({
    where: { userId: { equals: userId }, isPrimary: { equals: false } },
  })
  return {
    primary: primary ? toWallet(primary) : null,
    secondary: secondary ? toWallet(secondary) : null,
  }
}

export const walletsHandlers = [
  http.get('/api/wallets', ({ request }) => {
    const userId = getUserIdFromRequest(request)
    if (!userId) return unauthorized()

    return HttpResponse.json(buildResponse(userId))
  }),

  http.put('/api/wallets/:slot', async ({ request, params }) => {
    const userId = getUserIdFromRequest(request)
    if (!userId) return unauthorized()

    const slot = params.slot as string
    if (slot !== 'primary' && slot !== 'secondary') {
      return HttpResponse.json({ message: 'Slot de carteira inválido.' }, { status: 400 })
    }

    const body = (await request.json()) as Partial<Wallet>
    const label = body.label?.trim()
    const address = body.address?.trim()

    const errors: { field: string; message: string }[] = []
    if (!label) errors.push({ field: 'label', message: 'Informe um apelido para a carteira' })
    if (!body.network) errors.push({ field: 'network', message: 'Selecione uma rede' })
    if (!address) errors.push({ field: 'address', message: 'Informe o endereço da carteira' })
    if (!body.type) errors.push({ field: 'type', message: 'Selecione o tipo de carteira' })

    if (errors.length > 0) {
      return HttpResponse.json({ message: 'Dados inválidos.', errors }, { status: 422 })
    }

    const existing = db.wallet.findFirst({
      where: { userId: { equals: userId }, isPrimary: { equals: slot === 'primary' } },
    })
    const data = {
      label: label as string,
      network: body.network as string,
      address: address as string,
      type: body.type as string,
      ensName: body.ensName?.trim() ?? '',
    }

    if (existing) {
      db.wallet.update({ where: { id: { equals: existing.id } }, data })
    } else {
      db.wallet.create({
        id: crypto.randomUUID(),
        userId,
        isPrimary: slot === 'primary',
        ...data,
      })
    }
    persistDb()

    return HttpResponse.json(buildResponse(userId))
  }),

  http.delete('/api/wallets/:slot', ({ request, params }) => {
    const userId = getUserIdFromRequest(request)
    if (!userId) return unauthorized()

    const slot = params.slot as string
    if (slot === 'primary') {
      return HttpResponse.json(
        { message: 'A carteira principal não pode ser removida — edite-a ou cadastre outra.' },
        { status: 409 },
      )
    }

    const existing = db.wallet.findFirst({
      where: { userId: { equals: userId }, isPrimary: { equals: false } },
    })
    if (existing) {
      db.wallet.delete({ where: { id: { equals: existing.id } } })
      persistDb()
    }

    return HttpResponse.json(buildResponse(userId))
  }),
]
