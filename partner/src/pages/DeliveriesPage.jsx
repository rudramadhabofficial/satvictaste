import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'

const API_BASE = 'https://satvictaste.onrender.com'

export default function DeliveriesPage({ partnerId }) {
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
    load(partnerId)
    if (!partnerId) return
    const t = setInterval(() => load(partnerId), 30000)
    return () => clearInterval(t)
  }, [partnerId])

  const markDone = async (id) => {
    setMsg('')
    try {
      const r = await fetch(`${API_BASE}/api/deliveries/${id}/done`, { method: 'POST' })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || 'Failed')
      setMsg('Marked done')
      load(partnerId)
      setTimeout(() => setMsg(''), 3000)
    } catch {
      setMsg('Failed')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const createDelivery = async () => {
    setMsg('')
    if (!partnerId || !userId || !scheduledAt) { setMsg('Missing fields'); return }
    try {
      const r = await fetch(`${API_BASE}/api/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: partnerId, userId, scheduledAt })
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || 'Failed')
      setMsg('Delivery created')
      setUserId(''); setScheduledAt('')
      load(partnerId)
      setTimeout(() => setMsg(''), 3000)
    } catch {
      setMsg('Failed')
      setTimeout(() => setMsg(''), 3000)
    }
  }

  return (
    <div className="view-content">
      <div className="view-header" style={{ marginBottom: '32px' }}>
        <h2 className="view-title">Deliveries & Reminders</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Track daily meal deliveries for your subscribers.</p>
      </div>

      {msg && <div className={`message ${msg.includes('Failed') ? 'error' : 'success'}`} style={{ marginBottom: '24px' }}>{msg}</div>}
      
      <div className="card" style={{ padding: '32px', marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '24px' }}>Add New Delivery Reminder</h3>
        <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>User ID</label>
            <UiInput value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Enter user's ID" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}>Scheduled Delivery Time</label>
            <UiInput type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </div>
        </div>
        <div className="form-actions" style={{ marginTop: '24px' }}>
          <Button onClick={createDelivery} size="lg">Create Delivery Reminder</Button>
        </div>
      </div>

      <h3 style={{ marginBottom: '24px' }}>Scheduled Deliveries</h3>
      <div className="card" style={{ padding: '0' }}>
        <ul className="partner-list">
          {list.length === 0 && <li className="empty-state" style={{ padding: '64px' }}>No pending deliveries.</li>}
          {list.map((d) => (
            <li key={d.id} className="partner-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>User ID: {d.userId}</div>
                <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
                  Scheduled: {new Date(d.scheduledAt).toLocaleString()} • <span className={`badge ${d.status === 'done' ? 'badge-verified' : ''}`} style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.status}</span>
                  {d.overdue && <span style={{ color: 'red', fontWeight: 600, marginLeft: '8px' }}>• OVERDUE</span>}
                  {!d.overdue && d.minutesLeft > 0 && <span style={{ color: 'var(--accent)', fontWeight: 600, marginLeft: '8px' }}>• {d.minutesLeft}m left</span>}
                </div>
              </div>
              {d.status === 'pending' && <Button type="button" onClick={() => markDone(d.id)}>Mark as Delivered</Button>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
