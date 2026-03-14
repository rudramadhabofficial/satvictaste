import { Link } from 'react-router-dom'
import { Badge as UiBadge } from './ui/badge.jsx'

export function VerifiedBadge() {
  return (
    <UiBadge variant="verified">Verified</UiBadge>
  )
}

export function RestaurantCard({ r }) {
  return (
    <div className="card">
      <div className="card-cover">
        {r.verified && (
          <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
            <VerifiedBadge />
          </div>
        )}
      </div>
      <div className="card-body">
        <div className="card-header">
          <Link to={`/restaurants/${r._id}`} className="card-title">{r.name}</Link>
        </div>
        <div className="card-meta">
          <span>{r.area || r.city}</span>
          {r.priceRange && <span style={{ margin: '0 6px', opacity: 0.5 }}>•</span>}
          <span>{r.priceRange}</span>
        </div>
        <div className="card-tags">
          {r.satvikType && <span className="tag">{r.satvikType}</span>}
        </div>
      </div>
    </div>
  )
}
