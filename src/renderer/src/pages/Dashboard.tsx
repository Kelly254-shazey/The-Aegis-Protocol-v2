import { useAegisTick, useAegisStore } from '../store/useAegisStore'
import SpeedGraph from '../components/SpeedGraph'
import ProviderStatus from '../components/ProviderStatus'
import DeviceCard from '../components/DeviceCard'
import {
  Activity,
  Globe,
  MonitorSmartphone,
  Database,
  Radio,
  Zap,
} from 'lucide-react'

function formatBytes(bytes: number): string {
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(0)} MB`
  return `${(bytes / 1073741824).toFixed(2)} GB`
}

export default function Dashboard() {
  useAegisTick(2000)

  const { peers, connectionStatus, totalDataShared, disconnectPeer, uploadKbps, downloadKbps } =
    useAegisStore()

  const onlinePeers = peers.filter((p) => p.status === 'online')
  const totalPeers = peers.length
  const currentProvider = peers.find((p) => p.isProvider && p.status === 'online')

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            System <span>Dashboard</span>
          </h1>
          <p className="page-desc">Real-time monitoring of The Aegis Protocol network</p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(0,212,160,0.08)',
              border: '1px solid rgba(0,212,160,0.25)',
              fontSize: 11,
              color: 'var(--success)',
              fontWeight: 600,
            }}
          >
            <Radio size={12} />
            AEGIS ACTIVE
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        {/* My Status */}
        <div className="stat-card animate-fade-in">
          <div className="stat-card-accent gold" />
          <div className="stat-card-icon gold">
            <Zap size={18} />
          </div>
          <div className="stat-card-label">My Status</div>
          <div className="stat-card-value" style={{ color: 'var(--success)', fontSize: 20 }}>
            ● Online
          </div>
          <div className="stat-card-sub">
            ↑ {(uploadKbps / 1000).toFixed(1)} / ↓ {(downloadKbps / 1000).toFixed(1)} Mbps
          </div>
        </div>

        {/* Provider */}
        <div className="stat-card animate-fade-in">
          <div className="stat-card-accent blue" />
          <div className="stat-card-icon blue">
            <Globe size={18} />
          </div>
          <div className="stat-card-label">Internet Provider</div>
          <div className="stat-card-value" style={{ fontSize: 16, paddingTop: 4 }}>
            {currentProvider ? currentProvider.name : 'None'}
          </div>
          <div className="stat-card-sub">
            {currentProvider ? `${currentProvider.latency}ms latency` : 'No internet source'}
          </div>
        </div>

        {/* Data Shared */}
        <div className="stat-card animate-fade-in">
          <div className="stat-card-accent green" />
          <div className="stat-card-icon green">
            <Database size={18} />
          </div>
          <div className="stat-card-label">Data Shared Today</div>
          <div className="stat-card-value">{formatBytes(totalDataShared)}</div>
          <div className="stat-card-sub">Cumulative across all peers</div>
        </div>

        {/* Peers */}
        <div className="stat-card animate-fade-in">
          <div className="stat-card-accent" style={{ background: 'var(--gold)' }} />
          <div className="stat-card-icon gold">
            <MonitorSmartphone size={18} />
          </div>
          <div className="stat-card-label">Connected Devices</div>
          <div className="stat-card-value">
            {onlinePeers.length}
            <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>
              /{totalPeers}
            </span>
          </div>
          <div className="stat-card-sub">{onlinePeers.length} active right now</div>
        </div>
      </div>

      {/* Mid Row: Speed Graph + Provider */}
      <div className="mid-grid">
        <SpeedGraph />
        <ProviderStatus />
      </div>

      {/* Device Table */}
      <div className="device-table-wrapper">
        <div className="device-table-header">
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={14} />
            Trusted Devices
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {onlinePeers.length} / {totalPeers} online
          </div>
        </div>

        <div className="device-table">
          {/* Table Header */}
          <div className="device-table-row header">
            <span>Device</span>
            <span>Status</span>
            <span>Speed</span>
            <span>Latency</span>
            <span>Data Used</span>
            <span>Actions</span>
          </div>

          {/* Rows */}
          {peers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛡️</div>
              <div className="empty-state-title">No trusted devices yet</div>
              <div className="empty-state-desc">
                Pair a device to start sharing internet securely
              </div>
            </div>
          ) : (
            peers.map((peer) => (
              <DeviceCard key={peer.id} peer={peer} onDisconnect={disconnectPeer} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
