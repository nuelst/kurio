import type { CartQuote } from '@/features/cart/model/cart'
import { http } from '@/shared/lib/http'

export async function fetchCart(): Promise<CartQuote> {
  const { data } = await http.get<CartQuote>('/cart')
  return data
}

export async function addCartItem(nftId: string, quantity: number): Promise<CartQuote> {
  const { data } = await http.post<CartQuote>('/cart/items', { nftId, quantity })
  return data
}

export async function updateCartItemQuantity(nftId: string, quantity: number): Promise<CartQuote> {
  const { data } = await http.patch<CartQuote>(`/cart/items/${nftId}`, { quantity })
  return data
}

export async function removeCartItem(nftId: string): Promise<CartQuote> {
  const { data } = await http.delete<CartQuote>(`/cart/items/${nftId}`)
  return data
}

export async function applyCoupon(code: string): Promise<CartQuote> {
  const { data } = await http.post<CartQuote>('/cart/coupon', { code })
  return data
}

export async function removeCoupon(): Promise<CartQuote> {
  const { data } = await http.delete<CartQuote>('/cart/coupon')
  return data
}
