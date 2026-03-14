import { useState, useEffect } from 'react'
import './index.css'

const API = 'https://satvictaste.onrender.com/api'

function Header({ authed, onLogout }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <img src="/logo.png" alt="SatvicTaste" className="header-logo" />
          <span className="header-title">admin.satvictaste</span>
        </div>
        <nav className="nav">
          <a href="#approvals">Approvals</a>
          <a href="#listings">Listings</a>
          <a href="#partners">Partners</a>
          {authed ? <button className="btn btn-ghost" onClick={onLogout}>Logout</button> : null}
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  useEffect(() => {
    const t = localStorage.getItem('adminToken')
    if (t) setAuthed(true)
  }, [])
  const login = () => {
    fetch(`${API.replace('/api','')}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: pass })
    }).then(async (r) => {
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || 'Login failed')
      localStorage.setItem('adminToken', data.token)
      setAuthed(true)
    }).catch(() => {})
  }
  const logout = () => {
    localStorage.removeItem('adminToken')
    setAuthed(false)
  }
  const [tab, setTab] = useState('overview')
  const [partners, setPartners] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [deliveryPartners, setDeliveryPartners] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [issues, setIssues] = useState([])

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
    fetch(`${API}/admin/stats`) // Reuse stats or add new route. For now just stats.
      .then(r => r.json())
      .then(d => {
        // Since we don't have a direct "all orders" admin route yet, 
        // I'll just show the count for now or add the route if needed.
      })
  }
  const loadIssues = () => {
    fetch(`${API}/issues`)
      .then((r) => r.json())
      .then((d) => setIssues(Array.isArray(d) ? d : []))
      .catch(() => setIssues([]))
  }

  useEffect(() => {
    loadPartners()
    loadRestaurants()
    loadDeliveryPartners()
    loadIssues()
  }, [])
  useEffect(() => {
    if (tab === 'partners' || tab === 'approvals') loadPartners()
    if (tab === 'listings') loadRestaurants()
    if (tab === 'delivery') loadDeliveryPartners()
    if (tab === 'issues') loadIssues()
  }, [tab])

  const pendingCount = partners.filter((p) => p.status === 'pending').length

  const handleApprove = async (id) => {
    setMessage('')
    try {
      const token = localStorage.getItem('adminToken') || ''
      const res = await fetch(`${API}/partners/${id}/approve`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } })
      if (!res.ok) throw new Error('Approve failed')
      const data = await res.json()
      setMessage(`Approved. Restaurant ID: ${data.restaurantId || data.id}`)
      loadPartners()
      loadRestaurants()
    } catch (e) {
      setMessage(e.message || 'Failed to approve')
    }
  }

  if (!authed) {
    return (
      <div className="app-wrap">
        <Header authed={false} onLogout={() => {}} />
        <main className="container">
          <section className="hero-section">
            <h1 className="hero-title">Admin Login</h1>
            <p className="hero-sub">Enter passcode to access dashboard.</p>
          </section>
          <section className="content-section">
            <div className="card">
              <div className="grid grid-3">
                <div>
                  <label>Passcode</label>
                  <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
                </div>
                <div style={{ alignSelf: 'end' }}>
                  <button type="button" className="btn btn-primary" onClick={login}>Login</button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    )
  }
  return (
    <div className="app-wrap">
      <Header authed={true} onLogout={logout} />
      <main className="container">
        <section className="hero-section">
          <h1 className="hero-title">Admin Dashboard</h1>
          <p className="hero-sub">Moderate listings, manage partner requests, and verify satvik claims.</p>
        </section>

        <section className="tab-bar">
          <button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Overview</button>
          <button className={tab === 'approvals' ? 'active' : ''} onClick={() => setTab('approvals')}>Approvals</button>
          <button className={tab === 'listings' ? 'active' : ''} onClick={() => setTab('listings')}>Listings</button>
          <button className={tab === 'partners' ? 'active' : ''} onClick={() => setTab('partners')}>Partners</button>
          <button className={tab === 'delivery' ? 'active' : ''} onClick={() => setTab('delivery')}>Delivery Partners</button>
          <button className={tab === 'issues' ? 'active' : ''} onClick={() => setTab('issues')}>Issues</button>
        </section>

        {message && <div className={`message ${message.startsWith('Approved') ? 'success' : 'error'}`}>{message}</div>}

        {tab === 'overview' && (
          <section className="cards-section">
            <div className="grid grid-3">
              <div className="card">
                <h3>Pending Approvals</h3>
                <p className="stat">{pendingCount}</p>
                <button type="button" className="btn btn-primary" onClick={() => setTab('approvals')}>Review</button>
              </div>
              <div className="card">
                <h3>Delivery Partners</h3>
                <p className="stat">{deliveryPartners.length}</p>
                <button type="button" className="btn btn-primary" onClick={() => setTab('delivery')}>Manage</button>
              </div>
              <div className="card">
                <h3>Restaurants</h3>
                <p className="stat">{restaurants.length}</p>
                <button type="button" className="btn btn-primary" onClick={() => { setTab('listings'); loadRestaurants(); }}>View</button>
              </div>
            </div>
          </section>
        )}

        {tab === 'approvals' && (
          <section className="content-section">
            <div className="card">
              <h3>Pending approvals</h3>
              <p className="section-desc">Approve partner submissions to add them as verified restaurants on the platform.</p>
              {loading ? <p className="loading-state">Loading…</p> : (
                <ul className="partner-list">
                  {partners.filter((p) => p.status === 'pending').length === 0 && <li className="empty-state">No pending submissions. New partner requests will appear here.</li>}
                  {partners.filter((p) => p.status === 'pending').map((p) => (
                    <li key={p.id} className="partner-item">
                      <div className="info">
                        <strong>{p.profile?.name}</strong> — {p.profile?.city}, {p.profile?.phone}
                      </div>
                      <button type="button" className="btn btn-primary" onClick={() => handleApprove(p.id)}>Approve &amp; publish</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {tab === 'listings' && (
          <section className="content-section">
            <div className="card">
              <h3>Listings</h3>
              <p className="section-desc">Verified restaurants visible to users on the platform.</p>
              <ul className="partner-list">
                {restaurants.length === 0 && !loading && <li className="empty-state">No restaurants yet. Approve a partner submission to add one.</li>}
                {restaurants.map((r) => (
                  <li key={r._id} className="partner-item">
                    <div className="info">
                      <strong>{r.name}</strong> — {r.city}{r.area ? `, ${r.area}` : ''} {r.verified ? <span className="status-badge status-approved">Verified</span> : ''}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {tab === 'partners' && (
          <section className="content-section">
            <div className="card">
              <h3>Partners</h3>
              <p className="section-desc">All partner submissions and their approval status.</p>
              {loading ? <p className="loading-state">Loading…</p> : (
                <ul className="partner-list">
                  {partners.length === 0 && <li className="empty-state">No submissions yet. Partner sign-ups will appear here.</li>}
                  {partners.map((p) => (
                    <li key={p.id} className="partner-item">
                      <div className="info">
                        <strong>{p.profile?.name}</strong> — {p.profile?.city} — <span className={`status-badge ${p.status === 'approved' ? 'status-approved' : 'status-pending'}`}>{p.status}</span>
                      </div>
                      {p.status === 'pending' && <button type="button" className="btn btn-primary" onClick={() => handleApprove(p.id)}>Approve</button>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}
        {tab === 'delivery' && (
          <section className="content-section">
            <div className="card">
              <h3>Delivery Partners</h3>
              <p className="section-desc">Manage all delivery partners registered on the platform.</p>
              <ul className="partner-list">
                {deliveryPartners.length === 0 && <li className="empty-state">No delivery partners yet.</li>}
                {deliveryPartners.map((dp) => (
                  <li key={dp.id} className="partner-item">
                    <div className="info">
                      <strong>{dp.name}</strong> — {dp.email} — {dp.city}
                      {dp.verified ? <span className="status-badge status-approved" style={{ marginLeft: '10px' }}>Verified</span> : <span className="status-badge status-pending" style={{ marginLeft: '10px' }}>Pending</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
        {tab === 'issues' && (
          <section className="content-section">
            <div className="card">
              <h3>Escalated Issues</h3>
              <p className="section-desc">Deliveries not marked done within 30 minutes.</p>
              <ul className="partner-list">
                {issues.length === 0 && <li className="empty-state">No issues</li>}
                {issues.map((i) => (
                  <li key={i.id} className="partner-item">
                    <div className="info">
                      <strong>{i.restaurantId}</strong> — User {i.userId} — {new Date(i.escalatedAt).toLocaleString()}
                    </div>
                    <span className="status-badge status-pending">Escalated</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
