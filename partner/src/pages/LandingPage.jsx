import React, { useState } from 'react'
import { Button } from '../components/ui/button.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'
import { useToast } from '../components/ui/toast'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

function LoginCard({ onLogin, setView }) {
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e?.preventDefault()
    if (!email.trim() || !password.trim()) { 
      addToast('Email and password required', 'error')
      return 
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('partnerToken', data.token)
        localStorage.setItem('partnerId', data.id)
        addToast('Login successful!', 'success')
        onLogin(data.id)
      } else {
        addToast(data.error || 'Login failed', 'error')
      }
    } catch (err) {
      addToast('Network error', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card card-submit fade-in" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h3 className="form-section-title">Partner Login</h3>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Email</label>
          <UiInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="partner@example.com" required />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Password</label>
          <UiInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        <div style={{ marginBottom: '20px', textAlign: 'right' }}>
          <button type="button" className="text-link" style={{ fontSize: '13px', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setView('forgot')}>Forgot password?</button>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in...' : 'Login to Dashboard'}
        </Button>
      </form>
    </div>
  )
}

function ForgotPasswordCard({ setView }) {
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
    <div className="card card-submit fade-in" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h3 className="form-section-title">Forgot Password</h3>
      <p style={{ marginBottom: '20px', color: 'var(--muted)', fontSize: '14px', textAlign: 'center' }}>Enter your registered email to receive a reset code.</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Email Address</label>
          <UiInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending code...' : 'Send Reset Code'}
        </Button>
        <button type="button" className="w-full btn-soft" style={{ marginTop: '12px' }} onClick={() => setView('login')}>Back to Login</button>
      </form>
    </div>
  )
}

function ResetPasswordCard({ setView }) {
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword: password })
      })
      if (res.ok) {
        setView('login')
        alert('Password reset successful! Please login.')
      } else {
        const data = await res.json()
        setMsg(data.error || 'Reset failed')
      }
    } catch (err) {
      setMsg('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card card-submit" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h3 className="form-section-title">Reset Password</h3>
      {msg && <div className="message error">{msg}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Email</label>
          <UiInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Reset Code</label>
          <UiInput value={token} onChange={(e) => setToken(e.target.value)} maxLength={4} required />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>New Password</label>
          <UiInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </form>
    </div>
  )
}

export default function LandingPage({ onLogin }) {
  const [view, setView] = useState('login')

  return (
    <div className="container">
      <section className="hero-block" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h1 className="hero-title" style={{ fontSize: '56px', letterSpacing: '-0.03em' }}>Grow your Restaurant with SatvicTaste</h1>
        <p className="hero-sub" style={{ fontSize: '20px', maxWidth: '640px', margin: '24px auto', opacity: 0.8 }}>Join the most trusted platform for Satvik and Jain-friendly dining. Reach seekers who value purity and quality.</p>
        <div className="hero-actions" style={{ justifyContent: 'center', marginTop: '40px', display: 'flex', gap: '16px' }}>
          <a href="#login-section" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '16px' }}>Get Started</a>
          <a href="#benefits" className="btn btn-soft" style={{ padding: '16px 40px', fontSize: '16px' }}>Learn More</a>
        </div>
      </section>

      <section id="benefits" className="section" style={{ padding: '80px 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '56px', fontSize: '36px' }}>Why Partner with Us?</h2>
        <div className="grid grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '40px', marginBottom: '24px' }}>✨</div>
            <h3 style={{ marginBottom: '16px', fontSize: '22px' }}>Purity Verification</h3>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.6' }}>Get a verified badge that builds instant trust with spiritual seekers and health-conscious diners.</p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '40px', marginBottom: '24px' }}>📊</div>
            <h3 style={{ marginBottom: '16px', fontSize: '22px' }}>Manage Subscriptions</h3>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.6' }}>Offer daily meal packs and manage recurring revenue easily with our automated subscription tools.</p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '40px', marginBottom: '24px' }}>📱</div>
            <h3 style={{ marginBottom: '16px', fontSize: '22px' }}>Smart Operations</h3>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.6' }}>Digital menu, QR check-ins, and delivery management all in one calm, distraction-free dashboard.</p>
          </div>
        </div>
      </section>

      <section id="login-section" className="section" style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', padding: '80px 40px', textAlign: 'center', marginBottom: '80px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '28px' }}>Partner Dashboard</h3>
        <p style={{ marginBottom: '40px', color: 'var(--muted)', fontSize: '16px' }}>
          {view === 'login' ? 'Access your dashboard to manage your restaurant operations.' : 'Recover your account access.'}
        </p>
        
        {view === 'login' && <LoginCard onLogin={onLogin} setView={setView} />}
        {view === 'forgot' && <ForgotPasswordCard setView={setView} />}
        {view === 'reset' && <ResetPasswordCard setView={setView} />}

        <div style={{ marginTop: '40px', padding: '24px', borderTop: '1px solid var(--border)', maxWidth: '500px', margin: '40px auto 0' }}>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            Want to join as a restaurant partner? <br />
            Please contact our administration to get your restaurant verified and account created.
          </p>
        </div>
      </section>
    </div>
  )
}
