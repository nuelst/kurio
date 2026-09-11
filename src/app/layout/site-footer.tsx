import { Link } from '@tanstack/react-router'
import { Bell, ShieldCheck, Users } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { notImplementedToast } from '@/shared/lib/not-implemented'
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
  YoutubeIcon,
} from '@/shared/ui/icons'

const features = [
  {
    icon: ShieldCheck,
    title: 'Segurança da carteira',
    description: 'Proteja sua carteira e colecione arte digital verificada com confiança.',
  },
  {
    icon: Users,
    title: 'Criadores em destaque',
    description: 'Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.',
  },
  {
    icon: Bell,
    title: 'Alertas de lançamentos',
    description:
      'Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.',
  },
]

const profileLinks = [
  'Meu perfil',
  'Minha coleção',
  'Atividade',
  'Estúdio do criador',
  'Lista de interesse',
]
const helpLinks = [
  'Central de ajuda',
  'Como comprar NFTs',
  'Carteira e segurança',
  'Política do mercado',
  'Denunciar item',
]
const collectionLinks = [
  { label: 'Arte digital', category: 'art' },
  { label: 'Fotografia', category: 'photography' },
  { label: 'Música', category: 'music' },
  { label: 'Arte 3D', category: 'art3d' },
  { label: 'Utilidade', category: 'utility' },
]
const socialLinks = [
  { label: 'Facebook', Icon: FacebookIcon },
  { label: 'Instagram', Icon: InstagramIcon },
  { label: 'Twitter', Icon: TwitterIcon },
  { label: 'LinkedIn', Icon: LinkedinIcon },
  { label: 'YouTube', Icon: YoutubeIcon },
]
const compatibleWallets = ['MetaMask', 'WalletConnect', 'Coinbase']

const footerLinkClassName =
  'block text-left text-sm text-muted-foreground transition-colors hover:text-primary'

function FooterLinkButton({ label, to }: { label: string; to?: '/profile' | '/wallets' }) {
  if (to) {
    return (
      <Link to={to} className={footerLinkClassName}>
        {label}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={() => notImplementedToast(label)}
      className={footerLinkClassName}
    >
      {label}
    </button>
  )
}

export function SiteFooter() {
  const [email, setEmail] = useState('')

  return (
    <footer className="mx-auto max-w-page px-4 sm:px-6">
      {/* 1: newsletter + destaques — bg surface-card */}
      <div className="grid grid-cols-1 gap-3 bg-sidebar p-8 lg:grid-cols-[1fr_1fr_1fr_1.35fr]">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`flex flex-col gap-2.5 px-4 ${index > 0 ? 'lg:border-l lg:border-border' : ''}`}
          >
            <feature.icon className="size-8 rounded-full bg-primary p-1.5 text-primary-foreground" />
            <h3 className="font-semibold text-foreground">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}

        <form
          className="flex flex-col gap-3 border-border px-4 lg:border-l"
          onSubmit={(event) => {
            event.preventDefault()
            notImplementedToast('Inscrição na newsletter')
          }}
        >
          <h3 className="font-semibold text-foreground">Antecipe-se ao próximo lançamento</h3>
          <div className="flex gap-3">
            <Input
              type="email"
              required
              placeholder="digite seu e-mail..."
              aria-label="E-mail para newsletter"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-w-0 flex-1 bg-input placeholder:text-[#B39463]"
            />
            <Button type="submit">Enviar</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Receba lançamentos selecionados, histórias de criadores e novidades do mercado.
          </p>
        </form>
      </div>

      {/* 2: contato — bg surface-dark */}
      <div className="flex flex-col gap-4 bg-card p-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold tracking-[0.2em] text-foreground">KURIO</p>
        <p className="text-sm text-muted-foreground">
          Feito para colecionadores, criadores e cultura.
        </p>
        <a
          href="mailto:contato@email.com"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          contato@email.com
        </a>
        <p className="text-sm text-muted-foreground">+55 11 4002 8922</p>
      </div>

      {/* 3: colunas de links — bg surface-card */}
      <div className="grid grid-cols-2 gap-8 bg-sidebar p-8 lg:grid-cols-4">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Meu perfil</h3>
          {profileLinks.map((label) => (
            <FooterLinkButton
              key={label}
              label={label}
              to={label === 'Meu perfil' ? '/profile' : undefined}
            />
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Central de ajuda</h3>
          {helpLinks.map((label) => (
            <FooterLinkButton key={label} label={label} />
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Coleções</h3>
          {collectionLinks.map((link) => (
            <Link
              key={link.category}
              to="/"
              search={{ category: link.category, sort: 'relevance', page: 1 }}
              className="block text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Redes sociais</h3>
            <div className="flex gap-2">
              {socialLinks.map(({ label, Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => notImplementedToast(label)}
                  aria-label={label}
                  className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-primary"
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Carteiras compatíveis</h3>
            <div className="flex h-[26px] w-full max-w-[228px] items-center gap-2.5 rounded-sm border border-[#55321F] bg-card px-2 text-[9px] leading-none font-bold tracking-[0.1px] text-[#E89B55] uppercase">
              {compatibleWallets.map((wallet, index) => (
                <span key={wallet} className="flex items-center gap-2.5">
                  {index > 0 ? <span aria-hidden="true">•</span> : null}
                  {wallet}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4: copyright */}
      <div className="py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Kurio. Propriedade digital para todos.
      </div>
    </footer>
  )
}
