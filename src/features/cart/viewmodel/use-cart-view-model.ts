import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type FormEvent, useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  applyCoupon as applyCouponRequest,
  removeCartItem,
  removeCoupon as removeCouponRequest,
  updateCartItemQuantity,
} from '@/features/cart/api/cart-api'
import { cartQueries } from '@/features/cart/api/cart-queries'
import { applyNftUpdateToLine, recomputeQuote } from '@/features/cart/lib/cart-quote'
import type { CartLine, CartQuote } from '@/features/cart/model/cart'
import { catalogQueries } from '@/features/catalog/api/catalog-queries'
import type { NftSummary, NftUpdatedEvent } from '@/features/catalog/model/nft'
import { useToggleFavorite } from '@/features/favorites/viewmodel/use-toggle-favorite'
import type { ApiError } from '@/shared/lib/http'
import { multiply } from '@/shared/lib/money'
import { notImplementedToast } from '@/shared/lib/not-implemented'
import { createEventVersionTracker } from '@/shared/lib/realtime-event'
import { getSocket } from '@/shared/lib/socket'

const RELATED_LIMIT = 10

export function useCartViewModel() {
  const queryClient = useQueryClient()
  const query = useQuery(cartQueries.get())
  const quote = query.data

  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState<string | null>(null)

  const relatedQuery = useQuery({
    ...catalogQueries.list({ sort: 'relevance', page: 1 }),
    enabled: Boolean(quote),
  })
  const cartNftIds = new Set((quote?.items ?? []).map((item) => item.nftId))
  const relatedItems = (relatedQuery.data?.items ?? [])
    .filter((item) => !cartNftIds.has(item.id))
    .slice(0, RELATED_LIMIT)

  const relatedFavorite = useToggleFavorite()
  function toggleFavoriteFor(item: NftSummary) {
    relatedFavorite.mutate({ nftId: item.id, isFavorite: item.isFavorite })
  }

  function patchLine(nftId: string, updater: (line: CartLine) => CartLine) {
    queryClient.setQueryData<CartQuote>(['cart'], (current) => {
      if (!current) return current
      return recomputeQuote(
        current.items.map((item) => (item.nftId === nftId ? updater(item) : item)),
        current.coupon,
      )
    })
  }

  const quantityMutation = useMutation({
    mutationFn: ({ nftId, quantity }: { nftId: string; quantity: number }) =>
      updateCartItemQuantity(nftId, quantity),
    onMutate: async ({ nftId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] })
      const previous = queryClient.getQueryData<CartQuote>(['cart'])
      patchLine(nftId, (line) => ({
        ...line,
        quantity,
        lineTotalEth: multiply(line.priceEth, quantity),
      }))
      return { previous }
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(['cart'], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (nftId: string) => removeCartItem(nftId),
    onMutate: async (nftId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] })
      const previous = queryClient.getQueryData<CartQuote>(['cart'])
      queryClient.setQueryData<CartQuote>(['cart'], (current) => {
        if (!current) return current
        return recomputeQuote(
          current.items.filter((item) => item.nftId !== nftId),
          current.coupon,
        )
      })
      return { previous }
    },
    onError: (_error, _nftId, context) => {
      if (context?.previous) queryClient.setQueryData(['cart'], context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const applyCouponMutation = useMutation({
    mutationFn: (code: string) => applyCouponRequest(code),
    onSuccess: (nextQuote) => {
      queryClient.setQueryData(['cart'], nextQuote)
      setCouponCode('')
      setCouponError(null)
      toast(`Cupom ${nextQuote.coupon?.code} aplicado.`)
    },
    onError: (error: ApiError) => {
      setCouponError(error.message)
    },
  })

  const removeCouponMutation = useMutation({
    mutationFn: () => removeCouponRequest(),
    onSuccess: (nextQuote) => {
      queryClient.setQueryData(['cart'], nextQuote)
    },
  })

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
          description: 'O resumo do carrinho foi recalculado.',
        })
      }
    }

    socket.on('nft.updated', handleNftUpdated)
    return () => {
      socket.off('nft.updated', handleNftUpdated)
    }
  }, [queryClient])

  function incrementQuantity(line: CartLine) {
    if (line.isSoldOut) return
    const next = Math.min(line.quantity + 1, line.available)
    if (next === line.quantity) return
    quantityMutation.mutate({ nftId: line.nftId, quantity: next })
  }

  function decrementQuantity(line: CartLine) {
    const next = Math.max(1, line.quantity - 1)
    if (next === line.quantity) return
    quantityMutation.mutate({ nftId: line.nftId, quantity: next })
  }

  function removeItem(nftId: string) {
    removeMutation.mutate(nftId)
  }

  function submitCoupon(event: FormEvent) {
    event.preventDefault()
    const code = couponCode.trim()
    if (!code) return
    applyCouponMutation.mutate(code)
  }

  function clearCoupon() {
    setCouponError(null)
    removeCouponMutation.mutate()
  }

  function checkout() {
    notImplementedToast('Pagamento')
  }

  return {
    quote,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    couponCode,
    setCouponCode,
    couponError,
    isApplyingCoupon: applyCouponMutation.isPending,
    incrementQuantity,
    decrementQuantity,
    removeItem,
    submitCoupon,
    clearCoupon,
    checkout,
    relatedItems,
    isRelatedLoading: relatedQuery.isLoading,
    toggleFavoriteFor,
  }
}
