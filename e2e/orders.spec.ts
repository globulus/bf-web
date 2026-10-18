import { expect, test } from '@playwright/test'

// Each run uses its own customer so runs don't see each other's orders.
const customerId = `e2e-${Date.now()}`

test('place an order and cancel it', async ({ page }) => {
  await page.goto('/orders/new')

  await page.getByLabel('Customer ID').fill(customerId)
  await page.getByLabel('Quantity of Espresso beans 1kg').fill('2')
  await expect(page.getByTestId('order-total')).not.toHaveText('Total: €0.00')
  await page.getByRole('button', { name: 'Place order' }).click()

  await expect(page).toHaveURL(/\/orders\?placed=\d+/)
  await expect(page.getByText(/Order #\d+ placed/)).toBeVisible()

  const row = page.getByTestId('order-row').first()
  await expect(row).toContainText('placed')
  await expect(row).toContainText('2')

  page.once('dialog', (dialog) => dialog.accept())
  await row.getByRole('button', { name: 'Cancel' }).click()
  await expect(row).toContainText('cancelled')
})

test('an empty order cannot be placed', async ({ page }) => {
  await page.goto('/orders/new')

  await expect(page.getByRole('button', { name: 'Place order' })).toBeDisabled()
})
