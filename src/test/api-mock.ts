import { vi, type Mock } from 'vitest'
import { catalogApi, ordersApi } from '../api/client'

// Use together with this in the test file (vi.mock calls are hoisted, so they
// can't live in a helper):
//   vi.mock('../api/client', async (orig) => ({ ...(await orig()), catalogApi: { GET: vi.fn() }, ordersApi: { GET: vi.fn(), POST: vi.fn() } }))

export const catalogGet = catalogApi.GET as unknown as Mock
export const ordersGet = ordersApi.GET as unknown as Mock
export const ordersPost = ordersApi.POST as unknown as Mock

/** What openapi-fetch resolves to. */
export function ok<T>(data: T) {
  return Promise.resolve({ data, error: undefined, response: new Response(null, { status: 200 }) })
}

export function fail(status: number, error: unknown) {
  return Promise.resolve({ data: undefined, error, response: new Response(null, { status }) })
}

export function resetApiMocks() {
  vi.resetAllMocks()
}

export const sampleProducts = [
  { id: 1, sku: 'BEAN-1KG', name: 'Espresso beans 1kg', active: true, categoryId: 1, price: { amount: 18.9, currency: 'EUR' } },
  { id: 2, sku: 'GR-100', name: 'Hand grinder', active: true, categoryId: 2, price: { amount: 64, currency: 'EUR' } },
  { id: 3, sku: 'SAMPLE-1', name: 'Free sample', active: true, categoryId: 1, price: undefined },
]
