/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, Vite proxies the APIs so the browser sees one origin (no CORS).
// In Docker, nginx does the same (see nginx.conf.template).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const ordersTarget = env.ORDERS_API_URL || 'http://localhost:7081'
  const catalogTarget = env.CATALOG_API_URL || 'http://localhost:7082'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // Order matters: the orders prefix must win over the catch-all /api.
        '/api/v1/orders': { target: ordersTarget, changeOrigin: true },
        '/api': { target: catalogTarget, changeOrigin: true },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      css: false,
    },
  }
})
