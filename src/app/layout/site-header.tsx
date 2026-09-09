import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { notImplementedToast } from '@/shared/lib/not-implemented'
import { CartIcon, LoginIcon, SearchIcon } from '@/shared/ui/icons'

const secondaryNavItems = ['Mercado', 'Criadores', 'Aprenda']

export function SiteHeader() {
  return (
    <header>
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-6 border-b-[3px] border-primary px-4 sm:px-6">
        <Link to="/" className="text-lg font-bold tracking-[0.2em] text-foreground">
          KURIO
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 text-sm md:flex">
          <Link
            to="/"
            className="border-b-2 border-primary pb-1 font-medium text-primary"
            activeOptions={{ exact: true }}
          >
            Início
          </Link>
          {secondaryNavItems.map((item) => (
            <button
              key={item}
              type="button"
              className="pb-1 text-foreground/90 transition-colors hover:text-primary"
              onClick={() => notImplementedToast(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Buscar"
            onClick={() => notImplementedToast('Busca global')}
          >
            <SearchIcon className="size-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Carrinho"
            onClick={() => notImplementedToast('Carrinho')}
          >
            <CartIcon className="size-6" />
          </Button>
          <Button type="button" onClick={() => notImplementedToast('Login')}>
            <LoginIcon className="size-5" />
            Entrar
          </Button>
        </div>
      </div>
    </header>
  )
}
