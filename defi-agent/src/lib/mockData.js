import { subDays, subMinutes, subHours, format } from 'date-fns'

const TOKENS = ['SOL', 'JUP', 'RAY', 'BONK', 'WIF', 'JTO']
const SIGNALS = ['BUY', 'HOLD', 'SELL']

const TOKEN_PRICES = {
  SOL: 185.42,
  JUP: 1.24,
  RAY: 2.87,
  BONK: 0.0000342,
  WIF: 2.15,
  JTO: 3.61,
}

const REASONINGS = [
  "Bullish momentum detected across Solana ecosystem. Multiple news outlets reporting increased institutional interest. On-chain data shows accumulation pattern. High confidence BUY signal triggered.",
  "Market sentiment neutral. Price action consolidating near key support levels. Volume below 30-day average. Recommend holding current position and monitoring for breakout confirmation.",
  "Bearish divergence detected on 4H chart. Whale wallets showing distribution pattern. Social sentiment turning negative after recent protocol vulnerability disclosure. Reducing exposure.",
  "Strong DeFi TVL growth on Solana. Jupiter aggregator volume hitting all-time highs. Token fundamentals solid with upcoming governance catalyst. BUY signal with high conviction.",
  "Macro uncertainty affecting crypto markets broadly. Risk-off sentiment dominant. Despite strong fundamentals, external pressure warrants cautious approach. Hold and reassess in 1h.",
  "Positive news catalyst detected: major CEX listing announcement imminent. Volume spike +340% in last 2h. Momentum indicators strongly bullish. Executing BUY with urgency.",
  "Liquidity analysis shows thin order book above resistance. Smart money outflow detected via on-chain metrics. News sentiment negative after team token unlock. Sell to protect gains.",
  "Yield farming opportunity identified on Kamino with 23% APY. Low market risk profile. Allocating to earn passive yield while awaiting clearer directional signal.",
  "Breaking: Solana DeFi protocol announces $50M ecosystem fund. Token price up 18% in last hour. Positive momentum building. BUY signal confirmed on multiple timeframes.",
  "Solana network congestion metrics normalized. TPS hitting new highs post-upgrade. Ecosystem bullish but specific token showing weakness vs SOL pair. Hold recommended.",
]

const ACTIONS = {
  BUY: ['Swap executed via Jupiter', 'Long position opened', 'DCA purchase completed', 'Spot buy executed'],
  HOLD: ['Deposited to Kamino lending pool', 'Position maintained', 'Yield farming activated', 'Monitoring position'],
  SELL: ['Swap to USDC via Jupiter', 'Position closed', 'Profit taken', 'Stop-loss triggered'],
}

function randomTxHash() {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let hash = ''
  for (let i = 0; i < 88; i++) hash += chars[Math.floor(Math.random() * chars.length)]
  return hash
}

function randomHex(len = 64) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

function seededRandom(seed) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

