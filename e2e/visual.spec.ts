import { expect, test } from './fixtures'


test.describe('Regressão visual', () => {
  test('grade do catálogo (Início)', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('nft-card')).toHaveCount(9)
    await expect(page.getByTestId('nft-card').first().locator('img')).toBeVisible()

    await expect(page.getByTestId('catalog-grid')).toHaveScreenshot('catalog-grid.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    })
  })

  test('carrinho vazio', async ({ page }) => {
    await page.goto('/')
    await page.locator('header').getByRole('button', { name: 'Entrar' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('contato@email.com').fill('ana@example.com')
    await dialog.getByPlaceholder('Senha', { exact: true }).fill('demo1234')
    await dialog.locator('button[type=submit]').click()
    await expect(dialog).not.toBeVisible()

    await page.goto('/cart')
    await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()

    await expect(page).toHaveScreenshot('cart-empty.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    })
  })

  test('detalhe do NFT', async ({ page }) => {
    await page.goto('/nfts/nft-1')
    await expect(page.getByTestId('nft-detail-title')).toHaveText('Sage Baron #060')
    await expect(page.getByRole('img', { name: 'Sage Baron #060', exact: true })).toBeVisible()

    await expect(page.getByTestId('nft-detail-main')).toHaveScreenshot('nft-detail.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    })
  })
})
