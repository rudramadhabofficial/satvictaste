import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'

const API_BASE = 'https://satvictaste.onrender.com'

export default function MembershipPage({ partnerId }) {
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
    loadPlans(partnerId) 
  }, [partnerId])

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
          benefits: benefitsText.split(',').map((b) => b.trim()).filter(Boolean)
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed')
      setMsg('Created')
      setTitle(''); setPrice(''); setDurationDays(''); setBenefitsText(''); setType('subscription'); setMealType('none')
      loadPlans(partnerId)
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
