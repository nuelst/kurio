import { HttpResponse, http } from 'msw'

import { getUserIdFromRequest } from '@/mocks/auth'
import { db, persistDb } from '@/mocks/db'
import { getScenario } from '@/mocks/scenarios'

function unauthorized() {
  return HttpResponse.json({ message: 'Sessão inválida ou expirada' }, { status: 401 })
}

function forbidden() {
  return HttpResponse.json(
    { message: 'Sua conta não tem permissão para favoritar no momento.' },
    { status: 403 },
  )
}

export const favoritesHandlers = [
  http.get('/api/favorites', ({ request }) => {
    const userId = getUserIdFromRequest(request)
    if (!userId) return unauthorized()

    const favorites = db.favorite.findMany({ where: { userId: { equals: userId } } })
    return HttpResponse.json(favorites.map((favorite) => ({ nftId: favorite.nftId })))
  }),

  http.post('/api/favorites', async ({ request }) => {
    const userId = getUserIdFromRequest(request)
    if (!userId) return unauthorized()
    if (getScenario() === 'forbidden') return forbidden()

    const body = (await request.json()) as { nftId: string }
    const existing = db.favorite.findFirst({
      where: { userId: { equals: userId }, nftId: { equals: body.nftId } },
    })

    if (!existing) {
      db.favorite.create({ id: crypto.randomUUID(), userId, nftId: body.nftId })
      persistDb()
    }

    return HttpResponse.json({ nftId: body.nftId }, { status: 201 })
  }),

  http.delete('/api/favorites/:nftId', ({ request, params }) => {
    const userId = getUserIdFromRequest(request)
    if (!userId) return unauthorized()

    const favorite = db.favorite.findFirst({
      where: { userId: { equals: userId }, nftId: { equals: params.nftId as string } },
    })

    if (favorite) {
      db.favorite.delete({ where: { id: { equals: favorite.id } } })
      persistDb()
    }

    return new HttpResponse(null, { status: 204 })
  }),
]