export function generateHistoricalDecisions(count = 50) {
  const decisions = []
  for (let i = 0; i < count; i++) {
    const seed = i * 17 + 3
    const token = TOKENS[Math.floor(seededRandom(seed) * TOKENS.length)]
    const signal = SIGNALS[Math.floor(seededRandom(seed + 1) * SIGNALS.length)]
    const confidence = Math.floor(seededRandom(seed + 2) * 40 + 60)
    const basePrice = TOKEN_PRICES[token]
    const entryPrice = basePrice * (1 + (seededRandom(seed + 3) - 0.5) * 0.1)
    const priceChange = (seededRandom(seed + 4) - 0.4) * 0.15
    const currentPrice = entryPrice * (1 + priceChange)
    const pnl = signal === 'BUY'
      ? (currentPrice - entryPrice) * 50
      : signal === 'SELL'
        ? (entryPrice - currentPrice) * 50
        : seededRandom(seed + 5) * 8 - 2
    const hoursAgo = i * 3.2 + seededRandom(seed + 6) * 2
    const actionList = ACTIONS[signal]
    
    decisions.push({
      id: `mock-${i}-${seed}`,
      token,
      signal,
      confidence,
      reasoning: REASONINGS[i % REASONINGS.length],
      action_taken: actionList[Math.floor(seededRandom(seed + 7) * actionList.length)],
      entry_price: entryPrice,
      current_price: currentPrice,
      pnl: pnl,
      pnl_pct: (priceChange * 100).toFixed(2),
      tx_hash: randomTxHash(),
      executed: confidence > 75,
      created_at: subHours(new Date(), hoursAgo).toISOString(),
    })
  }
  return decisions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export function generateX402Payments(count = 210) {
  const payments = []
  const queryTypes = ['SERP Search: SOL news', 'LLM Analysis: SOL signal', 'SERP Search: JUP news', 'LLM Analysis: JUP signal', 'SERP Search: RAY news', 'LLM Analysis: RAY signal', 'SERP Search: BONK news', 'LLM Analysis: BONK signal', 'SERP Search: WIF news', 'LLM Analysis: WIF signal']
  
  for (let i = 0; i < count; i++) {
    const seed = i * 13 + 7
    const hoursAgo = i * 0.8 + seededRandom(seed) * 0.3
    payments.push({
      id: `pay-${i}-${seed}`,
      tx_hash: randomTxHash(),
      amount: 0.001,
      currency: 'USDC',
      recipient: 'AceData1FacilitatorWaLLet7xQK9vYmT3ZzPaXmJC',
      memo: queryTypes[i % queryTypes.length],
      query_type: queryTypes[i % queryTypes.length],
      status: 'confirmed',
      created_at: subHours(new Date(), hoursAgo).toISOString(),
    })
  }
  return payments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export function generateMemoLogs(count = 30) {
  const logs = []
  const memoTypes = [
    (t, s, c) => `OOBE:DECISION:${t}:${s}:conf=${c}:v1`,
    (t, s, c) => `SS:SIGNAL:${t}:${s}:${c}pct`,
    (t, s, c) => `x402:PAY:0.001USDC:AceData:query=${t}`,
    (t, s, c) => `OOBE:MERKLE:UPDATE:leaf=${randomHex(8)}`,
    (t, s, c) => `SS:EXECUTE:${s}:${t}:jupiter_swap`,
  ]
  
  for (let i = 0; i < count; i++) {
    const seed = i * 11 + 5
    const token = TOKENS[Math.floor(seededRandom(seed) * TOKENS.length)]
    const signal = SIGNALS[Math.floor(seededRandom(seed + 1) * SIGNALS.length)]
    const conf = Math.floor(seededRandom(seed + 2) * 40 + 60)
    const memoFn = memoTypes[Math.floor(seededRandom(seed + 3) * memoTypes.length)]
    
    logs.push({
      id: `memo-${i}`,
      tx_hash: randomTxHash(),
      memo_text: memoFn(token, signal, conf),
      program: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
      slot: 250000000 + i * 1200 + Math.floor(seededRandom(seed + 4) * 500),
      created_at: subMinutes(new Date(), i * 10 + seededRandom(seed) * 5).toISOString(),
    })
  }
  return logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export function generatePnLChart() {
  const points = []
  let pnl = 1000
  const now = new Date()
  for (let i = 23; i >= 0; i--) {
    const seed = i * 7 + 2
    const delta = (seededRandom(seed) - 0.35) * 22
    pnl = Math.max(900, pnl + delta)
    const tradeExecuted = seededRandom(seed + 1) > 0.7
    points.push({
      time: format(subHours(now, i), 'HH:mm'),
      pnl: parseFloat(pnl.toFixed(2)),
      trade: tradeExecuted,
    })
  }
  // End at target
  points[points.length - 1].pnl = 1247
  return points
}

export const MOCK_AGENT_CONFIG = {
  id: 'config-1',
  risk_tolerance: 'balanced',
  max_position_usdc: 500,
  tokens_watchlist: ['SOL', 'JUP', 'RAY', 'BONK', 'WIF', 'JTO'],
  auto_execute: false,
  daily_budget_usdc: 1.0,
  agent_wallet: '7nZP2druKRfY8HwZCCt5MTBhBkKNtDsT2QvKxJwSZGkR',
  oobe_pda: 'GDeFiSig9oBeXqxCHuSvhPpV3Aj7wKDhJuiMnNpK3Y4T',
  merkle_root: randomHex(64),
  personality_updated_at: subDays(new Date(), 1).toISOString(),
  is_running: false,
}

export { randomTxHash, randomHex }
