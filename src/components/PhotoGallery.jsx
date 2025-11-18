import './PhotoGallery.css'

export const PhotoGallery = ({ photos }) => {
  if (!photos || photos.length === 0) {
    return (
      <div className="empty-gallery">
        <p>No photos yet. Upload your first photo to get started!</p>
      </div>
    )
  }

  return (
    <div className="photo-gallery">
      {photos.map((photo) => (
        <div key={photo.id} className="photo-card">
          <img src={photo.image_url} alt="Uploaded photo" />
          <div className="photo-info">
            {photo.latitude && photo.longitude ? (
              <p className="location">
                📍 {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
              </p>
            ) : (
              <p className="no-location">No location data</p>
            )}
            {photo.taken_at && (
              <p className="date">
                {new Date(photo.taken_at).toLocaleDateString()}
              </p>
            )}
            {photo.metadata?.make && photo.metadata?.model && (
              <p className="camera">
                📷 {photo.metadata.make} {photo.metadata.model}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
