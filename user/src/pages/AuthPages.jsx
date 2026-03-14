import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'

const API_BASE = 'https://satvictaste.onrender.com'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return
    setError('')
    try {
      const r = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Failed')
      localStorage.setItem('userToken', data.token)
      localStorage.setItem('userId', data.id)
      navigate('/account')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section className="section">
      <div className="container-tight">
        <div className="card card-submit">
          <h3 className="form-section-title">Login</h3>
          {error && <div className="message error" style={{ marginBottom: '16px' }}>{error}</div>}
          <div className="grid" style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 500 }}>Email</label>
              <UiInput type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 500 }}>Password</label>
              <UiInput type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            <Button onClick={handleLogin} className="w-full">Login</Button>
            <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: 'var(--muted)' }}>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function SignupPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) return
    setError('')
    try {
      const r = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Failed')
      navigate(`/verify?email=${encodeURIComponent(email)}`)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section className="section">
      <div className="container-tight">
        <div className="card card-submit">
          <h3 className="form-section-title">Create account</h3>
          {error && <div className="message error" style={{ marginBottom: '16px' }}>{error}</div>}
          <div className="grid" style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 500 }}>Name</label>
              <UiInput placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 500 }}>Email</label>
              <UiInput type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 500 }}>Password</label>
              <UiInput type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            <Button onClick={handleSignup} className="w-full">Sign up</Button>
            <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px', color: 'var(--muted)' }}>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function VerifyPage() {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const email = new URLSearchParams(location.search).get('email')

  const handleVerify = async () => {
    if (!token.trim()) return
    setError('')
    try {
      const r = await fetch(`${API_BASE}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Invalid code')
      navigate('/login')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <section className="section">
      <div className="container-tight">
        <div className="card card-submit" style={{ textAlign: 'center' }}>
          <h3 className="form-section-title">Verify your email</h3>
          <p style={{ marginBottom: '24px', color: 'var(--muted)', fontSize: '14px' }}>
            We've sent a 6-digit verification code to <strong>{email}</strong>
          </p>
          {error && <div className="message error" style={{ marginBottom: '16px' }}>{error}</div>}
          <div style={{ marginBottom: '24px' }}>
            <UiInput
              placeholder="Enter 6-digit code"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '18px' }}
            />
          </div>
          <Button onClick={handleVerify} className="w-full">Verify</Button>
        </div>
      </div>
    </section>
  )
}
