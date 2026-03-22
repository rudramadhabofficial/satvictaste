import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, User, Map, Search, Menu, X, LogOut, ChevronRight } from 'lucide-react'
import { Button } from '../components/ui/button.jsx'

export function Header({ cartCount, onCartClick }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [logged, setLogged] = useState(!!localStorage.getItem('userToken'))
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const i = setInterval(() => setLogged(!!localStorage.getItem('userToken')), 1000)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  const logout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userId')
    navigate('/')
  }

  return (
    <header className={`header glass ${scrolled ? 'scrolled' : ''}`} style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      padding: scrolled ? '12px 0' : '20px 0',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="Satvic" style={{ height: scrolled ? '32px' : '40px', transition: 'height 0.3s ease' }} />
          <span className="header-title" style={{ 
            fontSize: scrolled ? '18px' : '22px', 
            fontWeight: 'bold', 
            color: 'var(--text-strong)',
            transition: 'font-size 0.3s ease'
          }}>
            SatvicTaste
          </span>
        </Link>

        <nav className="nav desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link to="/restaurants" className={`nav-link ${location.pathname === '/restaurants' ? 'active' : ''}`} style={{ fontSize: '14px', fontWeight: '500', color: 'var(--muted)' }}>Browse</Link>
          <Link to="/map" className="nav-link" style={{ fontSize: '14px', fontWeight: '500', color: 'var(--muted)' }}>Map</Link>
          {logged && <Link to="/orders" className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`} style={{ fontSize: '14px', fontWeight: '500', color: 'var(--muted)' }}>Orders</Link>}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '16px', borderLeft: '1px solid var(--border)', paddingLeft: '32px' }}>
            <div style={{ position: 'relative', cursor: 'pointer', color: 'var(--text-strong)' }} onClick={onCartClick}>
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ 
                    position: 'absolute', top: '-8px', right: '-8px', 
                    background: 'var(--accent)', color: 'white', borderRadius: '50%', 
                    width: '18px', height: '18px', fontSize: '10px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' 
                  }}
                >
                  {cartCount}
                </motion.span>
              )}
            </div>
            
            {!logged ? (
              <Link to="/login">
                <Button size="sm" className="btn-primary">Login</Button>
              </Link>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link to="/account" style={{ color: 'var(--text-strong)' }}><User size={20} /></Link>
                <button className="btn-ghost" onClick={logout} style={{ color: 'var(--muted)', padding: '4px' }}><LogOut size={18} /></button>
              </div>
            )}
          </div>
        </nav>

        <button className="mobile-only btn-ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mobile-menu glass"
            style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}
          >
            <div className="container" style={{ padding: '24px 0' }}>
              <nav style={{ display: 'grid', gap: '16px' }}>
                <Link to="/restaurants" style={{ fontSize: '18px', fontWeight: '500', padding: '12px 0' }}>Browse Restaurants</Link>
                <Link to="/map" style={{ fontSize: '18px', fontWeight: '500', padding: '12px 0' }}>Map View</Link>
                {logged && <Link to="/orders" style={{ fontSize: '18px', fontWeight: '500', padding: '12px 0' }}>My Orders</Link>}
                {logged && <Link to="/account" style={{ fontSize: '18px', fontWeight: '500', padding: '12px 0' }}>Account Settings</Link>}
                {!logged ? (
                  <Link to="/login"><Button className="btn-primary w-full" size="lg">Login / Sign Up</Button></Link>
                ) : (
                  <Button variant="soft" className="w-full" onClick={logout} style={{ color: 'red' }}>Logout</Button>
                )}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="footer" style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)', padding: '80px 0 40px' }}>
      <div className="container">
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '64px', marginBottom: '64px' }}>
          <div className="footer-brand">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <img src="/logo.png" alt="Satvic" style={{ height: '32px' }} />
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-strong)' }}>SatvicTaste</span>
            </Link>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.7', maxWidth: '320px' }}>
              Verified Satvik, Jain & spiritual food discovery. 
              Helping you find meals that nourish both body and soul.
            </p>
          </div>
          
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', color: 'var(--text-strong)' }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
              <li><Link to="/restaurants" style={{ color: 'var(--muted)', fontSize: '14px' }}>Browse Restaurants</Link></li>
              <li><Link to="/map" style={{ color: 'var(--muted)', fontSize: '14px' }}>Map Discovery</Link></li>
              <li><Link to="/about" style={{ color: 'var(--muted)', fontSize: '14px' }}>Our Mission</Link></li>
              <li><Link to="/account" style={{ color: 'var(--muted)', fontSize: '14px' }}>Partner Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', color: 'var(--text-strong)' }}>Trust & Safety</h4>
            <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' }}>
              All restaurants are manually verified for strict dietary compliance.
            </p>
            <Link to="/about" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 'bold', color: 'var(--accent)' }}>
              Verification Process <ChevronRight size={14} />
            </Link>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <p style={{ color: 'var(--muted-light)', fontSize: '13px' }}>
            © {new Date().getFullYear()} SatvicTaste. Purely Crafted.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: 'var(--muted-light)', fontSize: '13px' }}>Privacy</a>
            <a href="#" style={{ color: 'var(--muted-light)', fontSize: '13px' }}>Terms</a>
            <a href="#" style={{ color: 'var(--muted-light)', fontSize: '13px' }}>Guidelines</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function MainLayout({ children, cartCount, onCartClick }) {
  return (
    <div className="app-wrap" style={{ paddingTop: '80px' }}>
      <Header cartCount={cartCount} onCartClick={onCartClick} />
      <main style={{ minHeight: '80vh' }}>{children}</main>
      <Footer />
    </div>
  )
}
