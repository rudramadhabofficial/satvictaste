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
          <motion.div variants={itemVariants} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--accent-extra-soft)', color: 'var(--accent)', padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '24px' }}>
            <Shield size={14} /> Trusted by Seekers Worldwide
          </motion.div>
          <motion.h1 className="hero-title text-gradient" variants={itemVariants}>
            Calm discovery for Satvik & spiritual diets
          </motion.h1>
          <motion.p className="hero-sub" variants={itemVariants} style={{ color: 'var(--muted)', lineHeight: '1.7' }}>
            Find verified restaurants serving clean, simple, and soul-enriching food. 
            Experience purity in every bite with our handpicked collections.
          </motion.p>
          
          <motion.div className="hero-actions" variants={itemVariants}>
            <div className="hero-search-wrap">
              <Search 
                style={{ marginLeft: '12px', color: 'var(--muted-light)' }} 
                size={20} 
              />
              <UiInput
                placeholder="Search by name, city or cuisine..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
                className="hero-search"
              />
            </div>
            <Button size="lg" onClick={() => onSearch(query)} className="btn-primary">
              Explore Now
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '24px', opacity: 0.6 }}>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Pure Satvik</span>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>No Onion Garlic</span>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Jain Friendly</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function BenefitsSection() {
  const benefits = [
    { title: 'Verified Purity', desc: 'Every kitchen is manually inspected for strict adherence to satvik and jain dietary laws.', icon: <Shield size={28} /> },
    { title: 'Calm Experience', desc: 'A distraction-free discovery process designed to match your peaceful lifestyle.', icon: <Wind size={28} /> },
    { title: 'Soulful Community', desc: 'Join a network of seekers who value honest ingredients and conscious preparation.', icon: <Users size={28} /> }
  ]

  return (
    <section className="section" style={{ background: 'var(--surface)' }}>
      <div className="container">
        <div className="section-head" style={{ textAlign: 'center', justifyContent: 'center', marginBottom: '72px' }}>
          <div style={{ maxWidth: '600px' }}>
            <h2 className="section-title">The Satvic Standard</h2>
            <p style={{ color: 'var(--muted)', marginTop: '16px', fontSize: '17px' }}>We believe that what you eat shapes who you are. Our platform is built on three core pillars of trust.</p>
          </div>
        </div>
        
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          {benefits.map((b, i) => (
            <motion.div 
              key={i} 
              className="premium-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              style={{ textAlign: 'left', padding: '48px 40px', border: 'none', background: 'white', boxShadow: 'var(--shadow-soft)' }}
            >
              <div style={{ color: 'var(--accent)', marginBottom: '32px', background: 'var(--accent-extra-soft)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {b.icon}
              </div>
              <h3 style={{ fontSize: '22px', marginBottom: '16px' }}>{b.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.7' }}>{b.desc}</p>
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
              <p style={{ color: 'var(--muted)', fontSize: '16px', marginTop: '8px' }}>Explore the finest dining locations verified for purity.</p>
            </div>
            <Link to="/restaurants" className="btn-soft" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="cards-grid">
            {filtered.length === 0 && (
              <div className="empty-state">
                <p className="empty-state-title">No restaurants found</p>
                <p className="empty-state-desc">{q ? 'Try a different search or browse all.' : 'Verified restaurants will appear here soon.'}</p>
                {q && <Button variant="soft" onClick={() => setQ('')}>Clear Search</Button>}
              </div>
            )}
            {filtered.slice(0, 6).map((r, i) => (
              <motion.div
                key={r._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
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
            className="card" 
            style={{ 
              padding: '100px 40px', 
              textAlign: 'center', 
              background: 'linear-gradient(135deg, var(--text-strong) 0%, #2C332E 100%)', 
              color: 'white',
              borderRadius: 'var(--radius-xl)',
              border: 'none',
              boxShadow: 'var(--shadow-medium)',
              position: 'relative',
              overflow: 'hidden'
            }}
            whileHover={{ y: -4 }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, background: 'radial-gradient(circle at 20% 30%, var(--accent), transparent 70%)' }}></div>
            
            <h2 className="section-title" style={{ color: 'white', marginBottom: '24px', fontSize: '40px', position: 'relative', zIndex: 1 }}>Are you a Restaurant Owner?</h2>
            <p style={{ marginBottom: '48px', fontSize: '20px', opacity: 0.8, maxWidth: '640px', margin: '0 auto 48px', lineHeight: '1.7', position: 'relative', zIndex: 1 }}>
              Join our exclusive network of verified Satvik kitchens and reach thousands of seekers looking for pure, conscious food.
            </p>
            <a href="https://partner.satvictaste.onrender.com" target="_blank" rel="noreferrer" style={{ position: 'relative', zIndex: 1 }}>
              <Button size="lg" style={{ background: 'var(--accent)', color: 'white', fontWeight: 'bold', padding: '18px 48px', border: 'none' }}>
                List your Restaurant
              </Button>
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
