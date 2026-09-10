import { expect, test } from './fixtures'
import { login, skipToCheckoutPayment } from './helpers'

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
    await login(page)
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

  test('pagamento (checkout)', async ({ page }) => {
    await login(page)
    await page.goto('/nfts/nft-3')
    await page.getByRole('button', { name: 'Comprar', exact: true }).click()
    await expect(page.getByText('adicionado ao carrinho')).toBeVisible()
    await page.goto('/checkout')
    await expect(page.getByText('Perfil do colecionador')).toBeVisible()
    await skipToCheckoutPayment(page)
    await expect(page.getByRole('radio').first()).toBeVisible()

    await expect(page.locator('#main-content')).toHaveScreenshot('checkout-payment.png', {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    })
  })
})
