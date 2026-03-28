import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import './index.css'
import { useToast } from './components/ui/toast'

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

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

export default function App() {
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const { addToast } = useToast()
  const userId = localStorage.getItem('userId')

  useEffect(() => {
    if (userId) {
      const pollNotifications = async () => {
        try {
          const res = await fetch(`${API_BASE}/api/notifications?userId=${userId}`)
          const data = await res.json()
          if (data.length > notifications.length) {
            const latest = data[0]
            if (latest && !notifications.find(n => n.id === latest.id)) {
              addToast(latest.title, 'success')
            }
          }
          setNotifications(data)
        } catch (e) {}
      }
      const t = setInterval(pollNotifications, 10000)
      return () => clearInterval(t)
    }
  }, [userId, notifications])

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
