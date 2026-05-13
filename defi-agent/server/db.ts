import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_KEY!

if (!url || !key) {
  console.warn('⚠️  Missing SUPABASE_URL or SUPABASE_SERVICE_KEY — DB operations will fail')
}

export const supabaseAdmin = createClient(url || 'http://localhost', key || 'demo', {
  auth: { persistSession: false },
})
