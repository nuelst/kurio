import { Heart, Mail, Minus, Plus, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { EditionTier } from '@/features/nft-detail/model/nft-detail'
import { LinkedinGlyph, TwitterGlyph } from '@/features/nft-detail/ui/share-icons'
import { cn } from '@/lib/utils'
import { formatEth } from '@/shared/lib/money'

const editionTiers: EditionTier[] = ['1/1', '1/10', '1/50', 'Aberta']

interface NftPurchasePanelProps {
  title: string
  priceEth: string
  rating: number
  reviewCount: number
  summary: string
  editionTier: EditionTier
  quantity: number
  available: number
  isFavorite: boolean
  tokenNumber: string
  collectionName: string
  attributes: string[]
  onIncrement: () => void
  onDecrement: () => void
  onToggleFavorite: () => void
  onBuy: () => void
  onShare: (channel: 'twitter' | 'linkedin' | 'email') => void
}

export function NftPurchasePanel({
  title,
  priceEth,
  rating,
  reviewCount,
  summary,
  editionTier,
  quantity,
  available,
  isFavorite,
  tokenNumber,
  collectionName,
  attributes,
  onIncrement,
  onDecrement,
  onToggleFavorite,
  onBuy,
  onShare,
}: NftPurchasePanelProps) {
  const isSoldOut = available <= 0

  return (
    <div className="flex flex-1 flex-col justify-between gap-6 lg:h-[444px]">
      <div>
        <h1 className="text-[28px] leading-7 font-bold text-foreground">{title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <span className="text-[22px] leading-4 font-bold text-[#E89B55]">
            {formatEth(priceEth)}
          </span>
          <div className="flex items-center gap-1 text-[15px] text-muted-foreground">
            <div className="flex items-center gap-0.5 text-primary" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  // biome-ignore lint/suspicious/noArrayIndexKey: static 5-star display, never reorders
                  key={index}
                  className={cn('size-4', index < Math.round(rating) && 'fill-current')}
                />
              ))}
            </div>
            <span>{reviewCount} avaliações de colecionadores</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-foreground">Sobre este NFT:</h2>
        <p className="mt-1 text-sm leading-6 text-[#CFB28C]">{summary}</p>
      </div>

      <div>
        <h2 className="font-semibold text-foreground">Edição:</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {editionTiers.map((tier) => (
            <span
              key={tier}
              className={cn(
                'rounded-full border px-3 py-1 text-xs',
                tier === editionTier
                  ? 'border-primary text-primary'
                  : 'border-border text-muted-foreground',
              )}
            >
              {tier === 'Aberta' ? 'ABERTA' : tier}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onDecrement}
            disabled={quantity <= 1 || isSoldOut}
            aria-label="Diminuir quantidade"
            className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-4 text-center text-foreground" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={onIncrement}
            disabled={quantity >= available || isSoldOut}
            aria-label="Aumentar quantidade"
            className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <Button
          type="button"
          disabled={isSoldOut}
          onClick={onBuy}
          className="px-8 font-bold uppercase"
        >
          {isSoldOut ? 'Esgotado' : 'Comprar'}
        </Button>

        <Button type="button" variant="outline" onClick={onToggleFavorite}>
          <Heart className={cn('size-4', isFavorite && 'fill-current text-destructive')} />
          {isFavorite ? 'Favoritado' : 'Favoritar'}
        </Button>
      </div>

      <div className="space-y-1 text-sm">
        <p>
          <span className="font-semibold text-foreground">ID do token: </span>
          <span className="text-muted-foreground">#{tokenNumber}</span>
        </p>
        <p>
          <span className="font-semibold text-foreground">Coleção: </span>
          <span className="text-muted-foreground">{collectionName}</span>
        </p>
        <p>
          <span className="font-semibold text-foreground">Atributos: </span>
          <span className="text-muted-foreground">{attributes.join(', ')}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[15px] leading-4 font-bold text-foreground">
          Compartilhar este NFT:
        </span>
        <button
          type="button"
          onClick={() => onShare('linkedin')}
          aria-label="Compartilhar no LinkedIn"
          className="flex size-7 items-center justify-center rounded-full border border-border text-foreground"
        >
          <LinkedinGlyph className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onShare('email')}
          aria-label="Compartilhar por e-mail"
          className="flex size-7 items-center justify-center rounded-full border border-border text-foreground"
        >
          <Mail className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onShare('twitter')}
          aria-label="Compartilhar no Twitter"
          className="flex size-7 items-center justify-center rounded-full border border-border text-foreground"
        >
          <TwitterGlyph className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
