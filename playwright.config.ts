import { defineConfig, devices } from '@playwright/test'

// Runs against a running stack, not a dev server: start dev-env first.
//   E2E_BASE_URL=http://localhost:7080 npx playwright test
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:7080'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
