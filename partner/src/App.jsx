import React, { useState, useEffect, useRef } from 'react'
import './index.css'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from './components/ui/button.jsx'
import { Input as UiInput } from './components/ui/input.jsx'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

function LandingHeader() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <img src="/logo.png" alt="Satvic" className="header-logo" />
          <span className="header-title">partner.satvic</span>
        </div>
        <nav className="nav">
          <a href="#benefits">Benefits</a>
          <a href="#how">How it works</a>
          <a href="#register" className="btn btn-primary btn-sm">Join as Partner</a>
        </nav>
      </div>
    </header>
  )
}

function RegistrationForm() {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState({
    name: '', cuisines: '', vegStatus: 'Veg', jainFriendly: false,
    phone: '', email: '', whatsapp: '',
    street: '', city: '', state: '', pincode: '',
    latitude: '', longitude: '', deliveryRadiusKm: '',
    hours: '', dineIn: true, takeaway: true, delivery: false, preOrder: false, catering: false,
    paymentUPI: '', cash: true, card: false,
    notes: ''
  })
  const [menuItems, setMenuItems] = useState([
    { name: '', description: '', price: '', category: '' }
  ])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const updateProfile = (field, value) => setProfile(p => ({ ...p, [field]: value }))
  
  const addMenuItem = () => setMenuItems([...menuItems, { name: '', description: '', price: '', category: '' }])
  const updateMenuItem = (idx, field, value) => {
    const newItems = [...menuItems]
    newItems[idx][field] = value
    setMenuItems(newItems)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, menuItems })
      })
      if (res.ok) {
        setMessage('Registration submitted! Admin will review and approve soon.')
        setStep(4) // Success step
      }
    } catch (e) { setMessage('Submission failed') }
    finally { setSubmitting(false) }
  }

  return (
    <section id="register" className="section">
      <div className="container-tight">
        <div className="card">
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 className="view-title">Partner Registration</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= s ? 'var(--accent)' : 'var(--bg-subtle)', color: step >= s ? 'white' : 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>{s}</div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="form-step">
              <h3 style={{ marginBottom: '20px' }}>Basic Information</h3>
              <div className="grid grid-2">
                <div>
                  <label>Restaurant Name</label>
                  <UiInput value={profile.name} onChange={e => updateProfile('name', e.target.value)} placeholder="e.g. Satvic Sagar" />
                </div>
                <div>
                  <label>Contact Phone</label>
                  <UiInput value={profile.phone} onChange={e => updateProfile('phone', e.target.value)} />
                </div>
                <div>
                  <label>Business Email</label>
                  <UiInput type="email" value={profile.email} onChange={e => updateProfile('email', e.target.value)} />
                </div>
                <div>
                  <label>Cuisines</label>
                  <UiInput value={profile.cuisines} onChange={e => updateProfile('cuisines', e.target.value)} placeholder="North Indian, Jain" />
                </div>
              </div>
              <Button onClick={() => setStep(2)} className="w-full" style={{ marginTop: '24px' }}>Next: Location & Services</Button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h3 style={{ marginBottom: '20px' }}>Location & Services</h3>
              <LocationPicker profile={profile} updateProfile={updateProfile} />
              <div className="grid grid-2" style={{ marginTop: '20px' }}>
                <div>
                  <label>Street Address</label>
                  <UiInput value={profile.street} onChange={e => updateProfile('street', e.target.value)} />
                </div>
                <div>
                  <label>City</label>
                  <UiInput value={profile.city} onChange={e => updateProfile('city', e.target.value)} />
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <label>Services Offered</label>
                <div className="checkbox-group" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <label><input type="checkbox" checked={profile.dineIn} onChange={e => updateProfile('dineIn', e.target.checked)} /> Dine-in</label>
                  <label><input type="checkbox" checked={profile.takeaway} onChange={e => updateProfile('takeaway', e.target.checked)} /> Takeaway</label>
                  <label><input type="checkbox" checked={profile.delivery} onChange={e => updateProfile('delivery', e.target.checked)} /> Delivery</label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <Button variant="soft" onClick={() => setStep(1)} className="w-full">Back</Button>
                <Button onClick={() => setStep(3)} className="w-full">Next: Sample Menu</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step">
              <h3 style={{ marginBottom: '20px' }}>Sample Menu Items</h3>
              {menuItems.map((m, idx) => (
                <div key={idx} style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', marginBottom: '12px' }}>
                  <div className="grid grid-2">
                    <UiInput value={m.name} onChange={e => updateMenuItem(idx, 'name', e.target.value)} placeholder="Item Name" />
                    <UiInput type="number" value={m.price} onChange={e => updateMenuItem(idx, 'price', e.target.value)} placeholder="Price" />
                  </div>
                </div>
              ))}
              <Button variant="soft" onClick={addMenuItem} style={{ marginBottom: '20px' }}>+ Add Item</Button>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <Button variant="soft" onClick={() => setStep(2)} className="w-full">Back</Button>
                <Button onClick={handleSubmit} disabled={submitting} className="w-full">{submitting ? 'Submitting...' : 'Submit Registration'}</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h3>Registration Submitted!</h3>
              <p style={{ color: 'var(--muted)', marginTop: '8px' }}>{message}</p>
              <Button onClick={() => window.location.reload()} style={{ marginTop: '24px' }}>Go to Home</Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function LandingPage({ onLogin }) {
  return (
    <div className="app-wrap">
      <LandingHeader />
      <main className="container">
        <section className="hero-block" style={{ textAlign: 'center', padding: '80px 0' }}>
          <h1 className="hero-title" style={{ fontSize: '48px' }}>Grow your Restaurant with Satvic</h1>
          <p className="hero-sub" style={{ fontSize: '18px', maxWidth: '600px', margin: '20px auto' }}>Join the most trusted platform for Satvik and Jain-friendly dining. Reach seekers who value purity and quality.</p>
          <div className="hero-actions" style={{ justifyContent: 'center', marginTop: '32px' }}>
            <a href="#register" className="btn btn-primary btn-lg" style={{ padding: '16px 32px' }}>Get Started</a>
            <a href="#how" className="btn btn-soft btn-lg" style={{ padding: '16px 32px' }}>Learn More</a>
          </div>
        </section>

        <section id="benefits" className="section">
          <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Why Partner with Us?</h2>
          <div className="grid grid-3">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>✨</div>
              <h3>Purity Verification</h3>
              <p style={{ color: 'var(--muted)' }}>Get a verified badge that builds instant trust with spiritual seekers.</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>📊</div>
              <h3>Manage Subscriptions</h3>
              <p style={{ color: 'var(--muted)' }}>Offer daily meal packs and manage recurring revenue easily.</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>📱</div>
              <h3>Smart Tools</h3>
              <p style={{ color: 'var(--muted)' }}>Digital menu, QR check-ins, and delivery management in one place.</p>
            </div>
          </div>
        </section>

        <RegistrationForm />

        <section className="section" style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', padding: '60px', textAlign: 'center' }}>
          <h3>Already a Partner?</h3>
          <p style={{ marginBottom: '24px', color: 'var(--muted)' }}>Access your dashboard to manage your restaurant.</p>
          <LoginCard onLogin={onLogin} />
        </section>
      </main>
      <Footer />
    </div>
  )
}

async function reverseGeocode(lat, lng, updateProfile) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
  const resp = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'SatvicPartner/1.0' }
  })
  const data = await resp.json()
  const addr = data?.address || {}
  if (addr.road) updateProfile('street', [addr.road, addr.suburb, addr.neighbourhood].filter(Boolean).join(', '))
  if (addr.city) updateProfile('city', addr.city)
  else if (addr.town) updateProfile('city', addr.town)
  else if (addr.village) updateProfile('city', addr.village)
  if (addr.state) updateProfile('state', addr.state)
  if (addr.postcode) updateProfile('pincode', addr.postcode)
}

