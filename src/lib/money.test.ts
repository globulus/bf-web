import { describe, expect, it } from 'vitest'
import { formatMoney } from './money'

describe('formatMoney', () => {
  it('formats euros', () => {
    expect(formatMoney(18.9, 'EUR')).toBe('€18.90')
  })

  it('formats other currencies', () => {
    expect(formatMoney(5, 'GBP')).toBe('£5.00')
  })

  it('shows a dash for a missing amount', () => {
    expect(formatMoney(undefined, 'EUR')).toBe('—')
  })

  it('falls back to two decimals without a currency', () => {
    expect(formatMoney(3.456, undefined)).toBe('3.46')
  })
})
