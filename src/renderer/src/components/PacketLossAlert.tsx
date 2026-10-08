import { useState } from 'react'
import { AlertTriangle, RefreshCw, X } from 'lucide-react'
import { useAegisStore } from '../store/useAegisStore'

export default function PacketLossAlert() {
  const { networkHealth, isDegradedConnection, measureHealth, autoSwitch, setAutoSwitch, connectionStatus } = useAegisStore()
  const [dismissed, setDismissed] = useState(false)

  // Only display alert during an active connected session with verified packet loss
  if (dismissed || connectionStatus !== 'connected' || (!isDegradedConnection && networkHealth.packetLossPercent <= 5)) {
    return null
  }

  const handleOptimize = async () => {
    if (!autoSwitch) {
      setAutoSwitch(true)
    }
    await measureHealth()
  }

  return (
    <div className="alert-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertTriangle size={18} style={{ color: 'var(--danger)', flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#fff', marginRight: 6 }}>Elevated Packet Loss Detected:</strong>
          <span>
            Current route has {networkHealth.packetLossPercent}% dropped packets (Jitter: {networkHealth.jitterMs}ms).
            {autoSwitch
              ? ' Smart Auto-Switch is actively routing traffic to a healthier peer.'
              : ' Enable Smart Auto-Switch to automatically failover to an optimal peer.'}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleOptimize}
          className="btn btn-outline btn-sm"
          style={{
            borderColor: 'rgba(255, 69, 58, 0.4)',
            color: '#fff',
            gap: 6
          }}
        >
          <RefreshCw size={12} />
          Optimize Route
        </button>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            padding: 4
          }}
          title="Dismiss Alert"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
