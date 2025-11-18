# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
- `npm run dev` - Start Vite development server (default port: 5173)
- `npm run build` - Build production bundle to `dist/`
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Environment Setup
Environment variables are required in `.env.local`:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key

See `SETUP.md` for detailed Supabase configuration instructions.

## Architecture Overview

### Tech Stack
- **Frontend**: React 19 with Vite
- **Backend**: Supabase (PostgreSQL database, Storage, and Auth)
- **Maps**: React Leaflet with OpenStreetMap tiles
- **Routing**: React Router v7
- **EXIF Parsing**: exifr library for extracting GPS and metadata from photos

### Authentication Flow
The app uses Supabase Auth with a centralized authentication context:
- `AuthContext` (src/contexts/AuthContext.jsx) provides global auth state and methods (`signUp`, `signIn`, `signOut`)
- `useAuth()` hook exposes user state and auth functions
- `ProtectedRoute` component guards authenticated routes
- Auth state persists via Supabase session management

### Photo Upload and Processing
Photo uploads follow this sequence:
1. File selected → EXIF data extracted using exifr (GPS coordinates, date taken, camera info)
2. Image uploaded to Supabase Storage bucket `photos` with path: `{user_id}/{timestamp}.{ext}`
3. Public URL generated for the uploaded image
4. Metadata record inserted into `photos` table with GPS coordinates, URL, and EXIF metadata
5. Photos without GPS data are still uploaded but display a warning

Key insight: The EXIF extraction happens entirely client-side before upload. GPS coordinates are stored as separate `latitude`/`longitude` columns for efficient querying.

### Data Model
The `photos` table schema:
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to auth.users, enables Row Level Security
- `image_url` (TEXT) - Public URL from Supabase Storage
- `latitude` / `longitude` (NUMERIC) - GPS coordinates from EXIF
- `taken_at` (TIMESTAMP) - When photo was taken (from EXIF DateTimeOriginal)
- `metadata` (JSONB) - Additional EXIF data (camera make/model, hasGPS flag)
- `created_at` (TIMESTAMP) - Upload timestamp

Row Level Security (RLS) policies ensure users can only access their own photos.

### Map Visualization
The map component (PhotoMap.jsx) dynamically centers based on the average position of all photos with GPS data. It filters out photos without coordinates and uses Leaflet's popup feature to display photo thumbnails when markers are clicked.

Important: Leaflet's default marker icons require explicit configuration in React - see PhotoMap.jsx:6-16 for the icon fix pattern.

### Component Structure
- `App.jsx` - Root component with Router and AuthProvider wrapper
- `pages/` - Full page components (Login, Signup, Dashboard)
- `components/` - Reusable components (PhotoUpload, PhotoGallery, PhotoMap, ProtectedRoute)
- `contexts/` - React context providers (AuthContext for global auth state)
- `lib/` - Utility modules (supabase.js exports configured Supabase client)

### Deployment
Configured for Netlify deployment via `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect rule ensures React Router works on all routes

Environment variables must be configured in Netlify dashboard.

## Important Patterns

### Supabase Client Usage
Import the singleton client from `lib/supabase.js`:
```javascript
import { supabase } from '../lib/supabase'
```

### Auth Context Usage
Always use the `useAuth()` hook to access auth state:
```javascript
const { user, loading, signIn, signOut } = useAuth()
```

### Photo Queries
Photos are automatically filtered by RLS policies. Query pattern:
```javascript
const { data: photos } = await supabase
  .from('photos')
  .select('*')
  .order('created_at', { ascending: false })
```

### Storage Uploads
File path pattern for uploads: `{user_id}/{timestamp}.{extension}`
Always get public URL after upload to store in database.
