import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './index.css'

// Layouts
import MainLayout from './layouts/MainLayout.jsx'

// Pages
import HomePage from './pages/HomePage.jsx'
import MapPage from './pages/MapPage.jsx'
import BrowsePage from './pages/BrowsePage.jsx'
import RestaurantDetailPage from './pages/RestaurantDetailPage.jsx'
import AccountPage from './pages/AccountPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import { LoginPage, SignupPage, VerifyPage, ForgotPasswordPage, ResetPasswordPage } from './pages/AuthPages.jsx'

// Components
import { CartDrawer } from './components/CartDrawer.jsx'

export default function App() {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const onAddToCart = (item, restaurantId) => {
    setCart(prev => {
      const existing = prev.find(i => i.name === item.name)
      if (existing) {
        return prev.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, restaurantId, quantity: 1 }]
    })
    setIsCartOpen(true)
  }

  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0)

  return (
    <MainLayout cartCount={cartCount} onCartClick={() => setIsCartOpen(true)}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/restaurants" element={<BrowsePage />} />
        <Route path="/restaurants/:id" element={<RestaurantDetailPage onAddToCart={onAddToCart} />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} />} />
      </Routes>

      {isCartOpen && (
        <CartDrawer cart={cart} setCart={setCart} onClose={() => setIsCartOpen(false)} />
      )}
    </MainLayout>
  )
}
