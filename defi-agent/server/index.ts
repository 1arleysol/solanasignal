import Fastify from 'fastify'
import cors from '@fastify/cors'
import websocket from '@fastify/websocket'
import { agentLoop } from './agent'
import { supabaseAdmin } from './db'

const app = Fastify({ logger: false })

await app.register(cors, { origin: true })
await app.register(websocket)

// WebSocket clients set
const clients = new Set<any>()

export function broadcast(data: object) {
  const msg = JSON.stringify(data)
  clients.forEach(c => { try { c.send(msg) } catch {} })
}

// WebSocket endpoint
app.register(async (fastify) => {
  fastify.get('/api/ws', { websocket: true }, (socket) => {
    clients.add(socket)
    socket.send(JSON.stringify({ type: 'connected', message: 'SolanaSignal agent connected' }))
    socket.on('close', () => clients.delete(socket))
  })
})

// Agent control
app.post('/api/agent/start', async (req, reply) => {
  agentLoop.start(broadcast)
  return { status: 'started' }
})

app.post('/api/agent/stop', async (req, reply) => {
  agentLoop.stop()
  return { status: 'stopped' }
})

app.get('/api/agent/status', async () => ({
  running: agentLoop.isRunning(),
  cycleCount: agentLoop.getCycleCount(),
}))

// Decisions history from Supabase
app.get('/api/decisions', async (req: any) => {
  const { limit = 50, offset = 0 } = req.query
  const { data, error } = await supabaseAdmin
    .from('decisions')
    .select('*')
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1)
  if (error) return { data: [], error: error.message }
  return { data }
})

// x402 payments history
app.get('/api/payments', async (req: any) => {
  const { limit = 100 } = req.query
  const { data, error } = await supabaseAdmin
    .from('x402_payments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Number(limit))
  if (error) return { data: [], error: error.message }
  return { data }
})

// Memo logs
app.get('/api/memos', async (req: any) => {
  const { limit = 30 } = req.query
  const { data, error } = await supabaseAdmin
    .from('memo_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Number(limit))
  if (error) return { data: [], error: error.message }
  return { data }
})

// Health check
app.get('/api/health', async () => ({
  ok: true,
  timestamp: new Date().toISOString(),
  env: {
    acedata: !!process.env.ACEDATA_API_KEY,
    supabase: !!process.env.SUPABASE_SERVICE_KEY,
    solana: !!process.env.AGENT_WALLET_PRIVATE_KEY,
  }
}))

const port = Number(process.env.PORT) || 3001
await app.listen({ port, host: '0.0.0.0' })
console.log(`✅ SolanaSignal server running on port ${port}`)
