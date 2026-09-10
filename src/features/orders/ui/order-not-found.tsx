import { Link } from '@tanstack/react-router'

export function OrderNotFound() {
  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
      <h1 className="text-lg font-bold text-foreground">Pedido não encontrado</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Este pedido não existe ou não pertence à sua conta.
      </p>
      <Link to="/" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
        Voltar ao catálogo
      </Link>
    </div>
  )
}
