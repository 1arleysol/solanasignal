import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import ws from 'ws'
dotenv.config()

// Fix for Node.js < 22
;(global as any).WebSocket = ws

const url = process.env.SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_KEY!

export const supabaseAdmin = createClient(url || 'http://localhost', key || 'demo', {
  auth: { persistSession: false },
})