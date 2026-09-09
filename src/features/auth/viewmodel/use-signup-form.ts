import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { register as registerUser } from '@/features/auth/api/auth-api'
import { type SignupInput, signupSchema } from '@/features/auth/model/auth'
import { authModalStore } from '@/features/auth/stores/auth-modal-store'
import { sessionStore } from '@/shared/stores/session-store'

export function useSignupForm() {
  const queryClient = useQueryClient()
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const mutation = useMutation({
    mutationFn: ({ confirmPassword: _confirmPassword, ...input }: SignupInput) =>
      registerUser(input),
    onSuccess: ({ user, accessToken }) => {
      sessionStore.getState().authenticate(accessToken, user)
      queryClient.invalidateQueries({ queryKey: ['catalog'] })
      toast.success(`Conta criada! Bem-vindo, ${user.name}.`)
      authModalStore.getState().close()
      form.reset()
    },
    onError: (error) => {
      if (error.fieldErrors?.length) {
        for (const fieldError of error.fieldErrors) {
          form.setError(fieldError.field as keyof SignupInput, { message: fieldError.message })
        }
        return
      }
      form.setError('root', { message: error.message })
    },
  })

  return {
    form,
    isPending: mutation.isPending,
    submit: form.handleSubmit((values) => mutation.mutate(values)),
  }
}
