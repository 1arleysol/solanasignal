import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import {
  generateHistoricalDecisions,
  generateX402Payments,
  generateMemoLogs,
  generatePnLChart,
  MOCK_AGENT_CONFIG,
  randomTxHash,
  randomHex,
} from '../lib/mockData'

const AgentContext = createContext(null)

const TOKENS = ['SOL', 'JUP', 'RAY', 'BONK', 'WIF', 'JTO']
const SIGNALS = ['BUY', 'HOLD', 'SELL']
const SIGNAL_WEIGHTS = [0.45, 0.35, 0.20]

const LIVE_REASONINGS = [
  "AceData SERP scan detected 47 bullish articles in last 2h. LLM analysis confirms accumulation sentiment. x402 payment 0.001 USDC sent. BUY signal with high confidence.",
  "Market neutral. AceData LLM rates sentiment 52/100. OOBE memory shows 3 consecutive HOLD signals — pattern consistent with consolidation phase. Maintaining position.",
  "Negative catalyst detected via AceData news feed: large wallet unstaking. LLM confidence 89%. x402 payment logged. Executing SELL to protect portfolio.",
  "Jupiter swap route found: optimal path through 3 pools. Kamino yield 18.4% APY available as alternative. Signal: BUY — swapping via Jupiter aggregator.",
  "OOBE on-chain memory retrieved: 7-day pattern shows strong support. AceData search confirms ecosystem growth. Confidence threshold exceeded — executing strategy.",
]

function weightedRandom(weights) {
  const r = Math.random()
  let cumulative = 0
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i]
    if (r < cumulative) return i
  }
  return weights.length - 1
}

