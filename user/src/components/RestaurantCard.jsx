import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Star, Clock } from 'lucide-react'
import { Badge as UiBadge } from './ui/badge.jsx'

export function VerifiedBadge() {
  return (
    <UiBadge variant="verified" style={{ 
      background: 'var(--verified-bg)', 
      color: 'var(--verified)',
      border: '1px solid var(--verified-border)',
      boxShadow: '0 2px 4px rgba(45, 125, 62, 0.1)'
    }}>
      Verified
    </UiBadge>
  )
}

export function RestaurantCard({ r }) {
  return (
    <Link to={`/restaurants/${r._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <motion.div 
        className="premium-card" 
        style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexData: 'column' }}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        <div 
          className="card-cover" 
          style={{ 
            height: '180px', 
            backgroundImage: r.coverImage ? `url(${r.coverImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}
        >
          {r.verified && (
            <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2 }}>
              <VerifiedBadge />
            </div>
          )}
          <div style={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            height: '60px', 
            background: 'linear-gradient(transparent, rgba(0,0,0,0.4))',
            zIndex: 1
          }} />
        </div>
        
        <div className="card-body" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <h3 className="card-title" style={{ fontSize: '18px', fontWeight: '600' }}>{r.name}</h3>
          </div>
          
          <div className="card-meta" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--muted)', fontSize: '13px', marginBottom: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} />
              {r.area || r.city}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} />
              {r.bestTimeToVisit || '11am - 10pm'}
            </span>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 'auto' }}>
            {r.satvikType && (
              <span className="tag" style={{ background: 'var(--highlight)', color: 'var(--text-strong)', border: 'none' }}>
                {r.satvikType}
              </span>
            )}
            {r.priceRange && (
              <span className="tag" style={{ background: 'var(--bg-subtle)', border: 'none' }}>
                {r.priceRange}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
