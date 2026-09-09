import { BlogSection } from '@/features/catalog/ui/blog-section'
import { CatalogGrid } from '@/features/catalog/ui/catalog-grid'
import { CatalogSidebar } from '@/features/catalog/ui/catalog-sidebar'
import { CatalogSkeleton } from '@/features/catalog/ui/catalog-skeleton'
import { CatalogToolbar } from '@/features/catalog/ui/catalog-toolbar'
import { HeroSection } from '@/features/catalog/ui/hero-section'
import { PromoCards } from '@/features/catalog/ui/promo-cards'
import type { useCatalogViewModel } from '@/features/catalog/viewmodel/use-catalog-view-model'
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

  return (
    <>
      <HeroSection />

      <section className="mx-auto max-w-page px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[310px_1fr] lg:gap-12">
          <CatalogSidebar
            search={search}
            categoryCounts={page?.categoryCounts ?? {}}
            onSearchTextChange={setSearchText}
            onCategoryChange={setCategory}
            onPriceRangeApply={setPriceRange}
          />

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
