import type { UseFormReturn } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { CollectorFormInput } from '@/features/checkout/model/checkout'

interface CollectorFormProps {
  form: UseFormReturn<CollectorFormInput>
}

export function CollectorForm({ form }: CollectorFormProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground">Perfil do colecionador</h2>

      <div className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <div>
          <span className="text-sm font-semibold text-foreground">
            Nome de exibição<span className="ml-0.5 text-primary">*</span>
          </span>
          <Input className="mt-2" aria-invalid={Boolean(errors.name)} {...register('name')} />
          {errors.name ? (
            <p className="mt-1.5 text-xs text-destructive">{errors.name.message}</p>
          ) : null}
        </div>

        <div>
          <span className="text-sm font-semibold text-foreground">
            E-mail<span className="ml-0.5 text-primary">*</span>
          </span>
          <Input
            type="email"
            className="mt-2"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email ? (
            <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <span className="text-sm font-semibold text-foreground">Nome ENS</span>
          <Input className="mt-2" placeholder="nome.eth" {...register('ensName')} />
        </div>
      </div>

      <div className="mt-5">
        <span className="text-sm font-semibold text-foreground">
          Observação do colecionador (opcional)
        </span>
        <Textarea
          className="mt-2"
          rows={4}
          placeholder="Alguma instrução especial para este pedido?"
          aria-invalid={Boolean(errors.note)}
          {...register('note')}
        />
        {errors.note ? (
          <p className="mt-1.5 text-xs text-destructive">{errors.note.message}</p>
        ) : null}
      </div>
    </div>
  )
}
