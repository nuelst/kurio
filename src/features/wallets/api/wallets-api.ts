import type { Wallet, WalletSlot, WalletsResponse } from '@/features/wallets/model/wallet'
import { http } from '@/shared/lib/http'

export async function fetchWallets(): Promise<WalletsResponse> {
  const { data } = await http.get<WalletsResponse>('/wallets')
  return data
}

export async function saveWallet(slot: WalletSlot, input: Wallet): Promise<WalletsResponse> {
  const { data } = await http.put<WalletsResponse>(`/wallets/${slot}`, input)
  return data
}

export async function removeWallet(slot: WalletSlot): Promise<WalletsResponse> {
  const { data } = await http.delete<WalletsResponse>(`/wallets/${slot}`)
  return data
}
