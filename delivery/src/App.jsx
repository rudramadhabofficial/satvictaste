import React, { useState, useEffect } from 'react'
import './index.css'
import { Button } from './components/ui/button.jsx'
import { Input as UiInput } from './components/ui/input.jsx'
import { useToast } from './components/ui/toast'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

function LandingHeader() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <img src="/logo.png" alt="SatvicTaste" className="header-logo" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="header-title">delivery.satvictaste</span>
            <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', background: 'var(--accent-soft)', padding: '2px 6px', borderRadius: '4px' }}>Premium</span>
          </div>
        </div>
        <nav className="nav">
          <a href="#how">How it works</a>
          <a href="#login" className="btn btn-primary btn-sm">Partner Login</a>
        </nav>
      </div>
    </header>
  )
}

function LoginForm({ onLogin, setView }) {
  const { addToast } = useToast()
  const [creds, setCreds] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)

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
        addToast('Welcome back!', 'success')
        onLogin(data)
      } else {
        addToast(data.error || 'Login failed', 'error')
      }
    } catch (e) {
      addToast('Login failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="login" className="section fade-in">
      <div className="container-tight">
        <div className="card">
          <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Partner Login</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label>Email</label>
              <UiInput type="email" value={creds.email} onChange={e => setCreds({ ...creds, email: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label>Password</label>
              <UiInput type="password" value={creds.password} onChange={e => setCreds({ ...creds, password: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '20px', textAlign: 'right' }}>
              <button type="button" className="text-link" style={{ fontSize: '13px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setView('forgot')}>Forgot password?</button>
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

function ForgotPasswordForm({ setView }) {
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (res.ok) {
        addToast('Reset code sent to your email', 'success')
        setView('reset')
      } else {
        const data = await res.json()
        addToast(data.error || 'Failed to send code', 'error')
      }
    } catch (err) {
      addToast('Network error', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section fade-in">
      <div className="container-tight">
        <div className="card">
          <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Forgot Password</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label>Email Address</label>
              <UiInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending code...' : 'Send Reset Code'}
            </Button>
            <button type="button" className="w-full btn-soft" style={{ marginTop: '12px' }} onClick={() => setView('login')}>Back to Login</button>
          </form>
        </div>
      </div>
    </section>
  )
}

function ResetPasswordForm({ setView }) {
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password })
      })
      if (res.ok) {
        addToast('Password reset successful! Please login.', 'success')
        setView('login')
      } else {
        const data = await res.json()
        addToast(data.error || 'Reset failed', 'error')
      }
    } catch (err) {
      addToast('Network error', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section fade-in">
      <div className="container-tight">
        <div className="card">
          <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Reset Password</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label>Email</label>
              <UiInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label>Reset Code</label>
              <UiInput value={token} onChange={(e) => setToken(e.target.value)} maxLength={4} required />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label>New Password</label>
              <UiInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}

function LandingPage({ onLogin }) {
  const [view, setView] = useState('login')

  return (
    <div className="app-wrap">
      <LandingHeader />
      <main className="container">
        <section className="hero-block" style={{ textAlign: 'center', padding: '80px 0' }}>
          <h1 className="hero-title" style={{ fontSize: '48px' }}>Deliver Purity, Earn Peace</h1>
          <p className="hero-sub" style={{ fontSize: '18px', maxWidth: '600px', margin: '20px auto' }}>Join SatvicTaste as a delivery partner and help us bring healthy, satvic meals to those who need them.</p>
        </section>

        {view === 'login' && <LoginForm onLogin={onLogin} setView={setView} />}
        {view === 'forgot' && <ForgotPasswordForm setView={setView} />}
        {view === 'reset' && <ResetPasswordForm setView={setView} />}
        
        <div style={{ textAlign: 'center', marginTop: '32px', padding: '24px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)' }}>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            Want to become a delivery partner? <br />
            Please contact our administration to get your ID created.
          </p>
        </div>
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
      const res = await fetch(`${API_BASE}/api/delivery/available-orders`, {
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
      const res = await fetch(`${API_BASE}/api/delivery/orders/${id}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('deliveryToken')}` }
      })
      if (res.ok) {
        setMsg('Order accepted for delivery!')
        load()
        setTimeout(() => setMsg(''), 3000)
      } else {
        const data = await res.json()
        setMsg(data.error || 'Failed to accept')
      }
    } catch (e) {
      setMsg('Failed to accept')
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

  const pickUpOrder = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/delivery/orders/${id}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('deliveryToken')}` 
        },
        body: JSON.stringify({ status: 'PICKED' })
      })
      if (res.ok) {
        setMsg('Order picked up!')
        load()
      }
    } catch (e) {
      setMsg('Failed to pick up')
    }
  }

  const complete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/delivery/orders/${id}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('deliveryToken')}` 
        },
        body: JSON.stringify({ status: 'DELIVERED' })
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
          {deliveries.filter(d => ['ASSIGNED', 'PICKED'].includes(d.status)).length === 0 && <p className="empty-state">No active deliveries.</p>}
          {deliveries.filter(d => ['ASSIGNED', 'PICKED'].includes(d.status)).map(d => (
            <div key={d.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>Order ID: {d.id.slice(-6)}</h3>
                <span className={`badge ${d.status === 'PICKED' ? 'badge-verified' : ''}`}>{d.status}</span>
              </div>
              <p>Restaurant: {d.restaurantId}</p>
              <p>Address: {d.deliveryAddress}</p>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                {d.status === 'ASSIGNED' && (
                  <Button onClick={() => pickUpOrder(d.id)}>Mark Picked Up</Button>
                )}
                {d.status === 'PICKED' && (
                  <Button onClick={() => complete(d.id)}>Mark Delivered</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: '40px', marginBottom: '20px' }}>History</h3>
      <div className="grid grid-2">
        {deliveries.filter(d => d.status === 'DELIVERED').map(d => (
          <div key={d.id} className="card" style={{ opacity: 0.8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>Order ID: {d.id.slice(-6)}</h3>
              <span className="badge badge-verified">Delivered</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Completed: {new Date(d.deliveredAt).toLocaleString()}</p>
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
