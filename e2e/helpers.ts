import { expect, type Page } from '@playwright/test'

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

export async function logoutFromAccountSidebar(page: Page): Promise<void> {
  await page
    .getByRole('navigation', { name: 'Navegação da conta' })
    .getByRole('button', { name: 'Sair' })
    .click()
}

export async function skipToCheckoutPayment(page: Page): Promise<void> {
  const continueButton = page.getByRole('button', { name: 'Continuar', exact: true })
  const reachedPayment = page
    .getByRole('radio')
    .first()
    .or(page.getByText('Você ainda não cadastrou uma carteira.'))

  const isMobileStep = await Promise.race([
    continueButton.waitFor({ state: 'visible' }).then(() => true),
    reachedPayment.waitFor({ state: 'visible' }).then(() => false),
  ])

  if (!isMobileStep) return

  await expect(async () => {
    await continueButton.click()
    await expect(reachedPayment).toBeVisible({ timeout: 1000 })
  }).toPass({ timeout: 15_000 })
}
