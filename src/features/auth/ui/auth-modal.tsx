import { X } from 'lucide-react'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { authModalStore } from '@/features/auth/stores/auth-modal-store'
import { LoginForm } from '@/features/auth/ui/login-form'
import { SignupForm } from '@/features/auth/ui/signup-form'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/shared/hooks/use-media-query'

const descriptions = {
  login: 'Entre para gerenciar sua carteira, coleção e perfil de criador.',
  signup: 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.',
}

const mobileHeadings = {
  login: 'Entrar',
  signup: 'Criar perfil de colecionador',
}

const modalMinHeight = {
  login: 'sm:min-h-[600px]',
  signup: 'sm:min-h-[656px]',
}

export function AuthModal() {
  const isOpen = authModalStore((state) => state.isOpen)
  const mode = authModalStore((state) => state.mode)
  const close = authModalStore((state) => state.close)
  const setMode = authModalStore((state) => state.setMode)
  const isDesktopOrTablet = useMediaQuery('(min-width: 640px)')

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent
        showCloseButton={false}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          authModalStore.getState().triggerElement?.focus()
        }}
        className={cn(
          'fixed inset-0 top-0 left-0 z-50 flex h-dvh w-full max-w-full translate-x-0 translate-y-0 flex-col gap-0 overflow-y-auto rounded-none bg-background p-0 text-[13px] ring-0',
          'sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:w-[calc(100%-2rem)] sm:max-w-[500px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:overflow-hidden sm:rounded-lg sm:bg-sidebar sm:ring-1 sm:ring-foreground/10',
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
          {isDesktopOrTablet ? (
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
          ) : (
            <div className="mx-auto flex w-full max-w-[340px] flex-col items-center px-4 text-center">
              <span className="text-2xl font-bold tracking-[0.3em] text-foreground">KURIO</span>
              <h1 className="mt-10 text-xl font-bold text-foreground">{mobileHeadings[mode]}</h1>
            </div>
          )}

          <div className="mx-auto mt-8 w-full max-w-[340px] px-4">
            {mode === 'login' ? <LoginForm /> : <SignupForm />}
          </div>

          {!isDesktopOrTablet ? (
            <p className="mx-auto mt-2 w-full max-w-[340px] px-4 text-center text-sm text-muted-foreground">
              {mode === 'login' ? (
                <>
                  Novo na Kurio?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="font-semibold text-foreground hover:underline"
                  >
                    Crie uma conta
                  </button>
                </>
              ) : (
                <>
                  Já tem uma conta?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-semibold text-foreground hover:underline"
                  >
                    Entre
                  </button>
                </>
              )}
            </p>
          ) : null}
        </div>

        <div className="hidden h-[10px] w-full shrink-0 bg-primary sm:block" />
      </DialogContent>
    </Dialog>
  )
}