function LocationPicker({ profile, updateProfile }) {
  const mapElRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const updateProfileRef = useRef(updateProfile)
  const [locationStatus, setLocationStatus] = useState('') // '' | 'getting' | 'done' | 'error'

  useEffect(() => {
    updateProfileRef.current = updateProfile
  }, [updateProfile])

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return
    const lat = Number(profile.latitude) || 20.5937
    const lng = Number(profile.longitude) || 78.9629
    mapRef.current = L.map(mapElRef.current).setView([lat, lng], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapRef.current)
    mapRef.current.on('click', async (e) => {
      const { lat, lng } = e.latlng
      const up = updateProfileRef.current
      up('latitude', String(lat))
      up('longitude', String(lng))
      try {
        await reverseGeocode(lat, lng, up)
      } catch (err) {
        console.error('Reverse geocode error', err)
      }
    })
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    const lat = Number(profile.latitude)
    const lng = Number(profile.longitude)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      mapRef.current.setView([lat, lng], mapRef.current.getZoom())
      if (markerRef.current) mapRef.current.removeLayer(markerRef.current)
      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current)
    }
  }, [profile.latitude, profile.longitude])

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error')
      return
    }
    setLocationStatus('getting')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        const up = updateProfileRef.current
        up('latitude', String(lat))
        up('longitude', String(lng))
        try {
          await reverseGeocode(lat, lng, up)
          setLocationStatus('done')
        } catch (err) {
          console.error('Reverse geocode error', err)
          setLocationStatus('error')
        }
        setTimeout(() => setLocationStatus(''), 3000)
      },
      () => {
        setLocationStatus('error')
        setTimeout(() => setLocationStatus(''), 4000)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  return (
    <div className="location-picker-wrap">
      <label>Restaurant location</label>
      <p className="location-picker-hint">Allow location access or click on the map — address fields will be filled automatically.</p>
      <div className="location-picker-actions">
        <button type="button" className="btn btn-soft btn-sm location-btn" onClick={handleUseMyLocation} disabled={locationStatus === 'getting'}>
          {locationStatus === 'getting' ? 'Getting location…' : 'Use my current location'}
        </button>
        {locationStatus === 'done' && <span className="location-status success">Address filled automatically.</span>}
        {locationStatus === 'error' && <span className="location-status error">Could not get location. Try clicking on the map.</span>}
      </div>
      <div ref={mapElRef} className="location-picker-map" />
    </div>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-left">Satvic Partner • Build trust with a clean, calm profile</span>
        <span className="footer-right">Developed by <a href="https://www.linkedin.com/in/uddhab-das-645990237?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noopener noreferrer">Uddhab Das</a></span>
      </div>
    </footer>
  )
}

