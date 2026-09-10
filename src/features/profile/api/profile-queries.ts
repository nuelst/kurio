import { queryOptions } from '@tanstack/react-query'

import { fetchProfile } from '@/features/profile/api/profile-api'

export const profileQueries = {
  get: () =>
    queryOptions({
      queryKey: ['profile'],
      queryFn: fetchProfile,
    }),
}
