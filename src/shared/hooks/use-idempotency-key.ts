import { useCallback, useState } from 'react'

export function useIdempotencyKey(scope: string) {
  const storageKey = `nft-marketplace.idempotency.${scope}`

  const [key, setKey] = useState(() => {
    const existing = sessionStorage.getItem(storageKey)
    if (existing) return existing
    const generated = crypto.randomUUID()
    sessionStorage.setItem(storageKey, generated)
    return generated
  })

  const renew = useCallback(() => {
    const generated = crypto.randomUUID()
    sessionStorage.setItem(storageKey, generated)
    setKey(generated)
    return generated
  }, [storageKey])

  return { key, renew }
}
