import { useState } from 'react'
import { format } from 'date-fns'
import { Link2, ExternalLink, Zap, CreditCard, Brain, Copy, Check } from 'lucide-react'
import { useAgent } from '../context/AgentContext'
import clsx from 'clsx'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button onClick={handleCopy} className="p-1 rounded hover:bg-border-subtle transition-colors text-text-muted hover:text-text-secondary">
      {copied ? <Check className="w-3.5 h-3.5 text-signal-buy" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

function TxRow({ tx_hash, memo, label, amount, timestamp, program, slot }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3 border-b border-border-subtle last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs text-brand-purpleLight">
            {tx_hash.slice(0, 14)}…{tx_hash.slice(-6)}
          </span>
          <CopyButton text={tx_hash} />
          <a
            href={`https://solscan.io/tx/${tx_hash}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-brand-purpleLight transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="text-xs text-text-muted font-mono bg-border-subtle px-2 py-1 rounded truncate">
          {memo}
        </div>
        {program && (
          <div className="text-xs text-text-muted mt-1">
            Program: <span className="text-text-secondary font-mono">{program.slice(0, 20)}…</span>
          </div>
        )}
        {slot && (
          <div className="text-xs text-text-muted mt-0.5">
            Slot: <span className="text-text-secondary font-mono">{slot.toLocaleString()}</span>
          </div>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        {amount && <div className="text-xs font-semibold text-brand-amber">{amount} USDC</div>}
        <div className="text-xs text-text-muted mt-0.5">
          {format(new Date(timestamp), 'HH:mm:ss')}
        </div>
        <div className="mt-1">
          <span className="text-xs text-signal-buy bg-signal-buy/10 px-1.5 py-0.5 rounded font-medium">confirmed</span>
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'px-4 py-2 rounded-lg text-sm font-medium transition-all',
        active ? 'bg-brand-purple/20 text-brand-purpleLight border border-brand-purple/40' : 'text-text-muted hover:text-text-secondary'
      )}
    >
      {children}
    </button>
  )
}

export default function OnChain() {
  const { payments, memoLogs, agentConfig, metrics } = useAgent()
  const [tab, setTab] = useState('memo')
  const [page, setPage] = useState(0)
  const PER_PAGE = 20

  const data = tab === 'memo' ? memoLogs : payments
  const totalPages = Math.ceil(data.length / PER_PAGE)
  const paginated = data.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">On-Chain Activity</h1>
        <p className="text-sm text-text-muted mt-0.5">
          All Solana transactions including OOBE memo logs and x402 micropayments.
        </p>
      </div>

      {/* OOBE PDA Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-4 col-span-1 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4 text-brand-purpleLight" />
            <span className="font-semibold text-text-primary">OOBE On-Chain State</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-text-muted mb-1">PDA Address</div>
              <div className="flex items-center gap-2">
                <code className="text-xs text-brand-purpleLight bg-brand-purple/10 px-2 py-1 rounded font-mono">
                  GDeFiSig9…K3Y4T
                </code>
                <CopyButton text={agentConfig.oobe_pda} />
                <a
                  href={`https://solscan.io/account/${agentConfig.oobe_pda}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-brand-purpleLight"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div>
              <div className="text-xs text-text-muted mb-1">Agent Wallet</div>
              <div className="flex items-center gap-2">
                <code className="text-xs text-brand-green bg-brand-green/10 px-2 py-1 rounded font-mono">
                  7nZP2dru…ZGkR
                </code>
                <CopyButton text={agentConfig.agent_wallet} />
              </div>
            </div>

            <div>
              <div className="text-xs text-text-muted mb-1">Current Merkle Root</div>
              <code className="text-xs text-text-secondary bg-border-subtle px-2 py-1 rounded font-mono block truncate">
                {metrics.merkleRoot?.slice(0, 40)}…
              </code>
            </div>

            <div>
              <div className="text-xs text-text-muted mb-1">Memo Program</div>
              <code className="text-xs text-text-secondary bg-border-subtle px-2 py-1 rounded font-mono block truncate">
                MemoSq4gqABA…fHr
              </code>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-brand-purple/10 border border-brand-purple/20 text-xs text-brand-purpleLight">
            <strong>OOBE Protocol:</strong> Every agent decision is written to Solana via a Memo instruction. The Merkle root stored in the PDA acts as a verifiable proof of the agent's complete decision history and personality state.
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-brand-amber" />
            <span className="font-semibold text-text-primary">x402 Summary</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Total Payments</span>
              <span className="font-semibold text-brand-amber">{payments.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Total USDC Spent</span>
              <span className="font-semibold text-brand-amber">${(payments.length * 0.001).toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Cost Per Query</span>
              <span className="font-semibold text-text-primary">0.001 USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Recipient</span>
              <span className="font-mono text-xs text-text-secondary">AceData1…JC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Memo Logs</span>
              <span className="font-semibold text-text-primary">{memoLogs.length}</span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-brand-amber/10 border border-brand-amber/20 text-xs text-brand-amber">
            The agent autonomously pays for each Ace Data query using x402 HTTP micropayments, enabling permissionless, self-funded intelligence.
          </div>
        </div>
      </div>

      {/* Transaction Log */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-brand-green" />
            <span className="font-semibold text-text-primary">Transaction Log</span>
          </div>
          <div className="flex gap-2">
            <TabButton active={tab === 'memo'} onClick={() => { setTab('memo'); setPage(0) }}>
              <Brain className="inline-block w-3.5 h-3.5 mr-1" />
              OOBE Memos ({memoLogs.length})
            </TabButton>
            <TabButton active={tab === 'payments'} onClick={() => { setTab('payments'); setPage(0) }}>
              <CreditCard className="inline-block w-3.5 h-3.5 mr-1" />
              x402 Payments ({payments.length})
            </TabButton>
          </div>
        </div>

        <div className="divide-y divide-border-subtle">
          {tab === 'memo' && paginated.map(log => (
            <div className="px-4" key={log.id}>
              <TxRow
                tx_hash={log.tx_hash}
                memo={log.memo_text}
                timestamp={log.created_at}
                program={log.program}
                slot={log.slot}
              />
            </div>
          ))}

          {tab === 'payments' && paginated.map(pay => (
            <div className="px-4" key={pay.id}>
              <TxRow
                tx_hash={pay.tx_hash}
                memo={pay.memo || pay.query_type}
                amount={pay.amount}
                timestamp={pay.created_at}
              />
            </div>
          ))}

          {paginated.length === 0 && (
            <div className="px-4 py-8 text-center text-text-muted text-sm">
              No transactions found.
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle">
            <span className="text-xs text-text-muted">Page {page + 1} of {totalPages}</span>
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

      {/* Protocol Explainer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded bg-brand-purple/20 flex items-center justify-center">
              <span className="text-xs font-bold text-brand-purpleLight">1</span>
            </div>
            <span className="text-sm font-semibold text-text-primary">SERP Query</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Agent sends HTTP request to Ace Data Cloud API with x402 micropayment header containing 0.001 USDC authorization.
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded bg-brand-amber/20 flex items-center justify-center">
              <span className="text-xs font-bold text-brand-amber">2</span>
            </div>
            <span className="text-sm font-semibold text-text-primary">LLM Analysis</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Second x402 payment dispatched for LLM analysis. AI processes news data and generates BUY/HOLD/SELL signal with confidence score.
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded bg-brand-green/20 flex items-center justify-center">
              <span className="text-xs font-bold text-brand-green">3</span>
            </div>
            <span className="text-sm font-semibold text-text-primary">OOBE Memo Write</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Decision encoded as on-chain Memo instruction. Merkle root in OOBE PDA updated. If confidence threshold met, Jupiter swap or Kamino deposit executed.
          </p>
        </div>
      </div>
    </div>
  )
}
