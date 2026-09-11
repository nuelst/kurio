import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FacebookIcon, GoogleIcon } from '@/features/auth/ui/oauth-icons'
import { useSignupForm } from '@/features/auth/viewmodel/use-signup-form'
import { notImplementedToast } from '@/shared/lib/not-implemented'

export function SignupForm() {
  const { form, isPending, submit } = useSignupForm()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    formState: { errors },
  } = form

  return (
    <form onSubmit={submit} noValidate className="flex flex-col">
      <div>
        <Input
          type="text"
          placeholder="Nome de usuário"
          aria-label="Nome de usuário"
          aria-invalid={Boolean(errors.name)}
          {...register('name')}
        />
        {errors.name ? (
          <p className="mt-1.5 text-xs text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="mt-3">
        <Input
          type="email"
          placeholder="Digite seu e-mail"
          aria-label="E-mail"
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
        />
        {errors.email ? (
          <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="mt-3 relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          placeholder="Senha"
          aria-label="Senha"
          aria-invalid={Boolean(errors.password)}
          className="pr-10"
          {...register('password')}
        />
        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          className="absolute inset-y-0 right-3 flex items-center text-primary"
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
        {errors.password ? (
          <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      <div className="mt-3">
        <Input
          type="password"
          placeholder="Confirmar senha"
          aria-label="Confirmar senha"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword ? (
          <p className="mt-1.5 text-xs text-destructive">{errors.confirmPassword.message}</p>
        ) : null}
      </div>

      {errors.root ? (
        <p role="alert" className="mt-3 text-center text-sm text-destructive">
          {errors.root.message}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isPending}
        className="mt-6 h-[45px] w-full rounded-[5px] text-base font-semibold"
      >
        {isPending ? 'Criando conta...' : 'Criar conta'}
      </Button>

      <div className="mt-6 mb-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        Ou continue com
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => notImplementedToast('Cadastro com Google')}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-[5px] border border-[#3F2319] text-sm text-foreground"
        >
          <GoogleIcon className="size-4" />
          Continuar com Google
        </button>
        <button
          type="button"
          onClick={() => notImplementedToast('Cadastro com Facebook')}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-[5px] border border-[#3F2319] text-sm text-foreground"
        >
          <FacebookIcon className="size-4" />
          Continuar com Facebook
        </button>
      </div>
    </form>
  )
}
