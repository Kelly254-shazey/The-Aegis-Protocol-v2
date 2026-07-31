import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Link2,
  MonitorSmartphone,
  Settings,
  Shield,
  Wifi,
} from 'lucide-react'
import { useAegisStore } from '../store/useAegisStore'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/pair', label: 'Pair Device', icon: Link2 },
  { to: '/provider', label: 'Provider Quota', icon: Shield },
  { to: '/devices', label: 'Trusted Devices', icon: MonitorSmartphone },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const { peers, connectionStatus } = useAegisStore()
  const onlinePeers = peers.filter((p) => p.status === 'online').length
  const location = useLocation()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <svg className="logo-shield" viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 2L3 9V22C3 31.9 10.5 41.1 20 44C29.5 41.1 37 31.9 37 22V9L20 2Z"
              fill="url(#shield-grad)"
              stroke="#D4A017"
              strokeWidth="1.5"
            />
            <path
              d="M20 10L10 14.5V22C10 28 14.5 33.5 20 35.5C25.5 33.5 30 28 30 22V14.5L20 10Z"
              fill="rgba(212,160,23,0.2)"
              stroke="rgba(212,160,23,0.6)"
              strokeWidth="1"
            />
            <path
              d="M15 22L18.5 25.5L25 18"
              stroke="#F5C842"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="shield-grad" x1="20" y1="2" x2="20" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1a2750" />
                <stop offset="100%" stopColor="#080c18" />
              </linearGradient>
            </defs>
          </svg>

          <div>
            <div className="logo-title">AEGIS</div>
            <div className="logo-subtitle">Protocol</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon className="nav-item-icon" size={16} />
            {label}
            {label === 'Trusted Devices' && onlinePeers > 0 && (
              <span className="nav-badge">{onlinePeers}</span>
            )}
          </NavLink>
        ))}

        <div className="nav-section-label" style={{ marginTop: 12 }}>Network</div>
        <div
          className="nav-item"
          style={{
            cursor: 'default',
            background: 'transparent',
            borderColor: 'transparent',
          }}
        >
          <Wifi size={16} className="nav-item-icon" style={{ opacity: 0.5 }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {connectionStatus === 'connected'
              ? `${onlinePeers} peer${onlinePeers !== 1 ? 's' : ''} online`
              : 'Not connected'}
          </span>
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Admin Card */}
        <div className="admin-card">
          <div className="admin-label">Administrator</div>
          <div className="admin-name">
            <Shield
              size={10}
              style={{ display: 'inline', marginRight: 4, color: 'var(--gold)' }}
            />
            System Admin
          </div>
          <div className="status-dot-row">
            <div className="status-dot" />
            <span className="status-dot-label">Active Session</span>
          </div>
        </div>

        {/* Founder Credit */}
        <div className="founder-credit">
          <div className="founder-text">Founded by</div>
          <div className="founder-name">Javaln Mwei</div>
        </div>
      </div>
    </aside>
  )
}
