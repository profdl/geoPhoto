import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { PhotoUpload } from '../components/PhotoUpload'
import { PhotoGallery } from '../components/PhotoGallery'
import { PhotoMap } from '../components/PhotoMap'
import './Dashboard.css'

export const Dashboard = () => {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('gallery') // 'gallery' or 'map'
  const { user, signOut } = useAuth()

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPhotos(data || [])
    } catch (err) {
      console.error('Error fetching photos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchPhotos()
    }
  }, [user])

  const handleUploadSuccess = () => {
    fetchPhotos()
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading your photos...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>GeoPhoto</h1>
        <div className="header-actions">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleSignOut} className="btn-signout">
            Sign Out
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="upload-section">
          <PhotoUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        <div className="view-toggle">
          <button
            className={activeView === 'gallery' ? 'active' : ''}
            onClick={() => setActiveView('gallery')}
          >
            Gallery View
          </button>
          <button
            className={activeView === 'map' ? 'active' : ''}
            onClick={() => setActiveView('map')}
          >
            Map View
          </button>
        </div>

        {activeView === 'gallery' ? (
          <PhotoGallery photos={photos} />
        ) : (
          <PhotoMap photos={photos} />
        )}
      </div>
    </div>
  )
}
