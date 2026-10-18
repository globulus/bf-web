import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { catalogGet, fail, ok, ordersPost, resetApiMocks, sampleProducts } from '../test/api-mock'
import OrderFormPage from './OrderFormPage'

vi.mock('../api/client', async (orig) => ({
  ...(await orig<typeof import('../api/client')>()),
  catalogApi: { GET: vi.fn() },
  ordersApi: { GET: vi.fn(), POST: vi.fn() },
}))

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/orders/new']}>
      <Routes>
        <Route path="/orders/new" element={<OrderFormPage />} />
        <Route path="/orders" element={<p>orders page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('OrderFormPage', () => {
  beforeEach(() => {
    resetApiMocks()
    localStorage.clear()
    catalogGet.mockReturnValue(ok({ items: sampleProducts, total: 3, page: 0, pageSize: 100 }))
  })

  it('hides products without a price', async () => {
    renderPage()

    expect(await screen.findByText('Hand grinder')).toBeInTheDocument()
    expect(screen.queryByText('Free sample')).not.toBeInTheDocument()
  })

  it('updates the total as quantities change', async () => {
    renderPage()
    const beans = await screen.findByLabelText('Quantity of Espresso beans 1kg')

    await userEvent.clear(beans)
    await userEvent.type(beans, '2')

    expect(screen.getByTestId('order-total')).toHaveTextContent('€37.80')
  })

  it('places an order with one line per product and goes to the order list', async () => {
    ordersPost.mockReturnValue(ok({ id: 42, status: 'PLACED' }))
    renderPage()
    const grinder = await screen.findByLabelText('Quantity of Hand grinder')

    await userEvent.clear(grinder)
    await userEvent.type(grinder, '3')
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }))

    expect(ordersPost).toHaveBeenCalledWith('/api/v1/orders', {
      body: { customerId: 'web-customer', lines: [{ productId: 2, quantity: 3 }] },
    })
    expect(await screen.findByText('orders page')).toBeInTheDocument()
  })

  it('shows the problem detail when the order is refused', async () => {
    ordersPost.mockReturnValue(fail(422, { status: 422, detail: 'Product 2 is not available' }))
    renderPage()
    const grinder = await screen.findByLabelText('Quantity of Hand grinder')

    await userEvent.type(grinder, '1')
    await userEvent.click(screen.getByRole('button', { name: 'Place order' }))

    expect(await screen.findByText('Product 2 is not available')).toBeInTheDocument()
  })

  it('cannot submit an empty order', async () => {
    renderPage()
    await screen.findByText('Hand grinder')

    expect(screen.getByRole('button', { name: 'Place order' })).toBeDisabled()
  })
})
