import { Link } from '@tanstack/react-router'

import { notImplementedToast } from '@/shared/lib/not-implemented'
import { HeartIcon, HomeIcon, ShopIcon, UserIcon } from '@/shared/ui/icons'

const tabLinkClassName =
  'flex flex-1 items-center justify-center py-3 text-muted-foreground transition-colors data-[status=active]:text-primary'

export function MobileTabBar() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background md:hidden"
    >
      <Link to="/" className={tabLinkClassName} activeOptions={{ exact: true }}>
        <HomeIcon className="size-5" />
        <span className="sr-only">Início</span>
      </Link>
      <button
        type="button"
        onClick={() => notImplementedToast('Favoritos')}
        className={tabLinkClassName}
      >
        <HeartIcon className="size-5" />
        <span className="sr-only">Favoritos</span>
      </button>
      <Link to="/cart" className={tabLinkClassName}>
        <ShopIcon className="size-5" />
        <span className="sr-only">Carrinho</span>
      </Link>
      <Link to="/profile" className={tabLinkClassName}>
        <UserIcon className="size-5" />
        <span className="sr-only">Perfil</span>
      </Link>
    </nav>
  )
}
