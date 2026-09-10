import { expect, test } from './fixtures'
import { login } from './helpers'

test.describe('Carrinho — itens, cupom, persistência e tempo real', () => {
  test('carrinho vazio mostra estado vazio com saída para o catálogo', async ({ page }) => {
    await page.goto('/cart')
    await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()

    await page.getByRole('link', { name: 'Continuar explorando' }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('comprar no detalhe adiciona ao carrinho e reflete no badge do header', async ({ page }) => {
    await page.goto('/nfts/nft-3')
    await page.getByRole('button', { name: 'Comprar', exact: true }).click()
    await expect(page.getByTestId('cart-item-count')).toHaveText('1')

    await page.goto('/cart')
    await expect(page.getByTestId('cart-line')).toHaveCount(1)
    await expect(page.getByTestId('cart-line-title')).toHaveText('Cosmic Signal #166')
    await expect(page.getByTestId('cart-line-quantity')).toHaveText('1')
  })

  test('quantidade no carrinho respeita disponibilidade e total recalcula', async ({ page }) => {
    await page.goto('/nfts/nft-1')
    await page.getByRole('button', { name: 'Comprar', exact: true }).click()
    await page.goto('/cart')

    const increment = page.getByRole('button', { name: /Aumentar quantidade/ })
    const quantity = page.getByTestId('cart-line-quantity')

    await increment.click()
    await increment.click()
    await increment.click()
    await expect(quantity).toHaveText('4')
    await expect(increment).toBeDisabled()
    await expect(page.getByTestId('cart-line-total')).toHaveText('0.3200 ETH')
  })

  test('remover item esvazia o carrinho', async ({ page }) => {
    await page.goto('/nfts/nft-2')
    await page.getByRole('button', { name: 'Comprar', exact: true }).click()
    await page.goto('/cart')

    await expect(page.getByTestId('cart-line')).toHaveCount(1)
    await page.getByRole('button', { name: /Remover .* do carrinho/ }).click()
    await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()
  })

  test('aplica e remove cupom, tratando código inválido', async ({ page }) => {
    await page.goto('/nfts/nft-3')
    await page.getByRole('button', { name: 'Comprar', exact: true }).click()
    await page.goto('/cart')

    await page.getByPlaceholder('Digite o código promocional...').fill('CODIGO-INVALIDO')
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(page.getByText('Cupom inválido.')).toBeVisible()

    await page.getByPlaceholder('Digite o código promocional...').fill('EXPIRED5')
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(page.getByText('Este cupom expirou.')).toBeVisible()

    await page.getByPlaceholder('Digite o código promocional...').fill('LAUNCH10')
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(page.getByText('LAUNCH10', { exact: true })).toBeVisible()
    await expect(page.getByTestId('cart-total')).toHaveText('0.1420 ETH')

    await page.getByRole('button', { name: 'Remover', exact: true }).click()
    await expect(page.getByPlaceholder('Digite o código promocional...')).toBeVisible()
    await expect(page.getByTestId('cart-total')).toHaveText('0.1560 ETH')
  })

  test('carrinho de visitante persiste após refresh e migra ao autenticar', async ({ page }) => {
    await page.goto('/nfts/nft-4')
    await page.getByRole('button', { name: 'Comprar', exact: true }).click()
    await page.goto('/cart')
    await expect(page.getByTestId('cart-line')).toHaveCount(1)

    await page.reload()
    await expect(page.getByTestId('cart-line')).toHaveCount(1)

    await login(page, 'bruno@example.com')

    await page.goto('/cart')
    await expect(page.getByTestId('cart-line')).toHaveCount(1)
  })

  test('altera preço/disponibilidade em tempo real enquanto o carrinho está aberto', async ({
    page,
  }) => {
    await page.goto('/nfts/nft-3')
    await page.getByRole('button', { name: 'Comprar', exact: true }).click()
    await page.goto('/cart')
    await expect(page.getByTestId('cart-line')).toHaveCount(1)

    const priceBefore = await page.getByTestId('cart-line-total').textContent()

    await expect(async () => {
      await page.evaluate(() => window.__mocks__?.simulateNftUpdate('nft-3', { priceEth: '9.99' }))
      await expect(page.getByText('Preço de Cosmic Signal #166 foi atualizado')).toBeVisible({
        timeout: 1000,
      })
    }).toPass({ timeout: 10_000 })
    await expect(page.getByTestId('cart-line-total')).not.toHaveText(priceBefore ?? '')

    await page.evaluate(() => window.__mocks__?.simulateNftUpdate('nft-3', { available: 0 }))
    await expect(page.getByText('Cosmic Signal #166 ficou indisponível')).toBeVisible()
    await expect(page.getByTestId('cart-line').getByText('Esgotado')).toBeVisible()
    await expect(page.getByTestId('cart-total')).toHaveText('0.0000 ETH')
  })
})
