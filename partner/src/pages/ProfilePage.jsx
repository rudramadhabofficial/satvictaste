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
        setMsg('Profile updated successfully!')
        setTimeout(() => setMsg(''), 3000)
      }
    } catch (e) { setMsg('Update failed') }
  }

  if (loading) return <p>Loading profile...</p>

  return (
    <div className="view-content">
      <div className="view-header" style={{ marginBottom: '32px' }}>
        <h2 className="view-title">Restaurant Profile</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Update your restaurant's public information.</p>
      </div>
      
      <div className="card" style={{ padding: '32px' }}>
        {msg && <div className={`message ${msg.includes('success') ? 'success' : 'error'}`} style={{ marginBottom: '24px' }}>{msg}</div>}
        <form onSubmit={handleUpdate}>
          <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Restaurant Name</label>
              <UiInput value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>City</label>
              <UiInput value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Area</label>
              <UiInput value={profile.area} onChange={e => setProfile({...profile, area: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Address</label>
              <UiInput value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Satvik Type</label>
              <select value={profile.satvikType} onChange={e => setProfile({...profile, satvikType: e.target.value})} className="btn btn-soft w-full" style={{ height: '42px', border: '1px solid #ddd', borderRadius: 'var(--radius)' }}>
                <option>Pure Satvik</option>
                <option>No Onion/Garlic</option>
                <option>Jain Friendly</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Price Range</label>
              <select value={profile.priceRange} onChange={e => setProfile({...profile, priceRange: e.target.value})} className="btn btn-soft w-full" style={{ height: '42px', border: '1px solid #ddd', borderRadius: 'var(--radius)' }}>
                <option>$</option>
                <option>$$</option>
                <option>$$$</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Short Story / Description</label>
            <textarea 
              value={profile.story} 
              onChange={e => setProfile({...profile, story: e.target.value})}
              style={{ width: '100%', minHeight: '120px', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontFamily: 'inherit' }}
              placeholder="Tell seekers about your restaurant..."
            />
          </div>
          <div className="form-actions" style={{ marginTop: '32px' }}>
            <Button type="submit" size="lg">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
