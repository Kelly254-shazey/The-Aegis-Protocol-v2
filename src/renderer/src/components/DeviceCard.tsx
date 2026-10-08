import { useState } from 'react'
import { Edit2, Check, X } from 'lucide-react'
import { Peer, useAegisStore, useFormatBytes } from '../store/useAegisStore'

interface DeviceCardProps {
  peer: Peer
  onDisconnect: (id: string) => void
}

const PLATFORM_EMOJI: Record<string, string> = {
  windows: '🖥️',
  mac: '💻',
  linux: '🐧',
  android: '📱',
  ios: '📱'
}

export default function DeviceCard({ peer, onDisconnect }: DeviceCardProps) {
  const { renamePeer } = useAegisStore()

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(peer.name)

  const handleSaveName = () => {
    if (editName.trim()) {
      renamePeer(peer.id, editName.trim())
      setIsEditing(false)
    }
  }

  const handleCancelName = () => {
    setEditName(peer.name)
    setIsEditing(false)
  }

  return (
    <div className="notion-table-row">
      {/* Device Name + Masked ID (Privacy-first) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>{PLATFORM_EMOJI[peer.platform] || '💻'}</span>
        <div style={{ minWidth: 0 }}>
          {isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="apple-input"
                style={{ padding: '3px 8px', fontSize: 12, width: 140 }}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') handleCancelName()
                }}
              />
              <button onClick={handleSaveName} style={{ background: 'none', border: 'none', color: 'var(--success)', cursor: 'pointer' }}>
                <Check size={14} />
              </button>
              <button onClick={handleCancelName} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {peer.name}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                title="Rename device alias"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.6 }}
              >
                <Edit2 size={11} />
              </button>
            </div>
          )}

          {/* Masked Device Fingerprint & Anonymous Blinded IP (Zero Leak) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span className="masked-id-badge">••••{peer.id.slice(-4)}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: 'var(--success)' }}>
              {peer.blindedIp && peer.blindedIp.includes('[') ? peer.blindedIp : '100.64.••.•• [Cloaked Peer]'}
            </span>
          </div>
        </div>
      </div>

      {/* Connection Status Pill */}
      <div>
        {peer.isProvider && peer.status === 'online' ? (
          <span
            className="status-pill"
            style={{ background: 'rgba(212, 160, 23, 0.15)', color: 'var(--gold-bright)', border: '1px solid rgba(212, 160, 23, 0.35)' }}
          >
            ⚡ Gateway
          </span>
        ) : peer.status === 'online' ? (
          <span className="status-pill online">● Active</span>
        ) : (
          <span
            className="status-pill"
            style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
          >
            Offline
          </span>
        )}
      </div>

      {/* Speed / Throughput */}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>
        {peer.status === 'online' ? (
          <div>
            <span style={{ color: 'var(--gold)' }}>↑ {(peer.uploadKbps / 1000).toFixed(1)}</span>
            <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>/</span>
            <span style={{ color: 'var(--blue-bright)' }}>↓ {(peer.downloadKbps / 1000).toFixed(1)} M</span>
          </div>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>—</span>
        )}
      </div>

      {/* Latency & Real Packet Loss */}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>
        {peer.status === 'online' ? (
          <div>
            <span style={{ color: peer.latency < 40 ? 'var(--success)' : peer.latency < 90 ? 'var(--warning)' : 'var(--danger)' }}>
              {peer.latency} ms
            </span>
            <div style={{ fontSize: 10, color: peer.packetLoss === 0 ? 'var(--success)' : 'var(--danger)' }}>
              {peer.packetLoss}% Loss
            </div>
          </div>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>—</span>
        )}
      </div>

      {/* Cumulative Data Transferred */}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: 'var(--text-secondary)' }}>
        {useFormatBytes(peer.dataUsed)}
      </div>

      {/* Notion Action */}
      <div>
        {peer.status === 'online' ? (
          <button onClick={() => onDisconnect(peer.id)} className="btn btn-danger btn-sm" style={{ padding: '4px 9px', fontSize: 11 }}>
            Disconnect
          </button>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Disconnected</span>
        )}
      </div>
    </div>
  )
}
