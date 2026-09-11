import type { CartLine } from '@/features/cart/model/cart'
import { formatEth } from '@/shared/lib/money'

export function CheckoutItemRow({ line }: { line: CartLine }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-sidebar p-3">
      <img
        src={line.imageUrl}
        alt=""
        width={48}
        height={48}
        className="size-12 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{line.title}</p>
        <p className="text-xs text-muted-foreground">ID do token: #{line.tokenNumber}</p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">(x {line.quantity})</span>
      <span className="w-20 shrink-0 text-right text-sm font-bold text-[#E89B55]">
        {formatEth(line.lineTotalEth)}
      </span>
    </div>
  )
}
