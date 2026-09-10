import { HttpResponse, http } from 'msw'

import type { ProfileDetails } from '@/features/profile/model/profile'
import { getUserIdFromRequest, hashPassword, verifyPassword } from '@/mocks/auth'
import { db, persistDb } from '@/mocks/db'

function unauthorized() {
  return HttpResponse.json({ message: 'Sessão inválida ou expirada.' }, { status: 401 })
}

function toProfileDetails(user: {
  name: string
  username: string
  email: string
  ensName: string
  avatarUrl: string
}): ProfileDetails {
  return {
    name: user.name,
    username: user.username,
    email: user.email,
    ensName: user.ensName,
    avatarUrl: user.avatarUrl,
  }
}

export const profileHandlers = [
  http.get('/api/profile', ({ request }) => {
    const userId = getUserIdFromRequest(request)
    if (!userId) return unauthorized()

    const user = db.user.findFirst({ where: { id: { equals: userId } } })
    if (!user) return unauthorized()

    return HttpResponse.json(toProfileDetails(user))
  }),

  http.patch('/api/profile', async ({ request }) => {
    const userId = getUserIdFromRequest(request)
    if (!userId) return unauthorized()

    const user = db.user.findFirst({ where: { id: { equals: userId } } })
    if (!user) return unauthorized()

    const body = (await request.json()) as {
      name?: string
      username?: string
      email?: string
      ensName?: string
      avatarUrl?: string
      currentPassword?: string
      newPassword?: string
    }

    const name = body.name?.trim()
    const username = body.username?.trim().toLowerCase()
    const email = body.email?.trim().toLowerCase()

    const errors: { field: string; message: string }[] = []
    let hasConflict = false

    if (!name || name.length < 2) {
      errors.push({ field: 'name', message: 'Informe seu nome de exibição' })
    }
    if (!username || username.length < 3 || !/^[a-z0-9_]+$/i.test(username)) {
      errors.push({ field: 'username', message: 'Informe um nome de usuário válido' })
    } else if (
      db.user.findMany({ where: { username: { equals: username } } }).some((u) => u.id !== userId)
    ) {
      errors.push({ field: 'username', message: 'Este nome de usuário já está em uso' })
      hasConflict = true
    }
    if (!email?.includes('@')) {
      errors.push({ field: 'email', message: 'Informe um e-mail válido' })
    } else if (
      db.user.findMany({ where: { email: { equals: email } } }).some((u) => u.id !== userId)
    ) {
      errors.push({ field: 'email', message: 'Este e-mail já está cadastrado' })
      hasConflict = true
    }

    const wantsPasswordChange = Boolean(body.currentPassword || body.newPassword)
    if (wantsPasswordChange) {
      const currentOk = body.currentPassword
        ? await verifyPassword(body.currentPassword, user.password)
        : false
      if (!currentOk) errors.push({ field: 'currentPassword', message: 'Senha atual incorreta' })
      if (!body.newPassword || body.newPassword.length < 8) {
        errors.push({
          field: 'newPassword',
          message: 'A nova senha deve ter pelo menos 8 caracteres',
        })
      }
    }

    if (errors.length > 0) {
      return HttpResponse.json(
        { message: 'Dados inválidos.', errors },
        { status: hasConflict ? 409 : 422 },
      )
    }

    db.user.update({
      where: { id: { equals: userId } },
      data: {
        name: name as string,
        username: username as string,
        email: email as string,
        ensName: body.ensName?.trim() ?? '',
        avatarUrl: body.avatarUrl || user.avatarUrl,
        password: wantsPasswordChange
          ? await hashPassword(body.newPassword as string)
          : user.password,
      },
    })
    persistDb()

    const updated = db.user.findFirst({ where: { id: { equals: userId } } })
    if (!updated) return unauthorized()

    return HttpResponse.json(toProfileDetails(updated))
  }),
]
