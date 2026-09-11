import { ArrowRight } from 'lucide-react'
import nftPromoRight from '@/assets/nft/nft-02.png'
import nftPromoLeft from '@/assets/nft/nft-04.png'
import { Button } from '@/components/ui/button'
import { notImplementedToast } from '@/shared/lib/not-implemented'

const promos = [
  {
    image: nftPromoLeft,
    alt: 'Ilustração de macaco estilizado com jaqueta verde e óculos escuros',
    title: 'Lançamentos gênesis de edição limitada',
    description: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
  },
  {
    image: nftPromoRight,
    alt: 'Ilustração de macaco estilizado de terno bege',
    title: 'Arte digital selecionada e muito mais',
    description:
      'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.',
  },
]

export function PromoCards() {
  return (
    <section className="mx-auto max-w-page px-4 pt-24 pb-8 sm:px-6">
      <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
        {promos.map((promo) => (
          <div
            key={promo.title}
            className="flex h-auto w-full max-w-[586px] overflow-hidden rounded-lg bg-card sm:h-[250px]"
          >
            <div className="w-28 shrink-0 self-stretch sm:w-[288px]">
              <img
                src={promo.image}
                alt={promo.alt}
                className="size-full object-cover"
                width={288}
                height={250}
                loading="lazy"
              />
            </div>
            <div className="flex flex-1 flex-col justify-center gap-2 p-4 sm:p-6">
              <h3 className="font-semibold text-foreground">{promo.title}</h3>
              <p className="text-sm text-muted-foreground">{promo.description}</p>
              <Button
                size="sm"
                className="self-start"
                onClick={() => notImplementedToast(promo.title)}
              >
                Explorar
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
