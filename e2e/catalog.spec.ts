import { expect, test } from './fixtures'

// abaixo do breakpoint sm, os filtros de coleção vivem num drawer fechado por padrão (ver
// CatalogFilterDrawer) — precisa abrir antes de conseguir clicar num botão de categoria.
async function openFilterDrawerIfMobile(page: import('@playwright/test').Page) {
  const width = page.viewportSize()?.width ?? 1440
  if (width < 640) {
    await page.getByRole('button', { name: 'Filtros' }).click()
  }
}

test.describe('Catálogo — busca, filtros, ordenação, paginação e histórico', () => {
  test('combina filtros na URL e sobrevive a refresh e navegação pelo histórico', async ({
    page,
  }) => {
    await page.goto('/')

    const cards = page.getByTestId('nft-card')
    await expect(cards).toHaveCount(9)

    await page.getByLabel('Buscar NFTs').fill('Emerald')
    await expect(page).toHaveURL(/q=Emerald/)
    await expect(cards.first()).toBeVisible()
    for (const title of await page.getByTestId('nft-title').allTextContents()) {
      expect(title).toContain('Emerald')
    }
    await page.getByLabel('Buscar NFTs').fill('')
    await expect(page).not.toHaveURL(/q=/)

    await openFilterDrawerIfMobile(page)
    await page.getByRole('button', { name: /^Arte digital/ }).click()
    await expect(page).toHaveURL(/category=art/)

    await page.getByLabel('Ordenar por').click()
    await page.getByRole('option', { name: 'Menor preço' }).click()
    await expect(page).toHaveURL(/sort=price_asc/)

    await expect(page.getByTestId('nft-price').first()).toHaveText('0.0800 ETH')
    const artPrices = await page.getByTestId('nft-price').allTextContents()
    const parsedArtPrices = artPrices.map((text) => Number.parseFloat(text))
    expect(parsedArtPrices).toEqual([...parsedArtPrices].sort((a, b) => a - b))

    await openFilterDrawerIfMobile(page)
    await page.getByRole('button', { name: 'Todas as coleções' }).click()
    await expect(page).not.toHaveURL(/category=/)
    await expect(page.getByLabel('Página 1')).toHaveAttribute('aria-current', 'page')
    await expect(page.getByTestId('nft-price').first()).toHaveText('0.0500 ETH')

    const firstPageTitles = await page.getByTestId('nft-title').allTextContents()
    await page.getByLabel('Próxima página').click()
    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByLabel('Página 2')).toHaveAttribute('aria-current', 'page')
    const secondPageTitles = await page.getByTestId('nft-title').allTextContents()
    expect(secondPageTitles).not.toEqual(firstPageTitles)

    await page.reload()
    await expect(page.getByLabel('Página 2')).toHaveAttribute('aria-current', 'page')
    await expect(page).toHaveURL(/sort=price_asc/)
    await expect(page.getByTestId('nft-title')).toHaveText(secondPageTitles)

    await page.goBack()
    await expect(page).toHaveURL(/page=1|(?!.*page=)/)
    await expect(page.getByLabel('Página 1')).toHaveAttribute('aria-current', 'page')
    await expect(page.getByTestId('nft-title')).toHaveText(firstPageTitles)
  })

  test('busca sem resultados mostra estado vazio', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Buscar NFTs').fill('nft-que-nao-existe-em-nenhum-lugar')
    await expect(page.getByText('Nenhum NFT encontrado')).toBeVisible()
  })

  test('loading lento mostra skeleton e dá lugar ao conteúdo real quando os dados chegam', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem('nft-marketplace.scenario', 'latency')
    })
    await page.goto('/')

    await expect(page.getByRole('status', { name: 'Carregando NFTs' })).toBeVisible()
    await expect(page.getByTestId('nft-card').first()).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('status', { name: 'Carregando NFTs' })).not.toBeVisible()
  })

  test('erro ao carregar mostra estado de erro e recupera ao tentar de novo', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('nft-marketplace.scenario', 'error')
    })
    await page.goto('/')

    await expect(page.getByText('Não foi possível carregar o catálogo')).toBeVisible()
    const retry = page.getByRole('button', { name: 'Tentar novamente' })
    await expect(retry).toBeVisible()
    await expect(page.getByTestId('nft-card')).toHaveCount(0)

    await page.evaluate(() => localStorage.removeItem('nft-marketplace.scenario'))
    await retry.click()

    await expect(page.getByText('Não foi possível carregar o catálogo')).not.toBeVisible()
    await expect(page.getByTestId('nft-card').first()).toBeVisible()
  })
})
