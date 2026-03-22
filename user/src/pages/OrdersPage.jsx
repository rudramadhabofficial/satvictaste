import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Clock, MapPin, CheckCircle2, XCircle, ChevronRight, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/button.jsx'

const API_BASE = 'https://satvictaste.onrender.com'

const statusSteps = [
  { id: 'PLACED', label: 'Placed', icon: '📝' },
  { id: 'ACCEPTED', label: 'Accepted', icon: '✅' },
  { id: 'PREPARING', label: 'Preparing', icon: '👨‍🍳' },
  { id: 'READY', label: 'Ready', icon: '🥡' },
  { id: 'ASSIGNED', label: 'Assigned', icon: '🚴' },
  { id: 'PICKED', label: 'Out', icon: '🚚' },
  { id: 'DELIVERED', label: 'Delivered', icon: '🏠' }
]

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const userId = localStorage.getItem('userId')

  const loadOrders = async () => {
    if (!userId) return
    try {
      const res = await fetch(`${API_BASE}/api/users/${userId}/orders`)
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 10000)
    return () => clearInterval(interval)
  }, [])

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      })
      if (res.ok) {
        loadOrders()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to cancel order')
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return (
    <div className="section">
      <div className="container detail-loading" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '20px', color: 'var(--muted)' }}>Fetching your orders...</p>
      </div>
    </div>
  )

  if (!userId) {
    return (
      <section className="section">
        <div className="container">
          <div className="empty-state" style={{ padding: '80px 0' }}>
            <div style={{ marginBottom: '24px', color: 'var(--accent)' }}><Package size={48} style={{ opacity: 0.5 }} /></div>
            <p className="empty-state-title">Login to track your orders</p>
            <Button onClick={() => navigate('/login')} size="lg" className="btn-primary" style={{ marginTop: '20px' }}>Login Now</Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="fade-in">
      <section className="section">
        <div className="container">
          <div className="section-head" style={{ marginBottom: '48px' }}>
            <div>
              <h2 className="section-title">My Orders</h2>
              <p style={{ color: 'var(--muted)', marginTop: '4px' }}>Track your pure meals from kitchen to doorstep.</p>
            </div>
            <Link to="/restaurants">
              <Button variant="soft" className="btn">
                <ShoppingBag size={16} style={{ marginRight: '8px' }} />
                Order More
              </Button>
            </Link>
          </div>
          
          <div style={{ display: 'grid', gap: '32px' }}>
            {orders.length === 0 ? (
              <div className="empty-state" style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', padding: '80px 0' }}>
                <Package size={48} style={{ color: 'var(--muted-light)', marginBottom: '20px', opacity: 0.5 }} />
                <p className="empty-state-desc">You haven't placed any orders yet.</p>
                <Button onClick={() => navigate('/restaurants')} className="btn-primary">Explore Restaurants</Button>
              </div>
            ) : (
              <AnimatePresence>
                {orders.map((order, i) => (
                  <motion.div 
                    key={order.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="premium-card" 
                    style={{ padding: '0', overflow: 'hidden', background: 'white' }}
                  >
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)' }}>
                      <div>
                        <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', fontWeight: 'bold', marginBottom: '4px' }}>
                          Order #{order.id.slice(-6)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-strong)', fontWeight: '600' }}>
                          <Clock size={14} />
                          {new Date(order.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent)' }}>₹{order.totalPrice}</div>
                        <span className={`badge ${order.status === 'DELIVERED' ? 'badge-verified' : order.status === 'CANCELLED' ? 'badge-error' : ''}`} style={{ marginTop: '4px' }}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: '32px' }}>
                      {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                        <div style={{ marginBottom: '40px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                            {statusSteps.map((step, idx) => {
                              const currentIdx = statusSteps.findIndex(s => s.id === order.status)
                              const isCompleted = idx <= currentIdx
                              const isCurrent = idx === currentIdx
                              
                              return (
                                <div key={step.id} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                                  <motion.div 
                                    initial={false}
                                    animate={{ 
                                      backgroundColor: isCompleted ? 'var(--accent)' : 'var(--bg-elevated)',
                                      scale: isCurrent ? 1.2 : 1,
                                      borderColor: isCurrent ? 'var(--accent)' : 'var(--border-strong)'
                                    }}
                                    style={{ 
                                      width: '36px', height: '32px', borderRadius: '10px', 
                                      color: isCompleted ? 'white' : 'var(--muted-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px',
                                      border: '1px solid', fontSize: '14px', boxShadow: isCurrent ? '0 0 15px var(--accent-soft)' : 'none'
                                    }}
                                  >
                                    {step.icon}
                                  </motion.div>
                                  <div style={{ 
                                    fontSize: '10px', 
                                    fontWeight: isCurrent ? 'bold' : '500', 
                                    color: isCompleted ? 'var(--text-strong)' : 'var(--muted-light)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.02em'
                                  }}>
                                    {step.label}
                                  </div>
                                </div>
                              )
                            })}
                            {/* Progress track */}
                            <div style={{ 
                              position: 'absolute', top: '16px', left: '5%', right: '5%', height: '2px', backgroundColor: 'var(--border)', zIndex: 0 
                            }} />
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(statusSteps.findIndex(s => s.id === order.status) / (statusSteps.length - 1)) * 90}%` }}
                              style={{ 
                                position: 'absolute', top: '16px', left: '5%', 
                                height: '2px', backgroundColor: 'var(--accent)', zIndex: 0, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' 
                              }} 
                            />
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Package size={16} /> Items Ordered
                          </h4>
                          <div style={{ display: 'grid', gap: '12px' }}>
                            {order.items.map(item => (
                              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text)' }}>
                                <span style={{ color: 'var(--muted)' }}>{item.name} <span style={{ marginLeft: '4px', fontWeight: 'bold', color: 'var(--text-strong)' }}>× {item.quantity}</span></span>
                                <span style={{ fontWeight: '600' }}>₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={16} /> Delivery Address
                          </h4>
                          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.6' }}>{order.deliveryAddress}</p>
                          
                          {order.status === 'PLACED' && (
                            <Button 
                              variant="soft" 
                              style={{ marginTop: '24px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', width: '100%' }}
                              onClick={() => cancelOrder(order.id)}
                            >
                              <XCircle size={16} style={{ marginRight: '8px' }} />
                              Cancel Order
                            </Button>
                          )}
                          
                          {order.status === 'DELIVERED' && (
                            <div style={{ marginTop: '24px', padding: '12px', background: 'var(--verified-bg)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--verified)', fontSize: '13px', fontWeight: '600' }}>
                              <CheckCircle2 size={16} /> Order delivered successfully
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
