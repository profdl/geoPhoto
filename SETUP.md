# GeoPhoto Setup Guide

This guide will help you set up the GeoPhoto application with Supabase and Netlify.

## Prerequisites

- Node.js (v20+)
- npm or yarn
- Supabase account
- Netlify account (for deployment)

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details and wait for it to provision

### 2. Configure Storage

1. In your Supabase dashboard, go to **Storage**
2. Click "New bucket"
3. Name it `photos`
4. Set it to **Public** (or Private if you want URL-based access control)
5. Click "Create bucket"

### 3. Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Run the following SQL:

```sql
-- Create photos table
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  taken_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own photos
CREATE POLICY "Users can view own photos"
  ON photos FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own photos
CREATE POLICY "Users can insert own photos"
  ON photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own photos
CREATE POLICY "Users can update own photos"
  ON photos FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own photos
CREATE POLICY "Users can delete own photos"
  ON photos FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);
```

### 4. Configure Authentication

1. Go to **Authentication** > **Providers** in your Supabase dashboard
2. Enable **Email** provider (enabled by default)
3. Optionally enable other providers (Google, GitHub, etc.)
4. Configure email templates if desired

### 5. Get Your API Keys

1. Go to **Settings** > **API**
2. Copy your `Project URL` and `anon/public` key
3. Add them to `.env.local`:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173)

## Netlify Deployment

### 1. Connect Your Repository

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "Add new site" > "Import an existing project"
4. Connect your GitHub repository

### 2. Configure Build Settings

- Build command: `npm run build`
- Publish directory: `dist`

### 3. Set Environment Variables

In Netlify dashboard > Site settings > Environment variables, add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 4. Deploy

Click "Deploy site" - Netlify will build and deploy your app automatically on every push to your main branch.

## Features Roadmap

- ✅ User authentication (signup/login)
- ✅ Photo upload with EXIF parsing
- ✅ Extract GPS coordinates from photos
- ✅ Display photos in gallery view
- ✅ Interactive map with photo markers
- 🔄 Photo details modal
- 🔄 Filter photos by date/location
- 🔄 Clustering for many markers
