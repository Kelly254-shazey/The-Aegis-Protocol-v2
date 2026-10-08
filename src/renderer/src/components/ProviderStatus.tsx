import { Globe, Radio, Zap, AlertTriangle, CheckCircle2, Wifi, Activity } from 'lucide-react'
import { useAegisStore } from '../store/useAegisStore'

export default function ProviderStatus() {
  const {
    peers,
    autoSwitch,
    setAutoSwitch,
    hasInternet,
    networkHealth,
    isDegradedConnection,
    turboBoostEnabled,
    toggleTurboBoost,
    signalStrengthDbm,
    signalBars,
    linkSpeedMbps,
    channelSpectrum,
    mimoConfig,
    congestionControl
  } = useAegisStore()
  const provider = peers.find((p) => p.isProvider && p.status === 'online')

  const platformEmoji: Record<string, string> = {
    windows: '🖥️',
    mac: '💻',
    linux: '🐧',
    android: '📱',
    ios: '📱'
  }

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            <Globe size={16} style={{ color: 'var(--blue-bright)' }} />
            <span>Active Internet Gateway</span>
          </div>
          {isDegradedConnection ? (
            <span className="status-pill degraded">
              <AlertTriangle size={11} /> High Packet Loss
            </span>
          ) : (
            <span className="status-pill online">
              <CheckCircle2 size={11} /> Link Outstanding
            </span>
          )}
        </div>

        {provider ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{ fontSize: 24 }}>{platformEmoji[provider.platform] || '💻'}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{provider.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Zap size={11} /> Uplink active: {(provider.downloadKbps / 1000).toFixed(0)} Mbps Turbo
              </div>
            </div>
          </div>
        ) : hasInternet ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{ fontSize: 24 }}>🛡️</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>This Host Device</div>
              <div style={{ fontSize: 11.5, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Radio size={11} /> Native Internet Connected · Broadcasting Hotspot (:3888)
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 69, 58, 0.08)',
              border: '1px solid rgba(255, 69, 58, 0.25)',
              color: 'var(--danger)'
            }}
          >
            No active gateway found. Connect to a peer or activate a Hotspot Pass.
          </div>
        )}
      </div>

      {/* Outstanding Signal Strength & Link Metrics */}
      <div style={{ marginTop: 14 }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(0, 113, 227, 0.05) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            marginBottom: 12
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: 'var(--success)' }}>
              <Wifi size={14} />
              <span>Signal Strength: Outstanding</span>
            </div>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)', fontWeight: 700 }}>
              {signalStrengthDbm} dBm ({signalBars}/5 Bars)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11, color: 'var(--text-secondary)' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Link Rate: </span>
              <strong style={{ color: 'var(--text-primary)' }}>{linkSpeedMbps} Mbps</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Spectrum: </span>
              <strong style={{ color: 'var(--text-primary)' }}>{channelSpectrum}</strong>
            </div>
          </div>

          <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 4 }}>
            {mimoConfig} · {congestionControl}
          </div>
        </div>

        {/* Network Health Meters */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 10,
            marginBottom: 14
          }}
        >
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 10px'
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Latency</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
              {networkHealth.latencyMs} ms
            </div>
          </div>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 10px'
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Jitter</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
              {networkHealth.jitterMs} ms
            </div>
          </div>

          <div
            style={{
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 10px'
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Packet Loss</div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 14,
                fontWeight: 700,
                color: networkHealth.packetLossPercent === 0 ? 'var(--success)' : 'var(--danger)',
                marginTop: 2
              }}
            >
              {networkHealth.packetLossPercent}% Clean
            </div>
          </div>
        </div>

        {/* Turbo Acceleration & Smart Auto-Switch Toggles */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Activity size={13} style={{ color: 'var(--blue-bright)' }} />
                Turbo Speed Boost
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Multi-path MPTCP aggregation & QUIC 0-RTT Fast Path
              </div>
            </div>
            <div
              className={`apple-toggle${turboBoostEnabled ? ' on' : ''}`}
              onClick={toggleTurboBoost}
              role="switch"
              aria-checked={turboBoostEnabled}
            >
              <div className="apple-toggle-knob" />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600 }}>Smart Auto-Switch</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Automatically failover to best peer if packet loss exceeds 5%
              </div>
            </div>
            <div
              className={`apple-toggle${autoSwitch ? ' on' : ''}`}
              onClick={() => setAutoSwitch(!autoSwitch)}
              role="switch"
              aria-checked={autoSwitch}
            >
              <div className="apple-toggle-knob" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
