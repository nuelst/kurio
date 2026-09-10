import { Link } from '@tanstack/react-router'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { OrderSnapshot } from '@/features/checkout/model/checkout'
import { ThankYouIcon } from '@/features/orders/ui/thank-you-icon'
import { formatEth } from '@/shared/lib/money'

function formatOrderDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso))
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`
}

export function OrderConfirmedCard({ snapshot }: { snapshot: OrderSnapshot }) {
  const explorerUrl = `https://etherscan.io/tx/${snapshot.txHash}`

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-primary bg-card p-8">
      <div className="flex justify-end">
        <Link to="/" aria-label="Fechar" className="text-muted-foreground hover:text-foreground">
          <X className="size-5" />
        </Link>
      </div>

      <div className="-mt-4 flex flex-col items-center text-center">
        <ThankYouIcon className="size-20 text-primary" />
        <h1 className="mt-4 text-lg font-bold text-foreground">
          Seus NFTs agora estão na sua carteira
        </h1>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-b border-border py-4 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">ID da transação</dt>
          <dd className="text-foreground">{truncateHash(snapshot.txHash)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Data</dt>
          <dd className="text-foreground">{formatOrderDate(snapshot.confirmedAt)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Total</dt>
          <dd className="text-foreground">{formatEth(snapshot.totalEth)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Carteira</dt>
          <dd className="text-foreground">{snapshot.wallet.type}</dd>
        </div>
      </div>

      <h2 className="mt-6 font-bold text-foreground">Detalhes da transação</h2>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>NFTs</span>
        <div className="flex gap-8">
          <span>Edições</span>
          <span>Subtotal</span>
        </div>
      </div>

      <div className="mt-2">
        {snapshot.items.map((item) => (
          <div key={item.nftId} className="flex items-center gap-3 border-b border-border py-3">
            <img
              src={item.imageUrl}
              alt=""
              width={44}
              height={44}
              className="size-11 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">ID do token: #{item.tokenNumber}</p>
            </div>
            <span className="w-14 shrink-0 text-center text-xs text-muted-foreground">
              (x {item.quantity})
            </span>
            <span className="w-20 shrink-0 text-right text-sm font-bold text-[#E89B55]">
              {formatEth(item.lineTotalEth)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Taxa de rede</span>
        <span className="text-foreground">{formatEth(snapshot.networkFeeEth)}</span>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="font-bold text-foreground">Total</span>
        <span className="text-lg font-bold text-[#E89B55]">{formatEth(snapshot.totalEth)}</span>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Transação confirmada na Ethereum. A propriedade foi transferida para sua carteira conectada
        e registrada na rede.
      </p>

      <Button asChild className="mt-4 w-full font-bold">
        <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
          Ver no Etherscan
        </a>
      </Button>
    </div>
  )
}
