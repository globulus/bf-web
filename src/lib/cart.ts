export type Cart = Record<number, number>

export type CartLine = { productId: number; quantity: number }

export const MAX_QUANTITY = 999

/** Sets the quantity for one product, clamped to 0..999. 0 removes it. */
export function setQuantity(cart: Cart, productId: number, quantity: number): Cart {
  const next = { ...cart }
  const q = Math.min(Math.max(Math.floor(quantity) || 0, 0), MAX_QUANTITY)
  if (q === 0) {
    delete next[productId]
  } else {
    next[productId] = q
  }
  return next
}

/**
 * One line per product. The cart is keyed by product, so this never sends the
 * same product twice (orders-service gets that case wrong, see its KNOWN_ISSUES).
 */
export function toOrderLines(cart: Cart): CartLine[] {
  return Object.entries(cart)
    .filter(([, quantity]) => quantity > 0)
    .map(([productId, quantity]) => ({ productId: Number(productId), quantity }))
}

export function cartTotal(cart: Cart, priceOf: (productId: number) => number | undefined): number {
  return toOrderLines(cart).reduce((sum, line) => sum + (priceOf(line.productId) ?? 0) * line.quantity, 0)
}
