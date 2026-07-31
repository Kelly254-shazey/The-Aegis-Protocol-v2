import { useAegisStore, useFormatBytes } from '../store/useAegisStore'
import { Server, ShieldAlert, Activity, Users } from 'lucide-react'

export default function ProviderDashboard() {
  const { peers, totalDataShared, peerQuotas, setPeerQuota, disconnectPeer } = useAegisStore()

  const handleQuotaChange = (peerId: string, value: string) => {
    const bytes = parseFloat(value) * 1024 * 1024 * 1024 // Convert GB to Bytes
    setPeerQuota(peerId, isNaN(bytes) ? 0 : bytes)
  }

  const activeConsumers = peers.filter(p => !p.isProvider && p.status === 'online')

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Provider <span>Quota Dashboard</span>
          </h1>
          <p className="page-desc">Manage bandwidth allocation for devices using your internet</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card animate-fade-in" style={{ animationDelay: '0ms' }}>
          <div className="stat-card-accent gold" />
          <div className="stat-card-icon gold">
            <Server size={18} />
          </div>
          <div className="stat-card-label">My Status</div>
          <div className="stat-card-value" style={{ color: 'var(--gold)', fontSize: 20 }}>
            Broadcasting
          </div>
          <div className="stat-card-sub">You are sharing internet</div>
        </div>

        <div className="stat-card animate-fade-in" style={{ animationDelay: '60ms' }}>
          <div className="stat-card-accent blue" />
          <div className="stat-card-icon blue">
            <Users size={18} />
          </div>
          <div className="stat-card-label">Active Consumers</div>
          <div className="stat-card-value">{activeConsumers.length}</div>
          <div className="stat-card-sub">Devices routing through you</div>
        </div>

        <div className="stat-card animate-fade-in" style={{ animationDelay: '120ms' }}>
           <div className="stat-card-accent green" />
          <div className="stat-card-icon green">
            <Activity size={18} />
          </div>
          <div className="stat-card-label">Total Uploaded</div>
          <div className="stat-card-value">{useFormatBytes(totalDataShared)}</div>
          <div className="stat-card-sub">Total data shared to peers</div>
        </div>
      </div>

      <div className="device-table-wrapper" style={{ marginTop: 24 }}>
        <div className="device-table-header">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <ShieldAlert size={14} />
             Peer Quota Management
          </div>
        </div>
        
        <div className="device-table">
          <div className="device-table-row header" style={{ gridTemplateColumns: '2fr 1fr 1.5fr 1fr 100px' }}>
            <span>Consumer Device</span>
            <span>Current Usage</span>
            <span>Data Cap (GB)</span>
            <span>Score (Internal)</span>
            <span>Actions</span>
          </div>

          {activeConsumers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📡</div>
              <div className="empty-state-title">No active consumers</div>
              <div className="empty-state-desc">No trusted devices are currently routing their traffic through you.</div>
            </div>
          ) : (
            activeConsumers.map(peer => {
              const quota = peerQuotas[peer.id] || 0
              const percentage = quota > 0 ? (peer.dataUsed / quota) * 100 : 0
              const isExhausted = quota > 0 && peer.dataUsed >= quota

              return (
                <div key={peer.id} className="device-table-row animate-fade-in" style={{ gridTemplateColumns: '2fr 1fr 1.5fr 1fr 100px' }}>
                  <div className="device-name-cell">
                    <div>
                      <div className="device-name">{peer.name}</div>
                      <div className="device-id">{peer.id}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="mono-text" style={{ color: isExhausted ? 'var(--danger)' : 'var(--text-primary)' }}>
                      {useFormatBytes(peer.dataUsed)}
                    </div>
                    {quota > 0 && (
                      <div style={{ width: 80, height: 4, background: 'var(--bg-surface2)', borderRadius: 2, marginTop: 4 }}>
                        <div style={{ 
                          height: '100%', 
                          background: isExhausted ? 'var(--danger)' : 'var(--blue)', 
                          borderRadius: 2,
                          width: `${Math.min(100, percentage)}%` 
                        }} />
                      </div>
                    )}
                  </div>

                  <div>
                     <select 
                        className="settings-input" 
                        value={quota > 0 ? (quota / (1024 * 1024 * 1024)).toString() : '0'} 
                        onChange={(e) => handleQuotaChange(peer.id, e.target.value)}
                        style={{ width: 120 }}
                      >
                        <option value="0">Unlimited</option>
                        <option value="1">1 GB</option>
                        <option value="2">2 GB</option>
                        <option value="5">5 GB</option>
                        <option value="10">10 GB</option>
                      </select>
                  </div>

                  <div className="mono-text" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {peer.score !== undefined ? peer.score : 'N/A'} pts
                  </div>

                  <div>
                    <button className="btn btn-danger btn-sm" onClick={() => disconnectPeer(peer.id)}>
                      Cut Off
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
