import { Peer } from '../store/useAegisStore'

interface DeviceCardProps {
  peer: Peer
  onDisconnect: (id: string) => void
}

const PLATFORM_EMOJI: Record<string, string> = {
  windows: '🖥️',
  mac: '💻',
  linux: '🐧',
  android: '📱',
  ios: '📱',
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`
  return `${(bytes / 1073741824).toFixed(2)} GB`
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m`
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
}

export default function DeviceCard({ peer, onDisconnect }: DeviceCardProps) {
  const uptime = peer.status === 'online' ? Date.now() - peer.connectedSince : 0

  return (
    <div className="device-table-row animate-fade-in">
      {/* Name */}
      <div className="device-name-cell">
        <div className="device-os-icon">{PLATFORM_EMOJI[peer.platform] ?? '💻'}</div>
        <div>
          <div className="device-name">{peer.name}</div>
          <div className="device-id">{peer.id}</div>
        </div>
      </div>

      {/* Status */}
      <div>
        {peer.isProvider && peer.status === 'online' ? (
          <span className="status-pill provider">⚡ Provider</span>
        ) : peer.status === 'online' ? (
          <span className="status-pill online">● Online</span>
        ) : peer.status === 'connecting' ? (
          <span className="status-pill" style={{ color: 'var(--warning)', background: 'rgba(255,176,32,0.1)', border: '1px solid rgba(255,176,32,0.3)' }}>
            ◌ Connecting
          </span>
        ) : (
          <span className="status-pill offline">○ Offline</span>
        )}
      </div>

      {/* Speeds */}
      <div className="mono-text" style={{ fontSize: 11 }}>
        {peer.status === 'online' ? (
          <>
            <div style={{ color: 'var(--gold)' }}>↑ {(peer.uploadKbps / 1000).toFixed(1)}</div>
            <div style={{ color: 'var(--blue)' }}>↓ {(peer.downloadKbps / 1000).toFixed(1)} Mbps</div>
          </>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>—</span>
        )}
      </div>

      {/* Latency */}
      <div className="mono-text">
        {peer.status === 'online' && peer.latency > 0 ? (
          <span
            style={{
              color: peer.latency < 50 ? 'var(--success)' : peer.latency < 100 ? 'var(--warning)' : 'var(--danger)',
              fontWeight: 600,
            }}
          >
            {peer.latency} ms
          </span>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>—</span>
        )}
      </div>

      {/* Data */}
      <div className="mono-text">{formatBytes(peer.dataUsed)}</div>

      {/* Actions */}
      <div>
        {peer.status !== 'offline' ? (
          <button className="btn btn-danger btn-sm" onClick={() => onDisconnect(peer.id)}>
            Disconnect
          </button>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {uptime > 0 ? formatDuration(uptime) + ' ago' : 'Offline'}
          </span>
        )}
      </div>
    </div>
  )
}
