import React, { useState } from 'react'
import { Activity, Play, RefreshCw } from 'lucide-react'
import { useAegisStore } from '../../store/useAegisStore'

export const ClientSpeedTestWidget: React.FC = () => {
  const { networkHealth, downloadKbps, uploadKbps, measureHealth } = useAegisStore()
  const [isRunning, setIsRunning] = useState(false)

  const handleRunTest = async () => {
    setIsRunning(true)
    try {
      await measureHealth()
    } finally {
      setTimeout(() => setIsRunning(false), 1200)
    }
  }

  const downMbps = (downloadKbps / 1000).toFixed(1)
  const upMbps = (uploadKbps / 1000).toFixed(1)

  return (
    <div
      className="glass-card"
      style={{
        padding: '18px 22px',
        borderRadius: 16,
        background: 'rgba(18, 22, 34, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={16} color="var(--blue-bright)" />
          <span style={{ fontSize: 13, fontWeight: 700 }}>Mesh Latency & Performance Audit</span>
        </div>
        <button
          onClick={handleRunTest}
          disabled={isRunning}
          className="btn btn-outline btn-sm"
          style={{ fontSize: 11, padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5 }}
        >
          {isRunning ? <RefreshCw size={12} className="spin" /> : <Play size={12} />}
          <span>{isRunning ? 'Auditing...' : 'Run Diagnostics'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: 10, borderRadius: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>PING RTT</div>
          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: 'var(--success)' }}>
            {networkHealth.latencyMs} ms
          </div>
          <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>±{networkHealth.jitterMs}ms Jitter</div>
        </div>

        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: 10, borderRadius: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>PACKET LOSS</div>
          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: networkHealth.packetLossPercent === 0 ? 'var(--success)' : 'var(--danger)' }}>
            {networkHealth.packetLossPercent}% Loss
          </div>
          <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>Noise Pinning</div>
        </div>

        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: 10, borderRadius: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>SPEED (RX / TX)</div>
          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#00D2FF' }}>
            {downMbps} / {upMbps}
          </div>
          <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>Mbps Throughput</div>
        </div>
      </div>
    </div>
  )
}
