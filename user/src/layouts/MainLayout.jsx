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
    const onScroll = () => setScrolled(window.scrollY > 40)
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
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <Link to="/" className="header-brand">
          <img src="/logo.png" alt="Satvic" className="header-logo" />
          <span className="header-title">SatvicTaste</span>
        </Link>

        <nav className="nav desktop-only">
          <Link to="/restaurants" className={`nav-link ${location.pathname === '/restaurants' ? 'active' : ''}`}>Browse</Link>
          <Link to="/map" className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`}>Map View</Link>
          {logged && <Link to="/orders" className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}>My Orders</Link>}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: '12px', borderLeft: '1px solid var(--border)', paddingLeft: '32px' }}>
            <div style={{ position: 'relative', cursor: 'pointer', color: 'var(--text-strong)' }} onClick={onCartClick}>
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{ 
                    position: 'absolute', top: '-6px', right: '-6px', 
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
                <Button className="btn-primary">Login</Button>
              </Link>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Link to="/account" style={{ color: 'var(--text-strong)' }}><User size={22} strokeWidth={1.5} /></Link>
                <button className="btn-ghost" onClick={logout} style={{ color: 'var(--muted)', padding: '4px' }} title="Logout">
                  <LogOut size={20} strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>
        </nav>

        <button className="mobile-only" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', color: 'var(--text-strong)' }}>
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mobile-menu"
            style={{ 
              position: 'fixed', top: '72px', left: 0, right: 0, bottom: 0,
              background: 'white', zIndex: 999, padding: '40px var(--space-4)'
            }}
          >
            <nav style={{ display: 'grid', gap: '24px', textAlign: 'center' }}>
              <Link to="/restaurants" style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-strong)' }}>Browse Restaurants</Link>
              <Link to="/map" style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-strong)' }}>Map Discovery</Link>
              {logged && <Link to="/orders" style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-strong)' }}>Track Orders</Link>}
              {logged && <Link to="/account" style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-strong)' }}>My Profile</Link>}
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
                {!logged ? (
                  <Link to="/login"><Button className="btn-primary w-full" size="lg">Get Started</Button></Link>
                ) : (
                  <Button variant="soft" className="w-full" onClick={logout} style={{ color: '#e53e3e' }}>Sign Out</Button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <img src="/logo.png" alt="Satvic" style={{ height: '36px' }} />
              <span className="footer-brand-name">SatvicTaste</span>
            </Link>
            <p className="footer-tagline">
              Curating the world's most authentic Satvik and Jain-friendly dining experiences for spiritual seekers.
            </p>
          </div>
          
          <div className="footer-nav">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/restaurants">Restaurants</Link></li>
              <li><Link to="/map">Map Discovery</Link></li>
              <li><Link to="/about">Our Mission</Link></li>
            </ul>
          </div>

          <div className="footer-nav">
            <h4>For Partners</h4>
            <ul>
              <li><Link to="https://partner.satvictaste.onrender.com">Partner Portal</Link></li>
              <li><Link to="/guidelines">Purity Standards</Link></li>
              <li><Link to="/support">Support</Link></li>
            </ul>
          </div>

          <div className="footer-nav">
            <h4>Connect</h4>
            <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.6' }}>
              Stay updated with new verified locations and community stories.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
              <a href="#" style={{ color: 'var(--text-strong)' }}>Instagram</a>
              <a href="#" style={{ color: 'var(--text-strong)' }}>Twitter</a>
            </div>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <p style={{ color: 'var(--muted-light)', fontSize: '12px', fontWeight: '500' }}>
            © {new Date().getFullYear()} SATVICTASTE. ALL RIGHTS RESERVED.
          </p>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" style={{ color: 'var(--muted-light)', fontSize: '12px', fontWeight: '500' }}>PRIVACY</a>
            <a href="#" style={{ color: 'var(--muted-light)', fontSize: '12px', fontWeight: '500' }}>TERMS</a>
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