function MembershipManager({ partnerId }) {
  const [restaurantId, setRestaurantId] = useState(partnerId || '')
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [durationDays, setDurationDays] = useState('')
  const [type, setType] = useState('subscription')
  const [mealType, setMealType] = useState('none')
  const [benefitsText, setBenefitsText] = useState('')
  const [plans, setPlans] = useState([])
  const [msg, setMsg] = useState('')

  const loadPlans = async (rid) => {
    if (!rid) { setPlans([]); return }
    try {
      const r = await fetch(`${API_BASE}/api/restaurants/${rid}/memberships`)
      const data = await r.json()
      setPlans(Array.isArray(data) ? data : [])
    } catch {
      setPlans([])
    }
  }

  useEffect(() => { 
    setRestaurantId(partnerId || '')
    loadPlans(partnerId || restaurantId) 
  }, [partnerId])

  const createPlan = async (e) => {
    e.preventDefault()
    setMsg('')
    if (!restaurantId || !title || !price || !durationDays) { setMsg('Missing fields'); return }
    try {
      const res = await fetch(`${API_BASE}/api/restaurants/${restaurantId}/memberships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          price: Number(price),
          durationDays: Number(durationDays),
          type,
          mealType,
          benefits: benefitsText.split(',').map((b) => b.trim()).filter(Boolean)
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed')
      setMsg('Created')
      setTitle(''); setPrice(''); setDurationDays(''); setBenefitsText(''); setType('subscription'); setMealType('none')
      loadPlans(restaurantId)
      setTimeout(() => setMsg(''), 3000)
    } catch {
      setMsg('Failed')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const deletePlan = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/memberships/${id}`, { method: 'DELETE' })
      if (res.ok) loadPlans(restaurantId)
    } catch (e) { console.error(e) }
  }

  return (
    <div>
      {msg && <div className={`message ${msg === 'Created' ? 'success' : 'error'}`}>{msg}</div>}
      <div className="grid grid-3">
        {!partnerId && (
          <div>
            <label>Restaurant ID</label>
            <UiInput value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} placeholder="Approved restaurant ID" />
          </div>
        )}
        <div>
          <label>Title</label>
          <UiInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Monthly Lunch Pack" />
        </div>
        <div>
          <label>Price (INR)</label>
          <UiInput type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div>
          <label>Duration (days)</label>
          <UiInput type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} />
        </div>
        <div>
          <label>Plan Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="btn btn-soft w-full" style={{ height: '42px', border: '1px solid #ddd' }}>
            <option value="subscription">General Subscription</option>
            <option value="daily_meal">Daily Meal Package</option>
            <option value="on_table_qr">On-Table QR Access</option>
          </select>
        </div>
        {type === 'daily_meal' && (
          <div>
            <label>Meal Type</label>
            <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="btn btn-soft w-full" style={{ height: '42px', border: '1px solid #ddd' }}>
              <option value="lunch">Lunch Only</option>
              <option value="dinner">Dinner Only</option>
              <option value="both">Both (Lunch & Dinner)</option>
            </select>
          </div>
        )}
        <div>
          <label>Benefits (comma separated)</label>
          <UiInput value={benefitsText} onChange={(e) => setBenefitsText(e.target.value)} placeholder="Free delivery, 10% off" />
        </div>
      </div>
      <div className="form-actions" style={{ marginTop: '16px' }}>
        <Button onClick={createPlan}>Create Membership Plan</Button>
      </div>
      <div className="cards-grid" style={{ marginTop: '2rem' }}>
        {plans.map((p) => (
          <div key={p.id} className="card">
            <div className="card-body">
              <div className="card-header">
                <div className="card-title">{p.title}</div>
                <div style={{ textAlign: 'right' }}>
                  <div className="badge">₹{p.price} / {p.durationDays}d</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>{p.type.replace('_', ' ')}</div>
                </div>
              </div>
              <div className="card-meta">
                {p.mealType !== 'none' && <div style={{ marginBottom: '8px' }}><strong>Meals:</strong> {p.mealType}</div>}
                {Array.isArray(p.benefits) ? p.benefits.join(', ') : ''}
              </div>
              <div style={{ marginTop: '12px' }}>
                <Button variant="ghost" onClick={() => deletePlan(p.id)} style={{ color: 'red', fontSize: '12px' }}>Delete Plan</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DeliveryReminders({ partnerId }) {
  const [restaurantId, setRestaurantId] = useState(partnerId || '')
  const [list, setList] = useState([])
  const [msg, setMsg] = useState('')
  const [userId, setUserId] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const load = async (rid) => {
    if (!rid) { setList([]); return }
    try {
      const r = await fetch(`${API_BASE}/api/partners/${rid}/reminders`)
      const data = await r.json()
      setList(Array.isArray(data) ? data : [])
    } catch {
      setList([])
    }
  }
  useEffect(() => {
    const rid = partnerId || restaurantId
    load(rid)
    if (!rid) return
    const t = setInterval(() => load(rid), 30000)
    return () => clearInterval(t)
  }, [partnerId])
  const markDone = async (id) => {
    setMsg('')
    try {
      const r = await fetch(`${API_BASE}/api/deliveries/${id}/done`, { method: 'POST' })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || 'Failed')
      setMsg('Marked done')
      load(partnerId || restaurantId)
      setTimeout(() => setMsg(''), 3000)
    } catch {
      setMsg('Failed')
      setTimeout(() => setMsg(''), 3000)
    }
  }
  const createDelivery = async () => {
    setMsg('')
    if (!(partnerId || restaurantId) || !userId || !scheduledAt) { setMsg('Missing fields'); return }
    try {
      const r = await fetch(`${API_BASE}/api/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: partnerId || restaurantId, userId, scheduledAt })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || 'Failed')
      setMsg('Delivery created')
      setUserId(''); setScheduledAt('')
      load(partnerId || restaurantId)
      setTimeout(() => setMsg(''), 3000)
    } catch {
      setMsg('Failed')
      setTimeout(() => setMsg(''), 3000)
    }
  }
  return (
    <div>
      {msg && <div className={`message ${msg.includes('Failed') ? 'error' : 'success'}`}>{msg}</div>}
      <div className="grid grid-3">
        {!partnerId && (
          <div>
            <label>Restaurant ID</label>
            <UiInput value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)} placeholder="Approved restaurant ID" />
          </div>
        )}
        <div>
          <label>User ID</label>
          <UiInput value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" />
        </div>
        <div>
          <label>Scheduled at</label>
          <UiInput type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
        </div>
      </div>
      <div className="form-actions">
        <Button onClick={createDelivery}>Create delivery</Button>
      </div>
      <ul className="partner-list" style={{ marginTop: '1rem' }}>
        {list.length === 0 && <li className="empty-state">No deliveries</li>}
        {list.map((d) => (
          <li key={d.id} className="partner-item">
            <div className="info">
              <strong>{d.userId}</strong> — scheduled {new Date(d.scheduledAt).toLocaleString()} — {d.status}{d.overdue ? ' • overdue' : d.minutesLeft <= 0 ? '' : ` • ${d.minutesLeft}m left`}
            </div>
            {d.status === 'pending' && <Button type="button" onClick={() => markDone(d.id)}>Mark done</Button>}
          </li>
        ))}
      </ul>
    </div>
  )
}

function LoginCard({ onLogin }) {
  const [pid, setPid] = useState('')
  const [msg, setMsg] = useState('')
  const handleLogin = () => {
    if (!pid.trim()) { setMsg('Partner ID required'); return }
    localStorage.setItem('partnerId', pid.trim())
    onLogin(pid.trim())
  }
  return (
    <section className="section">
      <div className="card card-submit">
        <h3 className="form-section-title">Login</h3>
        {msg && <div className="message error">{msg}</div>}
        <div className="grid grid-2">
          <div>
            <label>Partner ID</label>
            <UiInput value={pid} onChange={(e) => setPid(e.target.value)} placeholder="Your partner ID" />
          </div>
        </div>
        <div className="form-actions">
          <Button onClick={handleLogin}>Login</Button>
        </div>
      </div>
    </section>
  )
}

function UsageMonitor({ partnerId }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const loadLogs = async () => {
    if (!partnerId) return
    try {
      const r = await fetch(`${API_BASE}/api/partners/${partnerId}/usage`)
      const data = await r.json()
      setLogs(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    loadLogs()
    const t = setInterval(loadLogs, 15000)
    return () => clearInterval(t)
  }, [partnerId])

  return (
    <div className="card">
      <h3>Recent Check-ins & Redemptions</h3>
      {loading ? <p>Loading activity...</p> : (
        <ul className="partner-list">
          {logs.length === 0 && <li className="empty-state">No activity yet</li>}
          {logs.map((log) => (
            <li key={log._id || log.id} className="partner-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className={`badge ${log.type === 'meal_redeem' ? 'badge-verified' : ''}`} style={{ marginRight: '10px' }}>
                  {log.type === 'meal_redeem' ? 'Meal Redeemed' : 'On-Table Check-in'}
                </span>
                <span style={{ fontSize: '14px' }}>User: {log.userId}</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function DashboardView({ partnerId }) {
  const [stats, setStats] = useState({ subsCount: 0, deliveriesCount: 0, activePlans: 0 })
  useEffect(() => {
    fetch(`${API_BASE}/api/partners/${partnerId}/stats`).then(r => r.json()).then(setStats)
  }, [partnerId])

  return (
    <div className="view-content">
      <div className="view-header">
        <h2 className="view-title">Dashboard Overview</h2>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.subsCount}</div>
          <div className="stat-label">Active Subscriptions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.deliveriesCount}</div>
          <div className="stat-label">Total Deliveries</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.activePlans}</div>
          <div className="stat-label">Membership Plans</div>
        </div>
      </div>
      <div className="grid grid-2">
        <UsageMonitor partnerId={partnerId} />
        <div className="card">
          <h3>Quick Tips</h3>
          <ul style={{ fontSize: '14px', color: 'var(--muted)', paddingLeft: '20px', lineHeight: '2' }}>
            <li>Keep your menu updated to attract more users.</li>
            <li>Respond to delivery reminders promptly.</li>
            <li>Use On-Table QR for a better dining experience.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function ProfileView({ partnerId }) {
  const [profile, setProfile] = useState(null)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/restaurants/${partnerId}`).then(r => r.json()).then(d => {
      setProfile(d)
      setLoading(false)
    })
  }, [partnerId])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setMsg('')
    try {
      const res = await fetch(`${API_BASE}/api/restaurants/${partnerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      if (res.ok) {
        setMsg('Profile updated successfully!')
        setTimeout(() => setMsg(''), 3000)
      }
    } catch (e) { setMsg('Update failed') }
  }

  if (loading) return <p>Loading profile...</p>

  return (
    <div className="view-content">
      <div className="view-header">
        <h2 className="view-title">Restaurant Profile</h2>
      </div>
      <div className="card">
        {msg && <div className={`message ${msg.includes('success') ? 'success' : 'error'}`}>{msg}</div>}
        <form onSubmit={handleUpdate}>
          <div className="grid grid-2">
            <div>
              <label>Restaurant Name</label>
              <UiInput value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
            </div>
            <div>
              <label>City</label>
              <UiInput value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} />
            </div>
            <div>
              <label>Area</label>
              <UiInput value={profile.area} onChange={e => setProfile({...profile, area: e.target.value})} />
            </div>
            <div>
              <label>Address</label>
              <UiInput value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
            </div>
            <div>
              <label>Satvik Type</label>
              <select value={profile.satvikType} onChange={e => setProfile({...profile, satvikType: e.target.value})} className="btn btn-soft w-full" style={{ height: '42px', border: '1px solid #ddd' }}>
                <option>Pure Satvik</option>
                <option>No Onion/Garlic</option>
                <option>Jain Friendly</option>
              </select>
            </div>
            <div>
              <label>Price Range</label>
              <select value={profile.priceRange} onChange={e => setProfile({...profile, priceRange: e.target.value})} className="btn btn-soft w-full" style={{ height: '42px', border: '1px solid #ddd' }}>
                <option>$</option>
                <option>$$</option>
                <option>$$$</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '24px' }}>
            <label>Short Story / Description</label>
            <textarea 
              value={profile.story} 
              onChange={e => setProfile({...profile, story: e.target.value})}
              style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'inherit' }}
            />
          </div>
          <div className="form-actions" style={{ marginTop: '20px' }}>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MenuView({ partnerId }) {
  const [restaurant, setRestaurant] = useState(null)
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '' })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/api/restaurants/${partnerId}`).then(r => r.json()).then(setRestaurant)
  }, [partnerId])

  const addItem = async () => {
    if (!newItem.name || !newItem.price) return
    const updatedMenu = [...(restaurant.menu || []), { ...newItem, price: Number(newItem.price) }]
    try {
      const res = await fetch(`${API_BASE}/api/restaurants/${partnerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu: updatedMenu })
      })
      if (res.ok) {
        setRestaurant({ ...restaurant, menu: updatedMenu })
        setNewItem({ name: '', description: '', price: '' })
        setMsg('Item added!')
        setTimeout(() => setMsg(''), 3000)
      }
    } catch (e) { setMsg('Failed to add') }
  }

  const removeItem = async (idx) => {
    const updatedMenu = restaurant.menu.filter((_, i) => i !== idx)
    try {
      await fetch(`${API_BASE}/api/restaurants/${partnerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu: updatedMenu })
      })
      setRestaurant({ ...restaurant, menu: updatedMenu })
    } catch (e) { console.error(e) }
  }

  if (!restaurant) return <p>Loading menu...</p>

  return (
    <div className="view-content">
      <div className="view-header">
        <h2 className="view-title">Menu Management</h2>
      </div>
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3>Add New Dish</h3>
        {msg && <div className="message success">{msg}</div>}
        <div className="grid grid-3">
          <div>
            <label>Dish Name</label>
            <UiInput value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
          </div>
          <div>
            <label>Price (INR)</label>
            <UiInput type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} />
          </div>
          <div>
            <label>Description</label>
            <UiInput value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
          </div>
        </div>
        <div className="form-actions" style={{ marginTop: '16px' }}>
          <Button onClick={addItem}>Add to Menu</Button>
        </div>
      </div>

      <div className="grid grid-2">
        {restaurant.menu?.map((item, idx) => (
          <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>₹{item.price} • {item.description}</div>
            </div>
            <Button variant="ghost" onClick={() => removeItem(idx)} style={{ color: 'red' }}>Remove</Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function BookingsView({ partnerId }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = async () => {
    if (!partnerId) return
    try {
      const res = await fetch(`${API_BASE}/api/restaurants/${partnerId}/bookings`)
      const data = await res.json()
      setBookings(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 20000)
    return () => clearInterval(t)
  }, [partnerId])

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setMsg(`Booking ${status}`)
        load()
        setTimeout(() => setMsg(''), 3000)
      }
    } catch (e) {
      setMsg('Failed to update')
    }
  }

  return (
    <div className="view-content">
      <div className="view-header">
        <h2 className="view-title">Table Bookings</h2>
      </div>
      {msg && <div className="message success">{msg}</div>}
      {loading ? <p>Loading...</p> : (
        <div className="card">
          <ul className="partner-list">
            {bookings.length === 0 && <li className="empty-state">No bookings yet.</li>}
            {bookings.map(b => (
              <li key={b.id} className="partner-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{b.userName || 'Guest'} — {b.people} people</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    {b.date} at {b.time} • <span className={`status-badge ${b.status === 'confirmed' ? 'status-approved' : 'status-pending'}`}>{b.status}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {b.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => updateStatus(b.id, 'confirmed')}>Confirm</Button>
                      <Button size="sm" variant="ghost" style={{ color: 'red' }} onClick={() => updateStatus(b.id, 'cancelled')}>Cancel</Button>
                    </>
                  )}
                  {b.status === 'confirmed' && (
                    <Button size="sm" variant="soft" onClick={() => updateStatus(b.id, 'completed')}>Mark Completed</Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function OrdersView({ partnerId }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = async () => {
    if (!partnerId) return
    try {
      const res = await fetch(`${API_BASE}/api/restaurants/${partnerId}/orders`)
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [partnerId])

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setMsg(`Order marked as ${status}`)
        load()
        setTimeout(() => setMsg(''), 3000)
      }
    } catch (e) {
      setMsg('Failed to update status')
    }
  }

  return (
    <div className="view-content">
      <div className="view-header">
        <h2 className="view-title">Orders Management</h2>
      </div>
      {msg && <div className="message success">{msg}</div>}
      {loading ? <p>Loading...</p> : (
        <div className="grid grid-1" style={{ display: 'grid', gap: '20px' }}>
          {orders.length === 0 && <p className="empty-state">No orders yet.</p>}
          {orders.map(o => (
            <div key={o.id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px' }}>Order #{o.id.slice(-6)}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Placed: {new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <span className={`badge ${o.status === 'DELIVERED' ? 'badge-verified' : ''}`} style={{ background: 'var(--highlight)', color: 'var(--text-strong)' }}>
                  {o.status}
                </span>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                {o.items?.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '14px', marginBottom: '4px' }}>
                    {item.name} x {item.quantity} (₹{item.price * item.quantity})
                  </div>
                ))}
                <div style={{ fontWeight: 'bold', marginTop: '8px' }}>Total: ₹{o.totalPrice}</div>
              </div>

              <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '20px' }}>
                <strong>Delivery Address:</strong> {o.deliveryAddress}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {o.status === 'PLACED' && (
                  <Button onClick={() => updateStatus(o.id, 'ACCEPTED')}>Accept Order</Button>
                )}
                {o.status === 'ACCEPTED' && (
                  <Button onClick={() => updateStatus(o.id, 'PREPARING')}>Start Preparing</Button>
                )}
                {o.status === 'PREPARING' && (
                  <Button onClick={() => updateStatus(o.id, 'READY')}>Mark Ready for Pickup</Button>
                )}
                {o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                  <Button variant="ghost" style={{ color: 'red' }} onClick={() => updateStatus(o.id, 'CANCELLED')}>Cancel</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DeliveriesView({ partnerId }) {
  return (
    <div className="view-content">
      <div className="view-header">
        <h2 className="view-title">Deliveries & Orders</h2>
      </div>
      <div className="card">
        <DeliveryReminders partnerId={partnerId} />
      </div>
    </div>
  )
}

function PlansView({ partnerId }) {
  return (
    <div className="view-content">
      <div className="view-header">
        <h2 className="view-title">Membership Plans</h2>
      </div>
      <div className="card">
        <MembershipManager partnerId={partnerId} />
      </div>
    </div>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [partnerId, setPartnerId] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const pid = localStorage.getItem('partnerId') || ''
    if (pid) { setPartnerId(pid); setAuthed(true) }
  }, [])

  const handleLogin = (pid) => {
    setPartnerId(pid)
    setAuthed(true)
  }

  const logout = () => {
    localStorage.removeItem('partnerId')
    setAuthed(false)
    setPartnerId('')
  }

  if (!authed) return <LandingPage onLogin={handleLogin} />

  return (
    <div className="partner-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="Satvic" className="sidebar-logo" />
          <span className="sidebar-title">Partner.Satvic</span>
        </div>
        <nav className="sidebar-nav">
          <div className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            Dashboard
          </div>
          <div className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            Profile
          </div>
          <div className={`sidebar-link ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
            Menu
          </div>
          <div className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            Orders
          </div>
          <div className={`sidebar-link ${activeTab === 'plans' ? 'active' : ''}`} onClick={() => setActiveTab('plans')}>
            Membership Plans
          </div>
          <div className={`sidebar-link ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
            Table Bookings
          </div>
          <div className={`sidebar-link ${activeTab === 'deliveries' ? 'active' : ''}`} onClick={() => setActiveTab('deliveries')}>
            Deliveries
          </div>
        </nav>
        <div className="sidebar-link" onClick={logout} style={{ marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
          Logout
        </div>
      </aside>
      <main className="main-content">
        {activeTab === 'dashboard' && <DashboardView partnerId={partnerId} />}
        {activeTab === 'profile' && <ProfileView partnerId={partnerId} />}
        {activeTab === 'menu' && <MenuView partnerId={partnerId} />}
        {activeTab === 'orders' && <OrdersView partnerId={partnerId} />}
        {activeTab === 'plans' && <PlansView partnerId={partnerId} />}
        {activeTab === 'bookings' && <BookingsView partnerId={partnerId} />}
        {activeTab === 'deliveries' && <DeliveriesView partnerId={partnerId} />}
      </main>
    </div>
  )
}
