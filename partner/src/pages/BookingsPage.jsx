import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

export default function BookingsPage({ partnerId }) {
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
      <div className="view-header" style={{ marginBottom: '32px' }}>
        <h2 className="view-title">Table Bookings</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Confirm and manage your guest reservations.</p>
      </div>
      
      {msg && <div className="message success" style={{ marginBottom: '24px' }}>{msg}</div>}
      
      {loading ? <p>Loading...</p> : (
        <div className="card" style={{ padding: '0' }}>
          <ul className="partner-list">
            {bookings.length === 0 && <li className="empty-state" style={{ padding: '64px' }}>No bookings yet.</li>}
            {bookings.map(b => (
              <li key={b.id} className="partner-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{b.userName || 'Guest'} — {b.people} people</div>
                  <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
                    {b.date} at {b.time} • <span className={`badge ${b.status === 'confirmed' ? 'badge-verified' : ''}`} style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{b.status}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
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
