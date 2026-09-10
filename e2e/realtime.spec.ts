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
})
