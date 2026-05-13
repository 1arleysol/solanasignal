import { useState } from 'react'
import { Settings, Brain, Shield, Wallet, Sliders, Check, RefreshCw, AlertTriangle } from 'lucide-react'
import { useAgent } from '../context/AgentContext'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'

const RISK_LEVELS = [
  { value: 'conservative', label: 'Conservative', desc: 'Low risk, prioritize capital preservation. Hold-heavy strategy.', color: 'text-signal-buy' },
  { value: 'balanced', label: 'Balanced', desc: 'Moderate risk, mix of growth and safety.', color: 'text-brand-amber' },
  { value: 'aggressive', label: 'Aggressive', desc: 'High risk, maximize returns. May trigger volatile signals.', color: 'text-signal-sell' },
]

const ALL_TOKENS = ['SOL', 'JUP', 'RAY', 'BONK', 'WIF', 'JTO', 'ORCA', 'MNGO']

function Section({ title, icon: Icon, children, className }) {
  return (
    <div className={clsx('card p-6', className)}>
      <div className="flex items-center gap-2 mb-5">
        <Icon className="w-4 h-4 text-brand-purpleLight" />
        <h2 className="font-semibold text-text-primary">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label, desc }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border-subtle last:border-b-0">
      <div>
        <div className="text-sm font-medium text-text-primary">{label}</div>
        {desc && <div className="text-xs text-text-muted mt-0.5">{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
          checked ? 'bg-brand-purple' : 'bg-border-muted'
        )}
      >
        <span
          className={clsx(
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform duration-200',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}

export default function AgentConfig() {
  const { agentConfig, updateConfig, isRunning, startAgent, pauseAgent } = useAgent()
  const [saved, setSaved] = useState(false)
  const [localConfig, setLocalConfig] = useState({
    risk_tolerance: agentConfig.risk_tolerance || 'balanced',
    max_position_usdc: agentConfig.max_position_usdc || 500,
    tokens_watchlist: agentConfig.tokens_watchlist || ['SOL', 'JUP', 'RAY'],
    auto_execute: agentConfig.auto_execute || false,
    daily_budget_usdc: agentConfig.daily_budget_usdc || 1.0,
    min_confidence: 75,
    news_sources: true,
    on_chain_data: true,
    enable_kamino: true,
    enable_jupiter: true,
    enable_notifications: false,
  })

  function toggleToken(token) {
    setLocalConfig(prev => ({
      ...prev,
      tokens_watchlist: prev.tokens_watchlist.includes(token)
        ? prev.tokens_watchlist.filter(t => t !== token)
        : [...prev.tokens_watchlist, token],
    }))
  }

  function handleSave() {
    updateConfig(localConfig)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Agent Configuration</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Customize strategy, risk, and behavior. Saved settings update the OOBE on-chain Merkle root.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={isRunning ? pauseAgent : startAgent}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all',
              isRunning
                ? 'bg-signal-sell/15 text-signal-sell border border-signal-sell/30 hover:bg-signal-sell/25'
                : 'bg-signal-buy/15 text-signal-buy border border-signal-buy/30 hover:bg-signal-buy/25'
            )}
          >
            {isRunning ? 'Pause Agent' : 'Start Agent'}
          </button>
          <button
            onClick={handleSave}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              saved
                ? 'bg-signal-buy/20 text-signal-buy border border-signal-buy/40'
                : 'bg-brand-purple hover:bg-brand-purpleLight text-white'
            )}
          >
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Settings className="w-4 h-4" /> Save Config</>}
          </button>
        </div>
      </div>

      {/* Agent Identity */}
      <Section title="OOBE Agent Identity" icon={Brain}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-xs text-text-muted">Agent Wallet</div>
            <div className="font-mono text-xs text-brand-purpleLight bg-brand-purple/10 px-3 py-2 rounded-lg break-all">
              {agentConfig.agent_wallet}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-text-muted">OOBE PDA</div>
            <div className="font-mono text-xs text-brand-green bg-brand-green/10 px-3 py-2 rounded-lg break-all">
              {agentConfig.oobe_pda}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-text-muted">Merkle Root (Personality Hash)</div>
            <div className="font-mono text-xs text-text-secondary bg-border-subtle px-3 py-2 rounded-lg break-all">
              {agentConfig.merkle_root?.slice(0, 32)}…
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-text-muted">Last Personality Update</div>
            <div className="text-sm text-text-secondary px-3 py-2 bg-border-subtle rounded-lg">
              {agentConfig.personality_updated_at
                ? formatDistanceToNow(new Date(agentConfig.personality_updated_at), { addSuffix: true })
                : 'Never'}
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 rounded-lg bg-brand-purple/10 border border-brand-purple/20 text-xs text-brand-purpleLight flex items-start gap-2">
          <Brain className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>OOBE Protocol stores all agent personality and decision history on-chain. Each configuration change generates a new Merkle leaf and updates the root.</span>
        </div>
      </Section>

      {/* Risk Strategy */}
      <Section title="Risk Strategy" icon={Shield}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {RISK_LEVELS.map(({ value, label, desc, color }) => (
            <button
              key={value}
              onClick={() => setLocalConfig(p => ({ ...p, risk_tolerance: value }))}
              className={clsx(
                'p-4 rounded-xl border text-left transition-all',
                localConfig.risk_tolerance === value
                  ? 'border-brand-purple bg-brand-purple/15'
                  : 'border-border-subtle hover:border-border-muted bg-bg-elevated'
              )}
            >
              <div className={clsx('font-semibold text-sm mb-1', color)}>{label}</div>
              <div className="text-xs text-text-muted leading-relaxed">{desc}</div>
              {localConfig.risk_tolerance === value && (
                <div className="mt-2 flex items-center gap-1 text-brand-purple text-xs font-semibold">
                  <Check className="w-3 h-3" /> Active
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-2">
              Max Position Size (USDC)
            </label>
            <input
              type="number"
              value={localConfig.max_position_usdc}
              onChange={e => setLocalConfig(p => ({ ...p, max_position_usdc: parseFloat(e.target.value) }))}
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-purple transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-2">
              Daily Budget for x402 Payments (USDC)
            </label>
            <input
              type="number"
              step="0.1"
              value={localConfig.daily_budget_usdc}
              onChange={e => setLocalConfig(p => ({ ...p, daily_budget_usdc: parseFloat(e.target.value) }))}
              className="w-full bg-bg-elevated border border-border-subtle rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand-purple transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-2">
              Minimum Confidence Threshold: {localConfig.min_confidence}%
            </label>
            <input
              type="range"
              min="50"
              max="95"
              value={localConfig.min_confidence}
              onChange={e => setLocalConfig(p => ({ ...p, min_confidence: parseInt(e.target.value) }))}
              className="w-full accent-brand-purple"
            />
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>50% (Loose)</span>
              <span>95% (Strict)</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Token Watchlist */}
      <Section title="Token Watchlist" icon={Sliders}>
        <div className="flex flex-wrap gap-2">
          {ALL_TOKENS.map(token => {
            const active = localConfig.tokens_watchlist.includes(token)
            return (
              <button
                key={token}
                onClick={() => toggleToken(token)}
                className={clsx(
                  'px-4 py-2 rounded-xl text-sm font-semibold border transition-all',
                  active
                    ? 'bg-brand-purple/20 text-brand-purpleLight border-brand-purple/50'
                    : 'bg-border-subtle text-text-muted border-border-subtle hover:border-border-muted'
                )}
              >
                {active && <Check className="inline-block w-3 h-3 mr-1" />}
                {token}
              </button>
            )
          })}
        </div>
        <p className="text-xs text-text-muted mt-3">
          {localConfig.tokens_watchlist.length} tokens selected. The agent cycles through all tokens every 30 seconds.
        </p>
      </Section>

      {/* Execution Settings */}
      <Section title="Execution & Data Sources" icon={Settings}>
        <div className="space-y-0">
          <Toggle
            checked={localConfig.auto_execute}
            onChange={v => setLocalConfig(p => ({ ...p, auto_execute: v }))}
            label="Auto Execute Trades"
            desc="Automatically execute BUY/SELL when confidence exceeds threshold. Requires connected wallet."
          />
          <Toggle
            checked={localConfig.news_sources}
            onChange={v => setLocalConfig(p => ({ ...p, news_sources: v }))}
            label="Ace Data SERP News Analysis"
            desc="Query Ace Data Cloud for real-time news and sentiment (costs 0.001 USDC per query via x402)"
          />
          <Toggle
            checked={localConfig.on_chain_data}
            onChange={v => setLocalConfig(p => ({ ...p, on_chain_data: v }))}
            label="On-Chain Data (Solscan, Birdeye)"
            desc="Include on-chain metrics: whale movements, liquidity changes, large transactions"
          />
          <Toggle
            checked={localConfig.enable_jupiter}
            onChange={v => setLocalConfig(p => ({ ...p, enable_jupiter: v }))}
            label="Jupiter Aggregator Execution"
            desc="Use Jupiter for best-route swap execution when trades are triggered"
          />
          <Toggle
            checked={localConfig.enable_kamino}
            onChange={v => setLocalConfig(p => ({ ...p, enable_kamino: v }))}
            label="Kamino Finance Yield"
            desc="Deploy idle capital to Kamino lending pools during HOLD signals"
          />
          <Toggle
            checked={localConfig.enable_notifications}
            onChange={v => setLocalConfig(p => ({ ...p, enable_notifications: v }))}
            label="Browser Notifications"
            desc="Show desktop notification when a signal is generated"
          />
        </div>

        {localConfig.auto_execute && (
          <div className="mt-4 p-3 rounded-lg bg-signal-sell/10 border border-signal-sell/30 text-xs text-signal-sell flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Auto-execute is enabled. The agent will autonomously place trades. Ensure your risk limits are configured correctly.</span>
          </div>
        )}
      </Section>

      {/* x402 Payment Config */}
      <Section title="x402 Micropayment Config" icon={Wallet}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="text-xs text-text-muted">Facilitator Wallet</div>
            <div className="font-mono text-xs text-brand-amber bg-brand-amber/10 px-3 py-2 rounded-lg break-all">
              AceData1FacilitatorWaLLet7xQK9vYmT3ZzPaXmJC
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-text-muted">Cost Per Query</div>
            <div className="text-sm text-brand-amber font-semibold px-3 py-2 bg-brand-amber/10 rounded-lg">
              0.001 USDC / query
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-text-muted">Daily Budget Remaining</div>
            <div className="text-sm text-signal-buy font-semibold px-3 py-2 bg-signal-buy/10 rounded-lg">
              $0.79 / $1.00 USDC
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-text-muted">Payment Method</div>
            <div className="text-sm text-text-secondary px-3 py-2 bg-border-subtle rounded-lg">
              SPL USDC on Solana devnet
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
