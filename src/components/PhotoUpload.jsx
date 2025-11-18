import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import * as exifr from 'exifr'
import './PhotoUpload.css'

export const PhotoUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setUploading(true)
    setError('')

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
        setError('Warning: No GPS data found in photo EXIF')
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
      if (onUploadSuccess) onUploadSuccess()

      if (!latitude || !longitude) {
        setTimeout(() => setError(''), 3000)
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="photo-upload">
      <label htmlFor="photo-input" className="upload-button">
        {uploading ? 'Uploading...' : '+ Upload Photo'}
      </label>
      <input
        id="photo-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        style={{ display: 'none' }}
      />
      {error && <p className="upload-error">{error}</p>}
    </div>
  )
}
