import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts'
import { useAgent } from '../context/AgentContext'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  const isPositive = val >= 1000
  return (
    <div className="bg-bg-elevated border border-border-muted rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-text-muted mb-1">{label}</div>
      <div className={`font-bold text-base ${isPositive ? 'text-signal-buy' : 'text-signal-sell'}`}>
        ${val?.toFixed(2)}
      </div>
    </div>
  )
}

export default function PnLChart() {
  const { pnlChart } = useAgent()

  const minVal = Math.min(...pnlChart.map(d => d.pnl))
  const maxVal = Math.max(...pnlChart.map(d => d.pnl))
  const currentVal = pnlChart[pnlChart.length - 1]?.pnl || 0
  const isPositive = currentVal >= 1000

  const tradeDots = pnlChart.filter(d => d.trade)

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">Portfolio P&L (24h)</div>
          <div className={`text-2xl font-bold ${isPositive ? 'text-signal-buy' : 'text-signal-sell'}`}>
            ${currentVal.toFixed(2)}
          </div>
          <div className="text-xs text-text-muted">Started: $1,000.00 — <span className="text-signal-buy font-semibold">+24.7%</span></div>
        </div>
        <div className="flex gap-4 text-xs">
          <div>
            <div className="text-text-muted">High</div>
            <div className="text-text-primary font-mono">${maxVal.toFixed(0)}</div>
          </div>
          <div>
            <div className="text-text-muted">Low</div>
            <div className="text-text-primary font-mono">${minVal.toFixed(0)}</div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={pnlChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D395" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#00D395" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2028" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: '#555B6E' }}
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{ fontSize: 10, fill: '#555B6E' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `$${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="pnl"
            stroke="#00D395"
            strokeWidth={2}
            fill="url(#pnlGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#00D395', strokeWidth: 0 }}
          />
          {tradeDots.map((d, i) => (
            <ReferenceDot
              key={i}
              x={d.time}
              y={d.pnl}
              r={3}
              fill="#7C3AED"
              stroke="#9D5FFF"
              strokeWidth={1}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-signal-buy rounded" />
          <span>Portfolio Value</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-brand-purple/80" />
          <span>Trade Executed</span>
        </div>
      </div>
    </div>
  )
}
