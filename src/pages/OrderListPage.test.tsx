import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ok, ordersGet, ordersPost, resetApiMocks } from '../test/api-mock'
import OrderListPage from './OrderListPage'

vi.mock('../api/client', async (orig) => ({
  ...(await orig<typeof import('../api/client')>()),
  catalogApi: { GET: vi.fn() },
  ordersApi: { GET: vi.fn(), POST: vi.fn() },
}))

const page = {
  content: [
    { id: 12, customerId: 'web-customer', status: 'PLACED', totalAmount: 37.8, currency: 'EUR', itemCount: 2, createdAt: '2026-10-01T09:00:00Z' },
    { id: 11, customerId: 'web-customer', status: 'SHIPPED', totalAmount: 64, currency: 'EUR', itemCount: 1, createdAt: '2026-09-28T09:00:00Z' },
  ],
  page: 0,
  size: 10,
  totalElements: 2,
  totalPages: 1,
}

describe('OrderListPage', () => {
  beforeEach(() => {
    resetApiMocks()
    localStorage.clear()
    ordersGet.mockReturnValue(ok(page))
  })

  it('lists the customer’s orders', async () => {
    render(
      <MemoryRouter>
        <OrderListPage />
      </MemoryRouter>,
    )

    expect(await screen.findAllByTestId('order-row')).toHaveLength(2)
    expect(screen.getByText('€37.80')).toBeInTheDocument()
    expect(ordersGet).toHaveBeenCalledWith('/api/v1/orders', {
      params: { query: { customerId: 'web-customer', status: undefined, page: 0, size: 10 } },
    })
  })

  it('offers cancel only for placed orders', async () => {
    render(
      <MemoryRouter>
        <OrderListPage />
      </MemoryRouter>,
    )
    const rows = await screen.findAllByTestId('order-row')

    expect(within(rows[0]).getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(within(rows[1]).queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
  })

  it('cancels after confirmation and reloads', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    ordersPost.mockReturnValue(ok({ id: 12, status: 'CANCELLED' }))
    render(
      <MemoryRouter>
        <OrderListPage />
      </MemoryRouter>,
    )
    const rows = await screen.findAllByTestId('order-row')

    await userEvent.click(within(rows[0]).getByRole('button', { name: 'Cancel' }))

    expect(ordersPost).toHaveBeenCalledWith('/api/v1/orders/{id}/cancel', {
      params: { path: { id: 12 } },
      body: { reason: 'Cancelled from the web shop' },
    })
    expect(ordersGet).toHaveBeenCalledTimes(2)
  })

  it('shows the confirmation banner after placing an order', async () => {
    render(
      <MemoryRouter initialEntries={['/orders?placed=12']}>
        <OrderListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Order #12 placed.')).toBeInTheDocument()
  })
})
