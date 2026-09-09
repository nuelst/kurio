import { X } from 'lucide-react'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { authModalStore } from '@/features/auth/stores/auth-modal-store'
import { LoginForm } from '@/features/auth/ui/login-form'
import { SignupForm } from '@/features/auth/ui/signup-form'
import { cn } from '@/lib/utils'

const descriptions = {
  login: 'Entre para gerenciar sua carteira, coleção e perfil de criador.',
  signup: 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.',
}

const modalMinHeight = {
  login: 'min-h-[600px]',
  signup: 'min-h-[656px]',
}

export function AuthModal() {
  const isOpen = authModalStore((state) => state.isOpen)
  const mode = authModalStore((state) => state.mode)
  const close = authModalStore((state) => state.close)
  const setMode = authModalStore((state) => state.setMode)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'flex w-[calc(100%-2rem)] max-w-[500px] text-[13px] flex-col gap-0 overflow-hidden rounded-lg bg-sidebar p-0 sm:max-w-[500px]',
          modalMinHeight[mode],
        )}
      >
        <DialogTitle className="sr-only">
          {mode === 'login' ? 'Entrar na Kurio' : 'Criar conta na Kurio'}
        </DialogTitle>

        <button
          type="button"
          onClick={close}
          aria-label="Fechar"
          className="absolute top-6 right-6 text-primary hover:opacity-80"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-1 flex-col pt-12 pb-[93px]">
          <div className="mx-auto flex w-full max-w-[340px] flex-col items-center px-4 text-center">
            <div className="flex items-center gap-2 text-xl leading-4 font-medium">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={cn(mode === 'login' ? 'text-primary' : 'text-foreground')}
              >
                Entrar
              </button>
              <span className="text-muted-foreground">|</span>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={cn(mode === 'signup' ? 'text-primary' : 'text-foreground')}
              >
                Criar conta
              </button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">{descriptions[mode]}</p>
          </div>

          <div className="mx-auto mt-8 w-full max-w-[340px] px-4">
            {mode === 'login' ? <LoginForm /> : <SignupForm />}
          </div>
        </div>

        <div className="h-[10px] w-full shrink-0 bg-primary" />
      </DialogContent>
    </Dialog>
  )
}
