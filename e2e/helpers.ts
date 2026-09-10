import { expect, type Page } from '@playwright/test'

// any protected route (requireAuth) opens the login modal and redirects to "/" — this works on
// every viewport, unlike clicking the header's "Entrar" button, which only exists on
// desktop/tablet (hidden below 768px, replaced by the mobile tab bar).
export async function login(
  page: Page,
  email = 'ana@example.com',
  password = 'demo1234',
): Promise<void> {
  await page.goto('/profile')
  const dialog = page.getByRole('dialog')
  await dialog.getByPlaceholder('contato@email.com').fill(email)
  await dialog.getByPlaceholder('Senha', { exact: true }).fill(password)
  await dialog.locator('button[type=submit]').click()
  await expect(dialog).not.toBeVisible()
}

// "Sair" existe tanto no header (desktop/tablet) quanto na sidebar de conta em /profile e
// /wallets (todos os viewports) — usa a da sidebar de conta pra funcionar em qualquer um.
export async function logoutFromAccountSidebar(page: Page): Promise<void> {
  await page
    .getByRole('navigation', { name: 'Navegação da conta' })
    .getByRole('button', { name: 'Sair' })
    .click()
}
