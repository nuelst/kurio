import type { AuthResponse, LoginInput, SignupInput } from '@/features/auth/model/auth'
import { http } from '@/shared/lib/http'

export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/auth/login', input)
  return data
}

export async function register(input: Omit<SignupInput, 'confirmPassword'>): Promise<AuthResponse> {
  const { data } = await http.post<AuthResponse>('/auth/register', input)
  return data
}

export async function logout(): Promise<void> {
  await http.post('/auth/logout')
}
