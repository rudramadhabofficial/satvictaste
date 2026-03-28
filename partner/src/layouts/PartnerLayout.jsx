import React from 'react'
import { Link } from 'react-router-dom'

export function LandingHeader() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <img src="/logo.png" alt="SatvicTaste" className="header-logo" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="header-title">partner.satvictaste</span>
            <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', background: 'var(--accent-soft)', padding: '2px 6px', borderRadius: '4px' }}>Premium</span>
          </div>
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
        <span className="footer-right">Developed by <a href="https://www.linkedin.com/in/uddhab-das-645990237" target="_blank" rel="noopener noreferrer">Uddhab Das</a></span>
      </div>
    </footer>
  )
}

export default function PartnerLayout({ children, isLanding }) {
  if (isLanding) {
    return (
      <div className="app-wrap">
        <LandingHeader />
        <main>{children}</main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="app-wrap dashboard-layout">
      <div className="dashboard-sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="Satvic" />
          <span>Partner Panel</span>
        </div>
        <nav className="sidebar-nav">
          <Link to="/">Dashboard</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/menu">Menu</Link>
          <Link to="/bookings">Bookings</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/memberships">Memberships</Link>
          <Link to="/deliveries">Deliveries</Link>
          <button onClick={() => { localStorage.removeItem('partnerId'); window.location.reload(); }} className="btn-logout">Logout</button>
        </nav>
      </div>
      <main className="dashboard-main">
        {children}
        <Footer />
      </main>
    </div>
  )
}
