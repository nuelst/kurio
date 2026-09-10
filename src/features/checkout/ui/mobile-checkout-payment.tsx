import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import type { CartQuote } from '@/features/cart/model/cart'
import type { WalletConnectionStatus } from '@/features/checkout/model/checkout'
import { MobileWalletOption } from '@/features/checkout/ui/mobile-wallet-option'
import type { WalletSlot, WalletsResponse } from '@/features/wallets/model/wallet'
import { formatEth } from '@/shared/lib/money'

interface MobileCheckoutPaymentProps {
  quote: CartQuote
  wallets: WalletsResponse | undefined
  connection: { status: WalletConnectionStatus; slot: WalletSlot | null; rejectionReason?: string }
  onConnect: (slot: WalletSlot) => void
  onDisconnect: () => void
  onSubmit: () => void
  isSubmitting: boolean
  formError?: string
}

export function MobileCheckoutPayment({
  quote,
  wallets,
  connection,
  onConnect,
  onDisconnect,
  onSubmit,
  isSubmitting,
  formError,
}: MobileCheckoutPaymentProps) {
  const hasAnyWallet = Boolean(wallets?.primary || wallets?.secondary)
  const hasDiscount = Number(quote.discountEth) > 0

  return (
    <div>
      <h2 className="font-bold text-foreground">Carteira e rede</h2>

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
            <MobileWalletOption
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
            <MobileWalletOption
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

      <dl className="mt-6 flex flex-col gap-3 border-t border-border pt-6 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="text-foreground">{formatEth(quote.subtotalEth)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Desconto do cupom</dt>
          <dd className="text-foreground">
            {hasDiscount ? `(-) ${formatEth(quote.discountEth)}` : '(-) 0.00'}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">
            Taxa de rede
            <span className="block text-xs text-primary">Taxa estimada</span>
          </dt>
          <dd className="text-foreground">{formatEth(quote.networkFeeEth)}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-base font-bold text-foreground">Total</span>
        <span className="text-lg font-bold text-[#E89B55]" data-testid="checkout-total">
          {formatEth(quote.totalEth)}
        </span>
      </div>

      {formError ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <Button
        type="button"
        onClick={onSubmit}
        disabled={connection.status !== 'connected' || isSubmitting}
        className="mt-6 h-12 w-full rounded-full font-bold uppercase"
      >
        {isSubmitting ? 'Confirmando...' : 'Confirmar compra'}
      </Button>
    </div>
  )
}
