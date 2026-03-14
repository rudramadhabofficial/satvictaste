import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { RestaurantCard } from '../components/RestaurantCard.jsx'

const API_BASE = 'https://satvictaste.onrender.com'

export default function BrowsePage() {
  const [restaurants, setRestaurants] = useState([])
  useEffect(() => {
    fetch(`${API_BASE}/api/restaurants`).then(r => r.json()).then(setRestaurants)
  }, [])
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h2 className="section-title">All Restaurants</h2>
        </div>
        <div className="cards-grid">
          {restaurants.length === 0 && (
            <div className="empty-state empty-state-full">
              <p className="empty-state-title">No restaurants listed yet</p>
              <p className="empty-state-desc">Verified Satvik and Jain-friendly restaurants will appear here. Explore the map or check back later.</p>
              <Link to="/map" className="btn btn-primary">Explore on Map</Link>
            </div>
          )}
          {restaurants.map(r => (
            <RestaurantCard key={r._id} r={r} />
          ))}
        </div>
      </div>
    </section>
  )
}
