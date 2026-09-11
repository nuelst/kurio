import { Link } from '@tanstack/react-router'
import { useLayoutEffect, useRef, useState } from 'react'

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

const DEFAULT_BAR_WIDTH = 414
const BAR_HEIGHT = 94.95
const BAR_TOP = 31
const CONTAINER_HEIGHT = BAR_TOP + BAR_HEIGHT
const CORNER_RADIUS = 28
const FAB_SIZE = 65
const NOTCH_R = FAB_SIZE / 2 + 2
const TRANSITION = 16

function buildNotchPath(barWidth: number) {
  const notchCx = barWidth / 2
  return `
    M 0,${BAR_HEIGHT}
    L 0,${CORNER_RADIUS}
    Q 0,0 ${CORNER_RADIUS},0
    L ${notchCx - NOTCH_R - TRANSITION},0
    C ${notchCx - NOTCH_R - TRANSITION * 0.4},0 ${notchCx - NOTCH_R},${NOTCH_R * 0.55} ${notchCx - NOTCH_R},${NOTCH_R}
    A ${NOTCH_R},${NOTCH_R} 0 0 0 ${notchCx + NOTCH_R},${NOTCH_R}
    C ${notchCx + NOTCH_R},${NOTCH_R * 0.55} ${notchCx + NOTCH_R + TRANSITION * 0.4},0 ${notchCx + NOTCH_R + TRANSITION},0
    L ${barWidth - CORNER_RADIUS},0
    Q ${barWidth},0 ${barWidth},${CORNER_RADIUS}
    L ${barWidth},${BAR_HEIGHT}
    Z
  `
}

export function MobileTabBar() {
  const isAuthenticated = useSession((state) => Boolean(state.user))
  const navRef = useRef<HTMLElement>(null)
  const [barWidth, setBarWidth] = useState(DEFAULT_BAR_WIDTH)

  useLayoutEffect(() => {
    const el = navRef.current
    if (!el) return

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setBarWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <nav
      ref={navRef}
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{ height: CONTAINER_HEIGHT }}
    >
      <div className="absolute inset-x-0 bottom-0" style={{ height: BAR_HEIGHT }}>
        <svg
          viewBox={`0 0 ${barWidth} ${BAR_HEIGHT}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          aria-hidden="true"
        >
          <path d={buildNotchPath(barWidth)} className="fill-sidebar" />
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
