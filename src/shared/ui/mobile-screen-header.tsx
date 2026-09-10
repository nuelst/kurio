import { useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface MobileScreenHeaderProps {
  title: string
  action?: ReactNode
  onBack?: () => void
}

export function MobileScreenHeader({ title, action, onBack }: MobileScreenHeaderProps) {
  const router = useRouter()

  return (
    <div className="mb-4 flex items-center gap-3">
      <button
        type="button"
        onClick={onBack ?? (() => router.history.back())}
        aria-label="Voltar"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar text-muted-foreground"
      >
        <ChevronLeft className="size-5" />
      </button>
      <h1 className="flex-1 truncate text-center text-base font-bold text-foreground">{title}</h1>
      <div className="flex size-9 shrink-0 items-center justify-center">{action}</div>
    </div>
  )
}
