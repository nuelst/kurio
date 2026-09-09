import nftThumbnail from '@/assets/nft/nft-01.png'
import nftFeatured from '@/assets/nft/nft-04.png'
import { Button } from '@/components/ui/button'
import { notImplementedToast } from '@/shared/lib/not-implemented'

export function HeroSection() {
  return (
    <section className="mx-auto max-w-page px-4 py-12 sm:px-6 lg:py-16">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col">
          <p className="text-sm leading-4 font-medium tracking-widest text-muted-foreground">
            Bem-vindo à Kurio
          </p>
          <h1 className="mt-2 text-4xl leading-tight font-bold uppercase sm:text-[43px] sm:leading-[70px]">
            Seja dono do futuro da arte digital
          </h1>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital
            rara, apoie artistas e tenha uma parte da cultura da internet.
          </p>
          <Button
            size="lg"
            className="mt-8 self-start"
            onClick={() => notImplementedToast('Explorar coleção completa')}
          >
            Explorar
          </Button>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[450px]">
          <div className="size-full overflow-hidden rounded-3xl bg-card">
            <img
              src={nftFeatured}
              alt="NFT em destaque: ilustração de macaco estilizado com jaqueta verde e óculos escuros"
              className="size-full object-cover"
              width={450}
              height={450}
            />
          </div>
          <div className="absolute bottom-[11.11%] left-[8.89%] size-[26.67%] overflow-hidden rounded-lg">
            <img
              src={nftThumbnail}
              alt="NFT relacionado: ilustração de macaco estilizado com chapéu e moletom"
              className="size-full object-cover"
              width={120}
              height={120}
            />
          </div>
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-2 lg:hidden" aria-hidden="true">
        <span className="size-2 rounded-full bg-primary" />
        <span className="size-2 rounded-full bg-primary" />
        <span className="size-2 rounded-full border border-primary" />
      </div>
    </section>
  )
}
