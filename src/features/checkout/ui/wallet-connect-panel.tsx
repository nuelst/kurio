import { Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { WalletConnectionStatus } from '@/features/checkout/model/checkout'
import type { Wallet, WalletSlot, WalletsResponse } from '@/features/wallets/model/wallet'
import { cn } from '@/lib/utils'

interface WalletOptionProps {
  slot: WalletSlot
  wallet: Wallet
  isSelected: boolean
  status: WalletConnectionStatus
  rejectionReason?: string
  onSelect: () => void
  onDisconnect: () => void
}

function WalletOption({
  slot,
  wallet,
  isSelected,
  status,
  rejectionReason,
  onSelect,
  onDisconnect,
}: WalletOptionProps) {
  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3 transition-colors',
        isSelected && status === 'connected' ? 'border-primary' : 'border-border',
      )}
    >
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="radio"
          name="wallet"
          value={slot}
          checked={isSelected}
          onChange={onSelect}
          disabled={status === 'connecting' && isSelected}
          className="mt-0.5 size-4 shrink-0 accent-primary"
        />
        <span className="min-w-0 flex-1 text-sm text-foreground">
          <span className="block truncate">{wallet.label}</span>
          <span className="block text-xs text-muted-foreground">
            {wallet.type} · {wallet.network}
          </span>
        </span>

        {isSelected && status === 'connecting' ? (
          <Loader2
            className="mt-0.5 size-4 shrink-0 animate-spin text-primary"
            aria-label="Conectando"
          />
        ) : null}
        {isSelected && status === 'connected' ? (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault()
              onDisconnect()
            }}
            className="mt-0.5 shrink-0 text-xs text-muted-foreground hover:text-destructive"
          >
            Desconectar
          </button>
        ) : null}
      </label>
      {isSelected && status === 'rejected' && rejectionReason ? (
        <p className="mt-2 text-xs text-destructive">{rejectionReason}</p>
      ) : null}
    </div>
  )
}

interface WalletConnectPanelProps {
  wallets: WalletsResponse | undefined
  connection: { status: WalletConnectionStatus; slot: WalletSlot | null; rejectionReason?: string }
  onConnect: (slot: WalletSlot) => void
  onDisconnect: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function WalletConnectPanel({
  wallets,
  connection,
  onConnect,
  onDisconnect,
  onSubmit,
  isSubmitting,
}: WalletConnectPanelProps) {
  const hasAnyWallet = Boolean(wallets?.primary || wallets?.secondary)

  return (
    <div className="mt-8 border-t border-border pt-6">
      <h3 className="font-bold text-foreground">Carteira e rede</h3>

      {!hasAnyWallet ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Você ainda não cadastrou uma carteira.{' '}
          <Link to="/wallets" className="font-semibold text-primary hover:underline">
            Cadastrar carteira
          </Link>
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {wallets?.primary ? (
            <WalletOption
              slot="primary"
              wallet={wallets.primary}
              isSelected={connection.slot === 'primary'}
              status={connection.slot === 'primary' ? connection.status : 'idle'}
              rejectionReason={connection.rejectionReason}
              onSelect={() => onConnect('primary')}
              onDisconnect={onDisconnect}
            />
          ) : null}
          {wallets?.secondary ? (
            <WalletOption
              slot="secondary"
              wallet={wallets.secondary}
              isSelected={connection.slot === 'secondary'}
              status={connection.slot === 'secondary' ? connection.status : 'idle'}
              rejectionReason={connection.rejectionReason}
              onSelect={() => onConnect('secondary')}
              onDisconnect={onDisconnect}
            />
          ) : null}
        </div>
      )}

      <Button
        type="button"
        onClick={onSubmit}
        disabled={connection.status !== 'connected' || isSubmitting}
        className="mt-6 w-full font-bold uppercase"
      >
        {isSubmitting ? 'Confirmando...' : 'Confirmar compra'}
      </Button>
    </div>
  )
}
