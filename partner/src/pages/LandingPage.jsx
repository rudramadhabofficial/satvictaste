import React, { useState, useRef, useEffect } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '../components/ui/button.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'

const API_BASE = 'https://satvictaste.onrender.com'

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
  const [locationStatus, setLocationStatus] = useState('')

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
    setMessage('')
    try {
      const res = await fetch(`${API_BASE}/api/partners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, menuItems })
      })
      if (res.ok) {
        setMessage('Registration submitted! Admin will review and approve soon.')
        setStep(4)
      } else {
        const data = await res.json()
        setMessage(data.error || 'Submission failed')
      }
    } catch (e) { 
      setMessage('Network error. Please try again.') 
    } finally { 
      setSubmitting(false) 
    }
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

function LoginCard({ onLogin }) {
  const [pid, setPid] = useState('')
  const [msg, setMsg] = useState('')
  const handleLogin = () => {
    if (!pid.trim()) { setMsg('Partner ID required'); return }
    localStorage.setItem('partnerId', pid.trim())
    onLogin(pid.trim())
  }
  return (
    <div className="card card-submit" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h3 className="form-section-title">Partner Login</h3>
      {msg && <div className="message error">{msg}</div>}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Partner ID</label>
        <UiInput value={pid} onChange={(e) => setPid(e.target.value)} placeholder="Enter your ID" />
      </div>
      <Button onClick={handleLogin} className="w-full">Login to Dashboard</Button>
    </div>
  )
}

export default function LandingPage({ onLogin }) {
  return (
    <div className="container">
      <section className="hero-block" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h1 className="hero-title" style={{ fontSize: '56px', letterSpacing: '-0.03em' }}>Grow your Restaurant with SatvicTaste</h1>
        <p className="hero-sub" style={{ fontSize: '20px', maxWidth: '640px', margin: '24px auto', opacity: 0.8 }}>Join the most trusted platform for Satvik and Jain-friendly dining. Reach seekers who value purity and quality.</p>
        <div className="hero-actions" style={{ justifyContent: 'center', marginTop: '40px', display: 'flex', gap: '16px' }}>
          <a href="#register" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '16px' }}>Get Started</a>
          <a href="#how" className="btn btn-soft" style={{ padding: '16px 40px', fontSize: '16px' }}>Learn More</a>
        </div>
      </section>

      <section id="benefits" className="section" style={{ padding: '80px 0' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '56px', fontSize: '36px' }}>Why Partner with Us?</h2>
        <div className="grid grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '40px', marginBottom: '24px' }}>✨</div>
            <h3 style={{ marginBottom: '16px', fontSize: '22px' }}>Purity Verification</h3>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.6' }}>Get a verified badge that builds instant trust with spiritual seekers and health-conscious diners.</p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '40px', marginBottom: '24px' }}>📊</div>
            <h3 style={{ marginBottom: '16px', fontSize: '22px' }}>Manage Subscriptions</h3>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.6' }}>Offer daily meal packs and manage recurring revenue easily with our automated subscription tools.</p>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '40px', marginBottom: '24px' }}>📱</div>
            <h3 style={{ marginBottom: '16px', fontSize: '22px' }}>Smart Operations</h3>
            <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.6' }}>Digital menu, QR check-ins, and delivery management all in one calm, distraction-free dashboard.</p>
          </div>
        </div>
      </section>

      <RegistrationForm />

      <section className="section" style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', padding: '80px 40px', textAlign: 'center', marginBottom: '80px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '28px' }}>Already a Partner?</h3>
        <p style={{ marginBottom: '40px', color: 'var(--muted)', fontSize: '16px' }}>Access your dashboard to manage your restaurant operations.</p>
        <LoginCard onLogin={onLogin} />
      </section>
    </div>
  )
}
