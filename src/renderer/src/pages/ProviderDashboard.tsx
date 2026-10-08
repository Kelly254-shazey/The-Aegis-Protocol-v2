import { ShieldAlert, Eye, EyeOff } from 'lucide-react'
import { useAegisStore, useFormatBytes, maskDeviceId } from '../store/useAegisStore'

export default function ProviderDashboard() {
  const {
    peers,
    totalDataShared,
    peerQuotas,
    setPeerQuota,
    disconnectPeer,
    privacyMode,
    revealedPeerIds,
    togglePeerReveal
  } = useAegisStore()

  const handleQuotaChange = (peerId: string, value: string) => {
    const bytes = parseFloat(value) * 1024 * 1024 * 1024 // Convert GB to Bytes
    setPeerQuota(peerId, isNaN(bytes) ? 0 : bytes)
  }

  const activeConsumers = peers.filter((p) => !p.isProvider && p.status === 'online')

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Consumer <span>Bandwidth & Quotas</span>
          </h1>
          <p className="page-desc">
            Administrative bandwidth allocation, individual data caps & routing priority for connected consumers
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-label">Gateway Uplink Mode</div>
          <div className="stat-card-value" style={{ color: 'var(--gold-bright)' }}>
            Broadcasting
          </div>
          <div className="stat-card-sub">Mesh internet gateway active</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Active Consumers</div>
          <div className="stat-card-value">{activeConsumers.length}</div>
          <div className="stat-card-sub">Routing packets through your node</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Total Shared Today</div>
          <div className="stat-card-value">{useFormatBytes(totalDataShared)}</div>
          <div className="stat-card-sub">Cumulative outbound traffic</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Admin Privacy Mode</div>
          <div className="stat-card-value" style={{ fontSize: 16, color: 'var(--success)', marginTop: 4 }}>
            {privacyMode ? 'Shielded (Masked)' : 'Full ID Visible'}
          </div>
          <div className="stat-card-sub">Device fingerprints secured</div>
        </div>
      </div>

      {/* Notion-Style Quota Records Table */}
      <div className="notion-table-wrapper" style={{ marginTop: 8 }}>
        <div className="notion-table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldAlert size={15} style={{ color: 'var(--blue-bright)' }} />
            <span style={{ fontWeight: 700, fontSize: 14 }}>Consumer Device Bandwidth Allocations</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {activeConsumers.length} consumer{activeConsumers.length !== 1 ? 's' : ''} connected
          </div>
        </div>

        {/* Table Head */}
        <div className="notion-table-row head" style={{ gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr 100px' }}>
          <span>Consumer Device (Masked ID)</span>
          <span>Data Consumed</span>
          <span>Data Cap Allowance</span>
          <span>Loss & Score</span>
          <span>Actions</span>
        </div>

        {/* Rows */}
        {activeConsumers.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📡</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No active consumers</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              No client devices are currently consuming internet bandwidth through this gateway.
            </div>
          </div>
        ) : (
          activeConsumers.map((peer) => {
            const quota = peerQuotas[peer.id] || 0
            const percentage = quota > 0 ? (peer.dataUsed / quota) * 100 : 0
            const isExhausted = quota > 0 && peer.dataUsed >= quota
            const isRevealed = !!revealedPeerIds[peer.id]

            return (
              <div
                key={peer.id}
                className="notion-table-row"
                style={{ gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr 100px' }}
              >
                {/* Device Name + Masked ID */}
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{peer.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span className="masked-id-badge">{maskDeviceId(peer.id, privacyMode, isRevealed)}</span>
                    <button
                      onClick={() => togglePeerReveal(peer.id)}
                      className="reveal-toggle"
                      title={isRevealed ? 'Hide ID' : 'Reveal hardware identifier'}
                    >
                      {isRevealed ? <EyeOff size={11} /> : <Eye size={11} />}
                    </button>
                  </div>
                </div>

                {/* Data Usage & Quota Progress Meter */}
                <div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      color: isExhausted ? 'var(--danger)' : 'var(--text-primary)',
                      fontWeight: 600
                    }}
                  >
                    {useFormatBytes(peer.dataUsed)}
                  </div>
                  {quota > 0 && (
                    <div style={{ width: 100, height: 4, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, marginTop: 5 }}>
                      <div
                        style={{
                          height: '100%',
                          background: isExhausted ? 'var(--danger)' : 'var(--blue-bright)',
                          borderRadius: 2,
                          width: `${Math.min(100, percentage)}%`
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Data Cap Selector */}
                <div>
                  <select
                    className="apple-input"
                    value={quota > 0 ? (quota / (1024 * 1024 * 1024)).toString() : '0'}
                    onChange={(e) => handleQuotaChange(peer.id, e.target.value)}
                    style={{ width: 120, padding: '5px 10px', fontSize: 12 }}
                  >
                    <option value="0">Unlimited</option>
                    <option value="0.25">250 MB</option>
                    <option value="1">1 GB</option>
                    <option value="2">2 GB</option>
                    <option value="5">5 GB</option>
                    <option value="10">10 GB</option>
                  </select>
                </div>

                {/* Packet Loss & Routing Score */}
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>
                  <span style={{ color: peer.packetLoss === 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {peer.packetLoss}% Loss
                  </span>
                  <div style={{ color: 'var(--text-muted)', fontSize: 10.5, marginTop: 2 }}>
                    {peer.score !== undefined ? `${peer.score} pts` : 'N/A'}
                  </div>
                </div>

                {/* Cut Off Action */}
                <div>
                  <button onClick={() => disconnectPeer(peer.id)} className="btn btn-danger btn-sm">
                    Cut Off
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
