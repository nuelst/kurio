import { Star } from 'lucide-react'
import type { NftReview } from '@/features/nft-detail/model/nft-detail'
import type { NftDetailTab } from '@/features/nft-detail/viewmodel/use-nft-detail-view-model'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/shared/ui/empty-state'

interface NftDetailTabsProps {
  activeTab: NftDetailTab
  onTabChange: (tab: NftDetailTab) => void
  description: string
  network: string
  contractAddress: string
  royaltyPercent: number
  reviews: NftReview[]
  reviewCount: number
}

export function NftDetailTabs({
  activeTab,
  onTabChange,
  description,
  network,
  contractAddress,
  royaltyPercent,
  reviews,
  reviewCount,
}: NftDetailTabsProps) {
  return (
    <section className="mt-12">
      <div className="flex gap-8 border-b border-border">
        <button
          type="button"
          onClick={() => onTabChange('details')}
          className={cn(
            'border-b-2 pb-3 font-semibold',
            activeTab === 'details'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground',
          )}
        >
          Detalhes do NFT
        </button>
        <button
          type="button"
          onClick={() => onTabChange('reviews')}
          className={cn(
            'border-b-2 pb-3 font-semibold',
            activeTab === 'reviews'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground',
          )}
        >
          Avaliações de colecionadores ({reviewCount})
        </button>
      </div>

      {activeTab === 'details' ? (
        <div className="mt-6 max-w-3xl space-y-4 text-sm leading-6 text-[#CFB28C]">
          {description.split('\n\n').map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div>
            <h3 className="font-semibold text-foreground">Rede:</h3>
            <p>Cunhado na {network} com procedência imutável e metadados armazenados no IPFS.</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Contrato:</h3>
            <p>
              Direitos autorais do criador: {royaltyPercent}% nas vendas secundárias, pagos
              automaticamente pelos mercados compatíveis.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Direitos autorais:</h3>
            <p>{contractAddress} · Contrato inteligente ERC-721 verificado.</p>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.length === 0 ? (
            <EmptyState title="Ainda não há avaliações" description="Seja o primeiro a avaliar." />
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-lg bg-sidebar p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">{review.authorName}</p>
                  <div className="flex items-center gap-0.5 text-primary" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        // biome-ignore lint/suspicious/noArrayIndexKey: fixed 5-star display per review, never reorders
                        key={index}
                        className={cn('size-3.5', index < review.rating && 'fill-current')}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#CFB28C]">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  )
}
