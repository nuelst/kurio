import { Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { NftSummary } from '@/features/catalog/model/nft'
import { cn } from '@/lib/utils'
import { formatEth } from '@/shared/lib/money'

interface NftCardProps {
  nft: NftSummary
  onToggleFavorite: (nft: NftSummary) => void
}

export function NftCard({ nft, onToggleFavorite }: NftCardProps) {
  const isSoldOut = nft.edition.available <= 0

  return (
    <div
      className="flex flex-col gap-3 overflow-hidden rounded-[15px] bg-sidebar"
      data-testid="nft-card"
    >
      <div className="bg-muted relative aspect-square w-full overflow-hidden rounded-[15px]">
        <Link
          to="/nfts/$nftId"
          params={{ nftId: nft.id }}
          className="absolute inset-0"
          aria-label={nft.title}
        >
          <img
            src={nft.imageUrl}
            alt=""
            loading="lazy"
            width={250}
            height={250}
            className="size-full object-cover"
          />
        </Link>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2"
          aria-pressed={nft.isFavorite}
          aria-label={
            nft.isFavorite ? `Remover ${nft.title} dos favoritos` : `Favoritar ${nft.title}`
          }
          onClick={() => onToggleFavorite(nft)}
        >
          <Heart className={cn('size-4', nft.isFavorite && 'text-destructive fill-current')} />
        </Button>
        {isSoldOut ? (
          <Badge variant="destructive" className="absolute bottom-2 left-2">
            Esgotado
          </Badge>
        ) : null}
      </div>

      <Link to="/nfts/$nftId" params={{ nftId: nft.id }} className="flex flex-col gap-1 px-4 pb-4">
        <p className="text-xs text-[#B39463]">{nft.creatorName}</p>
        <h3
          className="truncate text-base leading-4 font-normal text-[#F5F1EB]"
          data-testid="nft-title"
        >
          {nft.title}
        </h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg leading-4 font-bold text-[#E89B55]" data-testid="nft-price">
            {formatEth(nft.edition.priceEth)}
          </span>
          <span className="text-xs text-[#B39463]">
            {nft.edition.available}/{nft.edition.totalSupply} disponíveis
          </span>
        </div>
      </Link>
    </div>
  )
}
