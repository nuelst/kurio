import type { CreateOrderInput, Order } from '@/features/checkout/model/checkout'
import { http } from '@/shared/lib/http'

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { data } = await http.post<Order>('/orders', input)
  return data
}

export async function fetchOrder(orderId: string): Promise<Order> {
  const { data } = await http.get<Order>(`/orders/${orderId}`)
  return data
}
