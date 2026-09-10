import { expect, test } from './fixtures'
import { login } from './helpers'

test.describe('Carteiras — principal e secundária', () => {
  test('acesso sem login redireciona ao início e abre o modal de entrar', async ({ page }) => {
    await page.goto('/wallets')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('carteira principal já vem preenchida e é editável', async ({ page }) => {
    await login(page)
    await page.goto('/wallets')
    await expect(page.locator('input[name=label]')).toHaveValue('Carteira principal')
    await expect(page.locator('input[name=ensName]').first()).toHaveValue('ana.eth')
  })

  test('edita a carteira principal, adiciona e remove a secundária', async ({ page }) => {
    await login(page)
    await page.goto('/wallets')

    await page
      .locator('input[name=address]')
      .first()
      .fill('0x1111111111111111111111111111111111AAAA')
    await page.getByRole('button', { name: 'Salvar carteira' }).click()
    await expect(page.getByText('Carteira principal salva.')).toBeVisible()

    await page.getByRole('button', { name: 'Adicionar' }).click()
    await page.getByRole('button', { name: 'Usar os mesmos dados da carteira principal' }).click()
    await expect(page.locator('input[name=address]').nth(1)).toHaveValue(
      '0x1111111111111111111111111111111111AAAA',
    )

    await page.getByRole('button', { name: 'Salvar carteira secundária' }).click()
    await expect(page.getByText('Carteira secundária salva.')).toBeVisible()

    await page.reload()
    await expect(page.getByRole('button', { name: 'Remover carteira secundária' })).toBeVisible()

    await page.getByRole('button', { name: 'Remover carteira secundária' }).click()
    await expect(page.getByText('Carteira secundária removida.')).toBeVisible()
    await expect(page.getByText('Você ainda não adicionou uma carteira secundária.')).toBeVisible()
  })
})
