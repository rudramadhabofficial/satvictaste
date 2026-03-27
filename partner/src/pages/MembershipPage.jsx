import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

export default function MembershipPage({ partnerId }) {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [durationDays, setDurationDays] = useState('')
  const [type, setType] = useState('subscription')
  const [mealType, setMealType] = useState('none')
  const [benefitsText, setBenefitsText] = useState('')
  const [allowedItems, setAllowedItems] = useState([])
  const [restaurant, setRestaurant] = useState(null)
  const [plans, setPlans] = useState([])
  const [msg, setMsg] = useState('')

  const loadData = async (rid) => {
    if (!rid) { setPlans([]); setRestaurant(null); return }
    try {
      const [pRes, rRes] = await Promise.all([
        fetch(`${API_BASE}/api/restaurants/${rid}/memberships`),
        fetch(`${API_BASE}/api/restaurants/${rid}`)
      ])
      const pData = await pRes.json()
      const rData = await rRes.json()
      setPlans(Array.isArray(pData) ? pData : [])
      setRestaurant(rData)
    } catch {
      setPlans([])
    }
  }

  useEffect(() => { 
    loadData(partnerId) 
  }, [partnerId])

  const toggleItem = (item) => {
    setAllowedItems(prev => {
      const exists = prev.find(i => i.name === item.name)
      if (exists) return prev.filter(i => i.name !== item.name)
      return [...prev, { name: item.name, price: item.price }]
    })
  }

  const createPlan = async (e) => {
    e.preventDefault()
    setMsg('')
    if (!partnerId || !title || !price || !durationDays) { setMsg('Missing fields'); return }
    try {
      const res = await fetch(`${API_BASE}/api/restaurants/${partnerId}/memberships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          price: Number(price),
          durationDays: Number(durationDays),
          type,
          mealType,
          allowedItems,
          benefits: benefitsText.split(',').map((b) => b.trim()).filter(Boolean)
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed')
      setMsg('Created')
      setTitle(''); setPrice(''); setDurationDays(''); setBenefitsText(''); setType('subscription'); setMealType('none'); setAllowedItems([])
      loadData(partnerId)
      setTimeout(() => setMsg(''), 3000)
    } catch {
      setMsg('Failed')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const deletePlan = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/memberships/${id}`, { method: 'DELETE' })
      if (res.ok) loadPlans(partnerId)
    } catch (e) { console.error(e) }
  }

  return (
    <div className="view-content">
      <div className="view-header" style={{ marginBottom: '32px' }}>
        <h2 className="view-title">Membership Management</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Offer subscription plans and daily meal packages to your customers.</p>
      </div>

      <div className="card" style={{ marginBottom: '40px', padding: '32px' }}>
        <h3 style={{ marginBottom: '24px' }}>Create New Plan</h3>
        {msg && <div className={`message ${msg === 'Created' ? 'success' : 'error'}`} style={{ marginBottom: '24px' }}>{msg}</div>}
        <div className="grid grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Title</label>
            <UiInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Monthly Lunch Pack" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Price (INR)</label>
            <UiInput type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 2500" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Duration (days)</label>
            <UiInput type="number" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} placeholder="e.g. 30" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Plan Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="btn btn-soft w-full" style={{ height: '42px', border: '1px solid #ddd', borderRadius: 'var(--radius)' }}>
              <option value="subscription">General Subscription</option>
              <option value="daily_meal">Daily Meal Package</option>
              <option value="on_table_qr">On-Table QR Access</option>
            </select>
          </div>
          {type === 'daily_meal' && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Meal Type</label>
              <select value={mealType} onChange={(e) => setMealType(e.target.value)} className="btn btn-soft w-full" style={{ height: '42px', border: '1px solid #ddd', borderRadius: 'var(--radius)' }}>
                <option value="lunch">Lunch Only</option>
                <option value="dinner">Dinner Only</option>
                <option value="both">Both (Lunch & Dinner)</option>
              </select>
            </div>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Benefits (comma separated)</label>
            <UiInput value={benefitsText} onChange={(e) => setBenefitsText(e.target.value)} placeholder="Free delivery, 10% off" />
          </div>
        </div>

        {type === 'daily_meal' && restaurant?.menu && (
          <div style={{ marginTop: '24px', padding: '20px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 'bold' }}>Included Menu Items (Select for this plan)</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {restaurant.menu.map((item, idx) => {
                const isSelected = allowedItems.find(i => i.name === item.name);
                return (
                  <button 
                    key={idx}
                    onClick={() => toggleItem(item)}
                    style={{ 
                      padding: '8px 16px', 
                      borderRadius: 'var(--radius-full)', 
                      fontSize: '12px',
                      background: isSelected ? 'var(--accent)' : 'white',
                      color: isSelected ? 'white' : 'var(--text)',
                      border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                      cursor: 'pointer'
                    }}
                  >
                    {item.name} (₹{item.price})
                  </button>
                )
              })}
            </div>
            {allowedItems.length > 0 && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--muted)' }}>
                {allowedItems.length} items selected for this daily meal plan.
              </div>
            )}
          </div>
        )}

        <div className="form-actions" style={{ marginTop: '24px' }}>
          <Button onClick={createPlan} size="lg">Create Membership Plan</Button>
        </div>
      </div>

      <h3 style={{ marginBottom: '24px' }}>Active Membership Plans</h3>
      <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {plans.map((p) => (
          <div key={p.id} className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '18px', fontFamily: 'var(--font-display)' }}>{p.title}</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent)' }}>₹{p.price}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{p.durationDays} days</div>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', minHeight: '40px' }}>
              {p.mealType !== 'none' && <div style={{ marginBottom: '4px' }}><strong>Meals:</strong> {p.mealType}</div>}
              {Array.isArray(p.benefits) ? p.benefits.join(' • ') : ''}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <span className="badge" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.type.replace('_', ' ')}</span>
              <Button variant="ghost" onClick={() => deletePlan(p.id)} style={{ color: 'red', fontSize: '12px' }}>Delete Plan</Button>
            </div>
          </div>
        ))}
        {plans.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <p className="empty-state-desc">No membership plans available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
