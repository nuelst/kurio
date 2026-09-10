import type { FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CartQuote } from '@/features/cart/model/cart'
import { formatEth } from '@/shared/lib/money'

interface MobileCartSummaryProps {
  quote: CartQuote
  couponCode: string
  onCouponCodeChange: (value: string) => void
  couponError: string | null
  isApplyingCoupon: boolean
  onSubmitCoupon: (event: FormEvent) => void
  onClearCoupon: () => void
  onCheckout: () => void
}

export function MobileCartSummary({
  quote,
  couponCode,
  onCouponCodeChange,
  couponError,
  isApplyingCoupon,
  onSubmitCoupon,
  onClearCoupon,
  onCheckout,
}: MobileCartSummaryProps) {
  const hasPurchasableItems = quote.items.some((item) => !item.isSoldOut)
  const hasDiscount = Number(quote.discountEth) > 0

  return (
    <div className="-mx-7 rounded-t-[28px] bg-sidebar px-7 pt-6 pb-8">
      {quote.coupon ? (
        <div className="flex items-center justify-between gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm">
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
        <form onSubmit={onSubmitCoupon} className="flex gap-2">
          <Input
            aria-label="Código promocional"
            placeholder="Digite o código promocional..."
            aria-invalid={Boolean(couponError)}
            value={couponCode}
            onChange={(event) => onCouponCodeChange(event.target.value)}
            className="h-11 min-w-0 flex-1 rounded-full text-xs placeholder:text-xs"
          />
          <Button
            type="submit"
            disabled={isApplyingCoupon || !couponCode.trim()}
            className="h-11 shrink-0 rounded-full px-5"
          >
            Aplicar
          </Button>
        </form>
      )}
      {couponError ? <p className="mt-2 text-sm text-destructive">{couponError}</p> : null}

      <dl className="mt-5 flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="text-foreground">{formatEth(quote.subtotalEth)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Desconto do lançamento</dt>
          <dd className="text-foreground">
            {hasDiscount ? `(-) ${formatEth(quote.discountEth)}` : '(-) 00.00'}
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
        className="mt-6 h-12 w-full rounded-full font-bold uppercase"
        disabled={!hasPurchasableItems}
        onClick={onCheckout}
      >
        Conectar e finalizar
      </Button>
    </div>
  )
}
