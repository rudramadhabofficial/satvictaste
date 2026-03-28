import React, { useState, useEffect } from 'react'
import { Button } from '../components/ui/button.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

export default function OrdersPage({ partnerId }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [selectedDP, setSelectedDP] = useState(null)
  const [deliveryPartners, setDeliveryPartners] = useState([])

  const load = async () => {
    if (!partnerId) return
    try {
      const res = await fetch(`${API_BASE}/api/restaurants/${partnerId}/orders`)
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
      
      // Load delivery partners to show details if assigned
      const dpRes = await fetch(`${API_BASE}/api/admin/delivery-partners`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('partnerToken')}` } // Assuming partners can also see DP list for their assigned fleet
      })
      const dpData = await dpRes.json()
      setDeliveryPartners(Array.isArray(dpData) ? dpData : [])
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

  const DPDetailModal = () => {
    if (!selectedDP) return null
    return (
      <div className="modal-overlay" style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', 
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }} onClick={() => setSelectedDP(null)}>
        <div className="card fade-in" style={{ 
          maxWidth: '400px', width: '100%', position: 'relative', padding: '32px'
        }} onClick={e => e.stopPropagation()}>
          <h2 style={{ marginBottom: '24px' }}>Delivery Partner</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Name</div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>{selectedDP.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>Phone</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent)' }}>{selectedDP.phone || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 600 }}>City</div>
              <div style={{ fontSize: '16px' }}>{selectedDP.city || 'N/A'}</div>
            </div>
          </div>
          <Button className="w-full" style={{ marginTop: '24px' }} onClick={() => setSelectedDP(null)}>Close</Button>
        </div>
      </div>
    )
  }

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/partner/orders/${id}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        setMsg(`Order marked as ${status}`)
        load()
        setTimeout(() => setMsg(''), 3000)
      } else {
        const data = await res.json()
        setMsg(data.error || 'Failed to update status')
      }
    } catch (e) {
      setMsg('Failed to update status')
    }
  }

  return (
    <div className="view-content">
      <DPDetailModal />
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
          {orders.map(o => {
            const dp = deliveryPartners.find(x => x.id === o.deliveryPartnerId || x._id === o.deliveryPartnerId);
            return (
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
                    <Button onClick={() => updateStatus(o.id, 'ACCEPTED')} size="sm">Accept Order</Button>
                  )}
                  {['ACCEPTED', 'PREPARING'].includes(o.status) && (
                    <Button onClick={() => updateStatus(o.id, 'READY')} size="sm" variant="primary">Mark as Ready</Button>
                  )}
                  {o.status === 'READY' && (
                    <span style={{ fontSize: '13px', color: 'var(--muted)', fontStyle: 'italic' }}>Waiting for admin to assign delivery partner...</span>
                  )}
                  {o.status === 'ASSIGNED' && (
                    <span 
                      style={{ fontSize: '13px', color: 'var(--verified)', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => dp && setSelectedDP(dp)}
                    >
                      DP Assigned: {dp ? dp.name : 'View Info'}
                    </span>
                  )}
                  {o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && (
                    <Button onClick={() => updateStatus(o.id, 'CANCELLED')} variant="soft" size="sm">Cancel</Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}
