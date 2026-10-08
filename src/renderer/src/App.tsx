import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import MobileBottomNav from './components/MobileBottomNav'
import Dashboard from './pages/Dashboard'
import HotspotPortal from './pages/HotspotPortal'
import AdminConsole from './pages/AdminConsole'
import PairDevice from './pages/PairDevice'
import Settings from './pages/Settings'
import { AdminToastNotification } from './components/AdminToastNotification'
import { AdminNotificationDrawer } from './components/AdminNotificationDrawer'
import './assets/main.css'
import {
  ShieldCheck,
  ShieldAlert,
  X,
  ArrowRight,
  Zap,
  Rocket,
  Sparkles,
  Wifi,
  Bell,
  Lock
} from 'lucide-react'
import {
  useAegisStore,
  Peer,
  ClientFeedback,
  ThreatEvent,
  AppUpdateInfo
} from './store/useAegisStore'

function AppUpdateNotificationBanner() {
  const { appUpdate, triggerUpdateDownload, installUpdate, dismissUpdateBanner } = useAegisStore()

  if (!appUpdate.hasUpdate) return null

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, rgba(0, 113, 227, 0.28) 0%, rgba(13, 148, 136, 0.22) 100%)',
        borderBottom: '1px solid rgba(0, 113, 227, 0.45)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#fff',
        zIndex: 9998,
        position: 'sticky',
        top: 0,
        boxShadow: '0 4px 18px rgba(0, 113, 227, 0.2)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'rgba(0, 113, 227, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(0, 113, 227, 0.7)'
          }}
        >
          <Rocket size={14} style={{ color: 'var(--blue-bright)' }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                background: 'rgba(0, 113, 227, 0.4)',
                padding: '1px 6px',
                borderRadius: 4,
                color: '#fff'
              }}
            >
              NEW RELEASE v{appUpdate.latestVersion}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
              {appUpdate.releaseTitle}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.8)', marginTop: 1 }}>
            Outstanding 1.2 Gbps Turbo Mesh Speed, -38 dBm Signal Booster & Zero-Tolerance Killswitch.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {appUpdate.status === 'downloading' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 120,
                height: 6,
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 999,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${appUpdate.downloadProgress}%`,
                  height: '100%',
                  background: 'var(--teal)',
                  transition: 'width 0.2s ease'
                }}
              />
            </div>
            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
              {appUpdate.downloadProgress}%
            </span>
          </div>
        ) : appUpdate.status === 'ready' ? (
          <button
            onClick={installUpdate}
            className="btn btn-primary btn-sm"
            style={{
              background: 'var(--teal)',
              borderColor: 'var(--teal)',
              color: '#000',
              fontWeight: 700,
              fontSize: 11.5,
              padding: '4px 10px'
            }}
          >
            <Sparkles size={12} /> Restart & Apply v{appUpdate.latestVersion}
          </button>
        ) : (
          <button
            onClick={triggerUpdateDownload}
            className="btn btn-primary btn-sm"
            style={{
              background: 'var(--blue-bright)',
              borderColor: 'var(--blue-bright)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 11.5,
              padding: '4px 10px'
            }}
          >
            <Rocket size={12} /> Update Now (v{appUpdate.latestVersion})
          </button>
        )}

        <button
          onClick={dismissUpdateBanner}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center'
          }}
          title="Dismiss Release Notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  )
}

function ZeroToleranceEmergencyBanner() {
  const { latestFlaggedThreat, dismissLatestThreatAlert } = useAegisStore()
  const navigate = useNavigate()

  if (!latestFlaggedThreat) return null

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, rgba(235, 75, 75, 0.24) 0%, rgba(200, 40, 40, 0.16) 100%)',
        borderBottom: '1px solid rgba(235, 75, 75, 0.5)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color: '#ff8a8a',
        zIndex: 9999,
        position: 'sticky',
        top: 0,
        boxShadow: '0 4px 20px rgba(220, 38, 38, 0.25)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(235, 75, 75, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(235, 75, 75, 0.6)'
          }}
        >
          <ShieldAlert size={16} style={{ color: '#ff4d4d' }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(235, 75, 75, 0.3)', padding: '2px 6px', borderRadius: 4, color: '#fff' }}>
              FLAGGED OFF IMMEDIATELY
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
              Channel: {latestFlaggedThreat.channel}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.7)' }}>
              Source: {latestFlaggedThreat.sourceNode}
            </span>
          </div>
          <div style={{ fontSize: 11.5, color: '#ffb3b3', marginTop: 2 }}>
            {latestFlaggedThreat.description} — <strong>Session terminated, socket destroyed in 0ms.</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => {
            dismissLatestThreatAlert()
            navigate('/admin')
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#fff',
            borderRadius: 6,
            padding: '5px 10px',
            fontSize: 11.5,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <span>Quarantine Vault</span>
          <ArrowRight size={13} />
        </button>
        <button
          onClick={dismissLatestThreatAlert}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.7)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center'
          }}
          title="Dismiss Alert"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

function TopBar({ onOpenNotifications }: { onOpenNotifications?: () => void }) {
  const navigate = useNavigate()
  const {
    connectionStatus,
    myName,
    networkHealth,
    isDegradedConnection,
    zeroToleranceMode,
    toggleZeroToleranceMode,
    turboBoostEnabled,
    toggleTurboBoost,
    signalStrengthDbm,
    appUpdate,
    appPortalMode,
    adminNotifications,
    lockAdminPortal
  } = useAegisStore()

  const unreadNotifs = adminNotifications.filter((n) => !n.read).length

  return (
    <header className="topbar">
      <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isDegradedConnection
                ? 'var(--danger)'
                : connectionStatus === 'connected'
                  ? 'var(--success)'
                  : 'var(--text-muted)',
              boxShadow: isDegradedConnection
                ? '0 0 10px var(--danger)'
                : connectionStatus === 'connected'
                  ? '0 0 10px var(--success)'
                  : 'none'
            }}
          />
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
            {appPortalMode === 'admin' ? 'AEGIS OVERSEER' : 'THE AEGIS PROTOCOL'}
          </div>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>|</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 12,
            background: appPortalMode === 'admin' ? 'rgba(230, 180, 80, 0.15)' : 'rgba(0, 210, 255, 0.15)',
            color: appPortalMode === 'admin' ? 'var(--gold-bright)' : '#00D2FF',
            border: appPortalMode === 'admin' ? '1px solid rgba(230, 180, 80, 0.3)' : '1px solid rgba(0, 210, 255, 0.3)',
            whiteSpace: 'nowrap'
          }}
        >
          {appPortalMode === 'admin' ? 'Admin Portal' : 'Client App'}
        </span>
      </div>

      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
        {/* Admin Real-Time Notifications Bell */}
        {appPortalMode === 'admin' && (
          <button
            onClick={onOpenNotifications}
            title={`Overseer Alerts & Telemetry (${unreadNotifs} unread)`}
            style={{
              position: 'relative',
              background: unreadNotifs > 0 ? 'rgba(212, 160, 23, 0.18)' : 'rgba(255, 255, 255, 0.05)',
              border: unreadNotifs > 0 ? '1px solid var(--gold)' : '1px solid var(--border-subtle)',
              color: unreadNotifs > 0 ? 'var(--gold-bright)' : 'var(--text-muted)',
              width: 28,
              height: 28,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            <Bell size={14} />
            {unreadNotifs > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  minWidth: 14,
                  height: 14,
                  padding: '0 3px',
                  borderRadius: 999,
                  background: 'var(--danger)',
                  color: '#fff',
                  fontSize: 9,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #000'
                }}
              >
                {unreadNotifs}
              </span>
            )}
          </button>
        )}

        {/* Signal Strength Pill */}
        <div
          title="Signal Strength: -38 dBm (5/5 Bars)"
          style={{
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            color: 'var(--success)',
            padding: '2px 8px',
            borderRadius: 14,
            fontSize: 10.5,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            whiteSpace: 'nowrap'
          }}
        >
          <Wifi size={11} />
          <span>{signalStrengthDbm} dBm</span>
        </div>

        {/* Turbo Acceleration Toggle Pill */}
        <button
          onClick={toggleTurboBoost}
          title={turboBoostEnabled ? 'Turbo Boost Active: 1.2 Gbps' : 'Click to enable Turbo Boost'}
          style={{
            background: turboBoostEnabled ? 'rgba(0, 113, 227, 0.18)' : 'rgba(255, 255, 255, 0.05)',
            border: turboBoostEnabled ? '1px solid var(--blue-bright)' : '1px solid var(--border-subtle)',
            color: turboBoostEnabled ? 'var(--blue-bright)' : 'var(--text-muted)',
            padding: '2px 8px',
            borderRadius: 14,
            fontSize: 10.5,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          <Zap size={11} />
          <span>{turboBoostEnabled ? 'TURBO 1.2G' : 'NORMAL'}</span>
        </button>

        {/* Zero-Tolerance Policy Pill (Admin Mode only) */}
        {appPortalMode === 'admin' && (
          <button
            onClick={toggleZeroToleranceMode}
            title={zeroToleranceMode ? 'Zero-Tolerance Active' : 'Permissive'}
            style={{
              background: zeroToleranceMode ? 'rgba(235, 75, 75, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: zeroToleranceMode ? '1px solid rgba(235, 75, 75, 0.4)' : '1px solid var(--border-subtle)',
              color: zeroToleranceMode ? '#ff6b6b' : 'var(--text-muted)',
              padding: '2px 8px',
              borderRadius: 14,
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <span>{zeroToleranceMode ? '0-TOLERANCE' : 'PERMISSIVE'}</span>
          </button>
        )}

        {/* Real Network Health Diagnostics */}
        <div className="health-pill-group" style={{ whiteSpace: 'nowrap' }}>
          <span
            className={`health-stat ${
              connectionStatus !== 'connected'
                ? ''
                : networkHealth.packetLossPercent === 0
                ? 'loss-clean'
                : 'loss-warn'
            }`}
          >
            {connectionStatus === 'connected' ? `${networkHealth.packetLossPercent}% Loss` : 'Ready'}
          </span>
          <span style={{ color: 'var(--border-mid)' }}>·</span>
          <span className="health-stat" style={{ color: 'var(--text-primary)' }}>
            {networkHealth.latencyMs}ms
          </span>
        </div>

        {/* Release Version Pill */}
        <div
          style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            padding: '2px 6px',
            borderRadius: 6,
            color: appUpdate.hasUpdate ? 'var(--gold-bright)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            whiteSpace: 'nowrap'
          }}
        >
          {appUpdate.hasUpdate && (
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold-bright)' }} />
          )}
          <span>v{appUpdate.currentVersion}</span>
        </div>

        {/* Admin Instant Lock Button */}
        {appPortalMode === 'admin' && (
          <button
            onClick={() => {
              lockAdminPortal()
              navigate('/')
            }}
            title="Lock Overseer & Return to Client App"
            style={{
              background: 'rgba(255, 69, 58, 0.12)',
              border: '1px solid rgba(255, 69, 58, 0.35)',
              color: 'var(--danger)',
              padding: '2px 8px',
              borderRadius: 14,
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Lock size={10} />
            <span>LOCK</span>
          </button>
        )}

        {/* Node Identity Tag with fixed width to prevent wrapping */}
        <div
          style={{
            paddingLeft: 10,
            borderLeft: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            maxWidth: 120,
            flexShrink: 0
          }}
        >
          <div style={{ textAlign: 'right', overflow: 'hidden' }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {appPortalMode === 'admin' ? 'Overseer' : 'Client'}
            </div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={myName}
            >
              {myName}
            </div>
          </div>
          <ShieldCheck size={14} style={{ color: appPortalMode === 'admin' ? 'var(--gold-bright)' : 'var(--blue-bright)', flexShrink: 0 }} />
        </div>
      </div>
    </header>
  )
}

function MainLayout() {
  const [showNotifDrawer, setShowNotifDrawer] = useState(false)
  const {
    adminUnlocked,
    appPortalMode,
    addPeer,
    submitFeedback,
    flagOffThreatImmediately,
    tick,
    measureHealth,
    refreshPortalInfo,
    setUpdateAvailable,
    setUpdateProgress
  } = useAegisStore()

  useEffect(() => {
    // 1. Initial health and portal probe
    measureHealth()
    refreshPortalInfo()

    // 2. Set interval for store tick
    const tickInterval = setInterval(() => {
      tick()
    }, 2000)

    // 3. Periodic real health measurement
    const healthInterval = setInterval(() => {
      measureHealth()
    }, 15000)

    // 4. Hook up IPC events from electron main process
    let cleanupPeer: (() => void) | undefined
    let cleanupFeedback: (() => void) | undefined
    let cleanupThreat: (() => void) | undefined
    let cleanupUpdateAvail: (() => void) | undefined
    let cleanupUpdateProg: (() => void) | undefined

    if (typeof window !== 'undefined' && window.api) {
      if (window.api.onPeerJoined) {
        cleanupPeer = window.api.onPeerJoined((peer) => {
          addPeer(peer as Peer)
        })
      }

      if (window.api.onClientFeedback) {
        cleanupFeedback = window.api.onClientFeedback((fb) => {
          const item = fb as ClientFeedback
          submitFeedback({
            clientName: item.clientName,
            deviceFingerprint: item.deviceFingerprint,
            rating: item.rating,
            message: item.message
          })
        })
      }

      if (window.api.onThreatDetected) {
        cleanupThreat = window.api.onThreatDetected((threat) => {
          const item = threat as ThreatEvent
          flagOffThreatImmediately({
            type: item.type,
            channel: item.channel,
            sourceNode: item.sourceNode,
            description: item.description,
            severity: item.severity
          })
        })
      }

      if (window.api.onUpdateAvailable) {
        cleanupUpdateAvail = window.api.onUpdateAvailable((info) => {
          setUpdateAvailable(info as Partial<AppUpdateInfo>)
        })
      }

      if (window.api.onUpdateProgress) {
        cleanupUpdateProg = window.api.onUpdateProgress((prog) => {
          setUpdateProgress(prog)
        })
      }
    }

    return () => {
      clearInterval(tickInterval)
      clearInterval(healthInterval)
      if (cleanupPeer) cleanupPeer()
      if (cleanupFeedback) cleanupFeedback()
      if (cleanupThreat) cleanupThreat()
      if (cleanupUpdateAvail) cleanupUpdateAvail()
      if (cleanupUpdateProg) cleanupUpdateProg()
    }
  }, [
    addPeer,
    submitFeedback,
    flagOffThreatImmediately,
    tick,
    measureHealth,
    refreshPortalInfo,
    setUpdateAvailable,
    setUpdateProgress
  ])

  const isAdminActive = adminUnlocked && appPortalMode === 'admin'

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <AppUpdateNotificationBanner />
        <ZeroToleranceEmergencyBanner />
        <TopBar onOpenNotifications={() => setShowNotifDrawer(true)} />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/portal" element={<HotspotPortal />} />
          {/* Strictly Protected Admin & System Settings: Accessible ONLY to Authorized Admin */}
          <Route
            path="/admin"
            element={isAdminActive ? <AdminConsole /> : <Navigate to="/" replace />}
          />
          <Route
            path="/settings"
            element={isAdminActive ? <Settings /> : <Navigate to="/" replace />}
          />
          <Route path="/pair" element={<PairDevice />} />
          <Route path="/provider" element={<Navigate to="/" replace />} />
          <Route path="/devices" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <MobileBottomNav />
        <AdminToastNotification />
        <AdminNotificationDrawer
          isOpen={showNotifDrawer}
          onClose={() => setShowNotifDrawer(false)}
        />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <MainLayout />
    </HashRouter>
  )
}
