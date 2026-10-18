import createClient from 'openapi-fetch'
import type { paths as CatalogPaths, components as CatalogComponents } from './generated/catalog'
import type { paths as OrdersPaths, components as OrdersComponents } from './generated/orders'

// Both APIs are served from the page's origin. Vite's dev proxy and nginx send
// /api/v1/orders to orders-service and the rest of /api to catalog-service.
const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export const catalogApi = createClient<CatalogPaths>({ baseUrl })
export const ordersApi = createClient<OrdersPaths>({ baseUrl })

export type Product = CatalogComponents['schemas']['ProductResponse']
export type Category = CatalogComponents['schemas']['CategoryDto']
export type Order = OrdersComponents['schemas']['OrderResponse']
export type OrderSummary = OrdersComponents['schemas']['OrderSummaryDto']
export type OrderStatus = NonNullable<OrderSummary['status']>
export type OrderPage = OrdersComponents['schemas']['PageResponseOrderSummaryDto']

/**
 * Turns an error body from either backend into something to show the user.
 * orders-service answers with problem details ({detail}), catalog-service with
 * {error, message}. Neither is in the specs, hence the unknown.
 */
export function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const body = error as Record<string, unknown>
    if (typeof body.detail === 'string') return body.detail
    if (typeof body.message === 'string') return body.message
  }
  return fallback
}
