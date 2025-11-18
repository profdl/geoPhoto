import { createClient } from '@supabase/supabase-js'
import { mockSupabase } from './mockSupabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Use mock Supabase if environment variables are not configured
const useMock = !supabaseUrl || !supabaseAnonKey

let supabaseInstance

if (useMock) {
  console.warn('🔧 Running in MOCK MODE - data stored in localStorage')
  console.warn('📝 Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use real backend')
  supabaseInstance = mockSupabase
} else {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = supabaseInstance
export const isMockMode = useMock
