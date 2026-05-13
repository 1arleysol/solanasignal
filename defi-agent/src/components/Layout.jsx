import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Settings, History, Link2, Zap, Wifi, WifiOff } from 'lucide-react'
import { useAgent } from '../context/AgentContext'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/agent', label: 'Agent Config', icon: Settings },
  { to: '/history', label: 'History', icon: History },
  { to: '/onchain', label: 'On-Chain', icon: Link2 },
]

export default function Layout() {
  const { isRunning, wsConnected, metrics, agentConfig } = useAgent()

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      {/* Powered by Banner */}
      <div className="bg-gradient-to-r from-brand-purple/20 via-brand-green/10 to-brand-amber/20 border-b border-border-subtle">
        <div className="max-w-screen-xl mx-auto px-4 py-1.5 flex items-center justify-center gap-2 text-xs text-text-secondary">
          <Zap className="w-3 h-3 text-brand-amber" />
          <span>Powered by</span>
          <span className="text-brand-purple font-semibold">OOBE Protocol</span>
          <span className="text-text-muted">×</span>
          <span className="text-brand-green font-semibold">Ace Data Cloud</span>
          <span className="text-text-muted">×</span>
          <span className="text-brand-amber font-semibold">x402 Micropayments</span>
          <span className="hidden sm:inline text-text-muted">— Superteam Bounty Demo</span>
        </div>
      </div>

      {/* Top Nav */}
      <header className="border-b border-border-subtle bg-bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-green to-brand-purple flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              {isRunning && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-signal-buy border border-bg-card animate-pulse" />
              )}
            </div>
            <div>
              <span className="font-bold text-text-primary text-base tracking-tight">SolanaSignal</span>
              <span className="hidden sm:inline ml-1.5 text-xs text-text-muted">DeFi Intelligence Agent</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) => clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-brand-purple/15 text-brand-purpleLight'
                    : 'text-text-secondary hover:text-text-primary hover:bg-border-subtle'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Status Bar */}
          <div className="flex items-center gap-3">
            {/* WS Status */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs">
              {wsConnected
                ? <><Wifi className="w-3 h-3 text-signal-buy" /><span className="text-signal-buy">Live</span></>
                : <><WifiOff className="w-3 h-3 text-text-muted" /><span className="text-text-muted">Sim</span></>
              }
            </div>

            {/* Agent Status */}
            <div className={clsx(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
              isRunning
                ? 'bg-signal-buy/15 text-signal-buy border border-signal-buy/30'
                : 'bg-border-subtle text-text-secondary border border-border-muted'
            )}>
              <span className={clsx('w-1.5 h-1.5 rounded-full', isRunning ? 'bg-signal-buy animate-pulse' : 'bg-text-muted')} />
              {isRunning ? 'RUNNING' : 'PAUSED'}
            </div>

            {/* Wallet Mock */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-border-subtle rounded-lg text-xs text-text-secondary font-mono">
              <div className="w-2 h-2 rounded-full bg-brand-purple" />
              7nZP…ZGkR
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex border-t border-border-subtle">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => clsx(
                'flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-all',
                isActive ? 'text-brand-purpleLight' : 'text-text-muted'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-bg-card/50">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between text-xs text-text-muted">
          <span>SolanaSignal v1.0 — Devnet</span>
          <span className="flex items-center gap-3">
            <span>PnL: <span className="text-signal-buy font-semibold">+$247 (+24.7%)</span></span>
            <span>{metrics.paymentsTotal} x402 payments</span>
            <span className="text-brand-purple">OOBE on-chain ✓</span>
          </span>
        </div>
      </footer>
    </div>
  )
}