export function AgentProvider({ children }) {
  const [isRunning, setIsRunning] = useState(false)
  const [riskLevel, setRiskLevel] = useState(5)
  const [decisions, setDecisions] = useState([])
  const [payments, setPayments] = useState([])
  const [memoLogs, setMemoLogs] = useState([])
  const [pnlChart, setPnlChart] = useState([])
  const [agentConfig, setAgentConfig] = useState(MOCK_AGENT_CONFIG)
  const [metrics, setMetrics] = useState({
    totalPnl: 247,
    totalPnlPct: 24.7,
    activePositions: 3,
    decisionsToday: 12,
    paymentsTotal: 210,
    paymentsUSDC: 0.21,
    merkleRoot: randomHex(64),
  })
  const [liveSignal, setLiveSignal] = useState(null)
  const [wsConnected, setWsConnected] = useState(false)
  const intervalRef = useRef(null)
  const wsRef = useRef(null)

  // Initialize mock data
  useEffect(() => {
    const hist = generateHistoricalDecisions(50)
    const pays = generateX402Payments(210)
    const memos = generateMemoLogs(30)
    const chart = generatePnLChart()
    setDecisions(hist)
    setPayments(pays)
    setMemoLogs(memos)
    setPnlChart(chart)
  }, [])

  // Try WebSocket connection to backend
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || ''
    const wsUrl = apiBase.replace('https://', 'wss://').replace('http://', 'ws://') + '/api/ws'
    
    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => setWsConnected(true)
      ws.onclose = () => setWsConnected(false)
      ws.onerror = () => setWsConnected(false)

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data)
          if (data.type === 'signal') {
            ingestNewSignal(data.payload)
          }
        } catch {}
      }
    } catch {}

    return () => wsRef.current?.close()
  }, [])

  const ingestNewSignal = useCallback((signal) => {
    setDecisions(prev => [signal, ...prev].slice(0, 100))
    setLiveSignal(signal)
    setMetrics(prev => ({
      ...prev,
      decisionsToday: prev.decisionsToday + 1,
      paymentsTotal: prev.paymentsTotal + 2,
      paymentsUSDC: parseFloat((prev.paymentsUSDC + 0.002).toFixed(4)),
      totalPnl: parseFloat((prev.totalPnl + (Math.random() - 0.35) * 4).toFixed(2)),
      merkleRoot: randomHex(64),
    }))

    const newPayment = {
      id: `live-pay-${Date.now()}`,
      tx_hash: randomTxHash(),
      amount: 0.001,
      currency: 'USDC',
      recipient: 'AceData1FacilitatorWaLLet7xQK9vYmT3ZzPaXmJC',
      memo: `SERP Search: ${signal.token} news`,
      query_type: `SERP Search: ${signal.token} news`,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    }
    setPayments(prev => [newPayment, ...prev])

    const newMemo = {
      id: `live-memo-${Date.now()}`,
      tx_hash: randomTxHash(),
      memo_text: `OOBE:DECISION:${signal.token}:${signal.signal}:conf=${signal.confidence}:v1`,
      program: 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
      slot: 250000000 + Math.floor(Math.random() * 10000),
      created_at: new Date().toISOString(),
    }
    setMemoLogs(prev => [newMemo, ...prev].slice(0, 50))

    setPnlChart(prev => {
      const updated = [...prev]
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        pnl: parseFloat((updated[updated.length - 1].pnl + (Math.random() - 0.35) * 4).toFixed(2)),
        trade: true,
      }
      return updated
    })
  }, [])

  // Simulate live signals every 30s when running
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    const generate = () => {
      const token = TOKENS[Math.floor(Math.random() * TOKENS.length)]
      const signalIdx = weightedRandom(SIGNAL_WEIGHTS)
      const signal = SIGNALS[signalIdx]
      const confidence = Math.floor(Math.random() * 35 + 65)
      const TOKEN_PRICES = { SOL: 185.42, JUP: 1.24, RAY: 2.87, BONK: 0.0000342, WIF: 2.15, JTO: 3.61 }
      const base = TOKEN_PRICES[token]
      const entry = base * (1 + (Math.random() - 0.5) * 0.05)
      const pnlValue = (Math.random() - 0.35) * 25

      const newDecision = {
        id: `live-${Date.now()}`,
        token,
        signal,
        confidence,
        reasoning: LIVE_REASONINGS[Math.floor(Math.random() * LIVE_REASONINGS.length)],
        action_taken: signal === 'BUY' ? 'Swap executed via Jupiter' : signal === 'SELL' ? 'Swap to USDC via Jupiter' : 'Deposited to Kamino lending pool',
        entry_price: entry,
        current_price: entry,
        pnl: pnlValue,
        pnl_pct: ((Math.random() - 0.35) * 8).toFixed(2),
        tx_hash: randomTxHash(),
        executed: confidence > 75,
        created_at: new Date().toISOString(),
      }

      ingestNewSignal(newDecision)
    }

    generate()
    intervalRef.current = setInterval(generate, 30000)

    return () => clearInterval(intervalRef.current)
  }, [isRunning, ingestNewSignal])

  const startAgent = () => {
    setIsRunning(true)
    setAgentConfig(c => ({ ...c, is_running: true }))
  }

  const pauseAgent = () => {
    setIsRunning(false)
    setAgentConfig(c => ({ ...c, is_running: false }))
  }

  const updateConfig = (updates) => {
    setAgentConfig(prev => ({
      ...prev,
      ...updates,
      personality_updated_at: new Date().toISOString(),
      merkle_root: randomHex(64),
    }))
  }

  return (
    <AgentContext.Provider value={{
      isRunning,
      riskLevel,
      setRiskLevel,
      decisions,
      payments,
      memoLogs,
      pnlChart,
      agentConfig,
      metrics,
      liveSignal,
      wsConnected,
      startAgent,
      pauseAgent,
      updateConfig,
    }}>
      {children}
    </AgentContext.Provider>
  )
}

export function useAgent() {
  const ctx = useContext(AgentContext)
  if (!ctx) throw new Error('useAgent must be used within AgentProvider')
  return ctx
}
