import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'

export function NftNotFound() {
  return (
    <EmptyState
      title="NFT não encontrado"
      description="O item que você procura não existe ou foi removido do catálogo."
      action={
        <Button asChild>
          <Link to="/">Voltar ao catálogo</Link>
        </Button>
      }
    />
  )
}
