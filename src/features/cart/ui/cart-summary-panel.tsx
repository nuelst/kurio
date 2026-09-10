import { Link } from '@tanstack/react-router'
import type { FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CartQuote } from '@/features/cart/model/cart'
import { formatEth } from '@/shared/lib/money'

interface CartSummaryPanelProps {
  quote: CartQuote
  couponCode: string
  onCouponCodeChange: (value: string) => void
  couponError: string | null
  isApplyingCoupon: boolean
  onSubmitCoupon: (event: FormEvent) => void
  onClearCoupon: () => void
  onCheckout: () => void
}

export function CartSummaryPanel({
  quote,
  couponCode,
  onCouponCodeChange,
  couponError,
  isApplyingCoupon,
  onSubmitCoupon,
  onClearCoupon,
  onCheckout,
}: CartSummaryPanelProps) {
  const hasPurchasableItems = quote.items.some((item) => !item.isSoldOut)
  const hasDiscount = Number(quote.discountEth) > 0

  return (
    <aside className="w-full shrink-0 rounded-2xl bg-sidebar p-5 lg:w-[332px]">
      <h2 className="text-lg font-bold text-foreground">Resumo da carteira</h2>

      <div className="mt-6">
        {quote.coupon ? (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm">
            <span className="text-foreground">
              Cupom <strong>{quote.coupon.code}</strong> (-{quote.coupon.discountPercent}%)
            </span>
            <button
              type="button"
              onClick={onClearCoupon}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              Remover
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmitCoupon} className="flex flex-col gap-2">
            <label htmlFor="coupon-code" className="text-sm font-semibold text-foreground">
              Código promocional
            </label>
            <div className="flex gap-2">
              <Input
                id="coupon-code"
                placeholder="Digite o código promocional..."
                aria-invalid={Boolean(couponError)}
                value={couponCode}
                onChange={(event) => onCouponCodeChange(event.target.value)}
                className="min-w-0 flex-1 text-xs placeholder:text-xs"
              />
              <Button
                type="submit"
                disabled={isApplyingCoupon || !couponCode.trim()}
                className="shrink-0 px-2"
              >
                Aplicar
              </Button>
            </div>
            {couponError ? <p className="text-sm text-destructive">{couponError}</p> : null}
          </form>
        )}
      </div>

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
        <span className="text-lg font-bold text-[#E89B55]" data-testid="cart-total">
          {formatEth(quote.totalEth)}
        </span>
      </div>

      <Button
        type="button"
        className="mt-6 w-full font-bold uppercase"
        disabled={!hasPurchasableItems}
        onClick={onCheckout}
      >
        Conectar e finalizar
      </Button>

      <Link to="/" className="mt-3 block text-center text-sm text-primary hover:underline">
        Continuar explorando
      </Link>
    </aside>
  )
}
