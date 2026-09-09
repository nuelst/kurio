import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Informe seu e-mail').email('Informe um e-mail válido'),
  password: z.string().min(1, 'Informe sua senha'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, 'Informe seu nome de usuário'),
    email: z.string().trim().min(1, 'Informe seu e-mail').email('Informe um e-mail válido'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })
export type SignupInput = z.infer<typeof signupSchema>

export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
}
