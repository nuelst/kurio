import { expect, test } from './fixtures'
import { login, skipToCheckoutPayment } from './helpers'

async function addToCartAndGoToCheckout(page: import('@playwright/test').Page) {
  await page.goto('/nfts/nft-3')
  await page.getByRole('button', { name: 'Comprar', exact: true }).click()
  await expect(page.getByText('adicionado ao carrinho')).toBeVisible()
  await page.goto('/checkout')
  await expect(page.getByText('Perfil do colecionador')).toBeVisible()
  await skipToCheckoutPayment(page)
}

test.describe('Pagamento e confirmação de pedido', () => {
  test('acesso sem login redireciona ao início e abre o modal de entrar', async ({ page }) => {
    await page.goto('/checkout')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('carrinho vazio mostra estado vazio em vez do formulário', async ({ page }) => {
    await login(page)
    await page.goto('/checkout')
    await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()
  })

  test('compra completa confirma o pedido e esvazia o carrinho', async ({ page }) => {
    await login(page)
    await addToCartAndGoToCheckout(page)

    await page.getByRole('radio').first().check()
    await expect(page.getByRole('button', { name: 'Desconectar' })).toBeVisible({
      timeout: 3000,
    })

    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page).toHaveURL(/\/orders\//, { timeout: 5000 })
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible()
    await expect(page.getByText('Cosmic Signal #166')).toBeVisible()
    await expect(page.getByText('Ver no Etherscan')).toBeVisible()

    await page.goto('/cart')
    await expect(page.getByText('Seu carrinho está vazio')).toBeVisible()
  })

  test('carteira em rede incompatível é recusada na conexão', async ({ page }) => {
    await login(page)

    await page.goto('/wallets')
    await page.getByRole('button', { name: 'Adicionar' }).click()
    await page.locator('input[name=label]').nth(1).fill('Carteira Polygon')
    await page.locator('input[name=address]').nth(1).fill('0xPolygonAddress1234567890')
    await page.locator('[data-slot=select-trigger]').nth(2).click()
    await page.getByRole('option', { name: 'Polygon' }).click()
    await page.getByRole('button', { name: 'Salvar carteira secundária' }).click()
    await expect(page.getByText('Carteira secundária salva.')).toBeVisible()

    await addToCartAndGoToCheckout(page)
    await page.getByRole('radio').nth(1).check()
    await expect(
      page.locator('#main-content').getByText(/Esta carteira está na rede Polygon/),
    ).toBeVisible({ timeout: 3000 })
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeDisabled()
  })

  test('pedido recusado preserva o carrinho', async ({ page }) => {
    await login(page)
    await addToCartAndGoToCheckout(page)

    await page.evaluate(() => localStorage.setItem('nft-marketplace.scenario', 'declined'))
    await page.getByRole('radio').first().check()
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeEnabled({
      timeout: 3000,
    })
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page).toHaveURL(/\/orders\//, { timeout: 5000 })
    await expect(page.getByText('Pagamento recusado')).toBeVisible()

    await page.evaluate(() => localStorage.removeItem('nft-marketplace.scenario'))
    await page.goto('/cart')
    await expect(page.getByTestId('cart-line')).toHaveCount(1)
  })

  test('sem carteira cadastrada bloqueia a compra com um convite para cadastrar', async ({
    page,
  }) => {
    await page.goto('/checkout')
    const dialog = page.getByRole('dialog')
    // desktop mostra um toggle "Criar conta"; mobile (tela cheia) mostra o link
    // "Crie uma conta" embaixo do formulário — mesmo destino, texto diferente.
    await dialog.getByRole('button', { name: /Criar conta|Crie uma conta/ }).click()
    await dialog.getByPlaceholder('Nome de usuário').fill('Visitante Teste')
    await dialog.getByPlaceholder('Digite seu e-mail').fill(`visitante${Date.now()}@example.com`)
    await dialog.getByPlaceholder('Senha', { exact: true }).fill('demo12345')
    await dialog.getByPlaceholder('Confirmar senha').fill('demo12345')
    await dialog.locator('button[type=submit]').click()
    await expect(dialog).not.toBeVisible()

    await addToCartAndGoToCheckout(page)
    await expect(page.getByText('Você ainda não cadastrou uma carteira.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeDisabled()
  })

  test('servidor rejeita cotação desatualizada (409)', async ({ page }) => {
    await login(page)
    await page.goto('/nfts/nft-3')
    await page.getByRole('button', { name: 'Comprar', exact: true }).click()
    await expect(page.getByText('adicionado ao carrinho')).toBeVisible()

    const result = await page.evaluate(async () => {
      const token = JSON.parse(localStorage.getItem('nft-marketplace.session') ?? '{}')?.state
        ?.accessToken
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          idempotencyKey: crypto.randomUUID(),
          walletSlot: 'primary',
          collector: { name: 'Ana', email: 'ana@example.com' },
          expectedTotals: {
            subtotalEth: '999',
            discountEth: '0',
            networkFeeEth: '0.016',
            totalEth: '999.016',
          },
        }),
      })
      return { status: res.status, body: await res.json() }
    })

    expect(result.status).toBe(409)
    expect(result.body.message).toContain('cotação mudou')
  })

  test('chave de idempotência evita pedido duplicado em reenvio', async ({ page }) => {
    await login(page)
    await page.goto('/nfts/nft-3')
    await page.getByRole('button', { name: 'Comprar', exact: true }).click()
    await expect(page.getByText('adicionado ao carrinho')).toBeVisible()

    const result = await page.evaluate(async () => {
      const token = JSON.parse(localStorage.getItem('nft-marketplace.session') ?? '{}')?.state
        ?.accessToken
      const cartRes = await fetch('/api/cart', { headers: { Authorization: `Bearer ${token}` } })
      const cart = await cartRes.json()
      const idempotencyKey = crypto.randomUUID()
      const payload = {
        idempotencyKey,
        walletSlot: 'primary',
        collector: { name: 'Ana', email: 'ana@example.com' },
        expectedTotals: {
          subtotalEth: cart.subtotalEth,
          discountEth: cart.discountEth,
          networkFeeEth: cart.networkFeeEth,
          totalEth: cart.totalEth,
        },
      }
      const first = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      }).then((res) => res.json())
      const second = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      }).then((res) => res.json())
      return { firstId: first.id, secondId: second.id }
    })

    expect(result.firstId).toBe(result.secondId)
  })

  test('reaproveitar a chave de idempotência com conteúdo diferente gera conflito (409)', async ({
    page,
  }) => {
    await login(page)
    await page.goto('/nfts/nft-3')
    await page.getByRole('button', { name: 'Comprar', exact: true }).click()
    await expect(page.getByText('adicionado ao carrinho')).toBeVisible()

    const result = await page.evaluate(async () => {
      const token = JSON.parse(localStorage.getItem('nft-marketplace.session') ?? '{}')?.state
        ?.accessToken
      const cartRes = await fetch('/api/cart', { headers: { Authorization: `Bearer ${token}` } })
      const cart = await cartRes.json()
      const idempotencyKey = crypto.randomUUID()
      const totals = {
        subtotalEth: cart.subtotalEth,
        discountEth: cart.discountEth,
        networkFeeEth: cart.networkFeeEth,
        totalEth: cart.totalEth,
      }

      const first = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          idempotencyKey,
          walletSlot: 'primary',
          collector: { name: 'Ana', email: 'ana@example.com' },
          expectedTotals: totals,
        }),
      }).then((res) => res.json())

      // same key, different collector name — a genuinely different order attempt
      const second = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          idempotencyKey,
          walletSlot: 'primary',
          collector: { name: 'Outra Pessoa', email: 'ana@example.com' },
          expectedTotals: totals,
        }),
      })

      return { firstId: first.id, secondStatus: second.status, secondBody: await second.json() }
    })

    expect(result.firstId).toBeTruthy()
    expect(result.secondStatus).toBe(409)
    expect(result.secondBody.message).toContain('dados diferentes')
  })

  test('timeout na criação do pedido recupera pelo mesmo pedido no reenvio, sem comprar em duplicidade', async ({
    page,
  }) => {
    await login(page)
    await addToCartAndGoToCheckout(page)

    const availableBefore = await page.evaluate(() =>
      fetch('/api/nfts/nft-3')
        .then((res) => res.json())
        .then((nft) => nft.edition.available),
    )

    await page.evaluate(() => localStorage.setItem('nft-marketplace.scenario', 'timeout'))
    await page.getByRole('radio').first().check()
    await expect(page.getByRole('button', { name: 'Desconectar' })).toBeVisible({
      timeout: 3000,
    })
    await page.getByRole('button', { name: 'Confirmar compra' }).click()

    // the client-side timeout (2.5s) fires before the mock ever responds
    await expect(page.getByText('Não foi possível confirmar se o pedido foi recebido')).toBeVisible(
      { timeout: 5000 },
    )

    // the connection recovers; the user retries with the same idempotency key
    await page.evaluate(() => localStorage.removeItem('nft-marketplace.scenario'))
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page).toHaveURL(/\/orders\//, { timeout: 5000 })
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible({
      timeout: 5000,
    })

    const availableAfter = await page.evaluate(() =>
      fetch('/api/nfts/nft-3')
        .then((res) => res.json())
        .then((nft) => nft.edition.available),
    )
    // exactly one unit was purchased — the hung first attempt never bought a second one
    expect(availableBefore - availableAfter).toBe(1)
  })

  test('sessão expira ao confirmar a compra: contexto do formulário sobrevive ao login novamente', async ({
    page,
  }) => {
    await login(page)
    await page.goto('/nfts/nft-3')
    await page.getByRole('button', { name: 'Comprar', exact: true }).click()
    await expect(page.getByText('adicionado ao carrinho')).toBeVisible()
    await page.goto('/checkout')
    await expect(page.getByText('Perfil do colecionador')).toBeVisible()

    // no mobile, a observação faz parte do passo 1 — precisa ser preenchida antes
    // de avançar pro passo 2 (carteira), onde esse campo não existe mais.
    const note = 'Entregar com cuidado, é para presente.'
    await page.getByPlaceholder('Alguma instrução especial para este pedido?').fill(note)
    await skipToCheckoutPayment(page)
    await page.getByRole('radio').first().check()
    await expect(page.getByRole('button', { name: 'Desconectar' })).toBeVisible({
      timeout: 3000,
    })

    await page.evaluate(() => {
      const session = JSON.parse(localStorage.getItem('nft-marketplace.session') ?? '{}')
      const userId = session?.state?.accessToken?.replace('token-', '')
      window.__mocks__?.expireSession(userId)
    })

    await page.getByRole('button', { name: 'Confirmar compra' }).click()

    // the login modal reopens on top of checkout — never a redirect, never unmounting the form
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(page.getByText('Sua sessão expirou')).toBeVisible()
    await expect(page).toHaveURL(/\/checkout$/)

    await dialog.getByPlaceholder('contato@email.com').fill('ana@example.com')
    await dialog.getByPlaceholder('Senha', { exact: true }).fill('demo1234')
    await dialog.locator('button[type=submit]').click()
    await expect(dialog).not.toBeVisible()

    // context preserved: note, wallet connection and cart are exactly as left before
    // expiring. On mobile the two live on different steps (note on "Pagamento", wallet
    // on "Pagamento com carteira") — step back to check the note, then forward again.
    await expect(page.getByRole('button', { name: 'Desconectar' })).toBeVisible()

    const backButton = page.getByRole('button', { name: 'Voltar' })
    if (await backButton.isVisible().catch(() => false)) {
      await backButton.click()
      await expect(
        page.getByPlaceholder('Alguma instrução especial para este pedido?'),
      ).toHaveValue(note)
      await skipToCheckoutPayment(page)
    } else {
      await expect(
        page.getByPlaceholder('Alguma instrução especial para este pedido?'),
      ).toHaveValue(note)
    }
    await expect(page.getByRole('button', { name: 'Desconectar' })).toBeVisible()

    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page).toHaveURL(/\/orders\//, { timeout: 5000 })
    await expect(page.getByText('Seus NFTs agora estão na sua carteira')).toBeVisible({
      timeout: 5000,
    })
  })

  test('preço muda ao vivo enquanto o checkout está aberto, pela mesma via de um push real do servidor', async ({
    page,
  }) => {
    await login(page)
    await addToCartAndGoToCheckout(page)

    const totalBefore = await page.getByTestId('checkout-total').textContent()

    // simulateNftUpdate passa pelo mesmo caminho de um push do servidor de verdade: grava no
    // "banco" mockado e emite nft.updated via socket — não é um fetch cru reescrevendo o cache
    // do client por fora, é o mesmo evento que useCartRealtimeSync (reaproveitada no checkout)
    // já escuta.
    await expect(async () => {
      await page.evaluate(() => window.__mocks__?.simulateNftUpdate('nft-3', { priceEth: '9.99' }))
      await expect(page.getByText('Preço de Cosmic Signal #166 foi atualizado')).toBeVisible({
        timeout: 1000,
      })
    }).toPass({ timeout: 10_000 })

    await expect(page.getByTestId('checkout-total')).not.toHaveText(totalBefore ?? '')
  })
})
