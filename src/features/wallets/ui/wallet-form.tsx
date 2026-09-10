import type { FormEvent } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  type WalletFormInput,
  walletNetworks,
  walletProviders,
} from '@/features/wallets/model/wallet'

interface WalletFormProps {
  form: UseFormReturn<WalletFormInput>
  onSubmit: (event: FormEvent) => void
  isPending: boolean
  submitLabel: string
}

export function WalletForm({ form, onSubmit, isPending, submitLabel }: WalletFormProps) {
  const {
    register,
    control,
    formState: { errors },
  } = form

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <div>
          <span className="text-sm font-semibold text-foreground">
            Apelido da carteira<span className="ml-0.5 text-primary">*</span>
          </span>
          <Input className="mt-2" aria-invalid={Boolean(errors.label)} {...register('label')} />
          {errors.label ? (
            <p className="mt-1.5 text-xs text-destructive">{errors.label.message}</p>
          ) : null}
        </div>

        <div>
          <span className="text-sm font-semibold text-foreground">
            Rede<span className="ml-0.5 text-primary">*</span>
          </span>
          <Controller
            control={control}
            name="network"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="mt-2 w-full" aria-invalid={Boolean(errors.network)}>
                  <SelectValue placeholder="Selecione uma rede" />
                </SelectTrigger>
                <SelectContent>
                  {walletNetworks.map((network) => (
                    <SelectItem key={network} value={network}>
                      {network}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.network ? (
            <p className="mt-1.5 text-xs text-destructive">{errors.network.message}</p>
          ) : null}
        </div>

        <div>
          <span className="text-sm font-semibold text-foreground">
            Endereço da carteira<span className="ml-0.5 text-primary">*</span>
          </span>
          <Input
            className="mt-2"
            placeholder="Endereço 0x da carteira"
            aria-invalid={Boolean(errors.address)}
            {...register('address')}
          />
          {errors.address ? (
            <p className="mt-1.5 text-xs text-destructive">{errors.address.message}</p>
          ) : null}
        </div>

        <div>
          <span className="text-sm font-semibold text-foreground">
            Tipo de carteira<span className="ml-0.5 text-primary">*</span>
          </span>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="mt-2 w-full" aria-invalid={Boolean(errors.type)}>
                  <SelectValue placeholder="Selecione uma carteira" />
                </SelectTrigger>
                <SelectContent>
                  {walletProviders.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.type ? (
            <p className="mt-1.5 text-xs text-destructive">{errors.type.message}</p>
          ) : null}
        </div>

        <div>
          <span className="text-sm font-semibold text-foreground">Nome ENS</span>
          <Input className="mt-2" placeholder="nome.eth" {...register('ensName')} />
        </div>
      </div>

      {errors.root ? (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {errors.root.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending} className="mt-6 px-8 font-bold">
        {isPending ? 'Salvando...' : submitLabel}
      </Button>
    </form>
  )
}
