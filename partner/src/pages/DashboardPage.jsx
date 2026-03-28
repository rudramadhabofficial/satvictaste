import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Truck, 
  CreditCard, 
  Activity,
  Lightbulb
} from 'lucide-react'

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Activity size={20} className="text-accent" />
        <h3 style={{ margin: 0 }}>Recent Activity</h3>
      </div>
      {loading ? <p>Loading activity...</p> : (
        <ul className="partner-list" style={{ listStyle: 'none', padding: 0 }}>
          {logs.length === 0 && <li className="empty-state">No activity yet</li>}
          {logs.map((log) => (
            <li key={log._id || log.id} className="partner-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <span className={`badge ${log.type === 'meal_redeem' ? 'badge-verified' : ''}`} style={{ marginRight: '10px', fontSize: '11px' }}>
                  {log.type === 'meal_redeem' ? 'Meal Redeemed' : 'Check-in'}
                </span>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>User: {log.userId}</span>
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
      <div className="view-header" style={{ marginBottom: '40px' }}>
        <h2 className="view-title">Dashboard Overview</h2>
        <p style={{ color: 'var(--muted)', fontSize: '15px', marginTop: '4px' }}>Welcome back! Here's what's happening today.</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-value">{stats.subsCount}</div>
              <div className="stat-label">Active Subscriptions</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--accent-soft)', borderRadius: '12px', color: 'var(--accent)' }}>
              <Users size={24} />
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-value">{stats.deliveriesCount}</div>
              <div className="stat-label">Total Deliveries</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--highlight)', borderRadius: '12px', color: 'var(--muted)' }}>
              <Truck size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-value">{stats.activePlans}</div>
              <div className="stat-label">Active Plans</div>
            </div>
            <div style={{ padding: '12px', background: 'var(--verified-bg)', borderRadius: '12px', color: 'var(--verified)' }}>
              <CreditCard size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <UsageMonitor partnerId={partnerId} />
        
        <div className="card" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Lightbulb size={20} style={{ color: '#EAB308' }} />
            <h3 style={{ margin: 0 }}>Quick Tips</h3>
          </div>
          <ul style={{ fontSize: '14px', color: 'var(--muted)', paddingLeft: '20px', lineHeight: '1.8' }}>
            <li style={{ marginBottom: '8px' }}>Keep your menu updated to attract more users.</li>
            <li style={{ marginBottom: '8px' }}>Respond to delivery reminders promptly.</li>
            <li style={{ marginBottom: '8px' }}>Use On-Table QR for a better dining experience.</li>
            <li>Check bookings daily for new reservations.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
