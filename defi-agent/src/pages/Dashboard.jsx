import { useEffect, useState } from 'react'
import { DollarSign, Activity, Zap, TrendingUp, Brain, CreditCard, Play, Square, RefreshCw } from 'lucide-react'
import MetricCard from '../components/MetricCard'
import LiveSignalFeed from '../components/LiveSignalFeed'
import PnLChart from '../components/PnLChart'
import AgentTerminal from '../components/AgentTerminal'
import SignalBadge from '../components/SignalBadge'
import { useAgent } from '../context/AgentContext'
import clsx from 'clsx'
import { format } from 'date-fns'

function TokenPriceStrip() {
  const TOKEN_DATA = [
    { sym: 'SOL', price: 185.42, change: 2.14 },
    { sym: 'JUP', price: 1.24, change: -0.82 },
    { sym: 'RAY', price: 2.87, change: 5.31 },
    { sym: 'BONK', price: 0.0000342, change: 12.4 },
    { sym: 'WIF', price: 2.15, change: -1.8 },
    { sym: 'JTO', price: 3.61, change: 3.72 },
  ]

  return (
    <div className="card p-3 overflow-x-auto">
      <div className="flex items-center gap-4 min-w-max">
        {TOKEN_DATA.map(t => (
          <div key={t.sym} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-border-subtle">
            <span className="text-xs font-bold text-text-primary">{t.sym}</span>
            <span className="text-xs font-mono text-text-secondary">${t.price < 0.001 ? t.price.toFixed(7) : t.price.toFixed(2)}</span>
            <span className={clsx('text-xs font-semibold', t.change >= 0 ? 'text-signal-buy' : 'text-signal-sell')}>
              {t.change >= 0 ? '+' : ''}{t.change.toFixed(1)}%
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <RefreshCw className="w-3 h-3" />
          <span>Simulated prices</span>
        </div>
      </div>
    </div>
  )
}

function LiveSignalFlash({ signal }) {
  if (!signal) return null
  return (
    <div className="card-elevated p-4 border border-brand-green/30 glow-green animate-slide-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-signal-buy animate-pulse" />
          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Latest Signal</span>
          <span className="text-xs text-text-muted">{format(new Date(signal.created_at), 'HH:mm:ss')}</span>
        </div>
        <SignalBadge signal={signal.signal} />
      </div>
      <div className="mt-2 flex items-center gap-4">
        <span className="font-bold text-text-primary text-lg">{signal.token}</span>
        <span className="text-sm text-text-secondary">Confidence: <span className="text-brand-purpleLight font-semibold">{signal.confidence}%</span></span>
        {signal.executed && <span className="text-xs text-signal-buy border border-signal-buy/30 px-2 py-0.5 rounded-full">Executed</span>}
      </div>
      <p className="text-xs text-text-muted mt-2 leading-relaxed line-clamp-2">{signal.reasoning}</p>
    </div>
  )
}

export default function Dashboard() {
  const { metrics, isRunning, liveSignal, startAgent, pauseAgent, decisions, payments } = useAgent()
  const [pulseMetrics, setPulseMetrics] = useState(false)

  useEffect(() => {
    if (liveSignal) {
      setPulseMetrics(true)
      setTimeout(() => setPulseMetrics(false), 1000)
    }
  }, [liveSignal])

  const buyCount = decisions.filter(d => d.signal === 'BUY').length
  const sellCount = decisions.filter(d => d.signal === 'SELL').length
  const holdCount = decisions.filter(d => d.signal === 'HOLD').length
  const winRate = decisions.length > 0
    ? Math.round((decisions.filter(d => parseFloat(d.pnl_pct) > 0).length / decisions.length) * 100)
    : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Agent Dashboard</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Autonomous DeFi intelligence on Solana — OOBE × Ace Data × x402
          </p>
        </div>
        <button
          onClick={isRunning ? pauseAgent : startAgent}
          className={clsx(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all',
            isRunning
              ? 'bg-signal-sell/15 hover:bg-signal-sell/25 text-signal-sell border border-signal-sell/30'
              : 'bg-signal-buy/15 hover:bg-signal-buy/25 text-signal-buy border border-signal-buy/30 glow-green'
          )}
        >
          {isRunning
            ? <><Square className="w-4 h-4" strokeWidth={2.5} /> Pause Agent</>
            : <><Play className="w-4 h-4" strokeWidth={2.5} fill="currentColor" /> Start Agent</>
          }
        </button>
      </div>

      {/* Token Prices */}
      <TokenPriceStrip />

      {/* Live Signal Flash */}
      {liveSignal && <LiveSignalFlash signal={liveSignal} />}

      {/* Metrics Grid */}
      <div className={clsx('grid grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity', pulseMetrics && 'opacity-80')}>
        <MetricCard
          title="Total P&L"
          value={`+$${metrics.totalPnl.toFixed(0)}`}
          subtitle={`${metrics.totalPnlPct.toFixed(1)}% return`}
          icon={DollarSign}
          color="green"
          trend={8.3}
        />
        <MetricCard
          title="Decisions Today"
          value={metrics.decisionsToday}
          subtitle={`${buyCount} buy · ${holdCount} hold · ${sellCount} sell`}
          icon={Brain}
          color="purple"
        />
        <MetricCard
          title="x402 Payments"
          value={metrics.paymentsTotal}
          subtitle={`$${metrics.paymentsUSDC.toFixed(3)} USDC spent`}
          icon={CreditCard}
          color="amber"
        />
        <MetricCard
          title="Win Rate"
          value={`${winRate}%`}
          subtitle={`${decisions.length} total trades`}
          icon={TrendingUp}
          color={winRate >= 55 ? 'green' : winRate >= 45 ? 'amber' : 'red'}
        />
      </div>

      {/* Charts + Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PnLChart />
        <AgentTerminal />
      </div>

      {/* Signal Breakdown + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Signal Distribution */}
        <div className="card p-4 space-y-3">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">Signal Distribution</div>
          {[
            { label: 'BUY', count: buyCount, pct: decisions.length ? (buyCount / decisions.length) * 100 : 0, color: 'bg-signal-buy' },
            { label: 'HOLD', count: holdCount, pct: decisions.length ? (holdCount / decisions.length) * 100 : 0, color: 'bg-brand-amber' },
            { label: 'SELL', count: sellCount, pct: decisions.length ? (sellCount / decisions.length) * 100 : 0, color: 'bg-signal-sell' },
          ].map(({ label, count, pct, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-text-secondary">{label}</span>
                <span className="text-text-muted font-mono">{count} ({pct.toFixed(0)}%)</span>
              </div>
              <div className="h-2 bg-border-subtle rounded-full overflow-hidden">
                <div className={clsx('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}

          <div className="pt-2 border-t border-border-subtle space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">OOBE Merkle Root</span>
              <span className="text-brand-purple font-mono">{metrics.merkleRoot?.slice(0, 12)}…</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Agent Personality</span>
              <span className="text-brand-green font-medium">Balanced</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Active Positions</span>
              <span className="text-text-primary font-semibold">{metrics.activePositions}</span>
            </div>
          </div>
        </div>

        {/* Signal Feed */}
        <div className="lg:col-span-2">
          <LiveSignalFeed limit={10} />
        </div>
      </div>

      {/* Technology Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 border-l-2 border-brand-purple">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-brand-purpleLight" />
            <span className="text-sm font-semibold text-text-primary">OOBE Protocol</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            On-Chain Object Behavioral Engine stores agent personality as a Solana PDA. Every decision updates the on-chain Merkle root, creating an immutable memory of agent behavior.
          </p>
          <div className="mt-3 text-xs font-mono text-brand-purple bg-brand-purple/10 px-2 py-1 rounded">
            PDA: GDeFi…K3Y4T
          </div>
        </div>

        <div className="card p-4 border-l-2 border-brand-amber">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-brand-amber" />
            <span className="text-sm font-semibold text-text-primary">Ace Data Cloud</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Real-time SERP data and LLM analysis via the Ace Data Cloud API. Monitors news, sentiment, and on-chain metrics for each token in the watchlist every cycle.
          </p>
          <div className="mt-3 text-xs font-mono text-brand-amber bg-brand-amber/10 px-2 py-1 rounded">
            {payments.length} queries executed
          </div>
        </div>

        <div className="card p-4 border-l-2 border-brand-green">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-brand-green" />
            <span className="text-sm font-semibold text-text-primary">x402 Micropayments</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Every data query is paid for autonomously via x402 HTTP micropayments at 0.001 USDC/request. The agent self-funds its intelligence via its on-chain wallet.
          </p>
          <div className="mt-3 text-xs font-mono text-brand-green bg-brand-green/10 px-2 py-1 rounded">
            ${(payments.length * 0.001).toFixed(3)} USDC total
          </div>
        </div>
      </div>
    </div>
  )
}
