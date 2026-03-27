import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Map, Grid, List as ListIcon } from 'lucide-react'
import { RestaurantCard } from '../components/RestaurantCard.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'
import { Button } from '../components/ui/button.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

export default function BrowsePage() {
  const [restaurants, setRestaurants] = useState([])
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/restaurants`)
      .then(r => r.json())
      .then(data => {
        setRestaurants(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const satvikTypes = ['All', 'Pure Satvik', 'No Onion/Garlic', 'Jain Friendly']

  const filtered = restaurants.filter(r => {
    const matchesQuery = !q || (r.name + r.city + r.area).toLowerCase().includes(q.toLowerCase())
    const matchesFilter = filter === 'All' || r.satvikType === filter
    return matchesQuery && matchesFilter
  })

  return (
    <div className="fade-in">
      <section className="section-sm" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', paddingTop: '100px' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="hero-search-wrap" style={{ flex: 1, minWidth: '300px', maxWidth: '600px', background: 'white', boxShadow: 'var(--shadow-soft)' }}>
              <Search 
                style={{ marginLeft: '16px', color: 'var(--muted-light)' }} 
                size={20} 
              />
              <UiInput
                placeholder="Search by name, city, or cuisine..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="hero-search"
                style={{ border: 'none', background: 'transparent' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
              {satvikTypes.map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '14px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    background: filter === t ? 'var(--accent)' : 'white',
                    color: filter === t ? 'white' : 'var(--muted)',
                    border: `1px solid ${filter === t ? 'var(--accent)' : 'var(--border)'}`,
                    boxShadow: filter === t ? '0 4px 12px rgba(95, 139, 110, 0.2)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.2, 1, 0.2, 1)'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head" style={{ marginBottom: '56px', alignItems: 'center' }}>
            <div>
              <h2 className="section-title">
                {filter === 'All' ? 'All Verified Restaurants' : `${filter} Collections`}
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '15px', marginTop: '8px', fontWeight: '500' }}>
                Discovering {filtered.length} locations of purity
              </p>
            </div>
            <Link to="/map">
              <Button className="btn-soft" style={{ gap: '10px', padding: '12px 24px' }}>
                <Map size={18} strokeWidth={1.5} />
                Map Discovery
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="cards-grid">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="premium-card" style={{ height: '360px', opacity: 0.4, background: 'var(--bg-subtle)', border: 'none' }}>
                  <div className="spinner" style={{ margin: '150px auto' }}></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cards-grid">
              <AnimatePresence mode='popLayout'>
                {filtered.length === 0 ? (
                  <motion.div 
                    className="empty-state"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ background: 'white', padding: '120px 40px' }}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '24px', opacity: 0.5 }}>🍃</div>
                    <h3 className="empty-state-title">No matches found</h3>
                    <p className="empty-state-desc">We couldn't find any restaurants matching your search. Try adjusting your filters or search terms.</p>
                    <Button onClick={() => { setQ(''); setFilter('All'); }} className="btn-primary" style={{ marginTop: '32px' }}>Clear all filters</Button>
                  </motion.div>
                ) : (
                  filtered.map((r, i) => (
                    <motion.div
                      key={r._id}
                      layout
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, delay: i * 0.05, ease: [0.2, 1, 0.2, 1] }}
                    >
                      <RestaurantCard r={r} />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
