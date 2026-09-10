import { createFileRoute } from '@tanstack/react-router'

import { ProfileView, useProfileForm } from '@/features/profile'

export const Route = createFileRoute('/_account/profile')({
  component: ProfileRoute,
})

function ProfileRoute() {
  const viewModel = useProfileForm()
  return <ProfileView {...viewModel} />
}
