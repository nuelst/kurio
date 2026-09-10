import { expect, test } from './fixtures'

test.describe('Layout em tablet (768px)', () => {
  test('nav secundária aparece (breakpoint md) e a sidebar do catálogo empilha em vez de ficar ao lado', async ({
    page,
  }) => {
    await page.goto('/')

    // abaixo do breakpoint lg (1024px), a grade do catálogo cai para 1 coluna — sidebar empilha
    // acima do conteúdo em vez de ficar ao lado (isso só acontece em desktop ≥1024px)
    const sidebar = page.locator('#main-content').getByRole('heading', { name: 'Coleções' })
    const grid = page.getByTestId('nft-card').first()
    await expect(sidebar).toBeVisible()
    await expect(grid).toBeVisible()
    const sidebarBox = await sidebar.boundingBox()
    const gridBox = await grid.boundingBox()
    expect(sidebarBox).not.toBeNull()
    expect(gridBox).not.toBeNull()
    expect(sidebarBox?.y).toBeLessThan(gridBox?.y ?? 0)

    // acima do breakpoint md (768px), a nav secundária do header já é visível — diferente do
    // viewport mobile (390px), onde ela fica escondida
    await expect(page.getByRole('navigation', { name: 'Principal' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Mercado', exact: true })).toBeVisible()

    // grade do catálogo em 3 colunas (breakpoint sm: 640px, já ativo em 768px)
    const cards = page.getByTestId('nft-card')
    const firstBox = await cards.nth(0).boundingBox()
    const secondBox = await cards.nth(1).boundingBox()
    const thirdBox = await cards.nth(2).boundingBox()
    expect(firstBox?.y).toBeCloseTo(secondBox?.y ?? 0, 0)
    expect(firstBox?.y).toBeCloseTo(thirdBox?.y ?? 0, 0)
  })

  test('carrinho e checkout permanecem utilizáveis em 768px', async ({ page }) => {
    await page.goto('/')
    await page.locator('header').getByRole('button', { name: 'Entrar' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('contato@email.com').fill('ana@example.com')
    await dialog.getByPlaceholder('Senha', { exact: true }).fill('demo1234')
    await dialog.locator('button[type=submit]').click()
    await expect(dialog).not.toBeVisible()

    await page.goto('/nfts/nft-3')
    await page.getByRole('button', { name: 'Comprar', exact: true }).click()
    await expect(page.getByText('adicionado ao carrinho')).toBeVisible()

    await page.goto('/cart')
    await expect(page.getByTestId('cart-line')).toHaveCount(1)

    await page.goto('/checkout')
    await expect(page.getByText('Perfil do colecionador')).toBeVisible()
    await expect(page.getByTestId('checkout-total')).toBeVisible()
  })
})
