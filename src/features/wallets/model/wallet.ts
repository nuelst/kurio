import { z } from 'zod'

export const walletNetworks = ['Ethereum', 'Polygon', 'Solana'] as const
export type WalletNetwork = (typeof walletNetworks)[number]

export const walletProviders = ['MetaMask', 'WalletConnect', 'Coinbase'] as const
export type WalletProvider = (typeof walletProviders)[number]

export type WalletSlot = 'primary' | 'secondary'

export interface Wallet {
  label: string
  network: WalletNetwork
  address: string
  type: WalletProvider
  ensName: string
}

export interface WalletsResponse {
  primary: Wallet | null
  secondary: Wallet | null
}

export const walletFormSchema = z.object({
  label: z.string().trim().min(2, 'Informe um apelido para a carteira'),
  network: z.enum(walletNetworks, { message: 'Selecione uma rede' }),
  address: z
    .string()
    .trim()
    .min(6, 'Informe o endereço da carteira')
    .max(64, 'Endereço muito longo'),
  type: z.enum(walletProviders, { message: 'Selecione o tipo de carteira' }),
  ensName: z.string().trim().optional(),
})

export type WalletFormInput = z.infer<typeof walletFormSchema>
