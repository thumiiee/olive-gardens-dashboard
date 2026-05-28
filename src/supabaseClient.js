import { createClient } from '@supabase/supabase-js'

const rawSupabaseUrl = (process.env.REACT_APP_SUPABASE_URL || '').trim()
const rawSupabaseAnonKey = (process.env.REACT_APP_SUPABASE_ANON_KEY || '').trim()

const isValidUrl = (value) => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const isSupabaseConfigured = isValidUrl(rawSupabaseUrl) && !!rawSupabaseAnonKey

export const supabaseConfigError = isSupabaseConfigured
  ? null
  : 'Supabase is not configured correctly. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env'

const supabaseUrl = isSupabaseConfigured ? rawSupabaseUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = isSupabaseConfigured ? rawSupabaseAnonKey : 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
