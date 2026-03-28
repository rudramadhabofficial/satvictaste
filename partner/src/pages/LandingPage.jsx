import React, { useState } from 'react'
import { Button } from '../components/ui/button.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'
import { useToast } from '../components/ui/toast'
import { 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  CheckCircle2
} from 'lucide-react'

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
      const res = await fetch(`${API_BASE}/api/partner/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('partnerToken', data.token)
        localStorage.setItem('partnerId', data.partnerId || data.id)
        addToast('Login successful!', 'success')
        onLogin(data.partnerId || data.id)
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
    <div className="card card-submit fade-in" style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'left' }}>
      <h3 className="form-section-title" style={{ textAlign: 'center', marginBottom: '24px' }}>Partner Login</h3>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)' }}>Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
            <UiInput 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="partner@example.com" 
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
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
              style={{ paddingLeft: '40px' }}
              required 
            />
          </div>
        </div>
        <div style={{ marginBottom: '24px', textAlign: 'right' }}>
          <button type="button" className="text-link" style={{ fontSize: '13px', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => setView('forgot')}>Forgot password?</button>
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
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
    <div className="card card-submit fade-in" style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'left' }}>
      <button 
        type="button" 
        onClick={() => setView('login')} 
        style={{ background: 'none', border: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', marginBottom: '16px', padding: 0 }}
      >
        <ArrowLeft size={14} /> Back to Login
      </button>
      <h3 className="form-section-title" style={{ marginBottom: '12px' }}>Forgot Password</h3>
      <p style={{ marginBottom: '24px', color: 'var(--muted)', fontSize: '14px' }}>Enter your registered email to receive a 4-digit reset code.</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-strong)' }}>Email Address</label>
          <UiInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Sending code...' : 'Send Reset Code'}
        </Button>
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
    <div className="card card-submit" style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'left' }}>
      <h3 className="form-section-title" style={{ marginBottom: '24px' }}>Reset Password</h3>
      {msg && <div className="message error" style={{ marginBottom: '20px' }}>{msg}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Email Address</label>
          <UiInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Reset Code</label>
          <UiInput value={token} onChange={(e) => setToken(e.target.value)} placeholder="4-digit code" maxLength={4} required />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>New Password</label>
          <UiInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </form>
    </div>
  )
}

export default function LandingPage({ onLogin }) {
  const [view, setView] = useState('login')

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      <section className="hero-block" style={{ textAlign: 'center', padding: '120px 20px', borderRadius: '0 0 var(--radius-xl) var(--radius-xl)', margin: '0 -20px var(--space-8)' }}>
        <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.1, marginBottom: '24px' }}>Grow your Restaurant with <span className="text-accent">SatvicTaste</span></h1>
        <p className="hero-sub" style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', maxWidth: '680px', margin: '0 auto 48px', color: 'var(--muted)' }}>Join the most trusted platform for Satvik and Jain-friendly dining. Reach seekers who value purity, consciousness, and quality.</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <a href="#login-section" className="btn btn-primary" style={{ padding: '18px 48px', fontSize: '16px' }}>Get Started <ArrowRight size={18} /></a>
          <a href="#benefits" className="btn btn-soft" style={{ padding: '18px 48px', fontSize: '16px' }}>Learn More</a>
        </div>
      </section>

      <section id="benefits" className="section" style={{ padding: '80px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '16px' }}>Why Partner with Us?</h2>
          <p style={{ color: 'var(--muted)', fontSize: '16px' }}>Everything you need to run a successful conscious kitchen.</p>
        </div>
        
        <div className="grid grid-3">
          <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--verified-bg)', color: 'var(--verified)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <ShieldCheck size={32} />
            </div>
            <h3 style={{ marginBottom: '16px', fontSize: '22px' }}>Purity Verification</h3>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.6' }}>Get a verified badge that builds instant trust with spiritual seekers and health-conscious diners.</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <BarChart3 size={32} />
            </div>
            <h3 style={{ marginBottom: '16px', fontSize: '22px' }}>Manage Subscriptions</h3>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.6' }}>Offer daily meal packs and manage recurring revenue easily with our automated subscription tools.</p>
          </div>
          
          <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--highlight)', color: 'var(--text-strong)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Zap size={32} />
            </div>
            <h3 style={{ marginBottom: '16px', fontSize: '22px' }}>Smart Operations</h3>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.6' }}>Digital menu, QR check-ins, and delivery management all in one calm, distraction-free dashboard.</p>
          </div>
        </div>
      </section>

      <section id="login-section" className="section" style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto 48px' }}>
          <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '16px' }}>Partner Dashboard</h3>
          <p style={{ color: 'var(--muted)', fontSize: '16px' }}>
            {view === 'login' ? 'Access your dashboard to manage your restaurant operations and track growth.' : 'Recover your account access to get back to your dashboard.'}
          </p>
        </div>
        
        <div className="fade-in">
          {view === 'login' && <LoginCard onLogin={onLogin} setView={setView} />}
          {view === 'forgot' && <ForgotPasswordCard setView={setView} />}
          {view === 'reset' && <ResetPasswordCard setView={setView} />}
        </div>

        <div style={{ marginTop: '64px', padding: '32px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', maxWidth: '500px', margin: '64px auto 0', display: 'flex', gap: '16px', alignItems: 'flex-start', textAlign: 'left' }}>
          <CheckCircle2 size={24} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Want to join as a restaurant partner?</h4>
            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>
              Please contact our administration to get your restaurant verified and account created. We personally vet every partner to maintain our purity standards.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
