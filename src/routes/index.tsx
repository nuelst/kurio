import { createFileRoute } from '@tanstack/react-router'

import {
  CatalogView,
  catalogSearchSchema,
  resolveCatalogSearch,
  useCatalogViewModel,
} from '@/features/catalog'

export const Route = createFileRoute('/')({
  component: CatalogRoute,
  validateSearch: catalogSearchSchema,
})

function CatalogRoute() {
  const search = resolveCatalogSearch(Route.useSearch())
  const navigate = Route.useNavigate()

  const viewModel = useCatalogViewModel({
    search,
    onSearchChange: (updater, options) =>
      navigate({
        search: (previous) => updater(resolveCatalogSearch(previous)),
        replace: options?.replace ?? false,
      }),
  })

  return <CatalogView {...viewModel} />
}
