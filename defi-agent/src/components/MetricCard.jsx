import clsx from 'clsx'

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, color = 'green', className }) {
  const colorMap = {
    green: {
      icon: 'text-signal-buy bg-signal-buy/10',
      value: 'text-signal-buy',
      glow: 'hover:glow-green',
    },
    red: {
      icon: 'text-signal-sell bg-signal-sell/10',
      value: 'text-signal-sell',
      glow: 'hover:glow-red',
    },
    purple: {
      icon: 'text-brand-purple bg-brand-purple/10',
      value: 'text-brand-purpleLight',
      glow: 'hover:glow-purple',
    },
    amber: {
      icon: 'text-brand-amber bg-brand-amber/10',
      value: 'text-brand-amber',
      glow: '',
    },
    blue: {
      icon: 'text-blue-400 bg-blue-400/10',
      value: 'text-blue-400',
      glow: '',
    },
  }

  const c = colorMap[color] || colorMap.green

  return (
    <div className={clsx('card p-4 transition-all duration-200 hover:border-border-muted', className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', c.icon)}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className={clsx('text-2xl font-bold mb-1', c.value)}>{value}</div>
      {subtitle && <div className="text-xs text-text-muted">{subtitle}</div>}
      {trend !== undefined && (
        <div className={clsx('text-xs font-medium mt-2', trend >= 0 ? 'text-signal-buy' : 'text-signal-sell')}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs yesterday
        </div>
      )}
    </div>
  )
}
