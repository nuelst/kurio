import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { cartQueries } from '@/features/cart/api/cart-queries'
import { useCartRealtimeSync } from '@/features/cart/viewmodel/use-cart-realtime-sync'
import { createOrder } from '@/features/checkout/api/checkout-api'
import {
  type CollectorFormInput,
  collectorFormSchema,
  type WalletConnectionStatus,
} from '@/features/checkout/model/checkout'
import { profileQueries } from '@/features/profile/api/profile-queries'
import { walletsQueries } from '@/features/wallets/api/wallets-queries'
import type { WalletSlot } from '@/features/wallets/model/wallet'
import { useIdempotencyKey } from '@/shared/hooks/use-idempotency-key'

const REQUIRED_NETWORK = 'Ethereum'
const SIMULATED_CONNECT_DELAY_MS = 700

interface ConnectionState {
  status: WalletConnectionStatus
  slot: WalletSlot | null
  rejectionReason?: string
}

export function useCheckoutViewModel() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const cartQuery = useQuery(cartQueries.get())
  useCartRealtimeSync()

  const profileQuery = useQuery(profileQueries.get())
  const walletsQuery = useQuery(walletsQueries.get())

  const collectorForm = useForm<CollectorFormInput>({
    resolver: zodResolver(collectorFormSchema),
    defaultValues: { name: '', email: '', ensName: '', note: '' },
  })

  useEffect(() => {
    if (!profileQuery.data || collectorForm.formState.isDirty) return
    collectorForm.reset({
      name: profileQuery.data.name,
      email: profileQuery.data.email,
      ensName: profileQuery.data.ensName,
      note: '',
    })
  }, [profileQuery.data, collectorForm])

  const [connection, setConnection] = useState<ConnectionState>({ status: 'idle', slot: null })
  const { key: idempotencyKey, renew: renewIdempotencyKey } = useIdempotencyKey('checkout')

  function connectWallet(slot: WalletSlot) {
    const wallet = slot === 'primary' ? walletsQuery.data?.primary : walletsQuery.data?.secondary
    if (!wallet) return

    setConnection({ status: 'connecting', slot })
    window.setTimeout(() => {
      if (wallet.network !== REQUIRED_NETWORK) {
        const reason = `Esta carteira está na rede ${wallet.network}, mas esta coleção é na rede ${REQUIRED_NETWORK}.`
        setConnection({ status: 'rejected', slot, rejectionReason: reason })
        toast('Conexão recusada pela carteira', { description: reason })
        return
      }
      setConnection({ status: 'connected', slot })
    }, SIMULATED_CONNECT_DELAY_MS)
  }

  function disconnectWallet() {
    setConnection({ status: 'idle', slot: null })
  }

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      navigate({ to: '/orders/$orderId', params: { orderId: order.id } })
    },
    onError: (error) => {
      if (error.status === 409) {
        renewIdempotencyKey()
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        toast('Não foi possível confirmar o pedido', { description: error.message })
        return
      }
      if (error.kind === 'transient' && error.status === null) {
        collectorForm.setError('root', {
          message:
            'Não foi possível confirmar se o pedido foi recebido. Tente confirmar novamente — não será cobrado em duplicidade.',
        })
        return
      }
      collectorForm.setError('root', { message: error.message })
    },
  })

  const quote = cartQuery.data

  const submit = collectorForm.handleSubmit((values) => {
    if (!quote || quote.items.length === 0) return
    if (connection.status !== 'connected' || !connection.slot) {
      toast('Conecte uma carteira para continuar.')
      return
    }

    createOrderMutation.mutate({
      idempotencyKey,
      walletSlot: connection.slot,
      collector: values,
      expectedTotals: {
        subtotalEth: quote.subtotalEth,
        discountEth: quote.discountEth,
        networkFeeEth: quote.networkFeeEth,
        totalEth: quote.totalEth,
      },
    })
  })

  return {
    quote,
    isLoadingCart: cartQuery.isLoading,
    isCartError: cartQuery.isError,
    cartError: cartQuery.error,
    refetchCart: cartQuery.refetch,
    isLoadingWallets: walletsQuery.isLoading,
    wallets: walletsQuery.data,
    collectorForm,
    connection,
    connectWallet,
    disconnectWallet,
    submit,
    isSubmitting: createOrderMutation.isPending,
  }
}
