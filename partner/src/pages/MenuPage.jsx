import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'
import { Upload, Image as ImageIcon, X } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

export default function MenuPage({ partnerId }) {
  const [restaurant, setRestaurant] = useState(null)
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', image: '' })
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/api/restaurants/${partnerId}`).then(r => r.json()).then(setRestaurant)
  }, [partnerId])

  const handleImageUpload = async (e) => {
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
        setNewItem(prev => ({ ...prev, image: data.url }))
      }
    } catch (err) {
      console.error("Upload failed", err)
    } finally {
      setUploading(false)
    }
  }

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
        setNewItem({ name: '', description: '', price: '', image: '' })
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
      <div className="view-header" style={{ marginBottom: '32px' }}>
        <h2 className="view-title">Menu Management</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Add or remove dishes from your restaurant's menu.</p>
      </div>

      <div className="card" style={{ marginBottom: '40px', padding: '32px' }}>
        <h3 style={{ marginBottom: '24px' }}>Add New Dish</h3>
        {msg && <div className="message success" style={{ marginBottom: '24px' }}>{msg}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
          {/* Image Upload Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Dish Image</label>
            <div 
              style={{ 
                width: '100%', 
                aspectRatio: '4/3', 
                background: 'var(--bg-subtle)', 
                borderRadius: '12px', 
                border: '2px dashed var(--border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('menu-img-upload').click()}
            >
              {newItem.image ? (
                <img src={newItem.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  <Upload size={24} style={{ color: 'var(--muted)', marginBottom: '8px' }} />
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                </>
              )}
              <input 
                id="menu-img-upload" 
                type="file" 
                hidden 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>
          </div>

          {/* Form Fields Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Dish Name</label>
                <UiInput value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="e.g. Paneer Tikka" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Price (INR)</label>
                <UiInput type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} placeholder="e.g. 280" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Description</label>
              <UiInput value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Brief details about the dish" />
            </div>
            <div className="form-actions" style={{ marginTop: '8px' }}>
              <Button onClick={addItem} size="lg" disabled={uploading} style={{ width: '100%' }}>Add to Menu</Button>
            </div>
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: '24px' }}>Current Menu Items</h3>
      <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
        {restaurant.menu?.map((item, idx) => (
          <div key={idx} className="card" style={{ display: 'flex', gap: '20px', padding: '20px', alignItems: 'center' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '12px', background: 'var(--bg-subtle)', overflow: 'hidden', flexShrink: 0 }}>
              {item.image ? (
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                  <ImageIcon size={24} />
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--text-strong)' }}>{item.name}</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)', marginTop: '4px' }}>₹{item.price}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>{item.description}</div>
            </div>
            <Button variant="ghost" onClick={() => removeItem(idx)} style={{ color: '#ef4444', padding: '8px' }} title="Remove item">
              <X size={20} />
            </Button>
          </div>
        ))}
        {(!restaurant.menu || restaurant.menu.length === 0) && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <p className="empty-state-desc">Your menu is empty. Add some dishes to attract users.</p>
          </div>
        )}
      </div>
    </div>
  )
}
