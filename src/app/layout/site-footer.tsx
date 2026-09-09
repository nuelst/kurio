import { Link } from '@tanstack/react-router'

import { notImplementedToast } from '@/shared/lib/not-implemented'

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
  { label: 'Facebook', abbreviation: 'FB' },
  { label: 'Instagram', abbreviation: 'IG' },
  { label: 'Twitter', abbreviation: 'X' },
  { label: 'LinkedIn', abbreviation: 'in' },
  { label: 'YouTube', abbreviation: 'YT' },
]
const compatibleWallets = ['MetaMask', 'WalletConnect', 'Coinbase']

function FooterLinkButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => notImplementedToast(label)}
      className="block text-left text-sm text-muted-foreground transition-colors hover:text-primary"
    >
      {label}
    </button>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-page flex-col gap-4 rounded-b-2xl bg-card px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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

      <div className="mx-auto grid max-w-page grid-cols-2 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-4">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Meu perfil</h3>
          {profileLinks.map((label) => (
            <FooterLinkButton key={label} label={label} />
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
              {socialLinks.map(({ label, abbreviation }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => notImplementedToast(label)}
                  aria-label={label}
                  className="flex size-8 items-center justify-center rounded-md border border-border text-xs text-muted-foreground transition-colors hover:text-primary"
                >
                  {abbreviation}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Carteiras compatíveis</h3>
            <div className="flex flex-wrap gap-2">
              {compatibleWallets.map((wallet) => (
                <span
                  key={wallet}
                  className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground uppercase"
                >
                  {wallet}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-4 py-6 text-center text-sm text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} Kurio. Propriedade digital para todos.
      </div>
    </footer>
  )
}
