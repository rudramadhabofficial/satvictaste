import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button.jsx'

const API_BASE = 'https://satvictaste.onrender.com'

export default function OrdersPage({ partnerId }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = async () => {
    if (!partnerId) return
    try {
      const res = await fetch(`${API_BASE}/api/restaurants/${partnerId}/orders`)
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [partnerId])

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setMsg(`Order marked as ${status}`)
        load()
        setTimeout(() => setMsg(''), 3000)
      }
    } catch (e) {
      setMsg('Failed to update status')
    }
  }

  return (
    <div className="view-content">
      <div className="view-header" style={{ marginBottom: '32px' }}>
        <h2 className="view-title">Orders Management</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Manage incoming food orders and track delivery status.</p>
      </div>
      
      {msg && <div className="message success" style={{ marginBottom: '24px' }}>{msg}</div>}
      
      {loading ? <p>Loading...</p> : (
        <div className="grid grid-1" style={{ display: 'grid', gap: '24px' }}>
          {orders.length === 0 && (
            <div className="empty-state" style={{ padding: '64px' }}>
              <p className="empty-state-desc">No orders yet.</p>
            </div>
          )}
          {orders.map(o => (
            <div key={o.id} className="card" style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'var(--font-display)' }}>Order #{o.id.slice(-6)}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Placed: {new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <span className={`badge ${o.status === 'DELIVERED' ? 'badge-verified' : ''}`} style={{ background: 'var(--highlight)', color: 'var(--text-strong)', padding: '6px 12px' }}>
                  {o.status}
                </span>
              </div>
              
              <div style={{ padding: '16px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', marginBottom: '20px' }}>
                <div style={{ marginBottom: '12px', fontWeight: 600, fontSize: '14px' }}>Order Items:</div>
                {o.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                    <span>{item.name} x {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontWeight: 'bold' }}>
                  <span>Total Amount</span>
                  <span>₹{o.totalPrice}</span>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Delivery Address</div>
                <div style={{ fontSize: '14px' }}>{o.deliveryAddress || 'Not specified'}</div>
              </div>
              
              <div className="form-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {o.status === 'PLACED' && (
                  <Button onClick={() => updateStatus(o.id, 'ACCEPTED')} size="lg" style={{ flex: 1 }}>Accept Order</Button>
                )}
                {o.status === 'ACCEPTED' && (
                  <Button onClick={() => updateStatus(o.id, 'PREPARING')} size="lg" style={{ flex: 1 }}>Start Preparing</Button>
                )}
                {o.status === 'PREPARING' && (
                  <Button onClick={() => updateStatus(o.id, 'READY')} size="lg" style={{ flex: 1 }}>Mark as Ready</Button>
                )}
                {o.status === 'READY' && (
                  <Button onClick={() => updateStatus(o.id, 'PICKED')} size="lg" style={{ flex: 1 }}>Picked Up</Button>
                )}
                {o.status === 'PICKED' && (
                  <Button onClick={() => updateStatus(o.id, 'DELIVERED')} size="lg" style={{ flex: 1 }}>Mark Delivered</Button>
                )}
                {o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && (
                  <Button variant="ghost" style={{ color: 'red' }} onClick={() => updateStatus(o.id, 'CANCELLED')}>Cancel Order</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
