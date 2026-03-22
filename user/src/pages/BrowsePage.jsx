import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Map, Grid, List as ListIcon } from 'lucide-react'
import { RestaurantCard } from '../components/RestaurantCard.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'
import { Button } from '../components/ui/button.jsx'

const API_BASE = 'https://satvictaste.onrender.com'

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
      <section className="section-sm bg-subtle" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '300px', maxWidth: '500px' }}>
              <Search 
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-light)' }} 
                size={18} 
              />
              <UiInput
                placeholder="Search by name, city, or area..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                style={{ paddingLeft: '44px', background: 'white' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {satvikTypes.map(t => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '13px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    background: filter === t ? 'var(--accent)' : 'white',
                    color: filter === t ? 'white' : 'var(--muted)',
                    border: `1px solid ${filter === t ? 'var(--accent)' : 'var(--border)'}`,
                    transition: 'all 0.2s ease'
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
          <div className="section-head" style={{ marginBottom: '40px' }}>
            <div>
              <h2 className="section-title">
                {filter === 'All' ? 'All Restaurants' : `${filter} Places`}
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
                Showing {filtered.length} verified results
              </p>
            </div>
            <Link to="/map">
              <Button variant="soft" className="btn">
                <Map size={16} style={{ marginRight: '8px' }} />
                Map View
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="premium-card" style={{ height: '300px', opacity: 0.5, background: 'var(--bg-subtle)' }} />
              ))}
            </div>
          ) : (
            <motion.div 
              className="cards-grid"
              layout
            >
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <motion.div 
                    className="empty-state empty-state-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="empty-state-title">No matches found</p>
                    <p className="empty-state-desc">Try adjusting your filters or search term to find what you're looking for.</p>
                    <Button onClick={() => { setQ(''); setFilter('All'); }} variant="soft">Clear all filters</Button>
                  </motion.div>
                ) : (
                  filtered.map((r, i) => (
                    <motion.div
                      key={r._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                    >
                      <RestaurantCard r={r} />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
