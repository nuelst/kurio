import { useCallback, useState } from 'react'

/**
 * Persists one idempotency key per scope (e.g. "checkout") in sessionStorage so
 * repeated clicks, re-renders, and reloads before an order resolves reuse the
 * same key — the mock API recognizes the retry and returns the same order
 * instead of creating a duplicate. Call `renew` only after the order reaches a
 * terminal state (confirmed/refused) or the cart contents actually change.
 */
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
