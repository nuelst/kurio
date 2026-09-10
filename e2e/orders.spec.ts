import { expect, test } from './fixtures'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.locator('header').getByRole('button', { name: 'Entrar' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByPlaceholder('contato@email.com').fill('ana@example.com')
  await dialog.getByPlaceholder('Senha', { exact: true }).fill('demo1234')
  await dialog.locator('button[type=submit]').click()
  await expect(dialog).not.toBeVisible()
}

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
})
