import { Link } from '@tanstack/react-router'
import { X, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function OrderDeclinedCard() {
  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-destructive bg-card p-8">
      <div className="flex justify-end">
        <Link to="/" aria-label="Fechar" className="text-muted-foreground hover:text-foreground">
          <X className="size-5" />
        </Link>
      </div>

      <div className="-mt-4 flex flex-col items-center text-center">
        <XCircle className="size-20 text-destructive" />
        <h1 className="mt-4 text-lg font-bold text-foreground">Pagamento recusado</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Não foi possível confirmar seu pedido nesta tentativa. Nada foi cobrado e seus itens
          continuam no carrinho.
        </p>
      </div>

      <Button asChild className="mt-6 w-full font-bold">
        <Link to="/checkout">Tentar novamente</Link>
      </Button>
    </div>
  )
}
