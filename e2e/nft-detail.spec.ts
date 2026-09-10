import { expect, test } from './fixtures'
import { login } from './helpers'

test.describe('Detalhe do NFT — acesso direto, estoque e favoritos', () => {
  test('acesso direto carrega o NFT correto', async ({ page }) => {
    await page.goto('/nfts/nft-1')
    await expect(page.getByTestId('nft-detail-title')).toHaveText('Sage Baron #060')
    await expect(page.getByText('Sobre este NFT:')).toBeVisible()
    await expect(page.getByText('Mais desta coleção')).toBeVisible()
  })

  test('NFT inexistente mostra estado de não encontrado com saída para o catálogo', async ({
    page,
  }) => {
    await page.goto('/nfts/nft-nao-existe-em-lugar-nenhum')
    await expect(page.getByText('NFT não encontrado')).toBeVisible()

    await page.getByRole('link', { name: 'Voltar ao catálogo' }).click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByTestId('nft-card').first()).toBeVisible()
  })

  test('quantidade respeita o limite de disponibilidade', async ({ page }) => {
    await page.goto('/nfts/nft-1')

    const decrement = page.getByRole('button', { name: 'Diminuir quantidade' })
    const increment = page.getByRole('button', { name: 'Aumentar quantidade' })
    const quantity = page.getByTestId('nft-quantity')

    await expect(decrement).toBeDisabled()

    await increment.click()
    await increment.click()
    await increment.click()
    await expect(quantity).toHaveText('4')
    await expect(increment).toBeDisabled()

    await decrement.click()
    await expect(quantity).toHaveText('3')
    await expect(increment).toBeEnabled()
  })

  test('NFT esgotado desabilita quantidade e compra', async ({ page }) => {
    await page.goto('/nfts/nft-11')

    await expect(page.getByRole('button', { name: 'Esgotado' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Diminuir quantidade' })).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Aumentar quantidade' })).toBeDisabled()
  })

  test('favoritar exige login e persiste após refresh', async ({ page }) => {
    await page.goto('/nfts/nft-3')

    const favoriteButton = page.getByRole('button', { name: 'Favoritar', exact: true })
    await favoriteButton.click()

    await expect(favoriteButton).toBeVisible()

    await login(page)
    await page.goto('/nfts/nft-3')

    await page.getByRole('button', { name: 'Favoritar', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Favoritado', exact: true })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('button', { name: 'Favoritado', exact: true })).toBeVisible()
  })

  test('falha ao favoritar reverte o estado otimista e avisa por toast', async ({ page }) => {
    await login(page)
    await page.goto('/nfts/nft-3')
    await page.evaluate(() => localStorage.setItem('nft-marketplace.scenario', 'forbidden'))

    const favoriteButton = page.getByRole('button', { name: 'Favoritar', exact: true })
    await favoriteButton.click()

    await expect(page.getByText('Não foi possível favoritar')).toBeVisible()
    await expect(page.getByText('permissão')).toBeVisible()
    // reverteu para o estado anterior (não "favoritado") em vez de ficar preso no otimista
    await expect(favoriteButton).toBeVisible()

    await page.evaluate(() => localStorage.removeItem('nft-marketplace.scenario'))
    await favoriteButton.click()
    await expect(page.getByRole('button', { name: 'Favoritado', exact: true })).toBeVisible()
  })
})
