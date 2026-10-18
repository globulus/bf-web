import { describe, expect, it } from 'vitest'
import { cartTotal, setQuantity, toOrderLines } from './cart'

describe('cart', () => {
  it('keeps one line per product', () => {
    let cart = setQuantity({}, 1, 2)
    cart = setQuantity(cart, 1, 5)
    cart = setQuantity(cart, 2, 1)

    expect(toOrderLines(cart)).toEqual([
      { productId: 1, quantity: 5 },
      { productId: 2, quantity: 1 },
    ])
  })

  it('removes a product at zero', () => {
    const cart = setQuantity(setQuantity({}, 1, 2), 1, 0)

    expect(toOrderLines(cart)).toEqual([])
  })

  it('clamps quantities', () => {
    expect(setQuantity({}, 1, 5000)[1]).toBe(999)
    expect(setQuantity({}, 1, -3)[1]).toBeUndefined()
    expect(setQuantity({}, 1, Number.NaN)[1]).toBeUndefined()
  })

  it('totals with the given prices', () => {
    const cart = setQuantity(setQuantity({}, 1, 2), 2, 3)
    const prices: Record<number, number> = { 1: 18.9, 2: 4.2 }

    expect(cartTotal(cart, (id) => prices[id])).toBeCloseTo(50.4)
  })
})
