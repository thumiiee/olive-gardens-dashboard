import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'sb_publishable__Pa8YP_a1CpGTQsG5IILyA_evQwgAAf'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrZ2VkeWl3Y3Rvdnhud2lqZHpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNTkzNDMsImV4cCI6MjA5NDgzNTM0M30.XQVw-mvx9kraASdXiGi4ZjweVvexnHzNBLtdTjbXMPQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
