import { Link } from '@tanstack/react-router'
import type { CartQuote } from '@/features/cart/model/cart'
import type { WalletConnectionStatus } from '@/features/checkout/model/checkout'
import { CheckoutItemRow } from '@/features/checkout/ui/checkout-item-row'
import { WalletConnectPanel } from '@/features/checkout/ui/wallet-connect-panel'
import type { WalletSlot, WalletsResponse } from '@/features/wallets/model/wallet'
import { formatEth } from '@/shared/lib/money'

interface CheckoutSummaryProps {
  quote: CartQuote
  wallets: WalletsResponse | undefined
  connection: { status: WalletConnectionStatus; slot: WalletSlot | null; rejectionReason?: string }
  onConnect: (slot: WalletSlot) => void
  onDisconnect: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function CheckoutSummary({
  quote,
  wallets,
  connection,
  onConnect,
  onDisconnect,
  onSubmit,
  isSubmitting,
}: CheckoutSummaryProps) {
  const hasDiscount = Number(quote.discountEth) > 0

  return (
    <aside className="w-full shrink-0 rounded-2xl bg-sidebar p-6 lg:w-[380px]">
      <h2 className="text-lg font-bold text-foreground">Seus NFTs</h2>

      <div className="mt-4">
        {quote.items.map((line) => (
          <CheckoutItemRow key={line.nftId} line={line} />
        ))}
      </div>

      <Link to="/cart" className="mt-3 block text-sm text-primary hover:underline">
        Tem um código promocional? Aplique aqui
      </Link>

      <dl className="mt-4 flex flex-col gap-2 border-t border-border pt-4 text-sm">
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

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="text-base font-bold text-foreground">Total</span>
        <span className="text-lg font-bold text-[#E89B55]" data-testid="checkout-total">
          {formatEth(quote.totalEth)}
        </span>
      </div>

      <WalletConnectPanel
        wallets={wallets}
        connection={connection}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    </aside>
  )
}
