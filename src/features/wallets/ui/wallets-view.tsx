import { WalletForm } from '@/features/wallets/ui/wallet-form'
import { WalletsSkeleton } from '@/features/wallets/ui/wallets-skeleton'
import type { useWalletsViewModel } from '@/features/wallets/viewmodel/use-wallets-view-model'
import { ErrorState } from '@/shared/ui/error-state'

type WalletsViewModel = ReturnType<typeof useWalletsViewModel>

export function WalletsView(viewModel: WalletsViewModel) {
  const {
    isLoading,
    isError,
    error,
    refetch,
    primaryForm,
    secondaryForm,
    hasSecondaryWallet,
    isAddingSecondary,
    startAddingSecondary,
    copyPrimaryIntoSecondary,
    isSavingPrimary,
    isSavingSecondary,
    isRemovingSecondary,
    submitPrimary,
    submitSecondary,
    removeSecondary,
  } = viewModel

  if (isLoading) return <WalletsSkeleton />
  if (isError) {
    return (
      <ErrorState
        title="Não foi possível carregar suas carteiras"
        description={error?.message}
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="flex-1">
      <h2 className="text-lg font-bold text-foreground">Carteira principal</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
      </p>
      <div className="mt-6">
        <WalletForm
          form={primaryForm}
          onSubmit={submitPrimary}
          isPending={isSavingPrimary}
          submitLabel="Salvar carteira"
        />
      </div>

      <div className="mt-12 border-t border-border pt-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-foreground">Carteira secundária</h3>
            {!isAddingSecondary ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Você ainda não adicionou uma carteira secundária.
              </p>
            ) : null}
          </div>
          {!isAddingSecondary ? (
            <button
              type="button"
              onClick={startAddingSecondary}
              className="shrink-0 text-sm font-semibold text-primary hover:underline"
            >
              Adicionar
            </button>
          ) : null}
        </div>

        {isAddingSecondary ? (
          <div className="mt-6">
            <button
              type="button"
              onClick={copyPrimaryIntoSecondary}
              className="mb-4 text-sm text-primary hover:underline"
            >
              Usar os mesmos dados da carteira principal
            </button>
            <WalletForm
              form={secondaryForm}
              onSubmit={submitSecondary}
              isPending={isSavingSecondary}
              submitLabel="Salvar carteira secundária"
            />
            {hasSecondaryWallet ? (
              <button
                type="button"
                onClick={removeSecondary}
                disabled={isRemovingSecondary}
                className="mt-3 text-sm text-muted-foreground hover:text-destructive"
              >
                Remover carteira secundária
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
