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
        style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', border: 'none', background: 'white' }}
        whileHover={{ y: -10 }}
        transition={{ duration: 0.4, ease: [0.2, 1, 0.2, 1] }}
      >
        <div 
          className="card-cover" 
          style={{ 
            height: '220px', 
            backgroundImage: r.coverImage ? `url(${r.coverImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            backgroundRepeat: 'no-repeat',
            backgroundColor: 'var(--bg-subtle)'
          }}
        >
          {r.verified && (
            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 2 }}>
              <VerifiedBadge />
            </div>
          )}
          <div style={{ 
            position: 'absolute', 
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.3) 100%)',
            zIndex: 1
          }} />
        </div>
        
        <div className="card-body" style={{ padding: '24px' }}>
          <h3 className="card-title" style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-strong)' }}>{r.name}</h3>
          
          <div className="card-meta" style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} strokeWidth={2} />
              {r.area || r.city}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} strokeWidth={2} />
              {r.bestTimeToVisit || 'Satvik Timing'}
            </span>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: 'auto' }}>
            {r.satvikType && (
              <span className="tag" style={{ background: 'var(--accent-extra-soft)', color: 'var(--accent)', fontWeight: 'bold' }}>
                {r.satvikType}
              </span>
            )}
            {r.priceRange && (
              <span className="tag" style={{ background: 'var(--bg-subtle)', color: 'var(--muted)' }}>
                {r.priceRange}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
