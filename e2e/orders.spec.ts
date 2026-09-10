import { expect, test } from './fixtures'
import { login } from './helpers'

test.describe('Confirmação de pedido — recibo e recuperação', () => {
  test('acesso sem login redireciona ao início e abre o modal de entrar', async ({ page }) => {
    await page.goto('/orders/order-inexistente')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('pedido inexistente mostra estado de não encontrado', async ({ page }) => {
    await login(page)
    await page.goto('/orders/order-nao-existe-em-lugar-nenhum')
    await expect(page.getByText('Pedido não encontrado')).toBeVisible()
  })

  test('recibo sobrevive a um refresh da página', async ({ page }) => {
    await login(page)
    await page.goto('/nfts/nft-3')
    await page.getByRole('button', { name: 'Comprar', exact: true }).click()
    await expect(page.getByText('adicionado ao carrinho')).toBeVisible()
    await page.goto('/checkout')
    await page.getByRole('radio').first().check()
    await expect(page.getByRole('button', { name: 'Desconectar' })).toBeVisible({
      timeout: 3000,
    })
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page).toHaveURL(/\/orders\//, { timeout: 5000 })

    const orderUrl = page.url()
    await page.reload()
    await expect(page).toHaveURL(orderUrl)
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible()
  })

  test('alterações futuras no catálogo não mudam o recibo', async ({ page }) => {
    await login(page)
    await page.goto('/nfts/nft-3')
    await page.getByRole('button', { name: 'Comprar', exact: true }).click()
    await expect(page.getByText('adicionado ao carrinho')).toBeVisible()
    await page.goto('/checkout')
    await page.getByRole('radio').first().check()
    await expect(page.getByRole('button', { name: 'Desconectar' })).toBeVisible({
      timeout: 3000,
    })
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page).toHaveURL(/\/orders\//, { timeout: 5000 })
    await expect(page.getByText('0.1400 ETH').first()).toBeVisible()

    await page.evaluate(() => window.__mocks__?.simulateNftUpdate('nft-3', { priceEth: '9.99' }))
    await page.reload()
    // the receipt keeps the price paid at purchase time, not the live catalog price
    await expect(page.getByText('0.1400 ETH').first()).toBeVisible()
    await expect(page.getByText('9.9900 ETH')).not.toBeVisible()
  })

  test('pedido fica pendente e resolve para confirmado ao vivo via order.updated', async ({
    page,
  }) => {
    await login(page)
    await page.goto('/nfts/nft-3')
    await page.getByRole('button', { name: 'Comprar', exact: true }).click()
    await expect(page.getByText('adicionado ao carrinho')).toBeVisible()
    await page.goto('/checkout')
    await page.getByRole('radio').first().check()
    await expect(page.getByRole('button', { name: 'Desconectar' })).toBeVisible({
      timeout: 3000,
    })
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page).toHaveURL(/\/orders\//, { timeout: 5000 })

    // caught right after redirect, the order should still be processing
    await expect(page.getByText('Processando seu pedido')).toBeVisible()
    // ...and settle on its own shortly after, without any reload or user action
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible({
      timeout: 5000,
    })
  })

  test('reload enquanto o pedido está pendente recupera o mesmo pedido, sem duplicar', async ({
    page,
  }) => {
    await login(page)
    await page.goto('/nfts/nft-3')
    await page.getByRole('button', { name: 'Comprar', exact: true }).click()
    await expect(page.getByText('adicionado ao carrinho')).toBeVisible()
    await page.goto('/checkout')
    await page.getByRole('radio').first().check()
    await expect(page.getByRole('button', { name: 'Desconectar' })).toBeVisible({
      timeout: 3000,
    })
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page).toHaveURL(/\/orders\//, { timeout: 5000 })

    const orderUrl = page.url()
    await expect(page.getByText('Processando seu pedido')).toBeVisible()
    await page.reload()

    // still the same order, still eventually confirmed — no second purchase was created
    await expect(page).toHaveURL(orderUrl)
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible({
      timeout: 5000,
    })
    await expect(page.getByTestId('cart-item-count')).toHaveCount(0)
  })
})
