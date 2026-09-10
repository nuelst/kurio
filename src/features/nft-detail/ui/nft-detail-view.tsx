import { Link } from '@tanstack/react-router'

import { MobileNftGallery } from '@/features/nft-detail/ui/mobile-nft-gallery'
import { NftDetailSkeleton } from '@/features/nft-detail/ui/nft-detail-skeleton'
import { NftDetailTabs } from '@/features/nft-detail/ui/nft-detail-tabs'
import { NftGallery } from '@/features/nft-detail/ui/nft-gallery'
import { NftNotFound } from '@/features/nft-detail/ui/nft-not-found'
import { NftPurchasePanel } from '@/features/nft-detail/ui/nft-purchase-panel'
import type { useNftDetailViewModel } from '@/features/nft-detail/viewmodel/use-nft-detail-view-model'
import { useMediaQuery } from '@/shared/hooks/use-media-query'
import { ErrorState } from '@/shared/ui/error-state'
import { RelatedNfts } from '@/shared/ui/related-nfts'

type NftDetailViewModel = ReturnType<typeof useNftDetailViewModel>

export function NftDetailView(viewModel: NftDetailViewModel) {
  const {
    nft,
    isLoading,
    isError,
    error,
    refetch,
    selectedImageIndex,
    setSelectedImageIndex,
    quantity,
    incrementQuantity,
    decrementQuantity,
    activeTab,
    setActiveTab,
    toggleFavoriteFor,
    buy,
    isBuying,
    shareOn,
    relatedItems,
    isRelatedLoading,
  } = viewModel

  const isDesktopOrTablet = useMediaQuery('(min-width: 640px)')

  return (
    <section
      className="mx-auto max-w-page px-7 py-8 sm:px-6"
      style={
        !isDesktopOrTablet
          ? { background: 'linear-gradient(143.28deg, #241612 -12%, #2F1D15 106.59%)' }
          : undefined
      }
    >
      {isDesktopOrTablet ? (
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Início
          </Link>
          <span className="mx-2">/</span>
          <span>Mercado</span>
        </nav>
      ) : null}

      {isLoading ? <NftDetailSkeleton /> : null}

      {!isLoading && isError && error?.status === 404 ? <NftNotFound /> : null}

      {!isLoading && isError && error?.status !== 404 ? (
        <ErrorState
          title="Não foi possível carregar este NFT"
          description={error?.message}
          onRetry={() => refetch()}
        />
      ) : null}

      {!isLoading && !isError && nft ? (
        <>
          <div data-testid="nft-detail-main" className="flex flex-col gap-10 lg:flex-row">
            {isDesktopOrTablet ? (
              <NftGallery
                title={nft.title}
                images={nft.gallery}
                selectedIndex={selectedImageIndex}
                onSelect={setSelectedImageIndex}
              />
            ) : (
              <MobileNftGallery
                title={nft.title}
                images={nft.gallery}
                selectedIndex={selectedImageIndex}
                onSelect={setSelectedImageIndex}
                isFavorite={nft.isFavorite}
                onToggleFavorite={() => toggleFavoriteFor(nft)}
              />
            )}
            <NftPurchasePanel
              title={nft.title}
              priceEth={nft.edition.priceEth}
              rating={nft.rating}
              reviewCount={nft.reviewCount}
              summary={nft.summary}
              editionTier={nft.editionTier}
              quantity={quantity}
              available={nft.edition.available}
              isFavorite={nft.isFavorite}
              isBuying={isBuying}
              tokenNumber={nft.tokenNumber}
              collectionName={nft.collectionName}
              attributes={nft.attributes}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
              onToggleFavorite={() => toggleFavoriteFor(nft)}
              onBuy={buy}
              onShare={shareOn}
            />
          </div>

          <NftDetailTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            description={nft.description}
            network={nft.network}
            contractAddress={nft.contractAddress}
            royaltyPercent={nft.royaltyPercent}
            reviews={nft.reviews}
            reviewCount={nft.reviewCount}
          />

          <RelatedNfts
            title="Mais desta coleção"
            items={relatedItems}
            isLoading={isRelatedLoading}
            onToggleFavorite={toggleFavoriteFor}
          />
        </>
      ) : null}
    </section>
  )
}
