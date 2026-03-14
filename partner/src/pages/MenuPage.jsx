import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'

const API_BASE = 'https://satvictaste.onrender.com'

export default function MenuPage({ partnerId }) {
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
      <div className="view-header" style={{ marginBottom: '32px' }}>
        <h2 className="view-title">Menu Management</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Add or remove dishes from your restaurant's menu.</p>
      </div>

      <div className="card" style={{ marginBottom: '40px', padding: '32px' }}>
        <h3 style={{ marginBottom: '24px' }}>Add New Dish</h3>
        {msg && <div className="message success" style={{ marginBottom: '24px' }}>{msg}</div>}
        <div className="grid grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Dish Name</label>
            <UiInput value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} placeholder="e.g. Paneer Tikka" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Price (INR)</label>
            <UiInput type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} placeholder="e.g. 280" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Description</label>
            <UiInput value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} placeholder="Brief details" />
          </div>
        </div>
        <div className="form-actions" style={{ marginTop: '24px' }}>
          <Button onClick={addItem} size="lg">Add to Menu</Button>
        </div>
      </div>

      <h3 style={{ marginBottom: '24px' }}>Current Menu Items</h3>
      <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {restaurant.menu?.map((item, idx) => (
          <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
            <div style={{ flex: 1, paddingRight: '16px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--text-strong)' }}>{item.name}</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)', marginTop: '4px' }}>₹{item.price}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>{item.description}</div>
            </div>
            <Button variant="ghost" onClick={() => removeItem(idx)} style={{ color: 'red', flexShrink: 0 }}>Remove</Button>
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
