import { Link } from '@tanstack/react-router'
import { Minus, Plus, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import type { CartLine } from '@/features/cart/model/cart'
import { formatEth } from '@/shared/lib/money'

interface MobileCartLineItemProps {
  line: CartLine
  onIncrement: (line: CartLine) => void
  onDecrement: (line: CartLine) => void
  onRemove: (nftId: string) => void
}

export function MobileCartLineItem({
  line,
  onIncrement,
  onDecrement,
  onRemove,
}: MobileCartLineItemProps) {
  const isAtLimit = line.quantity >= line.available || line.isSoldOut

  return (
    <div className="flex gap-3 rounded-2xl bg-sidebar p-3" data-testid="cart-line">
      <Link to="/nfts/$nftId" params={{ nftId: line.nftId }} className="shrink-0">
        <img
          src={line.imageUrl}
          alt=""
          width={72}
          height={72}
          className="size-[72px] rounded-xl object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to="/nfts/$nftId"
              params={{ nftId: line.nftId }}
              className="block truncate text-sm font-bold text-foreground"
              data-testid="cart-line-title"
            >
              {line.title}
            </Link>
            <p className="text-xs text-muted-foreground">Edição: {line.editionTier}</p>
            {line.isSoldOut ? (
              <Badge variant="destructive" className="mt-1">
                Esgotado
              </Badge>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onDecrement(line)}
              disabled={line.quantity <= 1 || line.isSoldOut}
              aria-label={`Diminuir quantidade de ${line.title}`}
              className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
            >
              <Minus className="size-3" />
            </button>
            <span
              className="w-3 text-center text-sm text-foreground"
              data-testid="cart-line-quantity"
            >
              {line.quantity}
            </span>
            {isAtLimit ? (
              <button
                type="button"
                onClick={() => onRemove(line.nftId)}
                aria-label={`Remover ${line.title} do carrinho`}
                className="flex size-6 items-center justify-center text-primary"
              >
                <Trash2 className="size-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onIncrement(line)}
                aria-label={`Aumentar quantidade de ${line.title}`}
                className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
              >
                <Plus className="size-3" />
              </button>
            )}
          </div>
        </div>

        <p className="mt-2 text-sm font-bold text-[#E89B55]" data-testid="cart-line-total">
          {formatEth(line.lineTotalEth)}
        </p>
      </div>
    </div>
  )
}
