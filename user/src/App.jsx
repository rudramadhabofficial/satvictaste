import { useEffect, useState, useRef } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import './index.css'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from './components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card.jsx'
import { Badge as UiBadge } from './components/ui/badge.jsx'
import { Input as UiInput } from './components/ui/input.jsx'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

// Red marker for verified restaurants
const verifiedMarkerIcon = L.divIcon({
  className: 'custom-marker',
  html: `<span class="marker-pin marker-verified"></span>`,
  iconSize: [28, 42],
  iconAnchor: [14, 42],
})
function Header({ cartCount, onCartClick }) {
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
          {logged && <Link to="/subscriptions">My Account</Link>}
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={onCartClick}>
            <span style={{ fontSize: '20px' }}>🛒</span>
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--accent)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
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

function SignupPage() {
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

function VerifyPage() {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const email = new URLSearchParams(window.location.search).get('email')

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

function Hero({ onSearch }) {
  const [query, setQuery] = useState('')
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <h1 className="hero-title">Calm discovery for Satvik, Jain, and spiritual diets</h1>
          <p className="hero-sub">Verified restaurants serving clean, simple food.</p>
          <div className="hero-actions">
            <div className="hero-search-wrap">
              <UiInput
                placeholder="Search by name or city"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
                className="hero-search"
              />
            </div>
            <Button size="lg" onClick={() => onSearch(query)}>Search</Button>
            <Link to="/map"><Button variant="soft" size="lg">Map</Button></Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function VerifiedBadge() {
  return (
    <UiBadge variant="verified">Verified</UiBadge>
  )
}

function RestaurantCard({ r }) {
  return (
    <div className="card">
      <div className="card-cover">
        {r.verified && <div style={{ position: 'absolute', top: '12px', right: '12px' }}><VerifiedBadge /></div>}
      </div>
      <div className="card-body">
        <div className="card-header">
          <Link to={`/restaurants/${r._id}`} className="card-title">{r.name}</Link>
        </div>
        <div className="card-meta">
          <span>{r.area || r.city}</span>
          {r.priceRange && <span style={{ margin: '0 6px', opacity: 0.5 }}>•</span>}
          <span>{r.priceRange}</span>
        </div>
        <div className="card-tags">
          {r.satvikType && <span className="tag">{r.satvikType}</span>}
        </div>
      </div>
    </div>
  )
}

function HomePage() {
  const [restaurants, setRestaurants] = useState([])
  const [q, setQ] = useState('')
  useEffect(() => {
    fetch(`${API_BASE}/api/restaurants`).then(r => r.json()).then(setRestaurants)
  }, [])
  const filtered = restaurants.filter(r => !q || (r.name + r.city + r.area).toLowerCase().includes(q.toLowerCase()))
  return (
    <>
      <Hero onSearch={setQ} />
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Featured</h2>
            <Link to="/restaurants" className="btn btn-soft">View all</Link>
          </div>
          <div className="cards-grid">
            {filtered.length === 0 && (
              <div className="empty-state">
                <p className="empty-state-title">No restaurants yet</p>
                <p className="empty-state-desc">{q ? 'Try a different search or browse all.' : 'Verified restaurants will appear here. Check back soon.'}</p>
                {q && <Link to="/restaurants" className="btn btn-soft">Browse all</Link>}
              </div>
            )}
            {filtered.slice(0, 8).map(r => (
              <RestaurantCard key={r._id} r={r} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function MapPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const mapRef = useRef(null)
  const mapElRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!mapRef.current && mapElRef.current) {
      mapRef.current = L.map(mapElRef.current, { zoomControl: false }).setView([20.5937, 78.9629], 5)
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current)
    }
    ;(async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/restaurants`)
        const data = await resp.json()
        setRestaurants(data)
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 12)
          })
        }
      } catch (e) {
        console.error('Map load failed:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    markersRef.current.forEach(m => mapRef.current?.removeLayer(m))
    markersRef.current = []
    restaurants.forEach(r => {
      const lat = r.latitude || r.lat
      const lng = r.longitude || r.lng
      if (lat == null || lng == null) return
      
      const m = L.marker([lat, lng]).addTo(mapRef.current)
      const popupContent = `
        <div class="map-popup-premium">
          ${r.coverImage ? `<img src="${r.coverImage}" class="popup-img" />` : ''}
          <div class="popup-body">
            <h3>${r.name} ${r.verified ? '<span class="v-check">✓</span>' : ''}</h3>
            <p>${r.area || ''} ${r.city || ''}</p>
            <div class="popup-actions">
              <a href="/restaurants/${r._id}" class="btn-popup">View Details</a>
            </div>
          </div>
        </div>
      `
      m.bindPopup(popupContent, { maxWidth: 280, className: 'premium-popup' })
      markersRef.current.push(m)
    })
  }, [restaurants])

  const geocode = async (query) => {
    if (!query) return
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=1`
      const resp = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'SatvicApp/1.0' } })
      const results = await resp.json()
      if (results?.length) {
        const { lat, lon } = results[0]
        mapRef.current?.flyTo([parseFloat(lat), parseFloat(lon)], 13)
      }
    } catch (e) { console.error('Geocode failed:', e) }
  }

  const focusOnRestaurant = (r) => {
    const lat = r.latitude || r.lat
    const lng = r.longitude || r.lng
    if (lat && lng) {
      mapRef.current?.flyTo([lat, lng], 15)
    }
  }

  return (
    <div className="map-layout">
      <div className="map-pane" ref={mapElRef}>
        {loading && <div className="detail-loading" style={{ background: 'rgba(255,255,255,0.8)', padding: '12px 24px', borderRadius: 'var(--radius)', zIndex: 1000 }}>Loading map data…</div>}
      </div>
      <div className="list-pane">
        <div className="map-search-row">
          <UiInput 
            placeholder="Search city or area" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && geocode(search)}
            className="hero-search"
          />
          <Button variant="soft" onClick={() => geocode(search)}>Search</Button>
        </div>
        <div className="cards-grid">
          {restaurants.length === 0 && !loading && (
            <div className="empty-state">
              <p className="empty-state-title">No restaurants found</p>
              <p className="empty-state-desc">Try a different search or check back later.</p>
            </div>
          )}
          {restaurants.map((r) => (
            <div key={r._id} onClick={() => focusOnRestaurant(r)} style={{ cursor: 'pointer' }}>
              <RestaurantCard r={r} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ListingPage() {
  const [restaurants, setRestaurants] = useState([])
  useEffect(() => {
    fetch(`${API_BASE}/api/restaurants`).then(r => r.json()).then(setRestaurants)
  }, [])
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">All Restaurants</h2>
        </div>
        <div className="cards-grid">
          {restaurants.length === 0 && (
            <div className="empty-state empty-state-full">
              <p className="empty-state-title">No restaurants listed yet</p>
              <p className="empty-state-desc">Verified Satvik and Jain-friendly restaurants will appear here. Explore the map or check back later.</p>
              <Link to="/map" className="btn btn-primary">Explore on Map</Link>
            </div>
          )}
          {restaurants.map(r => (
            <RestaurantCard key={r._id} r={r} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BookingForm({ restaurantId }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [people, setPeople] = useState('2')
  const [msg, setMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleBooking = async (e) => {
    e.preventDefault()
    const userId = localStorage.getItem('userId')
    if (!userId) {
      navigate('/login')
      return
    }
    setSubmitting(true)
    setMsg('')
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId, userId, date, time, people })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed')
      setMsg('Booking request sent!')
      setDate(''); setTime(''); setPeople('2')
      setTimeout(() => setMsg(''), 5000)
    } catch (e) {
      setMsg(e.message || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="detail-block" style={{ borderTop: '1px solid var(--border)', paddingTop: '48px', marginBottom: '48px' }}>
      <h3 className="detail-heading">Book a Table</h3>
      <p className="detail-meta" style={{ marginBottom: '24px' }}>Reserve your spot for a calm dining experience.</p>
      <div className="card" style={{ padding: '32px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        {msg && <div className={`message ${msg.includes('sent') ? 'success' : 'error'}`} style={{ marginBottom: '20px' }}>{msg}</div>}
        <form onSubmit={handleBooking} className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Date</label>
            <UiInput type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Time</label>
            <UiInput type="time" value={time} onChange={e => setTime(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>People</label>
            <select value={people} onChange={e => setPeople(e.target.value)} className="btn btn-soft w-full" style={{ height: '42px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
              {[1, 2, 3, 4, 5, 6, 8, 10].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>)}
            </select>
          </div>
          <Button type="submit" disabled={submitting}>{submitting ? 'Booking...' : 'Reserve Table'}</Button>
        </form>
      </div>
    </div>
  )
}

function DetailPage({ onAddToCart }) {
  const [restaurant, setRestaurant] = useState(null)
  const id = window.location.pathname.split('/').pop()
  useEffect(() => {
    (async () => {
      const resp = await fetch(`${API_BASE}/api/restaurants/${id}`)
      const data = await resp.json()
      setRestaurant(data)
    })()
  }, [id])

  if (!restaurant) return (
    <div className="section">
      <div className="container-tight detail-loading">
        <div className="spinner" style={{ marginBottom: '12px' }}>Loading…</div>
      </div>
    </div>
  )

  return (
    <div className="detail-page">
      <div className="detail-hero-full">
        {restaurant.coverImage ? (
          <img src={restaurant.coverImage} alt={restaurant.name} className="detail-hero-img" />
        ) : (
          <div className="detail-hero-img" style={{ background: 'var(--highlight)' }} />
        )}
        <div className="detail-hero-overlay" />
      </div>

      <div className="container-tight">
        <div className="detail-header-card">
          <div className="detail-badge-wrap">
            <h1 className="detail-title">{restaurant.name}</h1>
            {restaurant.verified && <VerifiedBadge />}
          </div>
          <p className="detail-meta">
            {[restaurant.address, restaurant.city].filter(Boolean).join(' • ')}
          </p>
          <div className="detail-actions">
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} className="btn btn-call">
                Call Now
              </a>
            )}
            {restaurant.whatsapp && (
              <a href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="btn btn-whatsapp">
                WhatsApp
              </a>
            )}
            <Link to="/map" className="btn btn-soft">View on Map</Link>
          </div>
        </div>

        <div className="detail-block-grid">
          <div className="detail-main">
            <div className="detail-block">
              <h3 className="detail-heading">Menu Highlights</h3>
              <div className="menu-list-premium">
                {restaurant.menu?.length > 0 ? (
                  restaurant.menu.map((m, idx) => (
                    <div key={idx} className="menu-item-premium">
                      <div className="menu-item-info">
                        <h4>{m.name}</h4>
                        {m.description && <p>{m.description}</p>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="menu-item-price" style={{ marginBottom: '8px' }}>₹{m.price}</div>
                        <Button size="sm" variant="soft" onClick={() => onAddToCart(m, id)}>Add</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="detail-meta">Menu details are being updated.</p>
                )}
              </div>
            </div>

            {restaurant.story && (
              <div className="detail-block" style={{ marginTop: '48px', padding: '32px', background: 'var(--accent-soft)', borderRadius: 'var(--radius-lg)' }}>
                <h3 className="detail-heading">Our Story</h3>
                <p className="detail-meta" style={{ color: 'var(--text)', lineHeight: 1.8, fontSize: '16px' }}>{restaurant.story}</p>
              </div>
            )}
          </div>

          <div className="detail-side">
            <div className="detail-block">
              <h3 className="detail-heading">Information</h3>
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Satvik Type</label>
                  <div style={{ marginTop: '4px' }}>
                    <UiBadge variant="soft">{restaurant.satvikType || 'General Satvik'}</UiBadge>
                  </div>
                </div>
                {restaurant.bestTimeToVisit && (
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Best Time to Visit</label>
                    <p style={{ marginTop: '4px', fontSize: '14px' }}>{restaurant.bestTimeToVisit}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '64px' }}>
          <BookingForm restaurantId={id} />
        </div>

        <div style={{ marginTop: '64px', marginBottom: '80px' }}>
          <MembershipSection restaurantId={id} />
        </div>
      </div>
    </div>
  )
}

function MembershipSection({ restaurantId }) {
  const [plans, setPlans] = useState([])
  const [subMsg, setSubMsg] = useState('')
  const navigate = useNavigate()
  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch(`${API_BASE}/api/restaurants/${restaurantId}/memberships`)
        const data = await r.json()
        setPlans(Array.isArray(data) ? data : [])
      } catch {
        setPlans([])
      }
    })()
  }, [restaurantId])
  const subscribe = async (planId) => {
    setSubMsg('')
    const userId = localStorage.getItem('userId')
    if (!userId) {
      navigate('/login')
      return
    }
    try {
      const res = await fetch(`${API_BASE}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, restaurantId, planId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed')
      setSubMsg('Subscribed')
      setTimeout(() => setSubMsg(''), 3000)
    } catch (e) {
      setSubMsg(e.message || 'Failed')
      setTimeout(() => setSubMsg(''), 3000)
    }
  }
  return (
    <div className="detail-block" style={{ borderTop: '1px solid var(--border)', paddingTop: '48px' }}>
      <h3 className="detail-heading">Membership Plans</h3>
      <p className="detail-meta" style={{ marginBottom: '24px' }}>Support this restaurant and get exclusive benefits.</p>
      {subMsg && <div className={`message ${subMsg === 'Subscribed' ? 'success' : 'error'}`}>{subMsg}</div>}
      {plans.length === 0 ? (
        <div className="empty-state" style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius)' }}>
          <p className="empty-state-desc">No membership plans available for this restaurant yet.</p>
        </div>
      ) : (
        <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {plans.map((p) => (
            <Card key={p.id} className="hover:shadow-medium transition-all" style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <CardHeader>
                <CardTitle style={{ fontFamily: 'var(--font-display)', fontSize: '18px' }}>{p.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--text-strong)' }}>₹{p.price} <span className="text-sm font-medium text-neutral-400" style={{ fontWeight: 400 }}>/ {p.durationDays} days</span></div>
                <div className="text-sm text-neutral-600 mb-6" style={{ minHeight: '40px' }}>{Array.isArray(p.benefits) ? p.benefits.join(' • ') : ''}</div>
                <Button onClick={() => subscribe(p.id)} className="w-full" size="lg">Subscribe Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function AboutPage() {
  return (
    <section className="section">
      <div className="container-tight about-layout">
        <div className="about-text">
          <h1 className="section-title">About Satvic</h1>
          <p className="about-lead">
            Satvic is built to help people discover calm, clean and spiritually-aligned food places — without noise,
            ads or endless scrolling. The focus is on trust, simplicity and verified satvik, Jain-friendly options.
          </p>
          <p className="about-body">
            Every listing aims to reflect honest practices around ingredients, preparation and intention. This project
            started as a small effort to make it easier for families and seekers to find food that supports their lifestyle,
            wherever they travel.
          </p>
        </div>
        <div className="about-founder">
          <img src="/founder.jpg" alt="Founder" className="about-founder-photo" />
          <h2 className="about-founder-name">Founder</h2>
          <p className="about-founder-tagline">
            Vision for calm, trustworthy food discovery.
          </p>
        </div>
      </div>
    </section>
  )
}

function Footer() {
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

function SubscriptionsPage() {
  const [subs, setSubs] = useState([])
  const [bookings, setBookings] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadData = async () => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      setLoading(false)
      return
    }
    try {
      const [sRes, bRes, oRes] = await Promise.all([
        fetch(`${API_BASE}/api/users/${userId}/subscriptions`),
        fetch(`${API_BASE}/api/users/${userId}/bookings`),
        fetch(`${API_BASE}/api/users/${userId}/orders`)
      ])
      const sData = await sRes.json()
      const bData = await bRes.json()
      const oData = await oRes.json()
      setSubs(Array.isArray(sData) ? sData : [])
      setBookings(Array.isArray(bData) ? bData : [])
      setOrders(Array.isArray(oData) ? oData : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const redeemMeal = async (subId) => {
    try {
      const res = await fetch(`${API_BASE}/api/subscriptions/${subId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'meal_redeem' })
      })
      if (res.ok) {
        alert('Meal redeemed successfully! Show this to the restaurant.')
        loadData()
      }
    } catch (e) { console.error(e) }
  }

  const checkIn = async (subId) => {
    try {
      const res = await fetch(`${API_BASE}/api/subscriptions/${subId}/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'on_table_checkin' })
      })
      if (res.ok) {
        alert('Check-in successful! Enjoy your meal.')
        loadData()
      }
    } catch (e) { console.error(e) }
  }

  if (loading) return <div className="section"><div className="container-tight detail-loading">Loading your account data…</div></div>

  return (
    <section className="section">
      <div className="container">
        <div className="section-head" style={{ marginBottom: '40px' }}>
          <div>
            <h2 className="section-title">My Account</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>Manage your active restaurant memberships, table bookings, and food orders</p>
          </div>
        </div>

        <h3 className="detail-heading" style={{ marginBottom: '24px' }}>Active Subscriptions</h3>
        <div className="cards-grid" style={{ marginBottom: '64px' }}>
          {!localStorage.getItem('userId') && (
            <div className="empty-state empty-state-full" style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
              <p className="empty-state-title">Login required</p>
              <p className="empty-state-desc">Please login to view and manage your restaurant subscriptions.</p>
              <Button onClick={() => navigate('/login')} size="lg">Login to Account</Button>
            </div>
          )}
          {localStorage.getItem('userId') && subs.length === 0 && (
            <div className="empty-state empty-state-full" style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', padding: '40px' }}>
              <p className="empty-state-desc">You haven't subscribed to any restaurant plans yet.</p>
            </div>
          )}
          {subs.map((s) => (
            <div key={s.id} className="card" style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="card-header" style={{ marginBottom: '16px' }}>
                  <div>
                    <div className="card-title" style={{ fontSize: '18px', marginBottom: '4px' }}>Subscription</div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Restaurant: {s.restaurantId}</div>
                  </div>
                  <span className={`badge ${s.status === 'active' ? 'badge-verified' : ''}`} style={{ textTransform: 'capitalize' }}>
                    {s.status}
                  </span>
                </div>
                
                <div className="card-meta" style={{ marginBottom: '20px', fontSize: '14px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Ends on:</strong> {s.endDate ? new Date(s.endDate).toLocaleDateString() : 'N/A'}
                  </div>
                  {s.remainingMeals !== undefined && (
                    <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>{s.remainingMeals}</div>
                      <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Meals Left</div>
                    </div>
                  )}
                </div>

                <div className="form-actions" style={{ gap: '10px' }}>
                  {s.remainingMeals > 0 && (
                    <Button onClick={() => redeemMeal(s.id)} className="w-full" size="lg">Redeem Today's Meal</Button>
                  )}
                  <Button onClick={() => checkIn(s.id)} variant="soft" className="w-full">On-Table Check-in</Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ gap: '64px' }}>
          <div>
            <h3 className="detail-heading" style={{ marginBottom: '24px' }}>Table Bookings</h3>
            <div className="cards-grid" style={{ gridTemplateColumns: '1fr' }}>
              {localStorage.getItem('userId') && bookings.length === 0 && (
                <div className="empty-state empty-state-full" style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', padding: '40px' }}>
                  <p className="empty-state-desc">You haven't made any table bookings yet.</p>
                </div>
              )}
              {bookings.map((b) => (
                <div key={b.id} className="card" style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                  <div className="card-body" style={{ padding: 0 }}>
                    <div className="card-header" style={{ marginBottom: '12px' }}>
                      <div>
                        <div className="card-title" style={{ fontSize: '16px', marginBottom: '2px' }}>{b.people} People</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Restaurant: {b.restaurantId}</div>
                      </div>
                      <span className={`badge ${b.status === 'confirmed' ? 'badge-verified' : ''}`} style={{ textTransform: 'capitalize' }}>
                        {b.status}
                      </span>
                    </div>
                    <div className="card-meta" style={{ fontSize: '13px' }}>
                      <div><strong>Date:</strong> {b.date} — {b.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="detail-heading" style={{ marginBottom: '24px' }}>Order History</h3>
            <div className="cards-grid" style={{ gridTemplateColumns: '1fr' }}>
              {localStorage.getItem('userId') && orders.length === 0 && (
                <div className="empty-state empty-state-full" style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', padding: '40px' }}>
                  <p className="empty-state-desc">You haven't placed any orders yet.</p>
                </div>
              )}
              {orders.map((o) => (
                <div key={o.id} className="card" style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                  <div className="card-body" style={{ padding: 0 }}>
                    <div className="card-header" style={{ marginBottom: '12px' }}>
                      <div>
                        <div className="card-title" style={{ fontSize: '16px', marginBottom: '2px' }}>Order #{o.id.slice(-6)}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>₹{o.totalPrice} • {new Date(o.createdAt).toLocaleDateString()}</div>
                      </div>
                      <span className={`badge ${o.status === 'DELIVERED' ? 'badge-verified' : ''}`} style={{ textTransform: 'capitalize' }}>
                        {o.status}
                      </span>
                    </div>
                    <div className="card-meta" style={{ fontSize: '13px' }}>
                      {o.items?.map((item, idx) => (
                        <div key={idx} style={{ color: 'var(--muted)' }}>{item.name} x {item.quantity}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function UserLoginPage() {
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
      navigate('/subscriptions')
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

function CartDrawer({ cart, setCart, onClose }) {
  const navigate = useNavigate()
  const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0)

  const updateQty = (name, delta) => {
    setCart(cart.map(i => i.name === name ? { ...i, quantity: Math.max(0, i.quantity + delta) }.filter(x => x.quantity > 0) : i).filter(i => i.quantity > 0))
  }

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="cart-header-row">
          <h3>Your Cart</h3>
          <button onClick={onClose} style={{ background: 'none', fontSize: '24px' }}>&times;</button>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 && <p className="empty-state">Your cart is empty.</p>}
          {cart.map(i => (
            <div key={i.name} className="cart-item">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{i.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>₹{i.price}</div>
              </div>
              <div className="qty-controls">
                <button onClick={() => updateQty(i.name, -1)}>-</button>
                <span>{i.quantity}</span>
                <button onClick={() => updateQty(i.name, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <Button className="w-full" onClick={() => { onClose(); navigate('/checkout'); }}>Checkout</Button>
          </div>
        )}
      </div>
    </div>
  )
}

function CheckoutPage({ cart, setCart }) {
  const [address, setAddress] = useState('')
  const [msg, setMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0)

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    const userId = localStorage.getItem('userId')
    if (!userId) { navigate('/login'); return }
    if (!address.trim()) { setMsg('Please enter delivery address'); return }

    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: cart[0].restaurantId,
          userId,
          items: cart,
          totalPrice: total,
          deliveryAddress: address
        })
      })
      if (res.ok) {
        setCart([])
        setMsg('Order placed successfully!')
        setTimeout(() => navigate('/subscriptions'), 2000)
      } else {
        setMsg('Failed to place order')
      }
    } catch (e) {
      setMsg('Error placing order')
    } finally {
      setSubmitting(false)
    }
  }

  if (cart.length === 0 && !msg) return <div className="section"><div className="container-tight"><p>Your cart is empty.</p><Link to="/restaurants">Browse Restaurants</Link></div></div>

  return (
    <section className="section">
      <div className="container-tight">
        <h2 className="section-title" style={{ marginBottom: '32px' }}>Checkout</h2>
        {msg && <div className={`message ${msg.includes('successfully') ? 'success' : 'error'}`}>{msg}</div>}
        <div className="grid-2">
          <div>
            <h3 className="detail-heading">Order Summary</h3>
            <div className="card" style={{ padding: '24px' }}>
              {cart.map(i => (
                <div key={i.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                  <span>{i.name} x {i.quantity}</span>
                  <span>₹{i.price * i.quantity}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="detail-heading">Delivery Details</h3>
            <form onSubmit={handlePlaceOrder} className="card" style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Delivery Address</label>
                <textarea 
                  value={address} 
                  onChange={e => setAddress(e.target.value)}
                  style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'inherit' }}
                  placeholder="Enter full address..."
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Payment Method</label>
                <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', fontSize: '14px' }}>
                  Cash on Delivery (Online Payment coming soon)
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Placing Order...' : `Place Order (₹${total})`}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)

  const addToCart = (item, restaurantId) => {
    if (cart.length > 0 && cart[0].restaurantId !== restaurantId) {
      if (!window.confirm('Clear cart and add item from this restaurant?')) return
      setCart([{ ...item, restaurantId, quantity: 1 }])
    } else {
      const existing = cart.find(i => i.name === item.name)
      if (existing) {
        setCart(cart.map(i => i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i))
      } else {
        setCart([...cart, { ...item, restaurantId, quantity: 1 }])
      }
    }
    setShowCart(true)
  }

  return (
    <div className="app-wrap">
      <Header cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)} onCartClick={() => setShowCart(true)} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/restaurants" element={<ListingPage />} />
        <Route path="/restaurants/:id" element={<DetailPage onAddToCart={addToCart} />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/login" element={<UserLoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/checkout" element={<CheckoutPage cart={cart} setCart={setCart} />} />
      </Routes>
      <Footer />
      {showCart && <CartDrawer cart={cart} setCart={setCart} onClose={() => setShowCart(false)} />}
    </div>
  )
}
