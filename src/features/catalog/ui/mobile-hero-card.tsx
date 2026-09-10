import { ArrowRight } from 'lucide-react'
import mobileHeroBg from '@/assets/mobile-hero.svg'
import nftThumbnail from '@/assets/nft/nft-01.png'
import nftFeatured from '@/assets/nft/nft-04.png'
import { notImplementedToast } from '@/shared/lib/not-implemented'

export function MobileHeroCard() {
  return (
    <section className="mx-auto max-w-page px-4 pt-4">
      <div
        className="relative overflow-hidden rounded-[30px] px-5 py-6"
        style={{
          backgroundImage: `url(${mobileHeroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-[62%]">
          <p className="text-xs leading-4 font-medium tracking-widest text-muted-foreground">
            Bem-vindo à Kurio
          </p>
          <h1 className="mt-2 text-xl leading-6 font-bold uppercase text-foreground">
            Seja dono da cultura digital
          </h1>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Descubra NFTs selecionados de criadores do mundo todo.
          </p>
          <button
            type="button"
            onClick={() => notImplementedToast('Explorar coleção completa')}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold tracking-wide text-primary uppercase"
          >
            Explorar
            <ArrowRight className="size-4" />
          </button>
        </div>

        <div className="absolute top-4 right-4 size-28">
          <div className="size-full overflow-hidden rounded-2xl bg-card">
            <img
              src={nftFeatured}
              alt="NFT em destaque: ilustração de macaco estilizado com jaqueta verde e óculos escuros"
              className="size-full object-cover"
              width={112}
              height={112}
            />
          </div>
          <div className="absolute bottom-[-11%] left-[-18%] size-[45%] overflow-hidden rounded-lg border-2 border-background">
            <img
              src={nftThumbnail}
              alt="NFT relacionado: ilustração de macaco estilizado com chapéu e moletom"
              className="size-full object-cover"
              width={50}
              height={50}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-2" aria-hidden="true">
          <span className="size-2 rounded-full bg-primary" />
          <span className="size-2 rounded-full bg-primary" />
          <span className="size-2 rounded-full border border-primary" />
        </div>
      </div>
    </section>
  )
}
