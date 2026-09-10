import type { ProfileDetails } from '@/features/profile/model/profile'
import { http } from '@/shared/lib/http'

export async function fetchProfile(): Promise<ProfileDetails> {
  const { data } = await http.get<ProfileDetails>('/profile')
  return data
}

export interface UpdateProfileInput {
  name: string
  username: string
  email: string
  ensName?: string
  avatarUrl: string
  currentPassword?: string
  newPassword?: string
}

export async function updateProfile(input: UpdateProfileInput): Promise<ProfileDetails> {
  const { data } = await http.patch<ProfileDetails>('/profile', input)
  return data
}
