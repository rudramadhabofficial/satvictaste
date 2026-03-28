import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  User, 
  Menu as MenuIcon, 
  BookOpen, 
  ShoppingBag, 
  CreditCard, 
  Truck,
  LogOut,
  X,
  ChevronRight,
  ClipboardList
} from 'lucide-react'

export function LandingHeader() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <img src="/logo.png" alt="SatvicTaste" className="header-logo" />
          <span className="header-title">partner.satvictaste</span>
        </div>
        <nav className="nav">
          <a href="#benefits">Benefits</a>
          <a href="#how">How it works</a>
          <a href="#register" className="btn btn-primary btn-sm">Join as Partner</a>
        </nav>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-left">Satvic Partner • Build trust with a clean, calm profile</span>
      </div>
    </footer>
  )
}

export default function PartnerLayout({ children, isLanding }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  if (isLanding) {
    return (
      <div className="app-wrap">
        <LandingHeader />
        <main>{children}</main>
        <Footer />
      </div>
    )
  }

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/menu', label: 'Menu', icon: BookOpen },
    { path: '/bookings', label: 'Bookings', icon: ClipboardList },
    { path: '/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/memberships', label: 'Memberships', icon: CreditCard },
    { path: '/deliveries', label: 'Deliveries', icon: Truck },
  ]

  const logout = () => {
    localStorage.removeItem('partnerId')
    localStorage.removeItem('partnerToken')
    window.location.reload()
  }

  return (
    <div className="partner-layout">
      {/* Sidebar for Desktop / Header-like on Mobile */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="Satvic" className="sidebar-logo" />
          <span className="sidebar-title">Partner Panel</span>
          
          {/* Mobile Toggle */}
          <button 
            className="mobile-nav-toggle btn-ghost" 
            style={{ display: 'none', padding: '8px' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

        <nav className={`sidebar-nav ${mobileMenuOpen ? 'mobile-active' : ''}`}>
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon size={20} strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          ))}
          <button onClick={logout} className="sidebar-link btn-logout" style={{ marginTop: 'auto', border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
            <LogOut size={20} strokeWidth={2} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <main className="main-content">
        {children}
        <Footer />
      </main>
    </div>
  )
}
