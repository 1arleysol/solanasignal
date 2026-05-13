import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { History as HistoryIcon, Filter, ExternalLink, TrendingUp, TrendingDown, Minus, Search } from 'lucide-react'
import { useAgent } from '../context/AgentContext'
import SignalBadge from '../components/SignalBadge'
import clsx from 'clsx'

function StatCard({ label, value, sub, color = 'text-text-primary' }) {
  return (
    <div className="card p-4">
      <div className="text-xs text-text-muted mb-1">{label}</div>
      <div className={clsx('text-xl font-bold', color)}>{value}</div>
      {sub && <div className="text-xs text-text-muted mt-0.5">{sub}</div>}
    </div>
  )
}

export default function History() {
  const { decisions, payments } = useAgent()
  const [signalFilter, setSignalFilter] = useState('ALL')
  const [tokenFilter, setTokenFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const PER_PAGE = 15

  const tokens = useMemo(() => {
    const set = new Set(decisions.map(d => d.token))
    return ['ALL', ...Array.from(set)]
  }, [decisions])

  const filtered = useMemo(() => {
    return decisions.filter(d => {
      if (signalFilter !== 'ALL' && d.signal !== signalFilter) return false
      if (tokenFilter !== 'ALL' && d.token !== tokenFilter) return false
      if (search && !d.token.toLowerCase().includes(search.toLowerCase()) && !d.action_taken?.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [decisions, signalFilter, tokenFilter, search])

  const paginated = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  const totalPnl = decisions.reduce((acc, d) => acc + (parseFloat(d.pnl) || 0), 0)
  const winCount = decisions.filter(d => parseFloat(d.pnl) > 0).length
  const lossCount = decisions.filter(d => parseFloat(d.pnl) < 0).length
  const winRate = decisions.length > 0 ? ((winCount / decisions.length) * 100).toFixed(0) : 0
  const executedCount = decisions.filter(d => d.executed).length

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Decision History</h1>
        <p className="text-sm text-text-muted mt-0.5">Full log of agent decisions, signals, and execution results.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Decisions" value={decisions.length} sub="all time" />
        <StatCard
          label="Total P&L"
          value={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`}
          color={totalPnl >= 0 ? 'text-signal-buy' : 'text-signal-sell'}
        />
        <StatCard label="Win Rate" value={`${winRate}%`} sub={`${winCount}W / ${lossCount}L`} color={winRate >= 50 ? 'text-signal-buy' : 'text-signal-sell'} />
        <StatCard label="Executed" value={executedCount} sub={`${((executedCount / Math.max(decisions.length, 1)) * 100).toFixed(0)}% of signals`} color="text-brand-purpleLight" />
        <StatCard label="x402 Payments" value={payments.length} sub={`$${(payments.length * 0.001).toFixed(3)} USDC`} color="text-brand-amber" />
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search token or action…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg pl-8 pr-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-purple"
            />
          </div>

          {/* Signal filter */}
          <div className="flex gap-1.5">
            {['ALL', 'BUY', 'HOLD', 'SELL'].map(s => (
              <button
                key={s}
                onClick={() => { setSignalFilter(s); setPage(0) }}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                  signalFilter === s
                    ? s === 'BUY' ? 'badge-buy' : s === 'SELL' ? 'badge-sell' : s === 'HOLD' ? 'badge-hold' : 'bg-brand-purple/20 text-brand-purpleLight border-brand-purple/40'
                    : 'bg-border-subtle text-text-muted border-border-subtle hover:border-border-muted'
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Token filter */}
          <select
            value={tokenFilter}
            onChange={e => { setTokenFilter(e.target.value); setPage(0) }}
            className="bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-purple"
          >
            {tokens.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <div className="text-xs text-text-muted ml-auto">{filtered.length} results</div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-elevated">
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Token</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Signal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Confidence</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Entry</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">P&L</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Tx</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {paginated.map(d => {
                const pnl = parseFloat(d.pnl)
                const pnlPct = parseFloat(d.pnl_pct)
                const isPos = pnl >= 0
                return (
                  <tr key={d.id} className="hover:bg-border-subtle/30 transition-colors">
                    <td className="px-4 py-3 text-xs text-text-muted font-mono whitespace-nowrap">
                      {format(new Date(d.created_at), 'MMM d HH:mm')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-text-primary">{d.token}</span>
                    </td>
                    <td className="px-4 py-3">
                      <SignalBadge signal={d.signal} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-border-subtle rounded-full overflow-hidden">
                          <div
                            className={clsx('h-full rounded-full', d.confidence >= 80 ? 'bg-signal-buy' : d.confidence >= 65 ? 'bg-brand-amber' : 'bg-signal-sell')}
                            style={{ width: `${d.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-text-secondary">{d.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      {d.action_taken || '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-text-secondary">
                      ${d.entry_price < 0.001 ? parseFloat(d.entry_price).toFixed(7) : parseFloat(d.entry_price).toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className={clsx('font-mono text-xs font-semibold', isPos ? 'text-signal-buy' : 'text-signal-sell')}>
                        {isPos ? '+' : ''}${pnl.toFixed(2)}
                      </div>
                      <div className={clsx('text-xs', isPos ? 'text-signal-buy/70' : 'text-signal-sell/70')}>
                        {isPos ? '+' : ''}{pnlPct}%
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {d.tx_hash ? (
                        <a
                          href={`https://solscan.io/tx/${d.tx_hash}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-brand-purpleLight hover:text-brand-purple text-xs font-mono transition-colors"
                        >
                          {d.tx_hash.slice(0, 6)}…
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                )
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-text-muted text-sm">
                    No decisions match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
            <span className="text-xs text-text-muted">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 rounded-lg text-xs bg-border-subtle text-text-secondary disabled:opacity-40 hover:bg-border-muted transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 rounded-lg text-xs bg-border-subtle text-text-secondary disabled:opacity-40 hover:bg-border-muted transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
