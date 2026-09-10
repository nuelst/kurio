const STORAGE_KEY = 'nft-marketplace.guest-id'

export function getGuestId(): string {
  if (typeof localStorage === 'undefined') return 'guest-server'

  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) return existing

  const id = `guest-${crypto.randomUUID()}`
  localStorage.setItem(STORAGE_KEY, id)
  return id
}
