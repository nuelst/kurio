import { Link } from '@tanstack/react-router'
import { Minus, Plus, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { CartLine } from '@/features/cart/model/cart'
import { formatEth } from '@/shared/lib/money'

interface CartLineItemProps {
  line: CartLine
  onIncrement: (line: CartLine) => void
  onDecrement: (line: CartLine) => void
  onRemove: (nftId: string) => void
}

export function CartLineItem({ line, onIncrement, onDecrement, onRemove }: CartLineItemProps) {
  return (
    <div
      className="grid grid-cols-[64px_1fr] items-center gap-4 rounded-lg bg-sidebar px-4 py-4 sm:grid-cols-[64px_1fr_110px_140px_110px_32px]"
      data-testid="cart-line"
    >
      <Link to="/nfts/$nftId" params={{ nftId: line.nftId }} className="shrink-0">
        <img
          src={line.imageUrl}
          alt=""
          width={64}
          height={64}
          className="size-16 rounded-lg object-cover"
        />
      </Link>

      <div className="min-w-0">
        <Link
          to="/nfts/$nftId"
          params={{ nftId: line.nftId }}
          className="block truncate text-base font-semibold text-foreground hover:text-primary"
          data-testid="cart-line-title"
        >
          {line.title}
        </Link>
        <p className="text-xs text-muted-foreground">ID do token: #{line.tokenNumber}</p>
        {line.isSoldOut ? (
          <Badge variant="destructive" className="mt-1">
            Esgotado
          </Badge>
        ) : null}
        <p className="mt-1 text-sm text-foreground sm:hidden">{formatEth(line.priceEth)}</p>
      </div>

      <div className="col-span-2 flex items-center justify-between gap-4 sm:contents">
        <div className="hidden text-sm text-foreground sm:block">{formatEth(line.priceEth)}</div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onDecrement(line)}
            disabled={line.quantity <= 1 || line.isSoldOut}
            aria-label={`Diminuir quantidade de ${line.title}`}
            className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-4 text-center text-foreground" data-testid="cart-line-quantity">
            {line.quantity}
          </span>
          <button
            type="button"
            onClick={() => onIncrement(line)}
            disabled={line.quantity >= line.available || line.isSoldOut}
            aria-label={`Aumentar quantidade de ${line.title}`}
            className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        <div className="text-sm font-bold text-[#E89B55]" data-testid="cart-line-total">
          {formatEth(line.lineTotalEth)}
        </div>

        <button
          type="button"
          onClick={() => onRemove(line.nftId)}
          aria-label={`Remover ${line.title} do carrinho`}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  )
}
