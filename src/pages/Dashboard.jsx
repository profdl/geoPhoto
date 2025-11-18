import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'
import { PhotoUpload } from '../components/PhotoUpload'
import { PhotoGallery } from '../components/PhotoGallery'
import { PhotoMap } from '../components/PhotoMap'
import { Button } from '../components/ui/button'
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
      toast.error('Failed to load photos', {
        description: err.message
      })
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
      toast.success('Signed out successfully')
    } catch (err) {
      console.error('Error signing out:', err)
      toast.error('Failed to sign out')
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
          <Button onClick={handleSignOut} variant="outline" size="sm">
            Sign Out
          </Button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="upload-section">
          <PhotoUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        <div className="view-toggle">
          <Button
            variant={activeView === 'gallery' ? 'default' : 'ghost'}
            onClick={() => setActiveView('gallery')}
          >
            Gallery View
          </Button>
          <Button
            variant={activeView === 'map' ? 'default' : 'ghost'}
            onClick={() => setActiveView('map')}
          >
            Map View
          </Button>
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
