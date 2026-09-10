import { BlogSection } from '@/features/catalog/ui/blog-section'
import { CatalogFilterDrawer } from '@/features/catalog/ui/catalog-filter-drawer'
import { CatalogGrid } from '@/features/catalog/ui/catalog-grid'
import { CatalogSearchInput } from '@/features/catalog/ui/catalog-search-input'
import { CatalogSidebar } from '@/features/catalog/ui/catalog-sidebar'
import { CatalogSkeleton } from '@/features/catalog/ui/catalog-skeleton'
import { CatalogToolbar } from '@/features/catalog/ui/catalog-toolbar'
import { HeroSection } from '@/features/catalog/ui/hero-section'
import { MobileHeroCard } from '@/features/catalog/ui/mobile-hero-card'
import { PromoCards } from '@/features/catalog/ui/promo-cards'
import type { useCatalogViewModel } from '@/features/catalog/viewmodel/use-catalog-view-model'
import { useMediaQuery } from '@/shared/hooks/use-media-query'
import { EmptyState } from '@/shared/ui/empty-state'
import { ErrorState } from '@/shared/ui/error-state'
import { Pagination } from '@/shared/ui/pagination'

type CatalogViewModel = ReturnType<typeof useCatalogViewModel>

/** Pure View: renders whatever the ViewModel hands it, no data fetching of its own. */
export function CatalogView(viewModel: CatalogViewModel) {
  const {
    search,
    page,
    isLoading,
    isError,
    error,
    refetch,
    setSearchText,
    setCategory,
    setSort,
    setPage,
    setPriceRange,
    toggleFavoriteFor,
  } = viewModel

  // abaixo do breakpoint sm, os filtros saem da sidebar (some) e vão pra um drawer — usa
  // useMediaQuery (montagem condicional de verdade, não só CSS hidden) pra nunca ter dois
  // campos de busca ou dois conjuntos de botões de categoria no DOM ao mesmo tempo.
  const isDesktopOrTablet = useMediaQuery('(min-width: 640px)')

  return (
    <>
      {!isDesktopOrTablet ? (
        <div className="mx-auto flex max-w-page items-center gap-3 px-4 pt-4">
          <CatalogSearchInput value={search.q ?? ''} onChange={setSearchText} className="flex-1" />
          <CatalogFilterDrawer
            search={search}
            categoryCounts={page?.categoryCounts ?? {}}
            onCategoryChange={setCategory}
            onPriceRangeApply={setPriceRange}
          />
        </div>
      ) : null}

      {isDesktopOrTablet ? <HeroSection /> : <MobileHeroCard />}

      <section className="mx-auto max-w-page px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[310px_1fr] lg:gap-12">
          {isDesktopOrTablet ? (
            <CatalogSidebar
              search={search}
              categoryCounts={page?.categoryCounts ?? {}}
              onSearchTextChange={setSearchText}
              onCategoryChange={setCategory}
              onPriceRangeApply={setPriceRange}
            />
          ) : null}

          <div className="flex flex-col gap-6">
            <CatalogToolbar sort={search.sort} onSortChange={setSort} />

            {isLoading ? <CatalogSkeleton /> : null}

            {!isLoading && isError ? (
              <ErrorState
                title="Não foi possível carregar o catálogo"
                description={error?.message}
                onRetry={() => refetch()}
              />
            ) : null}

            {!isLoading && !isError && page && page.items.length === 0 ? (
              <EmptyState
                title="Nenhum NFT encontrado"
                description="Tente ajustar a busca ou os filtros selecionados."
              />
            ) : null}

            {!isLoading && !isError && page && page.items.length > 0 ? (
              <>
                <CatalogGrid items={page.items} onToggleFavorite={toggleFavoriteFor} />
                <Pagination page={page.page} totalPages={page.totalPages} onPageChange={setPage} />
              </>
            ) : null}
          </div>
        </div>
      </section>

      <PromoCards />
      <BlogSection />
    </>
  )
}
