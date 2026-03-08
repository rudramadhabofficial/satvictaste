import React, { useState, useEffect } from 'react'
import './index.css'
import { Button } from './components/ui/button.jsx'
import { Input as UiInput } from './components/ui/input.jsx'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

function LandingHeader() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <img src="/logo.png" alt="Satvic" className="header-logo" />
          <span className="header-title">delivery.satvic</span>
        </div>
        <nav className="nav">
          <a href="#how">How it works</a>
          <a href="#register" className="btn btn-primary btn-sm">Become a Partner</a>
        </nav>
      </div>
    </header>
  )
}

function RegistrationForm({ onRegistered }) {
  const [profile, setProfile] = useState({
    name: '', email: '', password: '', phone: '', city: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const updateProfile = (field, value) => setProfile(p => ({ ...p, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/delivery-auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Registration successful! You can now login.')
        onRegistered()
      } else {
        setMessage(data.error || 'Registration failed')
      }
    } catch (e) { 
      setMessage('Submission failed') 
    } finally { 
      setSubmitting(false) 
    }
  }

  return (
    <section id="register" className="section">
      <div className="container-tight">
        <div className="card">
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 className="view-title">Delivery Partner Registration</h2>
          </div>
          {message && <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>{message}</div>}
          <form onSubmit={handleSubmit} className="form-step">
            <div className="grid grid-2">
              <div>
                <label>Full Name</label>
                <UiInput value={profile.name} onChange={e => updateProfile('name', e.target.value)} required />
              </div>
              <div>
                <label>Phone Number</label>
                <UiInput value={profile.phone} onChange={e => updateProfile('phone', e.target.value)} required />
              </div>
              <div>
                <label>Email Address</label>
                <UiInput type="email" value={profile.email} onChange={e => updateProfile('email', e.target.value)} required />
              </div>
              <div>
                <label>City</label>
                <UiInput value={profile.city} onChange={e => updateProfile('city', e.target.value)} required />
              </div>
              <div className="grid-full">
                <label>Password</label>
                <UiInput type="password" value={profile.password} onChange={e => updateProfile('password', e.target.value)} required />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting} style={{ marginTop: '24px' }}>
              {submitting ? 'Registering...' : 'Join Now'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}

function LoginForm({ onLogin }) {
  const [creds, setCreds] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/delivery-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds)
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('deliveryToken', data.token)
        onLogin(data)
      } else {
        setMessage(data.error || 'Login failed')
      }
    } catch (e) {
      setMessage('Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="login" className="section">
      <div className="container-tight">
        <div className="card">
          <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Partner Login</h2>
          {message && <div className="message error">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label>Email</label>
              <UiInput type="email" value={creds.email} onChange={e => setCreds({ ...creds, email: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label>Password</label>
              <UiInput type="password" value={creds.password} onChange={e => setCreds({ ...creds, password: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}

function LandingPage({ onLogin }) {
  const [showLogin, setShowLogin] = useState(true)
  return (
    <div className="app-wrap">
      <LandingHeader />
      <main className="container">
        <section className="hero-block" style={{ textAlign: 'center', padding: '80px 0' }}>
          <h1 className="hero-title" style={{ fontSize: '48px' }}>Deliver Purity, Earn Peace</h1>
          <p className="hero-sub" style={{ fontSize: '18px', maxWidth: '600px', margin: '20px auto' }}>Join SatvicTaste as a delivery partner and help us bring healthy, satvic meals to those who need them.</p>
        </section>

        {showLogin ? (
          <>
            <LoginForm onLogin={onLogin} />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button onClick={() => setShowLogin(false)} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>Don't have an account? Register</button>
            </div>
          </>
        ) : (
          <>
            <RegistrationForm onRegistered={() => setShowLogin(true)} />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button onClick={() => setShowLogin(true)} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>Already have an account? Login</button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-left">Satvic Delivery • Delivering more than just food</span>
        <span className="footer-right">Developed by <a href="https://www.linkedin.com/in/uddhab-das-645990237" target="_blank" rel="noopener noreferrer">Uddhab Das</a></span>
      </div>
    </footer>
  )
}

function AvailableDeliveries() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/delivery/available`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('deliveryToken')}` }
      })
      const data = await res.json()
      setDeliveries(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [])

  const pickUp = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/delivery/${id}/pick`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('deliveryToken')}` }
      })
      if (res.ok) {
        setMsg('Order picked up!')
        load()
        setTimeout(() => setMsg(''), 3000)
      }
    } catch (e) {
      setMsg('Failed to pick up')
    }
  }

  return (
    <div className="view-content">
      <div className="view-header">
        <h2 className="view-title">Available Deliveries</h2>
      </div>
      {msg && <div className="message success">{msg}</div>}
      {loading ? <p>Loading...</p> : (
        <div className="grid grid-2">
          {deliveries.length === 0 && <p className="empty-state">No pending deliveries in your area.</p>}
          {deliveries.map(d => (
            <div key={d.id} className="card">
              <h3>Order ID: {d.id.slice(-6)}</h3>
              <p>Restaurant: {d.restaurantId}</p>
              <p>User ID: {d.userId}</p>
              <p>Scheduled: {new Date(d.scheduledAt).toLocaleString()}</p>
              <div style={{ marginTop: '16px' }}>
                <Button onClick={() => pickUp(d.id)}>Pick Up Order</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MyDeliveries() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/delivery/my-orders`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('deliveryToken')}` }
      })
      const data = await res.json()
      setDeliveries(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [])

  const complete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/delivery/${id}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('deliveryToken')}` }
      })
      if (res.ok) {
        setMsg('Delivery completed!')
        load()
        setTimeout(() => setMsg(''), 3000)
      }
    } catch (e) {
      setMsg('Failed to complete')
    }
  }

  return (
    <div className="view-content">
      <div className="view-header">
        <h2 className="view-title">My Deliveries</h2>
      </div>
      {msg && <div className="message success">{msg}</div>}
      {loading ? <p>Loading...</p> : (
        <div className="grid grid-2">
          {deliveries.filter(d => d.status === 'picked').length === 0 && <p className="empty-state">No active deliveries.</p>}
          {deliveries.filter(d => d.status === 'picked').map(d => (
            <div key={d.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>Order ID: {d.id.slice(-6)}</h3>
                <span className="badge">Picked Up</span>
              </div>
              <p>Restaurant: {d.restaurantId}</p>
              <p>User ID: {d.userId}</p>
              <p>Scheduled: {new Date(d.scheduledAt).toLocaleString()}</p>
              <div style={{ marginTop: '16px' }}>
                <Button onClick={() => complete(d.id)}>Mark Delivered</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: '40px', marginBottom: '20px' }}>History</h3>
      <div className="grid grid-2">
        {deliveries.filter(d => d.status === 'done').map(d => (
          <div key={d.id} className="card" style={{ opacity: 0.8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>Order ID: {d.id.slice(-6)}</h3>
              <span className="badge badge-verified">Delivered</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Completed: {new Date(d.doneAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardView({ user }) {
  const [stats, setStats] = useState({ totalDeliveries: 0, pendingDeliveries: 0 })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/delivery/my-orders`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('deliveryToken')}` }
        })
        const data = await res.json()
        if (Array.isArray(data)) {
          setStats({
            totalDeliveries: data.filter(d => d.status === 'done').length,
            pendingDeliveries: data.filter(d => d.status === 'picked').length
          })
        }
      } catch (e) {}
    }
    loadStats()
  }, [])

  return (
    <div className="view-content">
      <div className="view-header">
        <h2 className="view-title">Welcome, {user.name}</h2>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalDeliveries}</div>
          <div className="stat-label">Total Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pendingDeliveries}</div>
          <div className="stat-label">Active Deliveries</div>
        </div>
      </div>
      <div className="card">
        <h3>Current Status</h3>
        <p>You are currently logged in as a delivery partner in {user.city || 'your city'}.</p>
        <p style={{ marginTop: '10px', color: 'var(--muted)' }}>Keep your status active to receive more delivery requests.</p>
      </div>
    </div>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('deliveryToken')
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/api/delivery-auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (res.ok) {
            const data = await res.json()
            setUser(data)
            setAuthed(true)
          } else {
            localStorage.removeItem('deliveryToken')
          }
        } catch (e) {
          localStorage.removeItem('deliveryToken')
        }
      }
    }
    checkAuth()
  }, [])

  const handleLogin = (data) => {
    setUser(data)
    setAuthed(true)
  }

  const logout = () => {
    localStorage.removeItem('deliveryToken')
    setAuthed(false)
    setUser(null)
  }

  if (!authed) return <LandingPage onLogin={handleLogin} />

  return (
    <div className="partner-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="Satvic" className="sidebar-logo" />
          <span className="sidebar-title">Delivery.Satvic</span>
        </div>
        <nav className="sidebar-nav">
          <div className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            Dashboard
          </div>
          <div className={`sidebar-link ${activeTab === 'available' ? 'active' : ''}`} onClick={() => setActiveTab('available')}>
            Available Orders
          </div>
          <div className={`sidebar-link ${activeTab === 'my-orders' ? 'active' : ''}`} onClick={() => setActiveTab('my-orders')}>
            My Deliveries
          </div>
        </nav>
        <div className="sidebar-link" onClick={logout} style={{ marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
          Logout
        </div>
      </aside>
      <main className="main-content">
        {activeTab === 'dashboard' && <DashboardView user={user} />}
        {activeTab === 'available' && <AvailableDeliveries />}
        {activeTab === 'my-orders' && <MyDeliveries />}
      </main>
    </div>
  )
}
