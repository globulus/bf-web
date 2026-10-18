import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { errorMessage, ordersApi, type OrderPage, type OrderStatus, type OrderSummary } from '../api/client'
import { getCustomerId } from '../lib/customer'
import { formatMoney } from '../lib/money'

const PAGE_SIZE = 10
const STATUSES: OrderStatus[] = ['PLACED', 'SHIPPED', 'CANCELLED']

export default function OrderListPage() {
  const [params] = useSearchParams()
  const placedId = params.get('placed')
  const [customerId, setCustomerId] = useState(getCustomerId)
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [page, setPage] = useState(0)
  const [result, setResult] = useState<OrderPage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    ordersApi
      .GET('/api/v1/orders', {
        params: {
          query: {
            customerId: customerId.trim() || undefined,
            status: status || undefined,
            page,
            size: PAGE_SIZE,
          },
        },
      })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          setError(errorMessage(error, 'Could not load orders.'))
          return
        }
        setError(null)
        setResult(data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load orders.')
      })
    return () => {
      cancelled = true
    }
  }, [customerId, status, page, reloadKey])

  const cancelOrder = useCallback(async (order: OrderSummary) => {
    if (!window.confirm(`Cancel order #${order.id}?`)) return
    const { error } = await ordersApi.POST('/api/v1/orders/{id}/cancel', {
      params: { path: { id: order.id! } },
      body: { reason: 'Cancelled from the web shop' },
    })
    if (error) {
      setError(errorMessage(error, `Could not cancel order #${order.id}.`))
    }
    setReloadKey((k) => k + 1)
  }, [])

  const orders = result?.content ?? []
  const totalPages = result?.totalPages ?? 0

  return (
    <section>
      <h1>Orders</h1>
      {placedId && <p className="notice">Order #{placedId} placed.</p>}

      <div className="toolbar">
        <label>
          Customer ID
          <input
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value)
              setPage(0)
            }}
          />
        </label>
        <label>
          Status
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as OrderStatus | '')
              setPage(0)
            }}
          >
            <option value="">Any</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.toLowerCase()}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="error">{error}</p>}
      {result && orders.length === 0 && <p>No orders.</p>}
      {orders.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Placed</th>
              <th>Status</th>
              <th className="num">Items</th>
              <th className="num">Total</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} data-testid="order-row">
                <td>{o.id}</td>
                <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</td>
                <td>
                  <span className={`status status-${o.status}`}>{o.status?.toLowerCase()}</span>
                </td>
                <td className="num">{o.itemCount}</td>
                <td className="num">{formatMoney(o.totalAmount, o.currency)}</td>
                <td>
                  {o.status === 'PLACED' && (
                    <button type="button" onClick={() => cancelOrder(o)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {totalPages > 1 && (
        <div className="pager">
          <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            ← Newer
          </button>
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <button type="button" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Older →
          </button>
        </div>
      )}
    </section>
  )
}
