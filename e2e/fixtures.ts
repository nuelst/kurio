import { test as base, expect } from '@playwright/test'


export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      if (!window.sessionStorage.getItem('__e2e_seeded')) {
        window.localStorage.clear()
        window.sessionStorage.setItem('__e2e_seeded', '1')
      }
    })
    await use(page)
  },
})

export { expect }
