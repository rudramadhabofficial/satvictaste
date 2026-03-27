import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, Shield, Wind, Users, ArrowRight } from 'lucide-react'
import { Button } from '../components/ui/button.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'
import { RestaurantCard } from '../components/RestaurantCard.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
}

function Hero({ onSearch }) {
  const [query, setQuery] = useState('')

  return (
    <section className="hero">
      <div className="container">
        <motion.div 
          className="hero-inner"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 className="hero-title text-gradient" variants={itemVariants}>
            Calm discovery for Satvik, Jain, and spiritual diets
          </motion.h1>
          <motion.p className="hero-sub" variants={itemVariants}>
            Verified restaurants serving clean, simple, and soul-enriching food. 
            Experience purity in every bite.
          </motion.p>
          
          <motion.div className="hero-actions" variants={itemVariants}>
            <div className="hero-search-wrap" style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
              <Search 
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-light)', zIndex: 2 }} 
                size={20} 
              />
              <UiInput
                placeholder="Search by name or city"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
                className="hero-search"
                style={{ paddingLeft: '48px' }}
              />
            </div>
            <Button size="lg" onClick={() => onSearch(query)} className="btn-primary">
              Discover
            </Button>
            <Link to="/map">
              <Button variant="soft" size="lg" className="btn">
                <MapPin size={18} style={{ marginRight: '8px' }} />
                Map View
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function BenefitsSection() {
  const benefits = [
    { title: 'Verified Purity', desc: 'Every restaurant is manually checked for their diet practices.', icon: <Shield size={32} /> },
    { title: 'Calm Experience', desc: 'No loud ads, no noise — just find your meal in peace.', icon: <Wind size={32} /> },
    { title: 'Community Trust', desc: 'Built for seekers by seekers who value honest food.', icon: <Users size={32} /> }
  ]

  return (
    <section className="section bg-subtle">
      <div className="container">
        <div className="section-head" style={{ textAlign: 'center', justifyContent: 'center', marginBottom: '64px' }}>
          <div>
            <h2 className="section-title">The Satvic Standard</h2>
            <p style={{ color: 'var(--muted)', marginTop: '8px' }}>Purity, peace, and honesty in every recommendation.</p>
          </div>
        </div>
        
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
          {benefits.map((b, i) => (
            <motion.div 
              key={i} 
              className="premium-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{ textAlign: 'center', padding: '40px 32px' }}
            >
              <div style={{ color: 'var(--accent)', marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                {b.icon}
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{b.title}</h3>
              <p className="card-meta" style={{ fontSize: '15px' }}>{b.desc}</p>
            </motion.div>
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
    <div className="fade-in">
      <Hero onSearch={setQ} />
      
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">Handpicked Collections</h2>
              <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Explore the finest satvik dining experiences.</p>
            </div>
            <Link to="/restaurants" className="btn btn-soft" style={{ alignSelf: 'center' }}>
              Browse all <ArrowRight size={16} style={{ marginLeft: '8px' }} />
            </Link>
          </div>
          
          <div className="cards-grid">
            {filtered.length === 0 && (
              <div className="empty-state">
                <p className="empty-state-title">No restaurants found</p>
                <p className="empty-state-desc">{q ? 'Try a different search or browse all.' : 'Verified restaurants will appear here soon.'}</p>
                {q && <Link to="/restaurants" className="btn btn-soft">Browse all</Link>}
              </div>
            )}
            {filtered.slice(0, 8).map((r, i) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <RestaurantCard r={r} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <BenefitsSection />

      <section className="section-lg">
        <div className="container">
          <motion.div 
            className="card glass" 
            style={{ 
              padding: '80px 40px', 
              textAlign: 'center', 
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)', 
              color: 'white',
              borderRadius: '32px',
              border: 'none',
              boxShadow: 'var(--shadow-medium)'
            }}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <h2 className="section-title" style={{ color: 'white', marginBottom: '20px', fontSize: '32px' }}>Are you a Restaurant Owner?</h2>
            <p style={{ marginBottom: '40px', fontSize: '19px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 40px' }}>
              Join our exclusive network of verified Satvik and Jain-friendly kitchens and reach seekers of pure food.
            </p>
            <a href="https://partner.satvictaste.onrender.com" target="_blank" rel="noreferrer">
              <Button size="lg" style={{ background: 'white', color: 'var(--accent)', fontWeight: 'bold', padding: '16px 40px' }}>
                Join the Network
              </Button>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
