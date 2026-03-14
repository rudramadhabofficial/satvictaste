import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Badge as UiBadge } from '../components/ui/badge.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'
import { VerifiedBadge } from '../components/RestaurantCard.jsx'

const API_BASE = 'https://satvictaste.onrender.com'

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

export default function RestaurantDetailPage({ onAddToCart }) {
  const [restaurant, setRestaurant] = useState(null)
  const { id } = useParams()

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
