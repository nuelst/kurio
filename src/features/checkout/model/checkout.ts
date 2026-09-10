import { z } from 'zod'

import type { CartCoupon, CartLine } from '@/features/cart/model/cart'
import type { WalletProvider, WalletSlot } from '@/features/wallets/model/wallet'

export const collectorFormSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome de exibição'),
  email: z.string().trim().min(1, 'Informe seu e-mail').email('Informe um e-mail válido'),
  ensName: z.string().trim().optional(),
  note: z.string().trim().max(500, 'Observação muito longa (máx. 500 caracteres)').optional(),
})
export type CollectorFormInput = z.infer<typeof collectorFormSchema>

export type WalletConnectionStatus = 'idle' | 'connecting' | 'connected' | 'rejected'

export type OrderStatus = 'confirmed' | 'declined'

export interface OrderWalletSnapshot {
  label: string
  network: string
  type: WalletProvider
  address: string
}

export interface OrderSnapshot {
  items: CartLine[]
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
  coupon: CartCoupon | null
  collector: { name: string; email: string; ensName: string; note: string }
  wallet: OrderWalletSnapshot
  txHash: string
  confirmedAt: string
}

export interface Order {
  id: string
  status: OrderStatus
  snapshot: OrderSnapshot
}

export interface CreateOrderInput {
  idempotencyKey: string
  walletSlot: WalletSlot
  collector: { name: string; email: string; ensName?: string; note?: string }
  expectedTotals: {
    subtotalEth: string
    discountEth: string
    networkFeeEth: string
    totalEth: string
  }
}
