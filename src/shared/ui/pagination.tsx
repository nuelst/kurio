import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

const WINDOW_SIZE = 5

function getPageWindow(current: number, total: number): number[] {
  if (total <= WINDOW_SIZE) return Array.from({ length: total }, (_, i) => i + 1)

  let start = Math.max(1, current - Math.floor(WINDOW_SIZE / 2))
  const end = Math.min(total, start + WINDOW_SIZE - 1)
  start = Math.max(1, end - WINDOW_SIZE + 1)

  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Paginação" className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={page <= 1}
        aria-label="Página anterior"
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="size-4" />
      </Button>

      {getPageWindow(page, totalPages).map((pageNumber) => (
        <Button
          key={pageNumber}
          type="button"
          variant={pageNumber === page ? 'default' : 'outline'}
          size="icon"
          aria-current={pageNumber === page ? 'page' : undefined}
          aria-label={`Página ${pageNumber}`}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </Button>
      ))}

      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={page >= totalPages}
        aria-label="Próxima página"
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </nav>
  )
}
