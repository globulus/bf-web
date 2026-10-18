import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { catalogApi, errorMessage, ordersApi, type Product } from '../api/client'
import { cartTotal, setQuantity, toOrderLines, type Cart } from '../lib/cart'
import { getCustomerId, setCustomerId } from '../lib/customer'
import { formatMoney } from '../lib/money'

export default function OrderFormPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [cart, setCart] = useState<Cart>({})
  const [customerId, setCustomer] = useState(getCustomerId)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    catalogApi
      .GET('/api/products', { params: { query: { pageSize: 100 } } })
      .then(({ data, error }) => {
        if (error || !data) {
          setLoadError(errorMessage(error, 'Could not load products.'))
        } else {
          // Products without a price can't be ordered; orders-service would refuse them.
          setProducts((data.items ?? []).filter((p) => p.price))
        }
      })
      .catch(() => setLoadError('Could not load products.'))
  }, [])

  const priceById = useMemo(() => {
    const map = new Map<number, number>()
    products.forEach((p) => p.id != null && p.price && map.set(p.id, p.price.amount))
    return map
  }, [products])

  const lines = toOrderLines(cart)
  const total = cartTotal(cart, (id) => priceById.get(id))
  const currency = products[0]?.price?.currency

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (lines.length === 0 || !customerId.trim()) return
    setSubmitting(true)
    setSubmitError(null)
    setCustomerId(customerId.trim())
    try {
      const { data, error } = await ordersApi.POST('/api/v1/orders', {
        body: { customerId: customerId.trim(), lines },
      })
      if (error || !data) {
        setSubmitError(errorMessage(error, 'Could not place the order.'))
        return
      }
      navigate(`/orders?placed=${data.id}`)
    } catch {
      setSubmitError('Could not reach the server. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <h1>New order</h1>
      <form onSubmit={onSubmit}>
        <div className="toolbar">
          <label>
            Customer ID
            <input value={customerId} onChange={(e) => setCustomer(e.target.value)} required maxLength={64} />
          </label>
        </div>

        {loadError && <p className="error">{loadError}</p>}

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th className="num">Price</th>
              <th className="num">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td className="num">{formatMoney(p.price?.amount, p.price?.currency)}</td>
                <td className="num">
                  <input
                    type="number"
                    min={0}
                    max={999}
                    aria-label={`Quantity of ${p.name}`}
                    value={cart[p.id!] ?? 0}
                    onChange={(e) => setCart((c) => setQuantity(c, p.id!, Number(e.target.value)))}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="toolbar" style={{ marginTop: '1rem' }}>
          <strong data-testid="order-total">Total: {formatMoney(total, currency)}</strong>
          <button type="submit" className="primary" disabled={submitting || lines.length === 0}>
            {submitting ? 'Placing…' : 'Place order'}
          </button>
        </div>
        {submitError && <p className="error">{submitError}</p>}
      </form>
    </section>
  )
}
