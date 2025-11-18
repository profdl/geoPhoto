import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import * as exifr from 'exifr'
import { toast } from 'sonner'
import { Button } from './ui/button'
import './PhotoUpload.css'

export const PhotoUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false)
  const { user } = useAuth()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    setUploading(true)

    try {
      // Extract EXIF data
      const exifData = await exifr.parse(file, {
        gps: true,
        pick: ['DateTimeOriginal', 'Make', 'Model', 'latitude', 'longitude']
      })

      const latitude = exifData?.latitude || null
      const longitude = exifData?.longitude || null
      const takenAt = exifData?.DateTimeOriginal || null
      const metadata = {
        make: exifData?.Make,
        model: exifData?.Model,
        hasGPS: !!(latitude && longitude)
      }

      if (!latitude || !longitude) {
        toast.warning('No GPS data found in photo EXIF', {
          description: 'Photo will be uploaded without location information'
        })
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName)

      // Insert into database
      const { error: dbError } = await supabase
        .from('photos')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          latitude,
          longitude,
          taken_at: takenAt,
          metadata
        })

      if (dbError) throw dbError

      // Reset input and notify parent
      e.target.value = ''
      toast.success('Photo uploaded successfully!', {
        description: latitude && longitude
          ? `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          : 'No location data'
      })

      if (onUploadSuccess) onUploadSuccess()

    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Failed to upload photo', {
        description: err.message || 'An unexpected error occurred'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="photo-upload">
      <Button asChild>
        <label
          htmlFor="photo-input"
          style={{
            cursor: uploading ? 'not-allowed' : 'pointer',
            pointerEvents: uploading ? 'none' : 'auto',
            opacity: uploading ? 0.6 : 1
          }}
        >
          {uploading ? 'Uploading...' : '+ Upload Photo'}
        </label>
      </Button>
      <input
        id="photo-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        style={{ display: 'none' }}
      />
    </div>
  )
}
