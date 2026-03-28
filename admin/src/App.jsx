import { useState, useEffect } from 'react'
import './index.css'
import { useToast } from './components/ui/toast'
import { 
  LayoutDashboard, 
  CheckCircle, 
  ShoppingBag, 
  Truck, 
  AlertTriangle, 
  LogOut, 
  Menu,
  ChevronRight,
  MapPin,
  Phone,
  Clock,
  IndianRupee
} from 'lucide-react'

const API = (import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com') + '/api'

function Header({ authed, onLogout, setTab, activeTab }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <img src="/logo.png" alt="SatvicTaste" className="header-logo" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="header-title">admin.satvictaste</span>
            <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', background: 'var(--accent-soft)', padding: '2px 6px', borderRadius: '4px' }}>Premium</span>
          </div>
        </div>
        <nav className="nav">
          <span className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</span>
          <span className={`nav-link ${activeTab === 'restaurants' ? 'active' : ''}`} onClick={() => setTab('restaurants')}>Restaurants</span>
          <span className={`nav-link ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setTab('approvals')}>Approvals</span>
          <span className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>Orders</span>
          <span className={`nav-link ${activeTab === 'delivery' ? 'active' : ''}`} onClick={() => setTab('delivery')}>Delivery</span>
          {authed ? (
            <button className="btn btn-ghost" onClick={onLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  const { addToast } = useToast()
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [tab, setTab] = useState('overview')
  const [partners, setPartners] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [deliveryPartners, setDeliveryPartners] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [issues, setIssues] = useState([])

  useEffect(() => {
    const t = localStorage.getItem('adminToken')
    if (t) setAuthed(true)
  }, [])

  const login = () => {
    if (!pass) return addToast('Please enter passcode', 'error')
    
    fetch(`${API.replace('/api','')}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: pass })
    }).then(async (r) => {
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || 'Login failed')
      localStorage.setItem('adminToken', data.token)
      setAuthed(true)
      addToast('Welcome back, Admin', 'success')
    }).catch((err) => {
      addToast(err.message, 'error')
    })
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setAuthed(false)
    addToast('Logged out successfully', 'info')
  }

  const loadPartners = () => {
    setLoading(true)
    fetch(`${API}/partners`)
      .then((r) => r.json())
      .then(setPartners)
      .catch(() => setPartners([]))
      .finally(() => setLoading(false))
  }

  const loadRestaurants = () => {
    fetch(`${API}/restaurants`)
      .then((r) => r.json())
      .then(setRestaurants)
      .catch(() => setRestaurants([]))
  }

  const loadDeliveryPartners = () => {
    const token = localStorage.getItem('adminToken') || ''
    fetch(`${API}/admin/delivery-partners`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setDeliveryPartners)
      .catch(() => setDeliveryPartners([]))
  }

  const loadOrders = () => {
    const token = localStorage.getItem('adminToken') || ''
    fetch(`${API}/admin/orders`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(setOrders)
      .catch(() => setOrders([]))
  }

  const loadIssues = () => {
    fetch(`${API}/issues`)
      .then((r) => r.json())
      .then((d) => setIssues(Array.isArray(d) ? d : []))
      .catch(() => setIssues([]))
  }

  useEffect(() => {
    if (authed) {
      loadPartners()
      loadRestaurants()
      loadDeliveryPartners()
      loadIssues()
      loadOrders()
    }
  }, [authed])

  useEffect(() => {
    if (!authed) return
    if (tab === 'approvals') loadPartners()
    if (tab === 'delivery') loadDeliveryPartners()
    if (tab === 'orders') loadOrders()
  }, [tab, authed])

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('adminToken') || ''
      const res = await fetch(`${API}/partners/${id}/approve`, { 
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${token}` } 
      })
      if (!res.ok) throw new Error('Approve failed')
      const data = await res.json()
      addToast(`Approved! Restaurant ID: ${data.restaurantId || data.id}`, 'success')
      loadPartners()
      loadRestaurants()
    } catch (e) {
      addToast(e.message || 'Failed to approve', 'error')
    }
  }

  if (!authed) {
    return (
      <div className="app-wrap">
        <Header authed={false} onLogout={() => {}} activeTab="" />
        <main className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <div className="premium-card" style={{ maxWidth: '400px', width: '100%' }}>
            <h1 style={{ marginBottom: '8px', textAlign: 'center' }}>Admin Access</h1>
            <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: '24px' }}>Enter secure passcode to continue.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600' }}>Passcode</label>
                <input 
                  type="password" 
                  value={pass} 
                  onChange={(e) => setPass(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && login()}
                  placeholder="••••••••"
                />
              </div>
              <button type="button" className="btn btn-primary" onClick={login} style={{ width: '100%', justifyContent: 'center' }}>
                Login to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="app-wrap">
      <Header authed={authed} onLogout={logout} setTab={setTab} activeTab={tab} />
      <main className="container fade-in">
        
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div>
              <h2 style={{ marginBottom: '8px' }}>Dashboard Overview</h2>
              <p style={{ color: 'var(--muted)' }}>Real-time platform metrics and activity.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ padding: '12px', background: 'var(--accent-soft)', borderRadius: '12px', color: 'var(--accent)' }}>
                  <LayoutDashboard size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{restaurants.length}</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '500' }}>Restaurants</div>
                </div>
              </div>
              <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '12px', color: '#b45309' }}>
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{orders.length}</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '500' }}>Total Orders</div>
                </div>
              </div>
              <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ padding: '12px', background: 'var(--verified-bg)', borderRadius: '12px', color: 'var(--verified)' }}>
                  <Truck size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{deliveryPartners.length}</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '500' }}>Delivery Partners</div>
                </div>
              </div>
              <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '12px', color: '#b91c1c' }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700' }}>{issues.length}</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '500' }}>Issues</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
              <div className="premium-card">
                <h3 style={{ marginBottom: '20px' }}>Verified Restaurants</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Restaurant</th>
                        <th>Location</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurants.length === 0 ? (
                        <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--muted)' }}>No restaurants found</td></tr>
                      ) : (
                        restaurants.slice(0, 5).map(r => (
                          <tr key={r._id}>
                            <td style={{ fontWeight: '600' }}>{r.name}</td>
                            <td>{r.city}, {r.area}</td>
                            <td><span className="badge badge-active">Active</span></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="premium-card">
                <h3 style={{ marginBottom: '20px' }}>Active Issues</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {issues.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>No active issues</div>
                  ) : (
                    issues.map(i => (
                      <div key={i.id} style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: '8px', fontSize: '13px' }}>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>Delay: {i.restaurantId}</div>
                        <div style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} />
                          {new Date(i.escalatedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'restaurants' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ marginBottom: '8px' }}>Verified Restaurants</h2>
              <p style={{ color: 'var(--muted)' }}>Manage all live restaurant listings on the platform.</p>
            </div>
            
            <div className="premium-card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Restaurant</th>
                      <th>Location</th>
                      <th>Contact</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No verified restaurants found</td></tr>
                    ) : (
                      restaurants.map(r => (
                        <tr key={r._id}>
                          <td style={{ fontWeight: '600' }}>{r.name}</td>
                          <td>{r.city}, {r.area}</td>
                          <td>{r.phone}</td>
                          <td><span className="tag">{r.satvikType}</span></td>
                          <td><span className="badge badge-active">Active</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'approvals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ marginBottom: '8px' }}>Pending Approvals</h2>
              <p style={{ color: 'var(--muted)' }}>Review and approve new restaurant partner submissions.</p>
            </div>
            
            <div className="premium-card">
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>Loading submissions...</div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Partner Name</th>
                        <th>Contact</th>
                        <th>Location</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partners.filter(p => p.status === 'pending').length === 0 ? (
                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No pending approvals</td></tr>
                      ) : (
                        partners.filter(p => p.status === 'pending').map(p => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: '600' }}>{p.profile?.name}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {p.profile?.phone}</div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {p.profile?.city}</div>
                            </td>
                            <td>
                              <button className="btn btn-primary" onClick={() => handleApprove(p.id)}>
                                <CheckCircle size={16} />
                                Approve
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ marginBottom: '8px' }}>Order Management</h2>
              <p style={{ color: 'var(--muted)' }}>Track all orders and delivery progress.</p>
            </div>

            <div className="premium-card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No orders found</td></tr>
                    ) : (
                      orders.map(o => (
                        <tr key={o.id}>
                          <td style={{ fontWeight: '600' }}>#{o.id.slice(-6).toUpperCase()}</td>
                          <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td style={{ fontWeight: '600' }}>₹{o.totalPrice}</td>
                          <td>
                            <span className={`badge ${o.status === 'DELIVERED' ? 'badge-active' : 'badge-pending'}`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'delivery' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <h2 style={{ marginBottom: '8px' }}>Delivery Partners</h2>
              <p style={{ color: 'var(--muted)' }}>Manage your delivery fleet.</p>
            </div>

            <div className="premium-card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Partner Name</th>
                      <th>Email</th>
                      <th>City</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryPartners.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No delivery partners found</td></tr>
                    ) : (
                      deliveryPartners.map(dp => (
                        <tr key={dp.id}>
                          <td style={{ fontWeight: '600' }}>{dp.name}</td>
                          <td>{dp.email}</td>
                          <td>{dp.city}</td>
                          <td>
                            <span className={`badge ${dp.verified ? 'badge-active' : 'badge-pending'}`}>
                              {dp.verified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
