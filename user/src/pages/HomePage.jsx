import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'
import { RestaurantCard } from '../components/RestaurantCard.jsx'

const API_BASE = 'https://satvictaste.onrender.com'

function Hero({ onSearch }) {
  const [query, setQuery] = useState('')
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-inner">
          <h1 className="hero-title">Calm discovery for Satvik, Jain, and spiritual diets</h1>
          <p className="hero-sub">Verified restaurants serving clean, simple food.</p>
          <div className="hero-actions">
            <div className="hero-search-wrap">
              <UiInput
                placeholder="Search by name or city"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
                className="hero-search"
              />
            </div>
            <Button size="lg" onClick={() => onSearch(query)}>Search</Button>
            <Link to="/map"><Button variant="soft" size="lg">Map</Button></Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function BenefitsSection() {
  const benefits = [
    { title: 'Verified Purity', desc: 'Every restaurant is manually checked for their diet practices.', icon: '🛡️' },
    { title: 'Calm Experience', desc: 'No loud ads, no noise — just find your meal in peace.', icon: '🧘' },
    { title: 'Community Trust', desc: 'Built for seekers by seekers who value honest food.', icon: '🤝' }
  ]
  return (
    <section className="section bg-subtle">
      <div className="container">
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>{b.icon}</div>
              <h3 className="card-title" style={{ marginBottom: '8px' }}>{b.title}</h3>
              <p className="card-meta">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([])
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch(`${API_BASE}/api/restaurants`).then(r => r.json()).then(setRestaurants)
  }, [])

  const filtered = restaurants.filter(r => !q || (r.name + r.city + r.area).toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <Hero onSearch={setQ} />
      
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Featured</h2>
            <Link to="/restaurants" className="btn btn-soft">View all</Link>
          </div>
          <div className="cards-grid">
            {filtered.length === 0 && (
              <div className="empty-state">
                <p className="empty-state-title">No restaurants yet</p>
                <p className="empty-state-desc">{q ? 'Try a different search or browse all.' : 'Verified restaurants will appear here. Check back soon.'}</p>
                {q && <Link to="/restaurants" className="btn btn-soft">Browse all</Link>}
              </div>
            )}
            {filtered.slice(0, 8).map(r => (
              <RestaurantCard key={r._id} r={r} />
            ))}
          </div>
        </div>
      </section>

      <BenefitsSection />

      <section className="section">
        <div className="container">
          <div className="card" style={{ padding: '64px', textAlign: 'center', background: 'var(--accent)', color: 'white' }}>
            <h2 className="section-title" style={{ color: 'white', marginBottom: '16px' }}>Are you a Restaurant Owner?</h2>
            <p style={{ marginBottom: '32px', fontSize: '18px', opacity: 0.9 }}>Join our network of verified Satvik and Jain-friendly food places.</p>
            <a href="https://partner.satvictaste.onrender.com" target="_blank" rel="noreferrer">
              <Button size="lg" style={{ background: 'white', color: 'var(--accent)' }}>Partner with Us</Button>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
