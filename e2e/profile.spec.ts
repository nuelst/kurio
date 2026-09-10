import { expect, test } from './fixtures'
import { login, logoutFromAccountSidebar } from './helpers'

test.describe('Perfil do colecionador — edição, senha, avatar e acesso restrito', () => {
  test('acesso sem login redireciona ao início e abre o modal de entrar', async ({ page }) => {
    await page.goto('/profile')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('atualiza dados do perfil e persiste após refresh', async ({ page }) => {
    await login(page)
    await page.goto('/profile')
    await expect(page.locator('input[name=name]')).toHaveValue('Ana Souza')

    await page.locator('input[name=name]').fill('Ana Souza Silva')
    await page.locator('input[name=ensName]').fill('anasilva.eth')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText('Perfil atualizado.')).toBeVisible()

    await page.reload()
    await expect(page.locator('input[name=name]')).toHaveValue('Ana Souza Silva')
    await expect(page.locator('input[name=ensName]')).toHaveValue('anasilva.eth')
  })

  test('nome de usuário em conflito mostra erro no campo', async ({ page }) => {
    await login(page)
    await page.goto('/profile')
    await page.locator('input[name=username]').fill('brunolima')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText('Este nome de usuário já está em uso')).toBeVisible()
  })

  test('senha atual incorreta bloqueia a troca de senha', async ({ page }) => {
    await login(page)
    await page.goto('/profile')
    await page.locator('input[name=currentPassword]').fill('senhaerrada')
    await page.locator('input[name=newPassword]').fill('novaSenha123')
    await page.locator('input[name=confirmNewPassword]').fill('novaSenha123')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText('Senha atual incorreta')).toBeVisible()
  })

  test('troca de senha permite login com a nova senha', async ({ page }) => {
    await login(page)
    await page.goto('/profile')
    await page.locator('input[name=currentPassword]').fill('demo1234')
    await page.locator('input[name=newPassword]').fill('novaSenha123')
    await page.locator('input[name=confirmNewPassword]').fill('novaSenha123')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText('Perfil atualizado.')).toBeVisible()

    await logoutFromAccountSidebar(page)
    await login(page, 'ana@example.com', 'novaSenha123')

    await page.goto('/profile')
    await expect(page.locator('input[name=name]')).toHaveValue('Ana Souza')
  })

  test('upload de avatar atualiza a prévia e persiste', async ({ page }) => {
    await login(page)
    await page.goto('/profile')
    await page.setInputFiles('input[type=file]', 'e2e/fixtures/tiny-avatar.png')

    const avatarPreview = page.locator('img[width="56"]')
    await expect(async () => {
      const src = await avatarPreview.getAttribute('src')
      expect(src).toContain('data:image/png;base64')
    }).toPass({ timeout: 3000 })

    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByText('Perfil atualizado.')).toBeVisible()

    await page.reload()
    const src = await page.locator('img[width="56"]').getAttribute('src')
    expect(src).toContain('data:image/png;base64')
  })
})
