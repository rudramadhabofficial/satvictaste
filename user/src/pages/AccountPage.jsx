import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'

const API_BASE = 'https://satvictaste.onrender.com'

export default function AccountPage() {
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

  if (!localStorage.getItem('userId')) {
    return (
      <section className="section">
        <div className="container">
          <div className="empty-state empty-state-full" style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)' }}>
            <p className="empty-state-title">Login required</p>
            <p className="empty-state-desc">Please login to view and manage your restaurant subscriptions.</p>
            <Button onClick={() => navigate('/login')} size="lg">Login to Account</Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-head" style={{ marginBottom: '40px' }}>
          <div>
            <h2 className="section-title">My Account</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>Manage your memberships, bookings, and orders</p>
          </div>
        </div>

        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          {/* Active Subscriptions */}
          <div style={{ gridColumn: 'span 2' }}>
            <h3 className="detail-heading" style={{ marginBottom: '24px' }}>Active Memberships</h3>
            <div style={{ display: 'grid', gap: '24px' }}>
              {subs.length === 0 ? (
                <div className="empty-state" style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', padding: '40px' }}>
                  <p className="empty-state-desc">No active memberships found.</p>
                </div>
              ) : (
                subs.map((s) => (
                  <div key={s.id} className="card" style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'var(--font-display)' }}>Membership Plan</div>
                        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Restaurant ID: {s.restaurantId}</div>
                      </div>
                      <span className={`badge ${s.status === 'active' ? 'badge-verified' : ''}`} style={{ textTransform: 'capitalize' }}>
                        {s.status}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                      <div style={{ flex: 1, padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>{s.remainingMeals ?? '∞'}</div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)' }}>Meals Remaining</div>
                      </div>
                      <div style={{ flex: 1, padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{s.endDate ? new Date(s.endDate).toLocaleDateString() : 'N/A'}</div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)' }}>Expiry Date</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      {s.remainingMeals > 0 && (
                        <Button onClick={() => redeemMeal(s.id)} style={{ flex: 1 }} size="lg">Redeem Meal</Button>
                      )}
                      <Button onClick={() => checkIn(s.id)} variant="soft" style={{ flex: 1 }}>Check-in</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar: Bookings & Orders */}
          <div style={{ display: 'grid', gap: '32px', alignContent: 'start' }}>
            <div>
              <h3 className="detail-heading" style={{ marginBottom: '16px' }}>Bookings</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {bookings.length === 0 ? (
                  <p style={{ fontSize: '14px', color: 'var(--muted)' }}>No recent bookings.</p>
                ) : (
                  bookings.map((b) => (
                    <div key={b.id} className="card" style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{b.people} People</span>
                        <span style={{ fontSize: '11px', color: 'var(--verified)' }}>{b.status}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{b.date} • {b.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="detail-heading" style={{ marginBottom: '16px' }}>Recent Orders</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {orders.length === 0 ? (
                  <p style={{ fontSize: '14px', color: 'var(--muted)' }}>No recent orders.</p>
                ) : (
                  orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="card" style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>₹{o.totalPrice}</span>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{o.status}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
