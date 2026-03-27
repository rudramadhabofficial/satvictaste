import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, MapPin, CreditCard, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react'
import { Button } from '../components/ui/button.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

export default function CheckoutPage({ cart, setCart }) {
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0)

  const handleCheckout = async (e) => {
    e.preventDefault()
    const userId = localStorage.getItem('userId')
    if (!userId) {
      navigate('/login')
      return
    }
    setSubmitting(true)
    try {
      const restaurantId = cart[0].restaurantId
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, restaurantId, items: cart, totalPrice: total, deliveryAddress: address })
      })
      if (res.ok) {
        setCart([])
        navigate('/orders')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  if (cart.length === 0) return (
    <div className="section">
      <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
        <div style={{ marginBottom: '24px', color: 'var(--muted-light)' }}><ShoppingBag size={64} style={{ opacity: 0.3 }} /></div>
        <h2 className="section-title">Your cart is empty</h2>
        <p style={{ color: 'var(--muted)', marginTop: '8px', marginBottom: '32px' }}>Add some pure, soul-enriching meals to your cart.</p>
        <Button onClick={() => navigate('/restaurants')} size="lg" className="btn-primary">Browse Restaurants</Button>
      </div>
    </div>
  )

  return (
    <div className="fade-in">
      <section className="section">
        <div className="container">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-soft" 
            style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={18} /> Back to Menu
          </button>

          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '48px' }}>
            <div className="main-flow">
              <h2 className="section-title" style={{ marginBottom: '32px' }}>Secure Checkout</h2>
              
              <div className="premium-card" style={{ padding: '32px', background: 'white', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <MapPin className="text-accent" size={24} />
                  <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Delivery Details</h3>
                </div>
                
                <form id="checkout-form" onSubmit={handleCheckout}>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--muted)', fontSize: '14px' }}>Full Address</label>
                    <textarea
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      required
                      style={{ 
                        width: '100%', 
                        padding: '16px', 
                        borderRadius: 'var(--radius)', 
                        border: '1px solid var(--border-strong)', 
                        minHeight: '120px',
                        fontSize: '15px',
                        lineHeight: '1.6'
                      }}
                      placeholder="Enter your street, building, and apartment number"
                    />
                  </div>
                  
                  <div style={{ padding: '20px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <ShieldCheck size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                      Your food will be delivered by a verified SatvicTaste partner following our strict purity protocols.
                    </p>
                  </div>
                </form>
              </div>

              <div className="premium-card" style={{ padding: '32px', background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <CreditCard className="text-accent" size={24} />
                  <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Payment Method</h3>
                </div>
                <div style={{ padding: '20px', border: '2px solid var(--accent)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--accent-soft)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                      ₹
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Cash on Delivery</div>
                      <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Pay when your pure meal arrives</div>
                    </div>
                  </div>
                  <CheckCircle2 size={20} style={{ color: 'var(--accent)' }} />
                </div>
              </div>
            </div>

            <aside className="summary">
              <div style={{ position: 'sticky', top: '100px' }}>
                <div className="premium-card" style={{ padding: '32px', background: 'white' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                    Order Summary
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                    {cart.map(i => (
                      <div key={i.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span style={{ color: 'var(--muted)' }}>{i.name} <span style={{ fontWeight: 'bold', color: 'var(--text-strong)' }}>× {i.quantity}</span></span>
                        <span style={{ fontWeight: '600' }}>₹{i.price * i.quantity}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--muted)' }}>
                      <span>Subtotal</span>
                      <span>₹{total}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--muted)' }}>
                      <span>Delivery Fee</span>
                      <span style={{ color: 'var(--verified)', fontWeight: 'bold' }}>FREE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontWeight: 'bold', fontSize: '20px', color: 'var(--text-strong)' }}>
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    form="checkout-form"
                    className="btn-primary w-full" 
                    size="lg" 
                    style={{ marginTop: '32px', height: '56px' }}
                    disabled={submitting}
                  >
                    {submitting ? 'Placing Order...' : `Complete Order • ₹${total}`}
                  </Button>
                  
                  <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--muted-light)', marginTop: '16px' }}>
                    By completing this order, you agree to our terms of purity and service.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
