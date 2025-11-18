import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import './PhotoGallery.css'

export const PhotoGallery = ({ photos }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  if (!photos || photos.length === 0) {
    return (
      <div className="empty-gallery">
        <p>No photos yet. Upload your first photo to get started!</p>
      </div>
    )
  }

  return (
    <>
      <div className="photo-gallery">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="photo-card"
            onClick={() => setSelectedPhoto(photo)}
            style={{ cursor: 'pointer' }}
          >
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

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Photo Details</DialogTitle>
            <DialogDescription>
              {selectedPhoto?.taken_at
                ? new Date(selectedPhoto.taken_at).toLocaleString()
                : 'No date available'}
            </DialogDescription>
          </DialogHeader>
          {selectedPhoto && (
            <div className="space-y-4">
              <img
                src={selectedPhoto.image_url}
                alt="Full size photo"
                className="w-full h-auto rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Location</h4>
                  {selectedPhoto.latitude && selectedPhoto.longitude ? (
                    <div>
                      <p>Latitude: {selectedPhoto.latitude.toFixed(6)}</p>
                      <p>Longitude: {selectedPhoto.longitude.toFixed(6)}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No GPS data</p>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Camera Info</h4>
                  {selectedPhoto.metadata?.make ? (
                    <div>
                      <p>Make: {selectedPhoto.metadata.make}</p>
                      {selectedPhoto.metadata.model && (
                        <p>Model: {selectedPhoto.metadata.model}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No camera data</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
