import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { login } from '@/features/auth/api/auth-api'
import { type LoginInput, loginSchema } from '@/features/auth/model/auth'
import { authModalStore } from '@/features/auth/stores/auth-modal-store'
import { sessionStore } from '@/shared/stores/session-store'

export function useLoginForm() {
  const queryClient = useQueryClient()
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ user, accessToken }) => {
      sessionStore.getState().authenticate(accessToken, user)
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
      toast.success(`Bem-vindo de volta, ${user.name}!`)
      authModalStore.getState().close()
      form.reset()
    },
    onError: (error) => {
      form.setError('root', { message: error.message })
    },
  })

  return {
    form,
    isPending: mutation.isPending,
    submit: form.handleSubmit((values) => mutation.mutate(values)),
  }
}
