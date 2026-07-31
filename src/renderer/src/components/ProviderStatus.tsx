import { useAegisStore } from '../store/useAegisStore'

interface ToggleProps {
  on: boolean
  onToggle: () => void
}

function Toggle({ on, onToggle }: ToggleProps) {
  return (
    <div className={`toggle ${on ? 'on' : ''}`} onClick={onToggle} role="switch" aria-checked={on}>
      <div className="toggle-thumb" />
    </div>
  )
}

export default function ProviderStatus() {
  const { peers, autoSwitch, setAutoSwitch, hasInternet, isProvider } = useAegisStore()
  const provider = peers.find((p) => p.isProvider && p.status === 'online')

  const platformEmoji: Record<string, string> = {
    windows: '🖥️',
    mac: '💻',
    linux: '🐧',
    android: '📱',
    ios: '📱',
  }

  return (
    <div className="provider-card">
      <div className="provider-header">Internet Provider</div>

      {provider ? (
        <div className="provider-device">
          <div className="provider-avatar">{platformEmoji[provider.platform] ?? '💻'}</div>
          <div className="provider-info">
            <div className="provider-name">{provider.name}</div>
            <div className="provider-tag">⚡ Providing Internet</div>
          </div>
        </div>
      ) : hasInternet ? (
        <div className="provider-device">
          <div className="provider-avatar">🖥️</div>
          <div className="provider-info">
            <div className="provider-name">This Device</div>
            <div className="provider-tag" style={{ color: 'var(--gold)' }}>⚡ You Are Provider</div>
          </div>
        </div>
      ) : (
        <div
          className="provider-device"
          style={{ borderColor: 'rgba(255,71,87,0.3)', background: 'rgba(255,71,87,0.04)' }}
        >
          <div className="provider-avatar" style={{ background: 'var(--danger)' }}>⚠️</div>
          <div className="provider-info">
            <div className="provider-name" style={{ color: 'var(--danger)' }}>No Provider</div>
            <div className="provider-tag" style={{ color: 'var(--danger)' }}>No internet available</div>
          </div>
        </div>
      )}

      {/* Auto-switch */}
      <div className="auto-switch-row">
        <div>
          <div className="auto-switch-label">Auto-Switch Provider</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            Switch automatically when best peer changes
          </div>
        </div>
        <Toggle on={autoSwitch} onToggle={() => setAutoSwitch(!autoSwitch)} />
      </div>

      {/* Latency */}
      {provider && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            background: 'var(--bg-surface2)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Provider Latency</span>
          <span
            className="mono-text"
            style={{
              color: provider.latency < 50 ? 'var(--success)' : provider.latency < 100 ? 'var(--warning)' : 'var(--danger)',
              fontWeight: 700,
            }}
          >
            {provider.latency} ms
          </span>
        </div>
      )}
    </div>
  )
}
