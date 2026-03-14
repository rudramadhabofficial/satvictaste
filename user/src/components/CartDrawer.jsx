import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button.jsx'

export function CartDrawer({ cart, setCart, onClose }) {
  const navigate = useNavigate()
  const total = cart.reduce((acc, i) => acc + i.price * i.quantity, 0)

  const updateQty = (name, delta) => {
    setCart(cart.map(i => {
      if (i.name === name) {
        return { ...i, quantity: Math.max(0, i.quantity + delta) }
      }
      return i
    }).filter(i => i.quantity > 0))
  }

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="cart-header-row">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px' }}>Your Cart</h3>
          <button onClick={onClose} style={{ background: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--muted)' }}>&times;</button>
        </div>
        
        <div className="cart-items" style={{ padding: '24px' }}>
          {cart.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 0' }}>
              <p className="empty-state-desc">Your cart is empty.</p>
              <Button onClick={onClose} variant="soft" style={{ marginTop: '16px' }}>Start Shopping</Button>
            </div>
          ) : (
            cart.map(i => (
              <div key={i.name} className="cart-item" style={{ padding: '16px 0' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{i.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>₹{i.price}</div>
                </div>
                <div className="qty-controls">
                  <button onClick={() => updateQty(i.name, -1)}>-</button>
                  <span>{i.quantity}</span>
                  <button onClick={() => updateQty(i.name, 1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer" style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
            <div className="cart-total-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: 'bold', fontSize: '18px' }}>
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <Button className="w-full" size="lg" onClick={() => { onClose(); navigate('/checkout'); }}>Checkout</Button>
          </div>
        )}
      </div>
    </div>
  )
}
