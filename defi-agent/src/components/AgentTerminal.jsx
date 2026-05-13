import { useEffect, useRef, useState } from 'react'
import { useAgent } from '../context/AgentContext'
import { format } from 'date-fns'
import { Terminal, Play, Square } from 'lucide-react'
import clsx from 'clsx'

const BOOT_SEQUENCE = [
  { delay: 0, text: '> Initializing SolanaSignal DeFi Intelligence Agent...', color: 'text-text-secondary' },
  { delay: 300, text: '> Loading OOBE (On-Chain Object Behavioral Engine)...', color: 'text-brand-purple' },
  { delay: 600, text: '> OOBE PDA: GDeFiSig9oBeXqxCHuSvhPpV3Aj7wKDhJuiMnNpK3Y4T', color: 'text-text-muted' },
  { delay: 900, text: '> Connecting to Ace Data Cloud API...', color: 'text-brand-amber' },
  { delay: 1200, text: '> x402 Micropayment facilitator ready (0.001 USDC/query)', color: 'text-brand-green' },
  { delay: 1500, text: '> Wallet connected: 7nZP2druKRfY8HwZCCt5MTBhBkKNtDsT2QvKxJwSZGkR', color: 'text-text-secondary' },
  { delay: 1800, text: '> Watchlist: SOL, JUP, RAY, BONK, WIF, JTO', color: 'text-text-secondary' },
  { delay: 2100, text: '> Jupiter Aggregator: connected ✓', color: 'text-brand-green' },
  { delay: 2400, text: '> Kamino Finance: connected ✓', color: 'text-brand-green' },
  { delay: 2700, text: '> Agent ready. Awaiting START command.', color: 'text-signal-buy' },
]

export default function AgentTerminal() {
  const { isRunning, liveSignal, startAgent, pauseAgent, decisions } = useAgent()
  const [lines, setLines] = useState([])
  const [booted, setBooted] = useState(false)
  const termRef = useRef(null)

  // Boot sequence
  useEffect(() => {
    let timers = []
    BOOT_SEQUENCE.forEach(({ delay, text, color }) => {
      timers.push(setTimeout(() => {
        setLines(prev => [...prev, { id: Date.now() + delay, text, color, ts: new Date() }])
      }, delay))
    })
    timers.push(setTimeout(() => setBooted(true), 2800))
    return () => timers.forEach(clearTimeout)
  }, [])

  // Add lines on new signal
  useEffect(() => {
    if (!liveSignal) return
    const ts = format(new Date(), 'HH:mm:ss')
    const newLines = [
      { id: Date.now() + 1, text: `[${ts}] > AceData SERP query: "${liveSignal.token} DeFi news"`, color: 'text-brand-amber' },
      { id: Date.now() + 2, text: `[${ts}] > x402 payment: 0.001 USDC → AceData1FacilitatorWaLLet…`, color: 'text-text-muted' },
      { id: Date.now() + 3, text: `[${ts}] > LLM analysis complete. Confidence: ${liveSignal.confidence}%`, color: 'text-brand-purple' },
      { id: Date.now() + 4, text: `[${ts}] > Signal generated: ${liveSignal.signal} ${liveSignal.token} @ $${parseFloat(liveSignal.entry_price).toFixed(4)}`, color: liveSignal.signal === 'BUY' ? 'text-signal-buy' : liveSignal.signal === 'SELL' ? 'text-signal-sell' : 'text-brand-amber' },
      { id: Date.now() + 5, text: `[${ts}] > OOBE on-chain memo written. TX: ${liveSignal.tx_hash.slice(0, 20)}…`, color: 'text-text-secondary' },
      ...(liveSignal.executed ? [{ id: Date.now() + 6, text: `[${ts}] > ACTION: ${liveSignal.action_taken}`, color: 'text-signal-buy' }] : []),
    ]
    setLines(prev => [...prev, ...newLines].slice(-80))
  }, [liveSignal])

  // Status change lines
  useEffect(() => {
    if (!booted) return
    const ts = format(new Date(), 'HH:mm:ss')
    if (isRunning) {
      setLines(prev => [
        ...prev,
        { id: Date.now(), text: `[${ts}] > ===== AGENT STARTED =====`, color: 'text-signal-buy' },
        { id: Date.now() + 1, text: `[${ts}] > Cycle interval: 30s | Tokens: SOL, JUP, RAY, BONK, WIF, JTO`, color: 'text-text-secondary' },
      ])
    } else {
      setLines(prev => [
        ...prev,
        { id: Date.now(), text: `[${ts}] > ===== AGENT PAUSED =====`, color: 'text-signal-sell' },
      ])
    }
  }, [isRunning])

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight
    }
  }, [lines])

  return (
    <div className="card overflow-hidden">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-bg-elevated">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-signal-sell/80" />
            <div className="w-3 h-3 rounded-full bg-brand-amber/80" />
            <div className="w-3 h-3 rounded-full bg-signal-buy/80" />
          </div>
          <Terminal className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-xs font-mono text-text-muted">solana-signal-agent.log</span>
        </div>

        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={pauseAgent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-signal-sell/15 hover:bg-signal-sell/25 text-signal-sell text-xs font-semibold border border-signal-sell/30 transition-all"
            >
              <Square className="w-3 h-3" strokeWidth={2.5} />
              PAUSE
            </button>
          ) : (
            <button
              onClick={startAgent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-signal-buy/15 hover:bg-signal-buy/25 text-signal-buy text-xs font-semibold border border-signal-buy/30 transition-all"
            >
              <Play className="w-3 h-3" strokeWidth={2.5} fill="currentColor" />
              START
            </button>
          )}
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={termRef}
        className="h-64 overflow-y-auto p-4 font-mono text-xs space-y-0.5 bg-[#0D0F13]"
      >
        {lines.map(line => (
          <div key={line.id} className={clsx('leading-relaxed', line.color)}>
            <span className="text-text-muted select-none">{line.id} </span>
            {line.text}
          </div>
        ))}
        {isRunning && (
          <div className="text-signal-buy">
            {'> '}
            <span className="animate-blink">█</span>
          </div>
        )}
      </div>
    </div>
  )
}
