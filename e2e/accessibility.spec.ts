import { expect, test } from './fixtures'

test.describe('Navegação por teclado e foco de diálogos', () => {
  test('modal de entrar é alcançável e ativável só por teclado, prende o foco e devolve ao fechar', async ({
    page,
  }) => {
    await page.goto('/')

    const trigger = page.locator('header').getByRole('button', { name: 'Entrar' })
    await trigger.focus()
    await expect(trigger).toBeFocused()
    await page.keyboard.press('Enter')

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Radix move o foco pra dentro do diálogo ao abrir e marca o resto da página como
    // aria-hidden (por isso não dá pra checar "not toBeFocused" no trigger por role aqui — ele
    // some da árvore de acessibilidade enquanto o modal está aberto, o que é o comportamento
    // correto). O que importa: existe exatamente um elemento focado, e ele está dentro do diálogo.
    await expect(dialog.locator(':focus')).toHaveCount(1)

    // Tab repetidamente por mais paradas do que existem elementos focáveis no diálogo — se algum
    // dia escapar (foco fora do diálogo, ou parar de haver um :focus dentro dele), o teste falha
    // ali mesmo. Também confere que o foco de fato circula de volta (não fica preso sempre no
    // mesmo elemento) — prova de um focus trap de verdade, não só "ficou por perto".
    const seen = new Set<string>()
    for (let i = 0; i < 20; i += 1) {
      await page.keyboard.press('Tab')
      await expect(dialog.locator(':focus')).toHaveCount(1)
      const id = await page.evaluate(() => {
        const el = document.activeElement
        return `${el?.tagName}:${el?.getAttribute('aria-label') ?? el?.textContent ?? el?.getAttribute('placeholder')}`
      })
      seen.add(id)
    }
    expect(seen.size).toBeGreaterThan(1)

    // Shift+Tab também nunca deve escapar do diálogo
    for (let i = 0; i < 5; i += 1) {
      await page.keyboard.press('Shift+Tab')
      await expect(dialog.locator(':focus')).toHaveCount(1)
    }

    // Esc fecha e devolve o foco pro botão que abriu o modal
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toBeFocused()
  })

  test('alterna entre entrar e criar conta só por teclado', async ({ page }) => {
    await page.goto('/')
    await page.locator('header').getByRole('button', { name: 'Entrar' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByPlaceholder('contato@email.com')).toBeVisible()

    await dialog.getByRole('button', { name: 'Criar conta' }).focus()
    await page.keyboard.press('Enter')
    await expect(dialog.getByPlaceholder('Nome de usuário')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
  })
})
