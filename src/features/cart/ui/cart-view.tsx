import { Link } from '@tanstack/react-router'

import { CartLineItem } from '@/features/cart/ui/cart-line-item'
import { CartSkeleton } from '@/features/cart/ui/cart-skeleton'
import { CartSummaryPanel } from '@/features/cart/ui/cart-summary-panel'
import { MobileCartLineItem } from '@/features/cart/ui/mobile-cart-line-item'
import { MobileCartSummary } from '@/features/cart/ui/mobile-cart-summary'
import type { useCartViewModel } from '@/features/cart/viewmodel/use-cart-view-model'
import { useMediaQuery } from '@/shared/hooks/use-media-query'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { CartIcon } from '@/shared/ui/icons'
import { MobileScreenHeader } from '@/shared/ui/mobile-screen-header'
import { RelatedNfts } from '@/shared/ui/related-nfts'

type CartViewModel = ReturnType<typeof useCartViewModel>

export function CartView(viewModel: CartViewModel) {
  const {
    quote,
    isLoading,
    isError,
    error,
    refetch,
    couponCode,
    setCouponCode,
    couponError,
    isApplyingCoupon,
    incrementQuantity,
    decrementQuantity,
    removeItem,
    submitCoupon,
    clearCoupon,
    checkout,
    relatedItems,
    isRelatedLoading,
    toggleFavoriteFor,
  } = viewModel

  const isDesktopOrTablet = useMediaQuery('(min-width: 640px)')
  const hasItems = !isLoading && !isError && quote && quote.items.length > 0

  return (
    <section className="mx-auto max-w-page px-7 py-8 sm:px-6">
      {isDesktopOrTablet ? (
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Início
          </Link>
          <span className="mx-2">/</span>
          <span>Mercado</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">Carrinho</span>
        </nav>
      ) : (
        <MobileScreenHeader title="Carrinho de NFTs" />
      )}

      {isLoading ? <CartSkeleton /> : null}

      {!isLoading && isError ? (
        <ErrorState
          title="Não foi possível carregar o carrinho"
          description={error?.message}
          onRetry={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError && quote?.items.length === 0 ? (
        <EmptyState
          icon={<CartIcon className="size-10 text-muted-foreground" />}
          title="Seu carrinho está vazio"
          description="Explore o catálogo e adicione NFTs para vê-los aqui."
          action={
            <Link to="/" className="text-sm font-semibold text-primary hover:underline">
              Continuar explorando
            </Link>
          }
        />
      ) : null}

      {hasItems && quote ? (
        isDesktopOrTablet ? (
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
            <div className="flex-1">
              <div className="hidden border-b border-border pb-3 text-sm text-muted-foreground sm:grid sm:grid-cols-[64px_1fr_110px_140px_110px_32px] sm:items-center">
                <div />
                <div>NFTs</div>
                <div>Preço</div>
                <div>Edições</div>
                <div>Total</div>
                <div />
              </div>
              {quote.items.map((line) => (
                <CartLineItem
                  key={line.nftId}
                  line={line}
                  onIncrement={incrementQuantity}
                  onDecrement={decrementQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <CartSummaryPanel
              quote={quote}
              couponCode={couponCode}
              onCouponCodeChange={setCouponCode}
              couponError={couponError}
              isApplyingCoupon={isApplyingCoupon}
              onSubmitCoupon={submitCoupon}
              onClearCoupon={clearCoupon}
              onCheckout={checkout}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {quote.items.map((line) => (
              <MobileCartLineItem
                key={line.nftId}
                line={line}
                onIncrement={incrementQuantity}
                onDecrement={decrementQuantity}
                onRemove={removeItem}
              />
            ))}

            <MobileCartSummary
              quote={quote}
              couponCode={couponCode}
              onCouponCodeChange={setCouponCode}
              couponError={couponError}
              isApplyingCoupon={isApplyingCoupon}
              onSubmitCoupon={submitCoupon}
              onClearCoupon={clearCoupon}
              onCheckout={checkout}
            />
          </div>
        )
      ) : null}

      {!isLoading && !isError ? (
        <RelatedNfts
          title="Colecionadores também viram"
          items={relatedItems}
          isLoading={isRelatedLoading}
          onToggleFavorite={toggleFavoriteFor}
        />
      ) : null}
    </section>
  )
}
