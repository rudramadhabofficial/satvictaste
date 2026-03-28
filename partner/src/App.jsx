import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { useToast } from './components/ui/toast'

// Layouts
import PartnerLayout from './layouts/PartnerLayout.jsx'

// Pages
import LandingPage from './pages/LandingPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import MenuPage from './pages/MenuPage.jsx'
import BookingsPage from './pages/BookingsPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import MembershipPage from './pages/MembershipPage.jsx'
import DeliveriesPage from './pages/DeliveriesPage.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

export default function App() {
  const [partnerId, setPartnerId] = useState(localStorage.getItem('partnerId') || '')
  const [notifications, setNotifications] = useState([])
  const { addToast } = useToast()

  const onLogin = (id) => {
    setPartnerId(id)
  }

  useEffect(() => {
    if (partnerId) {
      const pollNotifications = async () => {
        try {
          const res = await fetch(`${API_BASE}/api/notifications?restaurantId=${partnerId}`)
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
  }, [partnerId, notifications])

  if (!partnerId) {
    return (
      <PartnerLayout isLanding={true}>
        <LandingPage onLogin={onLogin} />
      </PartnerLayout>
    )
  }

  return (
    <PartnerLayout isLanding={false}>
      <Routes>
        <Route path="/" element={<DashboardPage partnerId={partnerId} />} />
        <Route path="/profile" element={<ProfilePage partnerId={partnerId} />} />
        <Route path="/menu" element={<MenuPage partnerId={partnerId} />} />
        <Route path="/bookings" element={<BookingsPage partnerId={partnerId} />} />
        <Route path="/orders" element={<OrdersPage partnerId={partnerId} />} />
        <Route path="/memberships" element={<MembershipPage partnerId={partnerId} />} />
        <Route path="/deliveries" element={<DeliveriesPage partnerId={partnerId} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PartnerLayout>
  )
}
