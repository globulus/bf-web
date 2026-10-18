import { expect, test } from '@playwright/test'

// Needs the seed data from dev-env (seed.sh).

test('product list shows seeded products with prices', async ({ page }) => {
  await page.goto('/products')

  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible()
  await expect(page.getByTestId('product-row').first()).toBeVisible()
  await expect(page.getByRole('row', { name: /Espresso beans 1kg/ })).toContainText('€')
})

test('search narrows the list', async ({ page }) => {
  await page.goto('/products')
  await expect(page.getByTestId('product-row').first()).toBeVisible()

  await page.getByPlaceholder('Name or SKU').fill('grinder')
  await page.getByRole('button', { name: 'Search' }).click()

  const rows = page.getByTestId('product-row')
  await expect(rows.first()).toContainText(/grinder/i)
  for (const text of await rows.allTextContents()) {
    expect(text.toLowerCase()).toContain('grinder')
  }
})
