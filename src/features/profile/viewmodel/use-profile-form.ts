import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { updateProfile } from '@/features/profile/api/profile-api'
import { profileQueries } from '@/features/profile/api/profile-queries'
import { type ProfileFormInput, profileFormSchema } from '@/features/profile/model/profile'
import { placeholderImage } from '@/mocks/fixtures/placeholder-image'
import { sessionStore, useSession } from '@/shared/stores/session-store'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024

export function useProfileForm() {
  const queryClient = useQueryClient()
  const sessionUser = useSession((state) => state.user)
  const query = useQuery(profileQueries.get())

  const form = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      ensName: '',
      avatarUrl: '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  useEffect(() => {
    if (!query.data || form.formState.isDirty) return
    form.reset({
      name: query.data.name,
      username: query.data.username,
      email: query.data.email,
      ensName: query.data.ensName,
      avatarUrl: query.data.avatarUrl,
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    })
  }, [query.data, form])

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile'], profile)
      if (sessionUser) {
        sessionStore.getState().updateUser({ ...sessionUser, ...profile })
      }
      form.reset({
        ...profile,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      })
      toast('Perfil atualizado.')
    },
    onError: (error) => {
      if (error.fieldErrors?.length) {
        for (const fieldError of error.fieldErrors) {
          form.setError(fieldError.field as keyof ProfileFormInput, { message: fieldError.message })
        }
        return
      }
      form.setError('root', { message: error.message })
    },
  })

  function onAvatarSelected(file: File) {
    if (!file.type.startsWith('image/')) {
      toast('Selecione um arquivo de imagem.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast('Imagem muito grande.', { description: 'Escolha um arquivo de até 2MB.' })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        form.setValue('avatarUrl', reader.result, { shouldDirty: true })
      }
    }
    reader.readAsDataURL(file)
  }

  function removeAvatar() {
    const seed = sessionUser?.id ?? 'colecionador'
    form.setValue('avatarUrl', placeholderImage(seed), { shouldDirty: true })
  }

  return {
    form,
    avatarUrl: form.watch('avatarUrl'),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isPending: mutation.isPending,
    onAvatarSelected,
    removeAvatar,
    submit: form.handleSubmit((values) => {
      const { confirmNewPassword: _confirmNewPassword, ...input } = values
      mutation.mutate({
        ...input,
        currentPassword: input.currentPassword || undefined,
        newPassword: input.newPassword || undefined,
      })
    }),
  }
}
