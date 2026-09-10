export function getUserIdFromRequest(request: Request): string | null {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer token-')) return null
  return header.slice('Bearer token-'.length)
}

export function getCartOwnerId(request: Request): string {
  const userId = getUserIdFromRequest(request)
  if (userId) return userId
  return request.headers.get('x-guest-id') ?? 'guest-unknown'
}

export function issueToken(userId: string): string {
  return `token-${userId}`
}

export function generateUniqueUsername(
  name: string,
  isTaken: (candidate: string) => boolean,
): string {
  const base =
    name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 20) || 'colecionador'

  if (!isTaken(base)) return base

  let suffix = 2
  while (isTaken(`${base}${suffix}`)) suffix += 1
  return `${base}${suffix}`
}

const MOCK_PASSWORD_SALT = 'kurio-mock-salt'

export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(MOCK_PASSWORD_SALT + password)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return (await hashPassword(password)) === hash
}
