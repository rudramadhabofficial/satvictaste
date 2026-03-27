import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Clock, ShoppingBag, MapPin, CheckCircle2 } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

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
                  <div key={s.id} className="card" style={{ padding: '32px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                      <div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '4px' }}>
                          Active Subscription
                        </div>
                        <h4 style={{ fontSize: '20px', fontWeight: 'bold' }}>Restaurant ID: {s.restaurantId}</h4>
                      </div>
                      <span className="badge badge-verified" style={{ textTransform: 'capitalize' }}>
                        {s.status}
                      </span>
                    </div>
                    
                    <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                      <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginBottom: '8px' }}>Delivery Time</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <Clock size={18} /> {s.deliveryTime || '12:00'}
                        </div>
                      </div>
                      <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginBottom: '8px' }}>Meals Remaining</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>{s.remainingMeals ?? '∞'}</div>
                      </div>
                      <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginBottom: '8px' }}>Status</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--verified)' }}>Active</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                      <div>
                        <h5 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ShoppingBag size={16} /> Selected Daily Items
                        </h5>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          {s.selectedItems?.length > 0 ? s.selectedItems.map((item, idx) => (
                            <div key={idx} style={{ fontSize: '14px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={14} style={{ color: 'var(--verified)' }} />
                              {item.name}
                            </div>
                          )) : <p style={{ fontSize: '13px', color: 'var(--muted)' }}>No items selected.</p>}
                        </div>
                      </div>
                      <div>
                        <h5 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={16} /> Delivery Address
                        </h5>
                        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>
                          {s.deliveryAddress || 'No address set.'}
                        </p>
                      </div>
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
