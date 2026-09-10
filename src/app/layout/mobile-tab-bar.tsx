import { Link } from '@tanstack/react-router'

import { notImplementedToast } from '@/shared/lib/not-implemented'
import { useSession } from '@/shared/stores/session-store'
import {
  HeartIcon,
  HomeIcon,
  LoginIcon,
  MobileFabIcon,
  ShopIcon,
  UserIcon,
} from '@/shared/ui/icons'

const tabLinkClassName =
  'flex flex-1 items-center justify-center py-3 text-muted-foreground transition-colors data-[status=active]:text-primary'

const BAR_WIDTH = 414
const BAR_HEIGHT = 94.95
const BAR_TOP = 31
const CONTAINER_HEIGHT = BAR_TOP + BAR_HEIGHT
const CORNER_RADIUS = 28
const FAB_SIZE = 65
const NOTCH_R = FAB_SIZE / 2 + 3.5
const NOTCH_CX = BAR_WIDTH / 2
const TRANSITION = 24

const notchPath = `
  M 0,${BAR_HEIGHT}
  L 0,${CORNER_RADIUS}
  Q 0,0 ${CORNER_RADIUS},0
  L ${NOTCH_CX - NOTCH_R - TRANSITION},0
  C ${NOTCH_CX - NOTCH_R - TRANSITION * 0.4},0 ${NOTCH_CX - NOTCH_R},${NOTCH_R * 0.55} ${NOTCH_CX - NOTCH_R},${NOTCH_R}
  A ${NOTCH_R},${NOTCH_R} 0 0 0 ${NOTCH_CX + NOTCH_R},${NOTCH_R}
  C ${NOTCH_CX + NOTCH_R},${NOTCH_R * 0.55} ${NOTCH_CX + NOTCH_R + TRANSITION * 0.4},0 ${NOTCH_CX + NOTCH_R + TRANSITION},0
  L ${BAR_WIDTH - CORNER_RADIUS},0
  Q ${BAR_WIDTH},0 ${BAR_WIDTH},${CORNER_RADIUS}
  L ${BAR_WIDTH},${BAR_HEIGHT}
  Z
`

// Fills the notch void (from the container top down to the notch curve above)
// by re-tracing the same curve as `notchPath`, offset by BAR_TOP, so the two
// shapes meet with no gap or overhang.
const notchBackdropPath = `
  M ${NOTCH_CX - NOTCH_R - TRANSITION},0
  L ${NOTCH_CX - NOTCH_R - TRANSITION},${BAR_TOP}
  C ${NOTCH_CX - NOTCH_R - TRANSITION * 0.4},${BAR_TOP} ${NOTCH_CX - NOTCH_R},${BAR_TOP + NOTCH_R * 0.55} ${NOTCH_CX - NOTCH_R},${BAR_TOP + NOTCH_R}
  A ${NOTCH_R},${NOTCH_R} 0 0 0 ${NOTCH_CX + NOTCH_R},${BAR_TOP + NOTCH_R}
  C ${NOTCH_CX + NOTCH_R},${BAR_TOP + NOTCH_R * 0.55} ${NOTCH_CX + NOTCH_R + TRANSITION * 0.4},${BAR_TOP} ${NOTCH_CX + NOTCH_R + TRANSITION},${BAR_TOP}
  L ${NOTCH_CX + NOTCH_R + TRANSITION},0
  Z
`

export function MobileTabBar() {
  const isAuthenticated = useSession((state) => Boolean(state.user))

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{ height: CONTAINER_HEIGHT }}
    >
      <svg
        viewBox={`0 0 ${BAR_WIDTH} ${CONTAINER_HEIGHT}`}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <path d={notchBackdropPath} className="fill-sidebar" />
      </svg>

      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: BAR_HEIGHT,
          filter: 'drop-shadow(0px -10px 30px rgba(10, 6, 4, 0.45))',
        }}
      >
        <svg
          viewBox={`0 0 ${BAR_WIDTH} ${BAR_HEIGHT}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          aria-hidden="true"
        >
          <path d={notchPath} className="fill-sidebar" />
        </svg>

        <div className="relative flex h-full items-center">
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

          <div className="flex-1" aria-hidden="true" />

          <Link to="/cart" className={tabLinkClassName}>
            <ShopIcon className="size-5" />
            <span className="sr-only">Carrinho</span>
          </Link>
          <Link to="/profile" className={tabLinkClassName}>
            {isAuthenticated ? <UserIcon className="size-5" /> : <LoginIcon className="size-5" />}
            <span className="sr-only">{isAuthenticated ? 'Perfil' : 'Entrar'}</span>
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={() => notImplementedToast('Ação rápida')}
        aria-label="Ação rápida"
        className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full text-white"
        style={{
          width: FAB_SIZE,
          height: FAB_SIZE,
          background: 'linear-gradient(180deg, rgba(210, 138, 76, 0.4) -16.92%, #D28A4C 109.23%)',
        }}
      >
        <MobileFabIcon className="mx-auto size-6" />
      </button>
    </nav>
  )
}
