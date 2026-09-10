import { Loader2 } from 'lucide-react'

import type { WalletConnectionStatus } from '@/features/checkout/model/checkout'
import type { Wallet, WalletProvider, WalletSlot } from '@/features/wallets/model/wallet'
import { cn } from '@/lib/utils'

const providerBadge: Record<WalletProvider, { label: string; className: string }> = {
  MetaMask: { label: 'M', className: 'bg-[#F6851B] text-white' },
  WalletConnect: { label: 'W', className: 'bg-[#3B99FC] text-white' },
  Coinbase: { label: 'C', className: 'bg-[#0052FF] text-white' },
}

interface MobileWalletOptionProps {
  slot: WalletSlot
  wallet: Wallet
  isSelected: boolean
  status: WalletConnectionStatus
  rejectionReason?: string
  onSelect: () => void
  onDisconnect: () => void
}

export function MobileWalletOption({
  wallet,
  isSelected,
  status,
  rejectionReason,
  onSelect,
  onDisconnect,
}: MobileWalletOptionProps) {
  const badge = providerBadge[wallet.type]

  return (
    <div
      className={cn(
        'rounded-2xl border bg-sidebar px-4 py-3 transition-colors',
        isSelected && status === 'connected' ? 'border-primary' : 'border-transparent',
      )}
    >
      <label className="flex cursor-pointer items-center gap-3">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
            badge.className,
          )}
          aria-hidden="true"
        >
          {badge.label}
        </span>

        <span className="min-w-0 flex-1 text-sm text-foreground">
          <span className="block truncate font-semibold">{wallet.label}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {wallet.type} · {wallet.network}
          </span>
        </span>

        <input
          type="radio"
          name="wallet"
          checked={isSelected}
          onChange={onSelect}
          disabled={status === 'connecting' && isSelected}
          className="size-4 shrink-0 accent-primary"
        />
        {isSelected && status === 'connecting' ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-primary" aria-label="Conectando" />
        ) : null}
      </label>

      {isSelected && status === 'connected' ? (
        <button
          type="button"
          onClick={onDisconnect}
          className="mt-2 text-xs text-muted-foreground hover:text-destructive"
        >
          Desconectar
        </button>
      ) : null}

      {isSelected && status === 'rejected' && rejectionReason ? (
        <p className="mt-2 text-xs text-destructive">{rejectionReason}</p>
      ) : null}
    </div>
  )
}
