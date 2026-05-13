import { useEffect, useRef, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useAgent } from '../context/AgentContext'
import SignalBadge from './SignalBadge'
import clsx from 'clsx'
import { ChevronDown, ChevronUp, Activity } from 'lucide-react'

function ConfidenceBar({ value }) {
  const color = value >= 80 ? 'bg-signal-buy' : value >= 65 ? 'bg-brand-amber' : 'bg-signal-sell'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-border-subtle rounded-full overflow-hidden">
        <div className={clsx('h-full rounded-full transition-all', color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-mono text-text-secondary w-8 text-right">{value}%</span>
    </div>
  )
}

function DecisionRow({ decision, isNew }) {
  const [expanded, setExpanded] = useState(false)
  const isPositive = parseFloat(decision.pnl_pct) >= 0

  return (
    <div
      className={clsx(
        'border-b border-border-subtle last:border-b-0 transition-all duration-300',
        isNew && 'animate-slide-in bg-brand-green/5'
      )}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-border-subtle/50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Token */}
        <div className="w-10 h-10 rounded-lg bg-border-subtle flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-text-primary">{decision.token.slice(0, 3)}</span>
        </div>

        {/* Signal */}
        <div className="flex-shrink-0">
          <SignalBadge signal={decision.signal} />
        </div>

        {/* Token name + confidence */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-text-primary">{decision.token}</span>
            {decision.executed && (
              <span className="text-xs text-brand-green font-medium">executed</span>
            )}
          </div>
          <ConfidenceBar value={decision.confidence} />
        </div>

        {/* PnL */}
        <div className="text-right flex-shrink-0">
          <div className={clsx('text-sm font-semibold', isPositive ? 'text-signal-buy' : 'text-signal-sell')}>
            {isPositive ? '+' : ''}{parseFloat(decision.pnl_pct)}%
          </div>
          <div className="text-xs text-text-muted">
            {formatDistanceToNow(new Date(decision.created_at), { addSuffix: true })}
          </div>
        </div>

        {/* Expand */}
        <div className="text-text-muted flex-shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Reasoning */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          <div className="p-3 rounded-lg bg-bg-elevated border border-border-subtle">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Agent Reasoning</div>
            <p className="text-sm text-text-secondary leading-relaxed">{decision.reasoning}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {decision.action_taken && (
              <div className="p-2 rounded-lg bg-border-subtle">
                <span className="text-text-muted block mb-0.5">Action</span>
                <span className="text-text-primary font-medium">{decision.action_taken}</span>
              </div>
            )}
            {decision.entry_price && (
              <div className="p-2 rounded-lg bg-border-subtle">
                <span className="text-text-muted block mb-0.5">Entry Price</span>
                <span className="text-text-primary font-mono">${parseFloat(decision.entry_price).toFixed(4)}</span>
              </div>
            )}
            {decision.pnl != null && (
              <div className="p-2 rounded-lg bg-border-subtle">
                <span className="text-text-muted block mb-0.5">P&L</span>
                <span className={clsx('font-mono font-semibold', parseFloat(decision.pnl) >= 0 ? 'text-signal-buy' : 'text-signal-sell')}>
                  {parseFloat(decision.pnl) >= 0 ? '+' : ''}${parseFloat(decision.pnl).toFixed(2)}
                </span>
              </div>
            )}
            {decision.tx_hash && (
              <div className="p-2 rounded-lg bg-border-subtle">
                <span className="text-text-muted block mb-0.5">Tx Hash</span>
                <span className="text-brand-purpleLight font-mono">{decision.tx_hash.slice(0, 8)}…</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LiveSignalFeed({ limit = 20 }) {
  const { decisions, liveSignal, isRunning } = useAgent()
  const [newId, setNewId] = useState(null)
  const feedRef = useRef(null)

  useEffect(() => {
    if (liveSignal) {
      setNewId(liveSignal.id)
      setTimeout(() => setNewId(null), 3000)
    }
  }, [liveSignal])

  const visible = decisions.slice(0, limit)

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-green" />
          <span className="font-semibold text-text-primary">Signal Feed</span>
          {isRunning && <span className="live-dot ml-1" />}
        </div>
        <span className="text-xs text-text-muted">{visible.length} decisions</span>
      </div>

      <div ref={feedRef} className="divide-y divide-border-subtle max-h-[500px] overflow-y-auto">
        {visible.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-sm">
            No signals yet. Start the agent to begin generating decisions.
          </div>
        ) : (
          visible.map(d => (
            <DecisionRow key={d.id} decision={d} isNew={d.id === newId} />
          ))
        )}
      </div>
    </div>
  )
}
