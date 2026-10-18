import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { catalogGet, fail, ok, resetApiMocks, sampleProducts } from '../test/api-mock'
import ProductListPage from './ProductListPage'

vi.mock('../api/client', async (orig) => ({
  ...(await orig<typeof import('../api/client')>()),
  catalogApi: { GET: vi.fn() },
  ordersApi: { GET: vi.fn(), POST: vi.fn() },
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <ProductListPage />
    </MemoryRouter>,
  )
}

describe('ProductListPage', () => {
  beforeEach(() => {
    resetApiMocks()
    catalogGet.mockImplementation((path: string) => {
      if (path === '/api/categories') {
        return ok([
          { id: 1, name: 'Coffee', slug: 'coffee' },
          { id: 2, name: 'Grinders', slug: 'grinders' },
        ])
      }
      return ok({ items: sampleProducts, total: 3, page: 0, pageSize: 100 })
    })
  })

  it('lists products with price and category', async () => {
    renderPage()

    expect(await screen.findByText('Espresso beans 1kg')).toBeInTheDocument()
    expect(screen.getByText('€18.90')).toBeInTheDocument()
    expect(screen.getAllByTestId('product-row')).toHaveLength(3)
    expect(screen.getAllByText('Grinders').length).toBeGreaterThan(0)
  })

  it('shows a dash for products without a price', async () => {
    renderPage()

    const row = (await screen.findByText('Free sample')).closest('tr')!
    expect(row).toHaveTextContent('—')
  })

  it('searches by text', async () => {
    renderPage()
    await screen.findByText('Espresso beans 1kg')

    await userEvent.type(screen.getByPlaceholderText('Name or SKU'), 'grinder')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(catalogGet).toHaveBeenLastCalledWith('/api/products', {
      params: { query: { q: 'grinder', categoryId: undefined, pageSize: 100 } },
    })
  })

  it('shows the catalog error message', async () => {
    catalogGet.mockImplementation((path: string) =>
      path === '/api/categories' ? ok([]) : fail(500, { error: 'internal', message: 'Database unavailable' }),
    )

    renderPage()

    expect(await screen.findByText('Database unavailable')).toBeInTheDocument()
  })
})
