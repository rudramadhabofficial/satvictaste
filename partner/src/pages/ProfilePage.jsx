import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'
import { Upload, Camera } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

export default function ProfilePage({ partnerId }) {
  const [profile, setProfile] = useState(null)
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(`${API_BASE}/api/restaurants/${partnerId}`).then(r => r.json()).then(d => {
      setProfile(d)
      setLoading(false)
    })
  }, [partnerId])

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setProfile(prev => ({ ...prev, coverImage: data.url }))
      }
    } catch (err) {
      console.error("Banner upload failed", err)
    } finally {
      setUploading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setMsg('Updating...')
    try {
      console.log("Submitting profile update for:", partnerId, profile)
      const res = await fetch(`${API_BASE}/api/restaurants/${partnerId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('partnerToken')}`
        },
        body: JSON.stringify(profile)
      })
      const data = await res.json()
      if (res.ok) {
        setMsg('Profile and KYC updated successfully!')
        setProfile(data) // Update with response data
        setTimeout(() => {
          setMsg('')
          navigate('/') // Redirect to dashboard after KYC
        }, 2000)
      } else {
        setMsg(data.error || 'Update failed')
      }
    } catch (e) { 
      console.error("Update error:", e)
      setMsg('Network error. Please try again.') 
    }
  }

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocoding using Nominatim
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
          const data = await res.json()
          
          const address = data.address;
          const city = address.city || address.town || address.village || address.municipality || "";
          const area = address.suburb || address.neighbourhood || address.residential || "";
          const fullAddress = data.display_name;

          setProfile(prev => ({
            ...prev,
            latitude,
            longitude,
            city: city || prev.city,
            area: area || prev.area,
            address: fullAddress || prev.address
          }))
        } catch (e) {
          console.error("Geocoding failed", e)
          setProfile(prev => ({ ...prev, latitude, longitude }))
        }
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
          {/* Restaurant Banner Upload */}
          <h3 style={{ marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Restaurant Banner</h3>
          <div style={{ marginBottom: '32px' }}>
            <div 
              style={{ 
                width: '100%', 
                height: '240px', 
                background: 'var(--bg-subtle)', 
                borderRadius: '16px', 
                border: '2px dashed var(--border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('banner-upload').click()}
            >
              {profile.coverImage ? (
                <>
                  <img src={profile.coverImage} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <Camera size={16} /> Change Banner
                  </div>
                </>
              ) : (
                <>
                  <Upload size={32} style={{ color: 'var(--muted)', marginBottom: '12px' }} />
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>{uploading ? 'Uploading banner...' : 'Upload Restaurant Banner'}</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Recommended size: 1200x400</span>
                </>
              )}
              <input id="banner-upload" type="file" hidden accept="image/*" onChange={handleBannerUpload} />
            </div>
          </div>

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

          <h3 style={{ marginBottom: '20px', fontSize: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Location Details</h3>
          <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>City</label>
              <UiInput value={profile.city || ''} onChange={e => setProfile({...profile, city: e.target.value})} required />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Area / Locality</label>
              <UiInput value={profile.area || ''} onChange={e => setProfile({...profile, area: e.target.value})} required />
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>Full Address</label>
            <UiInput value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} placeholder="Complete physical address" required />
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '20px', borderRadius: '12px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Coordinates (Auto-filled)</span>
              <button type="button" onClick={useCurrentLocation} className="btn btn-soft btn-sm" style={{ fontSize: '12px' }}>Detect My Location</button>
            </div>
            <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <UiInput value={profile.latitude || ''} readOnly placeholder="Latitude" />
              <UiInput value={profile.longitude || ''} readOnly placeholder="Longitude" />
            </div>
            <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--muted)' }}>
              Coordinates are used to show your restaurant to nearby users. 
              {profile.latitude && (
                <a href={`https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`} target="_blank" rel="noreferrer" style={{ marginLeft: '8px', color: 'var(--accent)' }}>View on Maps</a>
              )}
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
