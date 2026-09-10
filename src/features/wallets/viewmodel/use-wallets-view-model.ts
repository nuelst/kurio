import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { removeWallet, saveWallet } from '@/features/wallets/api/wallets-api'
import { walletsQueries } from '@/features/wallets/api/wallets-queries'
import {
  type Wallet,
  type WalletFormInput,
  type WalletsResponse,
  walletFormSchema,
} from '@/features/wallets/model/wallet'

const emptyWallet: WalletFormInput = {
  label: '',
  network: 'Ethereum',
  address: '',
  type: 'MetaMask',
  ensName: '',
}

function toWallet(input: WalletFormInput): Wallet {
  return { ...input, ensName: input.ensName ?? '' }
}

export function useWalletsViewModel() {
  const queryClient = useQueryClient()
  const query = useQuery(walletsQueries.get())
  const [isAddingSecondary, setIsAddingSecondary] = useState(false)

  const primaryForm = useForm<WalletFormInput>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: emptyWallet,
  })
  const secondaryForm = useForm<WalletFormInput>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: emptyWallet,
  })

  useEffect(() => {
    if (!query.data) return
    if (query.data.primary && !primaryForm.formState.isDirty) {
      primaryForm.reset(query.data.primary)
    }
    if (query.data.secondary) {
      setIsAddingSecondary(true)
      if (!secondaryForm.formState.isDirty) secondaryForm.reset(query.data.secondary)
    }
  }, [query.data, primaryForm, secondaryForm])

  const savePrimary = useMutation({
    mutationFn: (input: WalletFormInput) => saveWallet('primary', toWallet(input)),
    onSuccess: (wallets: WalletsResponse) => {
      queryClient.setQueryData(['wallets'], wallets)
      if (wallets.primary) primaryForm.reset(wallets.primary)
      toast('Carteira principal salva.')
    },
    onError: (error) => {
      primaryForm.setError('root', { message: error.message })
    },
  })

  const saveSecondary = useMutation({
    mutationFn: (input: WalletFormInput) => saveWallet('secondary', toWallet(input)),
    onSuccess: (wallets: WalletsResponse) => {
      queryClient.setQueryData(['wallets'], wallets)
      if (wallets.secondary) secondaryForm.reset(wallets.secondary)
      toast('Carteira secundária salva.')
    },
    onError: (error) => {
      secondaryForm.setError('root', { message: error.message })
    },
  })

  const deleteSecondary = useMutation({
    mutationFn: () => removeWallet('secondary'),
    onSuccess: (wallets: WalletsResponse) => {
      queryClient.setQueryData(['wallets'], wallets)
      secondaryForm.reset(emptyWallet)
      setIsAddingSecondary(false)
      toast('Carteira secundária removida.')
    },
  })

  function copyPrimaryIntoSecondary() {
    const primary = primaryForm.getValues()
    secondaryForm.reset({ ...primary, label: primary.label ? `${primary.label} (backup)` : '' })
  }

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    primaryForm,
    secondaryForm,
    hasSecondaryWallet: Boolean(query.data?.secondary),
    isAddingSecondary,
    startAddingSecondary: () => setIsAddingSecondary(true),
    copyPrimaryIntoSecondary,
    isSavingPrimary: savePrimary.isPending,
    isSavingSecondary: saveSecondary.isPending,
    isRemovingSecondary: deleteSecondary.isPending,
    submitPrimary: primaryForm.handleSubmit((values) => savePrimary.mutate(values)),
    submitSecondary: secondaryForm.handleSubmit((values) => saveSecondary.mutate(values)),
    removeSecondary: () => deleteSecondary.mutate(),
  }
}
