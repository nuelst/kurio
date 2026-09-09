import { Search } from 'lucide-react'
import { useState } from 'react'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface NftGalleryProps {
  title: string
  images: string[]
  selectedIndex: number
  onSelect: (index: number) => void
}

export function NftGallery({ title, images, selectedIndex, onSelect }: NftGalleryProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const activeImage = images[selectedIndex] ?? images[0]

  return (
    <div className="flex gap-7">
      <div className="flex flex-col gap-4">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Ver imagem ${index + 1} de ${title}`}
            aria-current={index === selectedIndex}
            className={cn(
              'size-[100px] overflow-hidden rounded-lg ring-2 ring-transparent transition-all',
              index === selectedIndex && 'ring-primary',
            )}
          >
            <img src={image} alt="" width={100} height={100} className="size-full object-cover" />
          </button>
        ))}
      </div>

      <div className="relative h-[444px] w-[444px] rounded-md bg-sidebar p-4">
        <div className="size-full overflow-hidden rounded-3xl">
          <img
            src={activeImage}
            alt={title}
            width={404}
            height={404}
            className="size-full object-cover"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsZoomed(true)}
          aria-label="Ampliar imagem"
          className="absolute top-6 right-6 flex size-8 items-center justify-center rounded-full bg-background/70 text-foreground"
        >
          <Search className="size-4" />
        </button>
      </div>

      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-[min(90vw,700px)] bg-sidebar p-2">
          <DialogTitle className="sr-only">{title} — imagem ampliada</DialogTitle>
          <img src={activeImage} alt={title} className="w-full rounded-lg object-contain" />
        </DialogContent>
      </Dialog>
    </div>
  )
}
