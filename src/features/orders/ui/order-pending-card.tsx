import { Loader2 } from 'lucide-react'

export function OrderPendingCard() {
  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
      <Loader2 className="mx-auto size-12 animate-spin text-primary" aria-hidden="true" />
      <h1 className="mt-4 text-lg font-bold text-foreground">Processando seu pedido</h1>
      <p className="mt-2 text-sm text-muted-foreground" role="status">
        Estamos confirmando sua compra na rede. Isso leva só alguns instantes — não feche esta
        página.
      </p>
    </div>
  )
}
