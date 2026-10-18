import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import ProductListPage from './pages/ProductListPage'
import OrderFormPage from './pages/OrderFormPage'
import OrderListPage from './pages/OrderListPage'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <span className="brand">Shopfront</span>
        <nav>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/orders/new">New order</NavLink>
          <NavLink to="/orders">Orders</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/orders/new" element={<OrderFormPage />} />
          <Route path="/orders" element={<OrderListPage />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </div>
  )
}
