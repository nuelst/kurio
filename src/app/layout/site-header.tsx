import { Link } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { authModalStore, useLogout } from '@/features/auth'
import { useCartItemCount } from '@/features/cart'
import { notImplementedToast } from '@/shared/lib/not-implemented'
import { useSession } from '@/shared/stores/session-store'
import { CartIcon, LoginIcon, SearchIcon } from '@/shared/ui/icons'

const secondaryNavItems = ['Mercado', 'Criadores', 'Aprenda']

export function SiteHeader() {
  const user = useSession((state) => state.user)
  const logout = useLogout()
  const cartItemCount = useCartItemCount()

  return (
    <header className="hidden md:block">
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
          <Button asChild variant="ghost" size="icon" className="relative" aria-label="Carrinho">
            <Link to="/cart">
              <CartIcon className="size-6" />
              {cartItemCount > 0 ? (
                <span
                  className="absolute top-0 right-0 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                  data-testid="cart-item-count"
                >
                  {cartItemCount}
                </span>
              ) : null}
            </Link>
          </Button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="flex items-center gap-2">
                <img
                  src={user.avatarUrl}
                  alt=""
                  width={32}
                  height={32}
                  className="size-8 rounded-full object-cover"
                />
                <span className="hidden max-w-24 truncate text-sm text-foreground sm:inline">
                  {user.name}
                </span>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Sair"
                onClick={() => logout()}
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          ) : (
            <Button type="button" onClick={() => authModalStore.getState().open('login')}>
              <LoginIcon className="size-5" />
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
