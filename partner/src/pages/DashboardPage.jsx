import React, { useState, useEffect } from 'react'
const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

function UsageMonitor({ partnerId }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const loadLogs = async () => {
    if (!partnerId) return
    try {
      const r = await fetch(`${API_BASE}/api/partners/${partnerId}/usage`)
      const data = await r.json()
      setLogs(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    loadLogs()
    const t = setInterval(loadLogs, 15000)
    return () => clearInterval(t)
  }, [partnerId])

  return (
    <div className="card">
      <h3 style={{ marginBottom: '20px' }}>Recent Activity</h3>
      {loading ? <p>Loading activity...</p> : (
        <ul className="partner-list">
          {logs.length === 0 && <li className="empty-state">No activity yet</li>}
          {logs.map((log) => (
            <li key={log._id || log.id} className="partner-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span className={`badge ${log.type === 'meal_redeem' ? 'badge-verified' : ''}`} style={{ marginRight: '10px', fontSize: '11px' }}>
                  {log.type === 'meal_redeem' ? 'Meal Redeemed' : 'Check-in'}
                </span>
                <span style={{ fontSize: '14px' }}>User: {log.userId}</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function DashboardPage({ partnerId }) {
  const [stats, setStats] = useState({ subsCount: 0, deliveriesCount: 0, activePlans: 0 })
  useEffect(() => {
    fetch(`${API_BASE}/api/partners/${partnerId}/stats`).then(r => r.json()).then(setStats)
  }, [partnerId])

  return (
    <div className="view-content">
      <div className="view-header" style={{ marginBottom: '32px' }}>
        <h2 className="view-title">Dashboard Overview</h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Welcome back! Here's what's happening today.</p>
      </div>
      
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="stat-card" style={{ padding: '24px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div className="stat-value" style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--accent)' }}>{stats.subsCount}</div>
          <div className="stat-label" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginTop: '8px' }}>Active Subscriptions</div>
        </div>
        <div className="stat-card" style={{ padding: '24px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div className="stat-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.deliveriesCount}</div>
          <div className="stat-label" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginTop: '8px' }}>Total Deliveries</div>
        </div>
        <div className="stat-card" style={{ padding: '24px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <div className="stat-value" style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.activePlans}</div>
          <div className="stat-label" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--muted)', marginTop: '8px' }}>Membership Plans</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        <UsageMonitor partnerId={partnerId} />
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Quick Tips</h3>
          <ul style={{ fontSize: '14px', color: 'var(--muted)', paddingLeft: '20px', lineHeight: '2' }}>
            <li>Keep your menu updated to attract more users.</li>
            <li>Respond to delivery reminders promptly.</li>
            <li>Use On-Table QR for a better dining experience.</li>
            <li>Check bookings daily for new reservations.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
