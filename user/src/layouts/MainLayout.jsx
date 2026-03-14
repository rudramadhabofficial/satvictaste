import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'

export function Header({ cartCount, onCartClick }) {
  const [scrolled, setScrolled] = useState(false)
  const [logged, setLogged] = useState(!!localStorage.getItem('userToken'))
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const i = setInterval(() => setLogged(!!localStorage.getItem('userToken')), 1000)
    return () => clearInterval(i)
  }, [])

  const logout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userId')
    navigate('/')
  }

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">
        <Link to="/" className="header-brand">
          <img src="/logo.png" alt="Satvic" className="header-logo" />
          <span className="header-title">Satvic</span>
        </Link>
        <nav className="nav">
          <Link to="/map">Map</Link>
          <Link to="/restaurants">Browse</Link>
          {logged && <Link to="/account">My Account</Link>}
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={onCartClick}>
            <span style={{ fontSize: '20px' }}>🛒</span>
            {cartCount > 0 && (
              <span style={{ 
                position: 'absolute', top: '-8px', right: '-8px', 
                background: 'var(--accent)', color: 'white', borderRadius: '50%', 
                width: '18px', height: '18px', fontSize: '10px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' 
              }}>
                {cartCount}
              </span>
            )}
          </div>
          {!logged ? (
            <Link to="/login" className="btn btn-primary btn-sm" style={{ padding: '8px 16px', fontSize: '13px' }}>Login</Link>
          ) : (
            <button className="btn btn-ghost" onClick={logout}>Logout</button>
          )}
        </nav>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/logo.png" alt="Satvic" className="footer-logo" />
          <span className="footer-brand-name">Satvic</span>
          <p className="footer-tagline">Verified Satvik, Jain &amp; spiritual food. Calm discovery, no distractions.</p>
        </div>
        <div className="footer-nav">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/restaurants">Browse</Link></li>
            <li><Link to="/map">Map</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </div>
        <div className="footer-legal">
          <h4>Trust</h4>
          <p>Restaurants are verified for diet alignment. Use at your discretion.</p>
        </div>
      </div>
    </footer>
  )
}

export default function MainLayout({ children, cartCount, onCartClick }) {
  return (
    <div className="app-wrap">
      <Header cartCount={cartCount} onCartClick={onCartClick} />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
