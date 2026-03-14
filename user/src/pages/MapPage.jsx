import { useEffect, useState, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '../components/ui/button.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'
import { RestaurantCard } from '../components/RestaurantCard.jsx'

const API_BASE = 'https://satvictaste.onrender.com'

export default function MapPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const mapRef = useRef(null)
  const mapElRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!mapRef.current && mapElRef.current) {
      mapRef.current = L.map(mapElRef.current, { zoomControl: false }).setView([20.5937, 78.9629], 5)
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current)
    }
    ;(async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/restaurants`)
        const data = await resp.json()
        setRestaurants(data)
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 12)
          })
        }
      } catch (e) {
        console.error('Map load failed:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    markersRef.current.forEach(m => mapRef.current?.removeLayer(m))
    markersRef.current = []
    restaurants.forEach(r => {
      const lat = r.latitude || r.lat
      const lng = r.longitude || r.lng
      if (lat == null || lng == null) return
      
      const m = L.marker([lat, lng]).addTo(mapRef.current)
      const popupContent = `
        <div class="map-popup-premium">
          ${r.coverImage ? `<img src="${r.coverImage}" class="popup-img" />` : ''}
          <div class="popup-body">
            <h3>${r.name} ${r.verified ? '<span class="v-check">✓</span>' : ''}</h3>
            <p>${r.area || ''} ${r.city || ''}</p>
            <div class="popup-actions">
              <a href="/restaurants/${r._id}" class="btn-popup">View Details</a>
            </div>
          </div>
        </div>
      `
      m.bindPopup(popupContent, { maxWidth: 280, className: 'premium-popup' })
      markersRef.current.push(m)
    })
  }, [restaurants])

  const geocode = async (query) => {
    if (!query) return
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=1`
      const resp = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'SatvicApp/1.0' } })
      const results = await resp.json()
      if (results?.length) {
        const { lat, lon } = results[0]
        mapRef.current?.flyTo([parseFloat(lat), parseFloat(lon)], 13)
      }
    } catch (e) { console.error('Geocode failed:', e) }
  }

  const focusOnRestaurant = (r) => {
    const lat = r.latitude || r.lat
    const lng = r.longitude || r.lng
    if (lat && lng) {
      mapRef.current?.flyTo([lat, lng], 15)
    }
  }

  return (
    <div className="map-layout">
      <div className="map-pane" ref={mapElRef}>
        {loading && <div className="detail-loading" style={{ background: 'rgba(255,255,255,0.8)', padding: '12px 24px', borderRadius: 'var(--radius)', zIndex: 1000 }}>Loading map data…</div>}
      </div>
      <div className="list-pane">
        <div className="map-search-row">
          <UiInput 
            placeholder="Search city or area" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && geocode(search)}
            className="hero-search"
          />
          <Button variant="soft" onClick={() => geocode(search)}>Search</Button>
        </div>
        <div className="cards-grid">
          {restaurants.length === 0 && !loading && (
            <div className="empty-state">
              <p className="empty-state-title">No restaurants found</p>
              <p className="empty-state-desc">Try a different search or check back later.</p>
            </div>
          )}
          {restaurants.map((r) => (
            <div key={r._id} onClick={() => focusOnRestaurant(r)} style={{ cursor: 'pointer' }}>
              <RestaurantCard r={r} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
