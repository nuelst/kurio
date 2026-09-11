import { useRouter } from '@tanstack/react-router'
import { ChevronLeft, Heart } from 'lucide-react'

import { cn } from '@/lib/utils'

interface MobileNftGalleryProps {
  title: string
  images: string[]
  selectedIndex: number
  onSelect: (index: number) => void
  isFavorite: boolean
  onToggleFavorite: () => void
}

export function MobileNftGallery({
  title,
  images,
  selectedIndex,
  onSelect,
  isFavorite,
  onToggleFavorite,
}: MobileNftGalleryProps) {
  const router = useRouter()
  const activeImage = images[selectedIndex] ?? images[0]

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-[24px]">
        <img src={activeImage} alt={title} className="size-full object-cover" />

        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Voltar"
          className="absolute top-3 left-3 flex size-9 shrink-0 items-center justify-center rounded-full border border-[#3F2319] bg-[#2F1D15] text-foreground"
        >
          <ChevronLeft className="size-5" />
        </button>

        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className="absolute top-3 right-3 flex size-9 shrink-0 items-center justify-center rounded-full border border-[#3F2319] bg-[#2F1D15] text-foreground"
        >
          <Heart className={cn('size-4', isFavorite && 'fill-current text-destructive')} />
        </button>
      </div>

      {images.length > 1 ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Ver imagem ${index + 1} de ${title}`}
              aria-current={index === selectedIndex}
              className={cn(
                'size-16 shrink-0 overflow-hidden rounded-lg ring-2 ring-transparent transition-all',
                index === selectedIndex && 'ring-primary',
              )}
            >
              <img src={image} alt="" width={64} height={64} className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
