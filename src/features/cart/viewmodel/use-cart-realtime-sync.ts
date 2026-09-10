import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'

import { applyNftUpdateToLine, recomputeQuote } from '@/features/cart/lib/cart-quote'
import type { CartQuote } from '@/features/cart/model/cart'
import type { NftUpdatedEvent } from '@/features/catalog/model/nft'
import { createEventVersionTracker } from '@/shared/lib/realtime-event'
import { getSocket } from '@/shared/lib/socket'

export function useCartRealtimeSync(): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = getSocket()
    const tracker = createEventVersionTracker()

    function handleNftUpdated(event: NftUpdatedEvent) {
      if (!tracker.accept(event)) return

      const current = queryClient.getQueryData<CartQuote>(['cart'])
      const affected = current?.items.find((item) => item.nftId === event.data.nftId)
      if (!affected) return

      const wasAvailable = !affected.isSoldOut
      const priceChanged = affected.priceEth !== event.data.priceEth
      const becameSoldOut = wasAvailable && event.data.available <= 0

      queryClient.setQueryData<CartQuote>(['cart'], (quote) => {
        if (!quote) return quote
        return recomputeQuote(
          quote.items.map((item) =>
            item.nftId === event.data.nftId
              ? applyNftUpdateToLine(item, event.data.priceEth, event.data.available)
              : item,
          ),
          quote.coupon,
        )
      })

      if (becameSoldOut) {
        toast(`${affected.title} ficou indisponível`, {
          description: 'Removemos o valor do total — remova o item ou aguarde reposição.',
        })
      } else if (priceChanged) {
        toast(`Preço de ${affected.title} foi atualizado`, {
          description: 'O resumo foi recalculado — confira antes de continuar.',
        })
      }
    }

    socket.on('nft.updated', handleNftUpdated)
    return () => {
      socket.off('nft.updated', handleNftUpdated)
    }
  }, [queryClient])
}
