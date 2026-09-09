import { toast } from 'sonner'

export function notImplementedToast(feature: string): void {
  toast(`${feature} chega em breve`, {
    description: 'Essa parte do fluxo ainda não foi implementada nesta fatia.',
  })
}
