import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for Leaflet default icon issues in React
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

import { Button } from '../components/ui/button.jsx'
import { Input as UiInput } from '../components/ui/input.jsx'
import { MapPin } from 'lucide-react'
import { RestaurantCard } from '../components/RestaurantCard.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://satvictaste.onrender.com'

export default function MapPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const mapRef = useRef(null)
  const mapElRef = useRef(null)
  const markersRef = useRef([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!mapRef.current && mapElRef.current) {
      mapRef.current = L.map(mapElRef.current, { zoomControl: false }).setView([20.5937, 78.9629], 5)
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current)
    }

    const loadData = async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/restaurants`)
        const data = await resp.json()
        const verifiedOnly = Array.isArray(data) ? data.filter(r => r.verified) : []
        setRestaurants(verifiedOnly)

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords
            setUserLocation([latitude, longitude])
            mapRef.current?.setView([latitude, longitude], 13)
            
            // Add a special marker for user location
            L.circleMarker([latitude, longitude], {
              radius: 8,
              fillColor: "#3b82f6",
              color: "#fff",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            }).addTo(mapRef.current).bindPopup("You are here")
          })
        }
      } catch (e) {
        console.error('Map load failed:', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    // Clear old markers
    markersRef.current.forEach(m => mapRef.current?.removeLayer(m))
    markersRef.current = []

    restaurants.forEach(r => {
      const lat = r.latitude || r.lat
      const lng = r.longitude || r.lng
      if (lat == null || lng == null) return
      
      const m = L.marker([lat, lng]).addTo(mapRef.current)
      
      const popupContent = document.createElement('div')
      popupContent.className = 'map-popup-premium'
      popupContent.innerHTML = `
        ${r.coverImage ? `<div class="popup-img-container"><img src="${r.coverImage}" class="popup-img" /></div>` : ''}
        <div class="popup-body">
          <h3 class="popup-title">${r.name} ${r.verified ? '<span class="v-check">✓</span>' : ''}</h3>
          <p class="popup-meta">${r.area || ''}, ${r.city || ''}</p>
          <p class="popup-type">${r.satvikType || ''}</p>
          <button class="btn-popup-primary">View Restaurant</button>
        </div>
      `
      
      // Handle click on the popup's button
      popupContent.querySelector('.btn-popup-primary').onclick = () => {
        navigate(`/restaurants/${r._id || r.id}`)
      }

      // Also allow clicking the image/body to redirect
      popupContent.onclick = (e) => {
        if (!e.target.classList.contains('btn-popup-primary')) {
          navigate(`/restaurants/${r._id || r.id}`)
        }
      }

      m.bindPopup(popupContent, { 
        maxWidth: 280, 
        className: 'premium-leaflet-popup',
        closeButton: false
      })
      
      markersRef.current.push(m)
    })
  }, [restaurants, navigate])

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
      // Find the marker and open its popup
      const marker = markersRef.current.find(m => {
        const pos = m.getLatLng()
        return pos.lat === lat && pos.lng === lng
      })
      if (marker) marker.openPopup()
    }
  }

  const findClosest = () => {
    if (!userLocation || !restaurants.length) return
    let closest = null
    let minDist = Infinity
    
    restaurants.forEach(r => {
      const lat = r.latitude || r.lat
      const lng = r.longitude || r.lng
      if (lat == null || lng == null) return
      
      const d = Math.sqrt(Math.pow(lat - userLocation[0], 2) + Math.pow(lng - userLocation[1], 2))
      if (d < minDist) {
        minDist = d
        closest = r
      }
    })
    
    if (closest) focusOnRestaurant(closest)
  }

  return (
    <div className="map-layout">
      <div className="map-pane" ref={mapElRef}>
        {loading && (
          <div className="map-loading-overlay">
            <div className="spinner"></div>
            <p>Finding nearest restaurants...</p>
          </div>
        )}
        <div className="map-floating-search mobile-only">
          <UiInput 
            placeholder="Search location..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && geocode(search)}
          />
        </div>
        <button 
          className="map-btn-locate" 
          onClick={() => userLocation && mapRef.current?.flyTo(userLocation, 14)}
          title="Center on my location"
        >
          <MapPin size={20} />
        </button>
      </div>
      <div className="list-pane">
        <div className="map-header-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="map-sidebar-title" style={{ margin: 0 }}>Explore Nearby</h2>
            <Button variant="soft" size="sm" onClick={findClosest}>Find Nearest</Button>
          </div>
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
        </div>
        <div className="cards-grid-vertical">
          {restaurants.length === 0 && !loading && (
            <div className="empty-state">
              <p className="empty-state-title">No restaurants nearby</p>
              <p className="empty-state-desc">We're expanding quickly! Check other areas.</p>
            </div>
          )}
          {restaurants.map((r) => (
            <div key={r._id || r.id} onClick={() => focusOnRestaurant(r)} className="map-list-item">
              <div className="map-item-img">
                <img src={r.coverImage || '/placeholder.png'} alt={r.name} />
              </div>
              <div className="map-item-info">
                <h4 className="map-item-name">{r.name}</h4>
                <p className="map-item-meta">{r.area || r.city}</p>
                <div className="map-item-tags">
                  <span className="tag">{r.satvikType}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
