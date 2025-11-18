import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './PhotoMap.css'
import L from 'leaflet'

// Fix for default marker icons in React Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

export const PhotoMap = ({ photos }) => {
  const photosWithLocation = photos.filter(p => p.latitude && p.longitude)

  // Default center (world view) if no geotagged photos
  let centerLat = 20
  let centerLng = 0
  let zoom = 2

  // Calculate center based on photos with location data
  if (photosWithLocation.length > 0) {
    centerLat = photosWithLocation.reduce((sum, p) => sum + p.latitude, 0) / photosWithLocation.length
    centerLng = photosWithLocation.reduce((sum, p) => sum + p.longitude, 0) / photosWithLocation.length
    zoom = 10
  }

  return (
    <div className="photo-map-container">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        style={{ height: '500px', width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {photosWithLocation.length === 0 && (
          <div className="map-overlay">
            <p>No photos with location data yet. Upload photos with GPS information to see them on the map!</p>
          </div>
        )}
        {photosWithLocation.map((photo) => (
          <Marker key={photo.id} position={[photo.latitude, photo.longitude]}>
            <Popup>
              <div className="map-popup">
                <img src={photo.image_url} alt="Photo" />
                <p>
                  {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
                </p>
                {photo.taken_at && (
                  <p>{new Date(photo.taken_at).toLocaleDateString()}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
