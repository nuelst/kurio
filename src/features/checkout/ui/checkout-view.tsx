import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { CheckoutSkeleton } from '@/features/checkout/ui/checkout-skeleton'
import { CheckoutSummary } from '@/features/checkout/ui/checkout-summary'
import { CollectorForm } from '@/features/checkout/ui/collector-form'
import { MobileCheckoutPayment } from '@/features/checkout/ui/mobile-checkout-payment'
import type { useCheckoutViewModel } from '@/features/checkout/viewmodel/use-checkout-view-model'
import { useMediaQuery } from '@/shared/hooks/use-media-query'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { CartIcon } from '@/shared/ui/icons'
import { MobileScreenHeader } from '@/shared/ui/mobile-screen-header'

type CheckoutViewModel = ReturnType<typeof useCheckoutViewModel>
type MobileStep = 'profile' | 'payment'

export function CheckoutView(viewModel: CheckoutViewModel) {
  const {
    quote,
    isLoadingCart,
    isCartError,
    cartError,
    refetchCart,
    wallets,
    collectorForm,
    connection,
    connectWallet,
    disconnectWallet,
    submit,
    isSubmitting,
  } = viewModel

  const isDesktopOrTablet = useMediaQuery('(min-width: 640px)')
  const [mobileStep, setMobileStep] = useState<MobileStep>('profile')

  async function goToPayment() {
    const isValid = await collectorForm.trigger()
    if (isValid) setMobileStep('payment')
  }

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
          <span className="text-foreground">Pagamento</span>
        </nav>
      ) : (
        <MobileScreenHeader
          title={mobileStep === 'profile' ? 'Perfil do colecionador' : 'Pagamento com carteira'}
          onBack={mobileStep === 'payment' ? () => setMobileStep('profile') : undefined}
        />
      )}

      {isLoadingCart ? <CheckoutSkeleton /> : null}

      {!isLoadingCart && isCartError ? (
        <ErrorState
          title="Não foi possível carregar seu carrinho"
          description={cartError?.message}
          onRetry={() => refetchCart()}
        />
      ) : null}

      {!isLoadingCart && !isCartError && quote?.items.length === 0 ? (
        <EmptyState
          icon={<CartIcon className="size-10 text-muted-foreground" />}
          title="Seu carrinho está vazio"
          description="Adicione NFTs ao carrinho antes de ir para o pagamento."
          action={
            <Link to="/" className="text-sm font-semibold text-primary hover:underline">
              Continuar explorando
            </Link>
          }
        />
      ) : null}

      {!isLoadingCart && !isCartError && quote && quote.items.length > 0 ? (
        isDesktopOrTablet ? (
          <form
            onSubmit={submit}
            noValidate
            className="flex flex-col gap-10 lg:flex-row lg:items-start"
          >
            <div className="flex-1">
              <CollectorForm form={collectorForm} />
              {collectorForm.formState.errors.root ? (
                <p role="alert" className="mt-4 text-sm text-destructive">
                  {collectorForm.formState.errors.root.message}
                </p>
              ) : null}
            </div>

            <CheckoutSummary
              quote={quote}
              wallets={wallets}
              connection={connection}
              onConnect={connectWallet}
              onDisconnect={disconnectWallet}
              onSubmit={submit}
              isSubmitting={isSubmitting}
            />
          </form>
        ) : (
          <form onSubmit={submit} noValidate>
            {mobileStep === 'profile' ? (
              <>
                <CollectorForm form={collectorForm} />
                <Button
                  type="button"
                  onClick={goToPayment}
                  className="mt-8 h-12 w-full rounded-full font-bold uppercase"
                >
                  Continuar
                </Button>
              </>
            ) : (
              <MobileCheckoutPayment
                quote={quote}
                wallets={wallets}
                connection={connection}
                onConnect={connectWallet}
                onDisconnect={disconnectWallet}
                onSubmit={submit}
                isSubmitting={isSubmitting}
                formError={collectorForm.formState.errors.root?.message}
              />
            )}
          </form>
        )
      ) : null}
    </section>
  )
}
