import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, MessageCircle, MapPin, Calendar, Clock, Users, ChevronRight, Info, CheckCircle2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/button.jsx'
import { Badge as UiBadge } from '../components/ui/badge.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'
import { VerifiedBadge } from '../components/RestaurantCard.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

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
    <div className="premium-card" style={{ padding: '32px', border: '1px solid var(--border)', background: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Calendar className="text-accent" size={24} />
        <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Book a Table</h3>
      </div>
      
      <AnimatePresence>
        {msg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`message ${msg.includes('sent') ? 'success' : 'error'}`} 
            style={{ marginBottom: '20px' }}
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleBooking} style={{ display: 'grid', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--muted)' }}>Date</label>
            <div style={{ position: 'relative' }}>
              <UiInput type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ paddingLeft: '40px' }} />
              <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-light)' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--muted)' }}>Time</label>
            <div style={{ position: 'relative' }}>
              <UiInput type="time" value={time} onChange={e => setTime(e.target.value)} required style={{ paddingLeft: '40px' }} />
              <Clock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-light)' }} />
            </div>
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--muted)' }}>Guests</label>
          <div style={{ position: 'relative' }}>
            <select 
              value={people} 
              onChange={e => setPeople(e.target.value)} 
              style={{ 
                width: '100%', 
                height: '46px', 
                padding: '0 40px', 
                border: '1px solid var(--border-strong)', 
                borderRadius: 'var(--radius)',
                appearance: 'none',
                background: 'white'
              }}
            >
              {[1, 2, 3, 4, 5, 6, 8, 10].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
            </select>
            <Users size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-light)' }} />
          </div>
        </div>

        <Button type="submit" className="btn-primary w-full" size="lg" disabled={submitting}>
          {submitting ? 'Processing...' : 'Reserve Now'}
        </Button>
      </form>
    </div>
  )
}

