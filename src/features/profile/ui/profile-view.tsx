import { Eye, EyeOff } from 'lucide-react'
import { type ReactNode, useRef, useState } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProfileSkeleton } from '@/features/profile/ui/profile-skeleton'
import type { useProfileForm } from '@/features/profile/viewmodel/use-profile-form'
import { ErrorState } from '@/shared/ui/error-state'

type ProfileFormViewModel = ReturnType<typeof useProfileForm>

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <span className="text-sm font-semibold text-foreground">
        {label}
        {required ? <span className="ml-0.5 text-primary">*</span> : null}
      </span>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1.5 text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

function PasswordField({
  label,
  registration,
  error,
}: {
  label: string
  registration: UseFormRegisterReturn
  error?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <Field label={label} error={error}>
      <div className="relative">
        <Input
          type={visible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          className="pr-10"
          {...registration}
        />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </Field>
  )
}

export function ProfileView(viewModel: ProfileFormViewModel) {
  const {
    form,
    avatarUrl,
    isLoading,
    isError,
    error,
    refetch,
    isPending,
    onAvatarSelected,
    removeAvatar,
    submit,
  } = viewModel
  const {
    register,
    formState: { errors },
  } = form
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (isLoading) return <ProfileSkeleton />
  if (isError) {
    return (
      <ErrorState
        title="Não foi possível carregar seu perfil"
        description={error?.message}
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex-1">
      <h2 className="text-lg font-bold text-foreground">Perfil do colecionador</h2>

      <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <Field label="Nome de exibição" required error={errors.name?.message}>
          <Input aria-invalid={Boolean(errors.name)} {...register('name')} />
        </Field>
        <Field label="Nome de usuário" required error={errors.username?.message}>
          <Input aria-invalid={Boolean(errors.username)} {...register('username')} />
        </Field>
        <Field label="E-mail" required error={errors.email?.message}>
          <Input type="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
        </Field>
        <Field label="Nome ENS" error={errors.ensName?.message}>
          <Input
            placeholder="nome.eth"
            aria-invalid={Boolean(errors.ensName)}
            {...register('ensName')}
          />
        </Field>
      </div>

      <div className="mt-8">
        <span className="text-sm font-semibold text-foreground">Avatar</span>
        <div className="mt-2 flex items-center gap-4">
          <img
            src={avatarUrl}
            alt=""
            width={56}
            height={56}
            className="size-14 shrink-0 rounded-full object-cover"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onAvatarSelected(file)
              event.target.value = ''
            }}
          />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
            Alterar
          </Button>
          <button
            type="button"
            onClick={removeAvatar}
            className="text-sm text-muted-foreground hover:text-destructive"
          >
            Remover
          </button>
        </div>
      </div>

      <div className="mt-8 max-w-md">
        <h3 className="font-semibold text-foreground">Alterar senha</h3>
        <div className="mt-3 flex flex-col gap-4">
          <PasswordField
            label="Senha atual"
            registration={register('currentPassword')}
            error={errors.currentPassword?.message}
          />
          <PasswordField
            label="Nova senha"
            registration={register('newPassword')}
            error={errors.newPassword?.message}
          />
          <PasswordField
            label="Confirmar nova senha"
            registration={register('confirmNewPassword')}
            error={errors.confirmNewPassword?.message}
          />
        </div>
      </div>

      {errors.root ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {errors.root.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="mt-8 px-8 font-bold">
        {isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  )
}
