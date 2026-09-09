import { HttpResponse, http } from 'msw'

import type { AuthResponse } from '@/features/auth/model/auth'
import { getUserIdFromRequest, hashPassword, issueToken, verifyPassword } from '@/mocks/auth'
import { db, persistDb } from '@/mocks/db'
import { placeholderImage } from '@/mocks/fixtures/placeholder-image'

function toAuthUser(user: { id: string; name: string; email: string; avatarUrl: string }) {
  return { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl }
}

export const authHandlers = [
  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as {
      name?: string
      email?: string
      password?: string
    }
    const name = body.name?.trim()
    const email = body.email?.trim().toLowerCase()
    const password = body.password

    if (!name || !email || !password || password.length < 8) {
      return HttpResponse.json(
        {
          message: 'Dados inválidos.',
          errors: [
            ...(!name ? [{ field: 'name', message: 'Informe seu nome de usuário' }] : []),
            ...(!email ? [{ field: 'email', message: 'Informe seu e-mail' }] : []),
            ...(!password || password.length < 8
              ? [{ field: 'password', message: 'A senha deve ter pelo menos 8 caracteres' }]
              : []),
          ],
        },
        { status: 422 },
      )
    }

    const existing = db.user.findFirst({ where: { email: { equals: email } } })
    if (existing) {
      return HttpResponse.json(
        {
          message: 'Este e-mail já está cadastrado.',
          errors: [{ field: 'email', message: 'Este e-mail já está cadastrado' }],
        },
        { status: 409 },
      )
    }

    const id = `user-${crypto.randomUUID()}`
    const user = db.user.create({
      id,
      name,
      email,
      password: await hashPassword(password),
      avatarUrl: placeholderImage(id),
    })
    persistDb()

    const response: AuthResponse = { user: toAuthUser(user), accessToken: issueToken(id) }
    return HttpResponse.json(response, { status: 201 })
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    const email = body.email?.trim().toLowerCase()
    const password = body.password

    const invalidCredentials = () =>
      HttpResponse.json({ message: 'E-mail ou senha inválidos.' }, { status: 401 })

    if (!email || !password) return invalidCredentials()

    const user = db.user.findFirst({ where: { email: { equals: email } } })
    if (!user) return invalidCredentials()

    const passwordMatches = await verifyPassword(password, user.password)
    if (!passwordMatches) return invalidCredentials()

    const response: AuthResponse = { user: toAuthUser(user), accessToken: issueToken(user.id) }
    return HttpResponse.json(response)
  }),

  http.get('/api/auth/session', ({ request }) => {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return HttpResponse.json({ message: 'Sessão inválida ou expirada.' }, { status: 401 })
    }

    const user = db.user.findFirst({ where: { id: { equals: userId } } })
    if (!user) {
      return HttpResponse.json({ message: 'Sessão inválida ou expirada.' }, { status: 401 })
    }

    return HttpResponse.json({ user: toAuthUser(user) })
  }),

  http.post('/api/auth/logout', () => new HttpResponse(null, { status: 204 })),
]
