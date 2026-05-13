import clsx from 'clsx'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function SignalBadge({ signal, size = 'md' }) {
  const config = {
    BUY: {
      cls: 'badge-buy',
      icon: TrendingUp,
      label: 'BUY',
    },
    HOLD: {
      cls: 'badge-hold',
      icon: Minus,
      label: 'HOLD',
    },
    SELL: {
      cls: 'badge-sell',
      icon: TrendingDown,
      label: 'SELL',
    },
  }

  const c = config[signal] || config.HOLD
  const Icon = c.icon

  return (
    <span className={clsx(c.cls, 'flex items-center gap-1', size === 'sm' && 'text-xs px-2 py-0.5')}>
      <Icon className="w-3 h-3" />
      {c.label}
    </span>
  )
}
