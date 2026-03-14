import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

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

export default function App() {
  const [partnerId, setPartnerId] = useState(localStorage.getItem('partnerId') || '')

  const onLogin = (id) => {
    setPartnerId(id)
  }

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
