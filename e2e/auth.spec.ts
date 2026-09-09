import { expect, test } from './fixtures'

test.describe('Autenticação — cadastro, login, logout e troca de usuário', () => {
  test('cadastro valida campos e trata conflito de e-mail', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Entrar' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Criar conta' }).click()

    await dialog.locator('button[type=submit]').click()
    await expect(page.getByText('Informe seu nome de usuário')).toBeVisible()
    await expect(page.getByText('A senha deve ter pelo menos 8 caracteres')).toBeVisible()

    await dialog.getByPlaceholder('Nome de usuário').fill('Colecionador Novo')
    await dialog.getByPlaceholder('Digite seu e-mail').fill('novo@example.com')
    await dialog.getByPlaceholder('Senha', { exact: true }).fill('12345678')
    await dialog.getByPlaceholder('Confirmar senha').fill('87654321')
    await dialog.locator('button[type=submit]').click()
    await expect(page.getByText('As senhas não coincidem')).toBeVisible()

    await dialog.getByPlaceholder('Digite seu e-mail').fill('ana@example.com')
    await dialog.getByPlaceholder('Confirmar senha').fill('12345678')
    await dialog.locator('button[type=submit]').click()
    await expect(page.getByText('Este e-mail já está cadastrado')).toBeVisible()

    await dialog.getByPlaceholder('Digite seu e-mail').fill('novo@example.com')
    await dialog.locator('button[type=submit]').click()
    await expect(dialog).not.toBeVisible()
    await expect(page.locator('header').getByRole('button', { name: 'Sair' })).toBeVisible()
  })

  test('login com credenciais inválidas mostra erro e não autentica', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Entrar' }).click()

    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('contato@email.com').fill('ana@example.com')
    await dialog.getByPlaceholder('Senha', { exact: true }).fill('senha-errada')
    await dialog.locator('button[type=submit]').click()

    await expect(page.getByText('E-mail ou senha inválidos')).toBeVisible()
    await expect(dialog).toBeVisible()

    await dialog.getByRole('button', { name: 'Fechar' }).click()
    await expect(page.locator('header').getByRole('button', { name: 'Entrar' })).toBeVisible()
  })

  test('login, logout e troca de usuário atualizam o header', async ({ page }) => {
    await page.goto('/')

    async function loginAs(email: string) {
      await page.locator('header').getByRole('button', { name: 'Entrar' }).click()
      const dialog = page.getByRole('dialog')
      await dialog.getByPlaceholder('contato@email.com').fill(email)
      await dialog.getByPlaceholder('Senha', { exact: true }).fill('demo1234')
      await dialog.locator('button[type=submit]').click()
      await expect(dialog).not.toBeVisible()
    }

    const header = page.locator('header')
    const logoutButton = header.getByRole('button', { name: 'Sair' })
    const loginButton = header.getByRole('button', { name: 'Entrar' })

    await loginAs('ana@example.com')
    await expect(logoutButton).toBeVisible()

    await logoutButton.click()
    await expect(loginButton).toBeVisible()
    await expect(logoutButton).not.toBeVisible()

    await loginAs('bruno@example.com')
    await expect(logoutButton).toBeVisible()
  })
})
