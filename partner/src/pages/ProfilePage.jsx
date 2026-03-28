import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

export default function ProfilePage({ partnerId }) {
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
        setMsg('Profile and KYC updated successfully!')
        setTimeout(() => setMsg(''), 3000)
      }
    } catch (e) { setMsg('Update failed') }
  }

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setProfile({
          ...profile,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        })
      })
    }
  }

  if (loading) return <p>Loading profile...</p>

  return (
    <div className="view-content">
      <div className="view-header" style={{ marginBottom: '32px' }}>
        <h2 className="view-title">Restaurant Profile & KYC</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Complete your information to go live and receive orders.</p>
      </div>
      
      <div className="card" style={{ padding: '32px' }}>
        {msg && <div className={`message ${msg.includes('success') ? 'success' : 'error'}`} style={{ marginBottom: '24px' }}>{msg}</div>}
        <form onSubmit={handleUpdate}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Basic Details</h3>
          <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '32px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Restaurant Name</label>
              <UiInput value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} placeholder="Public name of your restaurant" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Contact Phone (KYC)</label>
              <UiInput value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="Phone number for verification" required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Satvik Type</label>
              <select value={profile.satvikType} onChange={e => setProfile({...profile, satvikType: e.target.value})} className="btn btn-soft w-full" style={{ height: '42px', border: '1px solid #ddd', borderRadius: 'var(--radius)' }}>
                <option value="Pure Satvik">Pure Satvik</option>
                <option value="No Onion/Garlic">No Onion/Garlic</option>
                <option value="Jain Friendly">Jain Friendly</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Price Range</label>
              <select value={profile.priceRange} onChange={e => setProfile({...profile, priceRange: e.target.value})} className="btn btn-soft w-full" style={{ height: '42px', border: '1px solid #ddd', borderRadius: 'var(--radius)' }}>
                <option value="$">₹ (Budget)</option>
                <option value="$$">₹₹ (Mid-range)</option>
                <option value="$$$">₹₹₹ (Premium)</option>
              </select>
            </div>
          </div>

          <h3 style={{ marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Location (OpenStreetMap)</h3>
          <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>City</label>
              <UiInput value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Area / Locality</label>
              <UiInput value={profile.area} onChange={e => setProfile({...profile, area: e.target.value})} required />
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Full Address</label>
            <UiInput value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} placeholder="Complete physical address" required />
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '20px', borderRadius: '12px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Map Coordinates</span>
              <button type="button" onClick={useCurrentLocation} className="btn btn-soft btn-sm" style={{ fontSize: '12px' }}>Detect My Location</button>
            </div>
            <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <UiInput value={profile.latitude || ''} readOnly placeholder="Latitude" />
              <UiInput value={profile.longitude || ''} readOnly placeholder="Longitude" />
            </div>
            <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--muted)' }}>
              Coordinates are used to show your restaurant to nearby users. 
              <a href={`https://www.openstreetmap.org/?mlat=${profile.latitude}&mlon=${profile.longitude}#map=16/${profile.latitude}/${profile.longitude}`} target="_blank" rel="noreferrer" style={{ marginLeft: '8px', color: 'var(--accent)' }}>View on OSM</a>
            </p>
          </div>

          <h3 style={{ marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>About Restaurant</h3>
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Short Story / Description</label>
            <textarea 
              value={profile.story} 
              onChange={e => setProfile({...profile, story: e.target.value})}
              style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'inherit' }}
              placeholder="Tell seekers about your restaurant's consciousness and purity standards..."
            />
          </div>

          <div className="form-actions" style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
            <Button type="submit" size="lg" style={{ padding: '16px 48px' }}>Save & Submit KYC</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
