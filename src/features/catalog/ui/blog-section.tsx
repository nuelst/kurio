import { ArrowRight } from 'lucide-react'

import nftPost01 from '@/assets/nft/nft-01.png'
import nftPost02 from '@/assets/nft/nft-02.png'
import nftPost03 from '@/assets/nft/nft-03.png'
import nftPost04 from '@/assets/nft/nft-04.png'
import { notImplementedToast } from '@/shared/lib/not-implemented'

const posts = [
  {
    image: nftPost01,
    date: '12 de setembro',
    readingTime: 'Leitura de 6 min',
    title: 'Como funciona a propriedade de NFTs',
    description: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
  },
  {
    image: nftPost02,
    date: '13 de setembro',
    readingTime: 'Leitura de 2 min',
    title: '10 artistas digitais para acompanhar',
    description: 'Conheça criadores que moldam a cultura digital.',
  },
  {
    image: nftPost03,
    date: '15 de setembro',
    readingTime: 'Leitura de 3 min',
    title: 'Raridade, atributos e procedência',
    description: 'Entenda raridade, procedência, direitos autorais e utilidade.',
  },
  {
    image: nftPost04,
    date: '15 de setembro',
    readingTime: 'Leitura de 2 min',
    title: 'Como proteger sua carteira',
    description: 'Proteja sua carteira, seus ativos e sua identidade.',
  },
]

export function BlogSection() {
  return (
    <section className="mx-auto max-w-page px-4 py-12 text-center sm:px-6">
      <h2 className="text-[28px] leading-[28px] font-bold text-foreground">Diário da Cunhagem</h2>
      <p className="mt-3 text-sm leading-[14px] text-muted-foreground">
        Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post) => (
          <article
            key={post.title}
            className="group mx-auto flex w-full max-w-[268px] flex-col overflow-hidden rounded-lg bg-sidebar transition-shadow motion-safe:duration-300 hover:shadow-lg hover:shadow-black/20"
          >
            <div className="aspect-[268/195] w-full overflow-hidden">
              <img
                src={post.image}
                alt=""
                className="size-full object-cover transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-110"
                width={268}
                height={195}
                loading="lazy"
              />
            </div>
            <div className="flex flex-col gap-2 p-4">
              <p className="text-xs text-muted-foreground">
                {post.date} | {post.readingTime}
              </p>
              <h3 className="font-semibold text-foreground">{post.title}</h3>
              <p className="text-sm text-muted-foreground">{post.description}</p>
              <button
                type="button"
                onClick={() => notImplementedToast(post.title)}
                className="inline-flex items-center gap-1 self-start text-sm text-primary hover:underline"
              >
                Ler mais <ArrowRight className="size-3.5" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
