import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'
import { Clock, ShoppingBag, MapPin, CheckCircle2, User, Phone, Map, Calendar, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

export default function AccountPage() {
  const [user, setUser] = useState(null)
  const [subs, setSubs] = useState([])
  const [bookings, setBookings] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()

  const loadData = async () => {
    const userId = localStorage.getItem('userId')
    if (!userId) {
      setLoading(false)
      return
    }
    try {
      const [uRes, sRes, bRes, oRes] = await Promise.all([
        fetch(`${API_BASE}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${API_BASE}/api/users/${userId}/subscriptions`),
        fetch(`${API_BASE}/api/users/${userId}/bookings`),
        fetch(`${API_BASE}/api/users/${userId}/orders`)
      ])
      const uData = await uRes.json()
      const sData = await sRes.json()
      const bData = await bRes.json()
      const oData = await oRes.json()
      
      setUser(uData)
      setSubs(Array.isArray(sData) ? sData : [])
      setBookings(Array.isArray(bData) ? bData : [])
      setOrders(Array.isArray(oData) ? oData : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setUpdating(true)
    try {
      const res = await fetch(`${API_BASE}/api/users/${user.id || user._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          phone: user.phone,
          city: user.city,
          address: user.address,
          name: user.name
        })
      })
      if (res.ok) {
        setMsg('Profile updated!')
        setTimeout(() => setMsg(''), 3000)
      }
    } catch (e) { console.error(e) }
    finally { setUpdating(false) }
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
    <section className="section" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div className="section-head" style={{ marginBottom: '56px' }}>
          <div>
            <h2 className="section-title">My Account</h2>
            <p style={{ color: 'var(--muted)', fontSize: '16px', marginTop: '8px', fontWeight: '500' }}>Manage your memberships, bookings, and culinary journey</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '48px' }}>
          {/* Active Subscriptions */}
          <div className="main-account-content">
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 className="text-accent" size={24} /> Active Memberships
            </h3>
            
            <div style={{ display: 'grid', gap: '32px' }}>
              {subs.length === 0 ? (
                <div className="empty-state" style={{ background: 'white', padding: '80px 40px', border: '1px dashed var(--border-strong)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '20px', opacity: 0.5 }}>🍱</div>
                  <p className="empty-state-desc">You don't have any active memberships yet. Explore restaurants to subscribe to daily meals.</p>
                  <Button onClick={() => navigate('/restaurants')} className="btn-primary" style={{ marginTop: '24px' }}>Explore Restaurants</Button>
                </div>
              ) : (
                subs.map((s) => (
                  <motion.div 
                    key={s.id} 
                    className="premium-card" 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '40px', background: 'white', border: 'none', boxShadow: 'var(--shadow-medium)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                      <div>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', fontWeight: 'bold', background: 'var(--accent-extra-soft)', padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>
                          {s.status} Plan
                        </span>
                        <h4 style={{ fontSize: '22px', fontWeight: 'bold', marginTop: '12px' }}>Restaurant #{s.restaurantId.slice(-4)}</h4>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>Renewal Date</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{new Date(s.endDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                      <div style={{ padding: '20px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginBottom: '8px', fontWeight: 'bold' }}>Delivery</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <Clock size={16} /> {s.deliveryTime || '12:00'}
                        </div>
                      </div>
                      <div style={{ padding: '20px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginBottom: '8px', fontWeight: 'bold' }}>Remaining</div>
                        <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--accent)' }}>{s.remainingMeals ?? '∞'}</div>
                      </div>
                      <div style={{ padding: '20px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginBottom: '8px', fontWeight: 'bold' }}>Status</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--verified)' }}>Active</div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px', paddingTop: '32px', borderTop: '1px solid var(--bg-subtle)' }}>
                      <div>
                        <h5 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-strong)' }}>
                          <ShoppingBag size={16} className="text-accent" /> Daily Items
                        </h5>
                        <div style={{ display: 'grid', gap: '10px' }}>
                          {s.selectedItems?.length > 0 ? s.selectedItems.map((item, idx) => (
                            <div key={idx} style={{ fontSize: '14px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                              {item.name}
                            </div>
                          )) : <p style={{ fontSize: '13px', color: 'var(--muted)' }}>No items selected.</p>}
                        </div>
                      </div>
                      <div>
                        <h5 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-strong)' }}>
                          <MapPin size={16} className="text-accent" /> Delivery Address
                        </h5>
                        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.6' }}>
                          {s.deliveryAddress || 'No address set.'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar: Bookings & Orders */}
          <aside className="account-sidebar">
            <div style={{ position: 'sticky', top: '120px', display: 'grid', gap: '48px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Recent Bookings</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {bookings.length === 0 ? (
                    <div style={{ padding: '24px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                      <p style={{ fontSize: '13px', color: 'var(--muted)' }}>No recent table bookings.</p>
                    </div>
                  ) : (
                    bookings.map((b) => (
                      <div key={b.id} className="premium-card" style={{ padding: '20px', background: 'white', border: 'none', boxShadow: 'var(--shadow-soft)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{b.people} Guests</span>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--verified)', background: 'var(--verified-bg)', padding: '2px 8px', borderRadius: '4px' }}>{b.status}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} /> {new Date(b.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} • {b.time}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>Order History</h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {orders.length === 0 ? (
                    <div style={{ padding: '24px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                      <p style={{ fontSize: '13px', color: 'var(--muted)' }}>No orders placed yet.</p>
                    </div>
                  ) : (
                    orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="premium-card" style={{ padding: '20px', background: 'white', border: 'none', boxShadow: 'var(--shadow-soft)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>₹{o.totalPrice}</span>
                          <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '500' }}>{o.status}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--muted-light)' }}>
                          {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {orders.length > 0 && (
                  <Button variant="soft" className="w-full" style={{ marginTop: '20px' }}>View All Orders</Button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
