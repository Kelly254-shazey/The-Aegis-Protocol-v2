import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useAegisStore } from '../store/useAegisStore'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'var(--bg-void)',
        border: '1px solid var(--border-mid)',
        borderRadius: 'var(--radius-sm)',
        padding: '8px 12px',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
      }}
    >
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map((entry: any) => (
        <div key={entry.name} style={{ color: entry.color, marginBottom: 2 }}>
          {entry.name === 'upload' ? '↑' : '↓'} {entry.value.toFixed(0)} Kbps
        </div>
      ))}
    </div>
  )
}

export default function SpeedGraph() {
  const speedHistory = useAegisStore((s) => s.speedHistory)
  const uploadKbps = useAegisStore((s) => s.uploadKbps)
  const downloadKbps = useAegisStore((s) => s.downloadKbps)

  const displayHistory = speedHistory.slice(-30)

  return (
    <div className="speed-graph-wrapper">
      <div className="speed-graph-header">
        <div className="speed-graph-title">Live Bandwidth</div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {/* Live readouts */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
            }}
          >
            <span style={{ color: 'var(--gold)' }}>↑ {(uploadKbps / 1000).toFixed(1)} Mbps</span>
            <span style={{ color: 'var(--blue)' }}>↓ {(downloadKbps / 1000).toFixed(1)} Mbps</span>
          </div>

          {/* Legend */}
          <div className="speed-legend">
            <div className="speed-legend-item">
              <div className="speed-legend-dot" style={{ background: 'var(--gold)' }} />
              Upload
            </div>
            <div className="speed-legend-item">
              <div className="speed-legend-dot" style={{ background: 'var(--blue)' }} />
              Download
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 8px 8px' }}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={displayHistory} margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4a017" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d4a017" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="downloadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4d9fff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4d9fff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,37,64,0.8)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: "'JetBrains Mono'" }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: "'JetBrains Mono'" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}K`}
              width={42}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="upload"
              stroke="#d4a017"
              strokeWidth={2}
              fill="url(#uploadGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#d4a017', strokeWidth: 0 }}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="download"
              stroke="#4d9fff"
              strokeWidth={2}
              fill="url(#downloadGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#4d9fff', strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
