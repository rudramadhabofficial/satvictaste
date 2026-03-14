import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'

const API_BASE = 'https://satvictaste.onrender.com'

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
        navigate('/account')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  if (cart.length === 0) return (
    <div className="section">
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 className="section-title">Your cart is empty</h2>
        <Button onClick={() => navigate('/restaurants')} style={{ marginTop: '24px' }}>Browse Restaurants</Button>
      </div>
    </div>
  )

  return (
    <section className="section">
      <div className="container-tight">
        <h2 className="section-title" style={{ marginBottom: '32px' }}>Checkout</h2>
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h3 className="detail-heading" style={{ marginBottom: '16px' }}>Order Summary</h3>
            {cart.map(i => (
              <div key={i.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span>{i.name} x {i.quantity}</span>
                <span>₹{i.price * i.quantity}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontWeight: 'bold', fontSize: '18px' }}>
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>

          <form onSubmit={handleCheckout}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Delivery Address</label>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', minHeight: '100px' }}
                placeholder="Enter your full address"
              />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? 'Placing Order...' : `Pay ₹${total} & Place Order`}
            </Button>
          </form>
        </div>
      </div>
    </section>
  )
}
