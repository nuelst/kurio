import { Link, useNavigate } from '@tanstack/react-router'
import { AlertCircle, Download, Heart, LogOut, MapPin, ShoppingCart, Tag, User } from 'lucide-react'

import { useLogout } from '@/features/auth'
import { cn } from '@/lib/utils'
import { notImplementedToast } from '@/shared/lib/not-implemented'

const navItems = [
  { label: 'Dados do perfil', to: '/profile' as const, icon: User },
  { label: 'Carteiras', to: '/wallets' as const, icon: MapPin },
]

const placeholderItems = [
  { label: 'Atividade', icon: ShoppingCart },
  { label: 'Lista de interesse', icon: Heart },
  { label: 'Ofertas', icon: Tag },
  { label: 'Arquivos baixados', icon: Download },
  { label: 'Suporte', icon: AlertCircle },
]

export function AccountSidebar() {
  const navigate = useNavigate()
  const logout = useLogout()

  return (
    <aside className="w-full shrink-0 lg:w-[280px]">
      <h1 className="text-lg font-bold text-foreground">Meu perfil</h1>

      <nav className="mt-6 flex flex-col" aria-label="Navegação da conta">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 border-l-2 border-transparent py-3 pl-4 text-sm text-muted-foreground transition-colors hover:text-primary data-[status=active]:border-primary data-[status=active]:text-primary"
            activeOptions={{ exact: true }}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}

        {placeholderItems.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => notImplementedToast(item.label)}
            className={cn(
              'flex items-center gap-3 border-l-2 border-transparent py-3 pl-4 text-left text-sm text-muted-foreground transition-colors hover:text-primary',
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </button>
        ))}

        <button
          type="button"
          onClick={() => {
            logout()
            navigate({ to: '/' })
          }}
          className="flex items-center gap-3 border-l-2 border-transparent py-3 pl-4 text-left text-sm font-semibold text-primary"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </nav>
    </aside>
  )
}
