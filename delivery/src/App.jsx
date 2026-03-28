import React, { useState, useEffect } from 'react'
import './index.css'
import { Button } from './components/ui/button.jsx'
import { Input as UiInput } from './components/ui/input.jsx'
import { useToast } from './components/ui/toast'
import { 
  LayoutDashboard, 
  Truck, 
  LogOut, 
  Menu as MenuIcon, 
  X, 
  CheckCircle2, 
  ArrowRight,
  Package,
  MapPin,
  Clock,
  Navigation,
  Mail,
  Lock
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

function LandingHeader() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <img src="/logo.png" alt="SatvicTaste" className="header-logo" />
          <span className="header-title">delivery.satvictaste</span>
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
        <div className="card card-submit" style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'left' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '24px' }}>Delivery Partner Login</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <UiInput 
                  type="email" 
                  value={creds.email} 
                  onChange={e => setCreds({ ...creds, email: e.target.value })} 
                  placeholder="delivery@example.com" 
                  style={{ paddingLeft: '40px' }}
                  required 
                />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <UiInput 
                  type="password" 
                  value={creds.password} 
                  onChange={e => setCreds({ ...creds, password: e.target.value })} 
                  placeholder="••••••••" 
                  style={{ paddingLeft: '40px' }}
                  required 
                />
              </div>
            </div>
            <div style={{ marginBottom: '24px', textAlign: 'right' }}>
              <button type="button" className="text-link" style={{ fontSize: '13px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => setView('forgot')}>Forgot password?</button>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? 'Logging in...' : 'Login to Dashboard'}
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
        <div className="card card-submit" style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'left' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '12px', fontSize: '24px' }}>Forgot Password</h2>
          <p style={{ marginBottom: '24px', color: 'var(--muted)', fontSize: '14px', textAlign: 'center' }}>Enter your email to receive a reset code.</p>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Email Address</label>
              <UiInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
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
        <div className="card card-submit" style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'left' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '24px' }}>Reset Password</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Email Address</label>
              <UiInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Reset Code</label>
              <UiInput value={token} onChange={(e) => setToken(e.target.value)} maxLength={4} required />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>New Password</label>
              <UiInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
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
      <main className="container" style={{ paddingBottom: '80px' }}>
        <section className="hero-block" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', lineHeight: 1.1, marginBottom: '24px' }}>Deliver Purity, <span className="text-accent">Earn Peace</span></h1>
          <p className="hero-sub" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', maxWidth: '640px', margin: '0 auto 40px', color: 'var(--muted)' }}>Join SatvicTaste as a delivery partner and help us bring healthy, satvic meals to those who value purity.</p>
          <div className="hero-actions" style={{ justifyContent: 'center', gap: '16px' }}>
            <a href="#login" className="btn btn-primary" style={{ padding: '18px 48px', fontSize: '16px' }}>Start Delivering <ArrowRight size={18} /></a>
          </div>
        </section>

        {view === 'login' && <LoginForm onLogin={onLogin} setView={setView} />}
        {view === 'forgot' && <ForgotPasswordForm setView={setView} />}
        {view === 'reset' && <ResetPasswordForm setView={setView} />}
        
        <div style={{ marginTop: '64px', padding: '32px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', maxWidth: '600px', margin: '64px auto 0', display: 'flex', gap: '20px', alignItems: 'flex-start', textAlign: 'left' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--text-strong)' }}>Want to become a delivery partner?</h4>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: 1.5 }}>
              Please contact our administration to get your ID created. We personally onboard every partner to ensure the best service for our community.
            </p>
          </div>
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
      </div>
    </footer>
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
        setMsg('Order marked as picked up!')
        load()
      }
    } catch (e) {
      setMsg('Failed to update status')
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
        setMsg('Delivery completed successfully!')
        load()
        setTimeout(() => setMsg(''), 3000)
      }
    } catch (e) {
      setMsg('Failed to complete delivery')
    }
  }

  const activeDeliveries = deliveries.filter(d => ['ASSIGNED', 'PICKED'].includes(d.status))
  const completedDeliveries = deliveries.filter(d => d.status === 'DELIVERED')

  return (
    <div className="view-content">
      <div className="view-header" style={{ marginBottom: '32px' }}>
        <h2 className="view-title">My Active Deliveries</h2>
        <p style={{ color: 'var(--muted)', marginTop: '4px' }}>Manage your ongoing delivery tasks.</p>
      </div>
      
      {msg && <div className="message success" style={{ marginBottom: '20px' }}>{msg}</div>}
      
      {loading ? <p>Loading your deliveries...</p> : (
        <div className="grid grid-2">
          {activeDeliveries.length === 0 && (
            <div className="card empty-state" style={{ gridColumn: '1 / -1', padding: '64px', textAlign: 'center' }}>
              <Navigation size={48} style={{ margin: '0 auto 16px', color: 'var(--muted)', opacity: 0.5 }} />
              <p>You have no active deliveries at the moment.</p>
            </div>
          )}
          {activeDeliveries.map(d => (
            <div key={d.id} className="card fade-in" style={{ padding: '24px', borderLeft: d.status === 'PICKED' ? '4px solid var(--verified)' : '4px solid var(--accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px' }}>Order #{d.id.slice(-6).toUpperCase()}</h3>
                <span className={`badge ${d.status === 'PICKED' ? 'badge-verified' : ''}`} style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: 700 }}>
                  {d.status === 'PICKED' ? 'Picked Up' : 'Assigned'}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <MapPin size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Restaurant</div>
                    <div style={{ fontSize: '15px' }}>{d.restaurantId}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Navigation size={18} style={{ color: 'var(--verified)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Delivery Address</div>
                    <div style={{ fontSize: '15px' }}>{d.deliveryAddress}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                {d.status === 'ASSIGNED' && (
                  <Button className="w-full" size="lg" onClick={() => pickUpOrder(d.id)}>
                    Mark as Picked Up
                  </Button>
                )}
                {d.status === 'PICKED' && (
                  <Button className="w-full" variant="primary" size="lg" onClick={() => complete(d.id)}>
                    Complete Delivery
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {completedDeliveries.length > 0 && (
        <>
          <h3 style={{ marginTop: '56px', marginBottom: '24px', fontSize: '20px' }}>Recent History</h3>
          <div className="grid grid-2">
            {completedDeliveries.slice(0, 4).map(d => (
              <div key={d.id} className="card" style={{ opacity: 0.8, padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px' }}>Order #{d.id.slice(-6).toUpperCase()}</h3>
                  <span className="badge badge-verified" style={{ fontSize: '10px' }}>DELIVERED</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
                  Completed on {new Date(d.deliveredAt).toLocaleDateString()} at {new Date(d.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function DashboardView({ user }) {
  const [stats, setStats] = useState({ totalDeliveries: 0, pendingDeliveries: 0 })
  const [assignedHotels, setAssignedHotels] = useState([])
  const [loadingHotels, setLoadingLoadingHotels] = useState(true)
  const [selectedHotel, setSelectedHotel] = useState(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/delivery/my-orders`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('deliveryToken')}` }
        })
        const data = await res.json()
        if (Array.isArray(data)) {
          setStats({
            totalDeliveries: data.filter(d => d.status === 'DELIVERED').length,
            pendingDeliveries: data.filter(d => ['ASSIGNED', 'PICKED'].includes(d.status)).length
          })
        }
      } catch (e) {}
    }

    const loadAssignedHotels = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/delivery/assigned-restaurants`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('deliveryToken')}` }
        })
        const data = await res.json()
        setAssignedHotels(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingLoadingHotels(false)
      }
    }

    loadStats()
    loadAssignedHotels()
  }, [])

  const HotelDetailModal = () => {
    if (!selectedHotel) return null
    return (
      <div className="modal-overlay" style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', 
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }} onClick={() => setSelectedHotel(null)}>
        <div className="card fade-in" style={{ 
          maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
          position: 'relative', padding: '32px'
        }} onClick={e => e.stopPropagation()}>
          <button 
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
            onClick={() => setSelectedHotel(null)}
          >
            <X size={24} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--accent-soft)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <MapPin size={28} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px' }}>{selectedHotel.name}</h2>
              <span className="badge badge-verified">Partner Hotel</span>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: 600 }}>Location Info</div>
              <div style={{ fontSize: '15px', color: 'var(--text-strong)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={16} style={{ marginTop: '2px', color: 'var(--accent)' }} />
                <span>{selectedHotel.address}<br/>{selectedHotel.area}, {selectedHotel.city}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: 600 }}>Contact</div>
                <div style={{ fontSize: '15px', color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={16} style={{ color: 'var(--accent)' }} />
                  <span>{selectedHotel.phone}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: 600 }}>Timing</div>
                <div style={{ fontSize: '15px', color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} style={{ color: 'var(--accent)' }} />
                  <span>{selectedHotel.bestTimeToVisit || 'Open Now'}</span>
                </div>
              </div>
            </div>

            {selectedHotel.story && (
              <div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', fontWeight: 600 }}>Notes</div>
                <div style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5 }}>{selectedHotel.story}</div>
              </div>
            )}
          </div>

          <Button className="w-full" style={{ marginTop: '32px' }} onClick={() => setSelectedHotel(null)}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="view-content">
      <HotelDetailModal />
      <div className="view-header" style={{ marginBottom: '40px' }}>
        <h2 className="view-title">Welcome back, {user.name}</h2>
        <p style={{ color: 'var(--muted)', marginTop: '4px' }}>Here's your delivery summary and assigned hotels.</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-value">{stats.totalDeliveries}</div>
              <div className="stat-label">Total Completed</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--verified-bg)', color: 'var(--verified)', borderRadius: '12px' }}>
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-value">{stats.pendingDeliveries}</div>
              <div className="stat-label">Active Deliveries</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: '12px' }}>
              <Truck size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-value">{assignedHotels.length}</div>
              <div className="stat-label">Assigned Hotels</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--highlight)', color: 'var(--text-strong)', borderRadius: '12px' }}>
              <MapPin size={24} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <MapPin size={20} className="text-accent" />
            <h3 style={{ margin: 0 }}>My Assigned Hotels</h3>
          </div>
          {loadingHotels ? <p>Loading assigned hotels...</p> : (
            <div className="table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 0' }}>Hotel Name</th>
                    <th>Location</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedHotels.length === 0 ? (
                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)' }}>No hotels assigned to you yet.</td></tr>
                  ) : (
                    assignedHotels.map(h => (
                      <tr key={h.id || h._id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => setSelectedHotel(h)}>
                        <td style={{ padding: '16px 0', fontWeight: '600', color: 'var(--accent)' }}>{h.name}</td>
                        <td style={{ color: 'var(--muted)', fontSize: '14px' }}>{h.area}, {h.city}</td>
                        <td style={{ fontSize: '14px' }}>{h.phone}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--accent-soft)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
              <Navigation size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>Status: Active</h3>
              <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.4 }}>You will receive orders from your assigned hotels above.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const { addToast } = useToast()

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

  useEffect(() => {
    if (authed && user) {
      const pollNotifications = async () => {
        try {
          const res = await fetch(`${API_BASE}/api/notifications?dpId=${user.id || user._id}`)
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
  }, [authed, user, notifications])

  const handleLogin = (data) => {
    setUser(data)
    setAuthed(true)
  }

  const logout = () => {
    localStorage.removeItem('deliveryToken')
    setAuthed(false)
    setUser(null)
    setMobileMenuOpen(false)
  }

  if (!authed) return <LandingPage onLogin={handleLogin} />

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-orders', label: 'Assigned Orders', icon: Truck },
  ]

  return (
    <div className="partner-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="Satvic" className="sidebar-logo" />
          <span className="sidebar-title">Delivery Panel</span>
          
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
            <div 
              key={item.id}
              className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`} 
              onClick={() => {
                setActiveTab(item.id)
                setMobileMenuOpen(false)
              }}
            >
              <item.icon size={20} strokeWidth={2} />
              <span>{item.label}</span>
            </div>
          ))}
          <div className="sidebar-link btn-logout" onClick={logout} style={{ marginTop: 'auto', border: 'none', background: 'none', cursor: 'pointer' }}>
            <LogOut size={20} strokeWidth={2} />
            <span>Logout</span>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        {activeTab === 'dashboard' && <DashboardView user={user} />}
        {activeTab === 'my-orders' && <MyDeliveries />}
        
        <footer className="footer" style={{ marginTop: 'auto', paddingTop: '40px' }}>
          <div className="footer-inner">
            <span className="footer-left">Satvic Delivery • Purity in every step</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
