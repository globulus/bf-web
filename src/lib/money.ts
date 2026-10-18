const formatters = new Map<string, Intl.NumberFormat>()

export function formatMoney(amount: number | undefined | null, currency: string | undefined | null): string {
  if (amount == null) return '—'
  if (!currency) return amount.toFixed(2)
  let formatter = formatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-IE', { style: 'currency', currency })
    formatters.set(currency, formatter)
  }
  return formatter.format(amount)
}
