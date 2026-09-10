import { z } from 'zod'

export interface ProfileDetails {
  name: string
  username: string
  email: string
  ensName: string
  avatarUrl: string
}

export const profileFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Informe seu nome de exibição'),
    username: z
      .string()
      .trim()
      .min(3, 'Informe um nome de usuário')
      .regex(/^[a-z0-9_]+$/i, 'Use apenas letras, números e _'),
    email: z.string().trim().min(1, 'Informe seu e-mail').email('Informe um e-mail válido'),
    ensName: z.string().trim().optional(),
    avatarUrl: z.string(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const wantsPasswordChange = Boolean(
      data.currentPassword || data.newPassword || data.confirmNewPassword,
    )
    if (!wantsPasswordChange) return

    if (!data.currentPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['currentPassword'],
        message: 'Informe sua senha atual',
      })
    }
    if (!data.newPassword || data.newPassword.length < 8) {
      ctx.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: 'A nova senha deve ter pelo menos 8 caracteres',
      })
    }
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmNewPassword'],
        message: 'As senhas não coincidem',
      })
    }
  })

export type ProfileFormInput = z.infer<typeof profileFormSchema>