function MembershipSection({ restaurantId, menu }) {
  const [plans, setPlans] = useState([])
  const [subMsg, setSubMsg] = useState('')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [deliveryTime, setDeliveryTime] = useState('12:00')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [selectedItems, setSelectedItems] = useState([])
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

  const toggleSubItem = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.name === item.name)
      if (exists) return prev.filter(i => i.name !== item.name)
      return [...prev, { name: item.name, price: item.price, quantity: 1 }]
    })
  }

  const subscribe = async () => {
    setSubMsg('')
    const userId = localStorage.getItem('userId')
    if (!userId) {
      navigate('/login')
      return
    }
    if (!deliveryAddress) {
      setSubMsg('Please enter a delivery address')
      return
    }
    if (selectedPlan.type === 'daily_meal' && selectedItems.length === 0) {
      setSubMsg('Please select at least one item for your daily meal')
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          restaurantId, 
          planId: selectedPlan.id,
          deliveryAddress,
          deliveryTime,
          selectedItems
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed')
      setSubMsg('Subscribed Successfully!')
      setSelectedPlan(null)
      setTimeout(() => setSubMsg(''), 3000)
    } catch (e) {
      setSubMsg(e.message || 'Subscription failed')
      setTimeout(() => setSubMsg(''), 3000)
    }
  }

  return (
    <div className="section" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="section-head" style={{ marginBottom: '32px' }}>
        <div>
          <h2 className="section-title">Membership & Subscriptions</h2>
          <p style={{ color: 'var(--muted)', marginTop: '4px' }}>Subscribe to daily meals and get them delivered automatically every day.</p>
        </div>
      </div>
      
      {subMsg && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className={`message ${subMsg.includes('Successfully') ? 'success' : 'error'}`} 
          style={{ marginBottom: '24px' }}
        >
          {subMsg}
        </motion.div>
      )}

      {selectedPlan ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card"
          style={{ padding: '40px', background: 'var(--bg-subtle)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>Customize Your {selectedPlan.title}</h3>
            <Button variant="soft" onClick={() => setSelectedPlan(null)}>Change Plan</Button>
          </div>

          <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            <div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Delivery Time</label>
                <UiInput type="time" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} />
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
                  Your order will be automatically placed 30 minutes before this time every day.
                </p>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>Delivery Address</label>
                <textarea 
                  value={deliveryAddress} 
                  onChange={e => setAddress(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', minHeight: '100px' }}
                  placeholder="Enter full address for daily delivery"
                />
              </div>
            </div>

            {selectedPlan.type === 'daily_meal' && (
              <div>
                <label style={{ display: 'block', marginBottom: '16px', fontWeight: 'bold', fontSize: '14px' }}>
                  Select Daily Items (Included in Plan)
                </label>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {(selectedPlan.allowedItems?.length > 0 ? selectedPlan.allowedItems : menu).map((item, idx) => {
                    const isSelected = selectedItems.find(i => i.name === item.name)
                    return (
                      <div 
                        key={idx} 
                        onClick={() => toggleSubItem(item)}
                        style={{ 
                          padding: '16px', 
                          borderRadius: 'var(--radius)', 
                          border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                          background: isSelected ? 'var(--accent-soft)' : 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ fontWeight: '500' }}>{item.name}</span>
                        {isSelected && <CheckCircle2 size={18} style={{ color: 'var(--accent)' }} />}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '32px', textAlign: 'right' }}>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Plan Total: </span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-strong)' }}>₹{selectedPlan.price}</span>
            </div>
            <Button size="lg" className="btn-primary" style={{ padding: '16px 64px' }} onClick={subscribe}>
              Confirm & Subscribe
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          {plans.map((p, i) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="premium-card"
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div style={{ marginBottom: '24px' }}>
                <span style={{ 
                  fontSize: '11px', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em', 
                  color: 'var(--accent)', 
                  fontWeight: 'bold',
                  background: 'var(--accent-soft)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  {p.type.replace('_', ' ')}
                </span>
                <h4 style={{ fontSize: '22px', fontWeight: 'bold', marginTop: '12px' }}>{p.title}</h4>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--text-strong)' }}>
                  ₹{p.price}
                  <span style={{ fontSize: '14px', fontWeight: 'normal', color: 'var(--muted)', marginLeft: '4px' }}>
                    / {p.durationDays} days
                  </span>
                </div>
              </div>

              <div style={{ flex: 1, marginBottom: '32px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-strong)' }}>What's included:</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'var(--muted)', marginBottom: '10px' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--verified)', marginTop: '2px', flexShrink: 0 }} />
                    Daily doorstep delivery
                  </li>
                  {Array.isArray(p.benefits) && p.benefits.map((benefit, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'var(--muted)', marginBottom: '10px' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--verified)', marginTop: '2px', flexShrink: 0 }} />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <Button onClick={() => setSelectedPlan(p)} className="btn-primary w-full" size="lg">
                Choose Plan
              </Button>
            </motion.div>
          ))}
          {plans.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1 / -1', background: 'var(--bg-subtle)', padding: '48px' }}>
              <p className="empty-state-desc">No membership plans available for this restaurant yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function RestaurantDetailPage({ onAddToCart }) {
  const [restaurant, setRestaurant] = useState(null)
  const [activeTab, setActiveTab] = useState('menu')
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/restaurants/${id}`)
        const data = await resp.json()
        setRestaurant(data)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [id])

  if (!restaurant) return (
    <div className="section">
      <div className="container-tight detail-loading" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="spinner" style={{ marginBottom: '20px' }}></div>
        <p style={{ color: 'var(--muted)' }}>Loading discovery details...</p>
      </div>
    </div>
  )

  return (
    <motion.div 
      className="fade-in"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div style={{ position: 'relative', height: '500px', overflow: 'hidden' }}>
        {restaurant.coverImage ? (
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            src={restaurant.coverImage} 
            alt={restaurant.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--bg-subtle) 0%, var(--highlight) 100%)' }} />
        )}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to bottom, rgba(26, 31, 28, 0.1) 0%, rgba(26, 31, 28, 0.8) 100%)' 
        }} />
        
        <div className="container" style={{ position: 'absolute', top: '100px', left: 0, right: 0 }}>
          <button 
            onClick={() => navigate(-1)} 
            className="btn glass" 
            style={{ padding: '10px 20px', color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: '8px', border: 'none' }}
          >
            <ArrowLeft size={18} /> Back to Discovery
          </button>
        </div>
        
        <div className="container" style={{ position: 'absolute', bottom: '60px', left: 0, right: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '32px' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}
              >
                <h1 style={{ color: 'white', fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 'bold', letterSpacing: '-0.02em' }}>{restaurant.name}</h1>
                {restaurant.verified && <VerifiedBadge />}
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', color: 'rgba(255,255,255,0.9)', fontSize: '16px', fontWeight: '500' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} className="text-accent" /> {restaurant.address}, {restaurant.city}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} className="text-accent" /> {restaurant.bestTimeToVisit || 'Satvic Timings'}</span>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              style={{ display: 'flex', gap: '16px' }}
            >
              {restaurant.phone && (
                <a href={`tel:${restaurant.phone}`} className="btn glass" style={{ width: '56px', height: '56px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-strong)', border: 'none' }}>
                  <Phone size={22} />
                </a>
              )}
              {restaurant.whatsapp && (
                <a href={`https://wa.me/${restaurant.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="btn glass" style={{ width: '56px', height: '56px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-strong)', border: 'none' }}>
                  <MessageCircle size={22} />
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 10, paddingBottom: '100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '48px' }}>
          <div className="main-content">
            <div className="premium-card" style={{ padding: '0', background: 'white', overflow: 'hidden', marginBottom: '48px', border: 'none', boxShadow: 'var(--shadow-medium)' }}>
              <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: '8px' }}>
                <button 
                  onClick={() => setActiveTab('menu')}
                  style={{ 
                    flex: 1, padding: '16px', fontSize: '15px', fontWeight: 'bold',
                    borderRadius: 'var(--radius)',
                    background: activeTab === 'menu' ? 'white' : 'transparent',
                    color: activeTab === 'menu' ? 'var(--accent)' : 'var(--muted)',
                    boxShadow: activeTab === 'menu' ? 'var(--shadow-subtle)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Curated Menu
                </button>
                <button 
                  onClick={() => setActiveTab('story')}
                  style={{ 
                    flex: 1, padding: '16px', fontSize: '15px', fontWeight: 'bold',
                    borderRadius: 'var(--radius)',
                    background: activeTab === 'story' ? 'white' : 'transparent',
                    color: activeTab === 'story' ? 'var(--accent)' : 'var(--muted)',
                    boxShadow: activeTab === 'story' ? 'var(--shadow-subtle)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Kitchen Story
                </button>
              </div>
              
              <div style={{ padding: '48px' }}>
                {activeTab === 'menu' && (
                  <div style={{ display: 'grid', gap: '32px' }}>
                    {restaurant.menu?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--bg-subtle)', alignItems: 'center' }}>
                        {item.image && (
                          <div style={{ width: '120px', height: '120px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
                            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '19px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-strong)' }}>{item.name}</h4>
                          <p style={{ fontSize: '15px', color: 'var(--muted)', maxWidth: '480px', lineHeight: '1.6' }}>{item.description}</p>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '32px' }}>
                          <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-strong)' }}>₹{item.price}</span>
                          <Button 
                            className="btn-primary"
                            size="sm" 
                            onClick={() => onAddToCart(item, restaurant._id)}
                            style={{ gap: '8px', padding: '10px 20px' }}
                          >
                            <ShoppingBag size={16} /> Add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeTab === 'story' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div style={{ fontSize: '17px', lineHeight: '1.8', color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                      {restaurant.story || "Welcome to our kitchen where we serve with love and purity. Our recipes are rooted in tradition, focusing on seasonal ingredients and spiritual balance."}
                    </div>
                    <div style={{ marginTop: '48px', padding: '32px', background: 'var(--accent-extra-soft)', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '20px', border: '1px solid var(--accent-soft)' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                        <Info size={24} />
                      </div>
                      <div style={{ fontSize: '15px', color: 'var(--text-strong)', lineHeight: '1.6' }}>
                        <strong style={{ display: 'block', marginBottom: '4px', fontSize: '16px' }}>Dietary Compliance</strong>
                        This kitchen is certified <strong>{restaurant.satvikType}</strong>. 
                        We strictly follow ancient wisdom in food preparation, ensuring no onion, garlic, or non-satvik ingredients are used.
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            
            <MembershipSection restaurantId={id} menu={restaurant.menu || []} />
          </div>

          <aside className="sidebar">
            <div style={{ position: 'sticky', top: '120px', display: 'grid', gap: '48px' }}>
              <BookingForm restaurantId={id} />
              
              <div className="premium-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '32px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: 'var(--text-strong)' }}>Find Us</h4>
                <div style={{ height: '200px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', marginBottom: '20px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                    <MapPin size={40} style={{ opacity: 0.2 }} />
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '24px' }}>{restaurant.address}</p>
                <Link to="/map" className="btn-soft w-full" style={{ justifyContent: 'center' }}>
                  Open Discovery Map <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  )
}
