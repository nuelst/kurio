import { expect, test } from './fixtures'

test.describe('Detalhe do NFT — acesso direto, estoque e favoritos', () => {
  test('acesso direto carrega o NFT correto', async ({ page }) => {
    await page.goto('/nfts/nft-1')
    await expect(page.getByRole('heading', { name: /#/ })).toBeVisible()
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
    const quantity = page.locator('[aria-live="polite"]')

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

    await page.locator('header').getByRole('button', { name: 'Entrar' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('contato@email.com').fill('ana@example.com')
    await dialog.getByPlaceholder('Senha', { exact: true }).fill('demo1234')
    await dialog.locator('button[type=submit]').click()
    await expect(dialog).not.toBeVisible()

    await favoriteButton.click()
    await expect(page.getByRole('button', { name: 'Favoritado', exact: true })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('button', { name: 'Favoritado', exact: true })).toBeVisible()
  })
})
