# GeoPhoto

A modern web application for uploading photos and visualizing their geolocation data on an interactive map.

## Features

- **User Authentication**: Secure signup/login powered by Supabase Auth
- **Photo Upload**: Upload images with automatic EXIF data extraction
- **GPS Extraction**: Automatically extracts GPS coordinates from photo metadata
- **Gallery View**: Beautiful grid layout showcasing your photos
- **Interactive Map**: Visualize photo locations on an OpenStreetMap-powered map
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL + Storage + Auth)
- **Maps**: React Leaflet + OpenStreetMap
- **Routing**: React Router v6
- **EXIF Parsing**: exifr
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js v20 or higher
- npm or yarn
- Supabase account
- Netlify account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd geoPhoto
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment variables template:
```bash
cp .env.example .env.local
```

4. Set up Supabase (see [SETUP.md](./SETUP.md) for detailed instructions):
   - Create a new Supabase project
   - Create a `photos` storage bucket
   - Run the SQL schema from SETUP.md
   - Copy your Project URL and anon key to `.env.local`

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173)

## Project Structure

```
geoPhoto/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── PhotoUpload.jsx  # Photo upload with EXIF parsing
│   │   ├── PhotoGallery.jsx # Photo grid display
│   │   ├── PhotoMap.jsx     # Interactive map with markers
│   │   └── ProtectedRoute.jsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.jsx  # Authentication state management
│   ├── pages/               # Page components
│   │   ├── Dashboard.jsx    # Main app dashboard
│   │   ├── Login.jsx        # Login page
│   │   └── Signup.jsx       # Signup page
│   ├── lib/                 # Utilities and configurations
│   │   └── supabase.js      # Supabase client setup
│   ├── App.jsx              # Main app with routing
│   └── main.jsx             # React app entry point
├── netlify.toml             # Netlify configuration
├── SETUP.md                 # Detailed setup guide
└── package.json
```

## Database Schema

```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  image_url TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  taken_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);
```

## Deployment

This app is configured for easy deployment on Netlify:

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy!

See [SETUP.md](./SETUP.md) for detailed deployment instructions.

## Usage

1. **Sign up** for a new account or **log in**
2. **Upload photos** that contain GPS metadata (most smartphones add this automatically)
3. View your photos in **Gallery View** or **Map View**
4. Click on map markers to see photo previews

## Notes

- Photos without GPS data will still be uploaded but won't appear on the map
- GPS coordinates are extracted from EXIF metadata
- All photos are stored securely in Supabase Storage
- Row Level Security (RLS) ensures users can only access their own photos

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
