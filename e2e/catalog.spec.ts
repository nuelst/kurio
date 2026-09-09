import { expect, test } from './fixtures'

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

    await page.getByRole('button', { name: /^Arte digital/ }).click()
    await expect(page).toHaveURL(/category=art/)

    await page.getByLabel('Ordenar por').click()
    await page.getByRole('option', { name: 'Menor preço' }).click()
    await expect(page).toHaveURL(/sort=price_asc/)

    await expect(page.getByTestId('nft-price').first()).toHaveText('0.0800 ETH')
    const artPrices = await page.getByTestId('nft-price').allTextContents()
    const parsedArtPrices = artPrices.map((text) => Number.parseFloat(text))
    expect(parsedArtPrices).toEqual([...parsedArtPrices].sort((a, b) => a - b))


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
})
