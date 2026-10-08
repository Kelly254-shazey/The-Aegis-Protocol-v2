import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Shield,
  QrCode,
  ShieldAlert,
  Settings,
  Radio,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react'
import { useAegisStore, maskDeviceId } from '../store/useAegisStore'
import { AdminAuthModal } from './AdminAuthModal'

export default function Sidebar() {
  const {
    connectionStatus,
    myId,
    privacyMode,
    togglePrivacyMode,
    isDegradedConnection,
    threats,
    feedbacks,
    appPortalMode,
    setAppPortalMode,
    adminUnlocked,
    lockAdminPortal
  } = useAegisStore()

  const navigate = useNavigate()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const blockedThreats = threats.filter((t) => t.status === 'blocked').length
  const activeThreats = threats.filter((t) => t.status === 'active').length
  const newFeedback = feedbacks.filter((f) => f.status === 'new').length
  const adminBadgeCount = blockedThreats + activeThreats + newFeedback

  // Strict Navigation Separation: System Settings ONLY in Admin
  const CLIENT_NAV_ITEMS = [
    { to: '/', label: 'Connect & Shield', icon: Shield, shortcut: '1', exact: true },
    { to: '/portal', label: 'Access Passes', icon: Radio, shortcut: '2' },
    { to: '/pair', label: 'Share Network & QR', icon: QrCode, shortcut: '3' }
  ]

  const ADMIN_NAV_ITEMS = [
    { to: '/admin', label: 'Admin Command Console', icon: ShieldAlert, shortcut: '1', exact: true },
    { to: '/settings', label: 'System & Cloud Settings', icon: Settings, shortcut: '2' },
    { to: '/pair', label: 'Fleet Topologies & QR', icon: QrCode, shortcut: '3' },
    { to: '/', label: 'Client View Preview', icon: Shield, shortcut: '4' }
  ]

  const navItems = appPortalMode === 'admin' ? ADMIN_NAV_ITEMS : CLIENT_NAV_ITEMS

  const handleSwitchToAdmin = () => {
    if (adminUnlocked) {
      setAppPortalMode('admin')
      navigate('/admin')
    } else {
      setShowAuthModal(true)
    }
  }

  const handleSwitchToClient = () => {
    lockAdminPortal()
    navigate('/')
  }

  return (
    <aside className="sidebar">
      <div>
        {/* Workspace Brand Header */}
        <div className="sidebar-header">
          <div
            className="sidebar-logo"
            style={{
              background: appPortalMode === 'admin'
                ? 'linear-gradient(135deg, rgba(230, 180, 80, 0.3) 0%, rgba(200, 40, 40, 0.25) 100%)'
                : 'linear-gradient(135deg, rgba(0, 113, 227, 0.3) 0%, rgba(0, 245, 212, 0.2) 100%)',
              borderColor: appPortalMode === 'admin' ? 'var(--gold)' : 'var(--blue-bright)'
            }}
          >
            <Shield size={16} color={appPortalMode === 'admin' ? 'var(--gold-bright)' : '#00D2FF'} />
          </div>
          <div>
            <div className="sidebar-brand-title">
              {appPortalMode === 'admin' ? 'AEGIS OVERSEER' : 'THE AEGIS PROTOCOL'}
            </div>
            <div className="sidebar-brand-sub" style={{ color: appPortalMode === 'admin' ? 'var(--gold)' : 'var(--text-muted)' }}>
              {appPortalMode === 'admin' ? 'Master Admin Infrastructure' : 'Anonymous Client Portal'}
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon, shortcut, exact }) => (
            <NavLink
              key={to + label}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <div className="nav-link-content">
                <Icon size={16} />
                <span>{label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {label === 'Admin Command Console' && adminBadgeCount > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 999,
                      background: activeThreats > 0 ? 'var(--danger)' : 'var(--blue)',
                      color: '#fff'
                    }}
                  >
                    {adminBadgeCount}
                  </span>
                )}
                <span className="shortcut-badge">{shortcut}</span>
              </div>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Info: Portal Switcher, Identity & Status */}
      <div className="sidebar-footer">
        {/* Role Portal Switcher Button */}
        {appPortalMode === 'client' ? (
          <button
            onClick={handleSwitchToAdmin}
            className="btn btn-outline btn-sm"
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: 11,
              borderColor: 'rgba(230, 180, 80, 0.35)',
              color: 'var(--gold-bright)',
              background: 'rgba(230, 180, 80, 0.08)',
              padding: '6px 10px',
              borderRadius: 8,
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Lock size={12} />
            <span>Admin Overseer Portal</span>
          </button>
        ) : (
          <button
            onClick={handleSwitchToClient}
            className="btn btn-outline btn-sm"
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: 11,
              borderColor: 'rgba(255, 69, 58, 0.4)',
              color: 'var(--danger)',
              background: 'rgba(255, 69, 58, 0.08)',
              padding: '6px 10px',
              borderRadius: 8,
              marginBottom: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Lock size={12} />
            <span>Lock & Return to Client</span>
          </button>
        )}

        {/* Identity with Privacy Mode */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {appPortalMode === 'admin' ? 'Admin Node' : 'Client Node ID'}
            </span>
            <button
              onClick={togglePrivacyMode}
              title={privacyMode ? 'Reveal Device Identifier' : 'Mask Device Identifier'}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 2
              }}
            >
              {privacyMode ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-primary)', fontWeight: 600 }}>
            {maskDeviceId(myId, privacyMode)}
          </div>
        </div>

        {/* Live Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '4px 6px',
            fontSize: 11,
            color: 'var(--text-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: isDegradedConnection
                  ? 'var(--danger)'
                  : connectionStatus === 'connected'
                    ? 'var(--success)'
                    : 'var(--text-muted)',
                boxShadow: isDegradedConnection ? '0 0 8px var(--danger)' : '0 0 8px var(--success)'
              }}
            />
            <span style={{ fontSize: 11 }}>
              {connectionStatus === 'connected' ? 'Mesh Online' : 'Standby'}
            </span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>v2.5.0</span>
        </div>
      </div>

      <AdminAuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </aside>
  )
}
