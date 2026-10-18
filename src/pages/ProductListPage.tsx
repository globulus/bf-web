import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { catalogApi, errorMessage, type Category, type Product } from '../api/client'
import { formatMoney } from '../lib/money'

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[] | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState<number | undefined>()
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    catalogApi.GET('/api/categories').then(({ data }) => setCategories(data ?? []))
  }, [])

  useEffect(() => {
    let cancelled = false
    catalogApi
      .GET('/api/products', {
        params: { query: { q: search || undefined, categoryId, pageSize: 100 } },
      })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          setError(errorMessage(error, 'Could not load products.'))
          return
        }
        setError(null)
        setProducts(data.items ?? [])
      })
      .catch(() => {
        if (!cancelled) setError('Could not load products.')
      })
    return () => {
      cancelled = true
    }
  }, [search, categoryId])

  function onSearch(event: FormEvent) {
    event.preventDefault()
    setSearch(query.trim())
  }

  const categoryName = (id?: number) => categories.find((c) => c.id === id)?.name ?? ''

  return (
    <section>
      <h1>Products</h1>
      <form className="toolbar" onSubmit={onSearch}>
        <label>
          Search
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name or SKU" />
        </label>
        <label>
          Category
          <select
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Search</button>
        <Link to="/orders/new" style={{ marginLeft: 'auto' }}>
          Start an order →
        </Link>
      </form>

      {error && <p className="error">{error}</p>}
      {products === null && !error && <p>Loading…</p>}
      {products?.length === 0 && <p>No products found.</p>}
      {products && products.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th className="num">Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} data-testid="product-row">
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>{categoryName(p.categoryId)}</td>
                <td className="num">{formatMoney(p.price?.amount, p.price?.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
