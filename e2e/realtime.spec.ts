import { expect, test } from './fixtures'

test.describe('Tempo real — reconexão do socket e reconciliação', () => {
  test('mudança perdida enquanto desconectado é recuperada ao reconectar', async ({ page }) => {
    await page.goto('/nfts/nft-3')
    await expect(page.getByTestId('nft-detail-title')).toBeVisible()
    await expect(page.getByText('0.1400 ETH').first()).toBeVisible()
    await page.evaluate(() => window.__mocks__?.disconnectSocket())
    await page.evaluate(() => window.__mocks__?.simulateNftUpdate('nft-3', { priceEth: '9.99' }))

    await expect(page.getByText('0.1400 ETH').first()).toBeVisible()

    await page.evaluate(() => window.__mocks__?.reconnectSocket())
    await expect(page.getByText('9.9900 ETH').first()).toBeVisible({ timeout: 5000 })
  })

  test('primeira conexão do socket não dispara reconciliação (sem refetch redundante)', async ({
    page,
  }) => {
    let cartRequests = 0
    page.on('request', (request) => {
      if (request.url().includes('/api/cart')) cartRequests += 1
    })

    await page.goto('/cart')
    await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()
    const requestsAfterLoad = cartRequests

    await page.waitForTimeout(500)
    expect(cartRequests).toBe(requestsAfterLoad)
  })

  test('eventos duplicados ou mais antigos que o já visto não retrocedem o estado', async ({
    page,
  }) => {
    await page.goto('/')
    // "Cosmic Signal" sozinho não é único (o título cicla e se repete a cada ~20 NFTs) — o
    // número do token no título é que garante um resultado só.
    await page.getByLabel('Buscar NFTs').fill('Cosmic Signal #166')
    await expect(page).toHaveURL(/q=Cosmic/)
    await expect(page.getByTestId('nft-card')).toHaveCount(1)
    const price = page.getByTestId('nft-price').first()
    await expect(price).toBeVisible()

    const base = {
      id: 'nft-3',
      resource: 'nft',
      data: { nftId: 'nft-3', editionId: 'nft-3-edition', available: 5 },
    }

    // versão nova aplica normalmente
    await page.evaluate(
      (event) =>
        window.__mocks__?.broadcastRawNftUpdate({
          ...event,
          version: 10,
          data: { ...event.data, priceEth: '1.000000' },
        }),
      base,
    )
    await expect(price).toHaveText('1.0000 ETH')

    // reenvio da MESMA versão (duplicado) é ignorado — preço "novo" no evento não aparece
    await page.evaluate(
      (event) =>
        window.__mocks__?.broadcastRawNftUpdate({
          ...event,
          version: 10,
          data: { ...event.data, priceEth: '2.000000' },
        }),
      base,
    )
    await expect(price).toHaveText('1.0000 ETH')

    // versão menor que a já vista (evento antigo, fora de ordem) também é ignorada
    await page.evaluate(
      (event) =>
        window.__mocks__?.broadcastRawNftUpdate({
          ...event,
          version: 3,
          data: { ...event.data, priceEth: '3.000000' },
        }),
      base,
    )
    await expect(price).toHaveText('1.0000 ETH')

    // versão maior aplica normalmente de novo
    await page.evaluate(
      (event) =>
        window.__mocks__?.broadcastRawNftUpdate({
          ...event,
          version: 11,
          data: { ...event.data, priceEth: '4.000000' },
        }),
      base,
    )
    await expect(price).toHaveText('4.0000 ETH')
  })

  test('app continua funcional via REST enquanto o socket está desconectado', async ({ page }) => {
    await page.goto('/nfts/nft-3')
    await expect(page.getByTestId('nft-detail-title')).toBeVisible()

    await page.evaluate(() => window.__mocks__?.disconnectSocket())

    await page.getByRole('button', { name: 'Comprar', exact: true }).click()
    await expect(page.getByText('adicionado ao carrinho')).toBeVisible()

    await page.goto('/cart')
    await expect(page.getByTestId('cart-line')).toHaveCount(1)
  })
})
