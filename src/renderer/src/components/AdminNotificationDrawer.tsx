import { useState } from 'react'
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  ShieldAlert,
  UserCheck,
  CreditCard,
  Radio,
  Info,
  Clock
} from 'lucide-react'
import { useAegisStore, AdminNotification } from '../store/useAegisStore'

interface AdminNotificationDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminNotificationDrawer({ isOpen, onClose }: AdminNotificationDrawerProps) {
  const {
    adminNotifications,
    markAdminNotificationRead,
    markAllAdminNotificationsRead,
    clearAdminNotifications
  } = useAegisStore()

  const [filter, setFilter] = useState<'all' | 'security' | 'clients' | 'billing' | 'system'>('all')

  if (!isOpen) return null

  const filtered = adminNotifications.filter((n) => {
    if (filter === 'all') return true
    return n.category === filter
  })

  const unreadCount = adminNotifications.filter((n) => !n.read).length

  const getCategoryIcon = (n: AdminNotification) => {
    switch (n.type) {
      case 'threat_blocked':
        return <ShieldAlert size={14} style={{ color: 'var(--danger)' }} />
      case 'client_connect':
        return <UserCheck size={14} style={{ color: 'var(--blue-bright)' }} />
      case 'pass_activated':
      case 'voucher_redeemed':
        return <CreditCard size={14} style={{ color: 'var(--success)' }} />
      case 'router_alert':
        return <Radio size={14} style={{ color: 'var(--gold-bright)' }} />
      default:
        return <Info size={14} style={{ color: 'var(--blue)' }} />
    }
  }

  const formatRelativeTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000)
    if (diff < 60) return `${Math.max(1, diff)}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: 'rgba(3, 5, 9, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 380,
          maxWidth: '90vw',
          height: '100%',
          background: 'rgba(11, 16, 30, 0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '1px solid var(--border-bright)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(212, 160, 23, 0.15)',
                border: '1px solid rgba(212, 160, 23, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-bright)'
              }}
            >
              <Bell size={16} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Overseer Alerts
                </span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      background: 'var(--gold)',
                      color: '#000',
                      padding: '1px 6px',
                      borderRadius: 999
                    }}
                  >
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Real-time fleet, client & security telemetry
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Action Toolbar & Filters */}
        <div
          style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            background: 'rgba(0, 0, 0, 0.15)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
              {(['all', 'security', 'billing', 'clients', 'system'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  style={{
                    background: filter === tab ? 'var(--blue)' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid ' + (filter === tab ? 'var(--blue)' : 'var(--border-subtle)'),
                    color: filter === tab ? '#fff' : 'var(--text-muted)',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: 999,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAdminNotificationsRead}
                  title="Mark all read"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--blue-bright)',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11
                  }}
                >
                  <CheckCheck size={14} />
                </button>
              )}
              {adminNotifications.length > 0 && (
                <button
                  onClick={clearAdminNotifications}
                  title="Clear all"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 4
                  }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                color: 'var(--text-muted)',
                gap: 8,
                textAlign: 'center',
                padding: '40px 20px'
              }}
            >
              <Bell size={32} style={{ opacity: 0.3 }} />
              <div style={{ fontSize: 13, fontWeight: 600 }}>No Notifications</div>
              <div style={{ fontSize: 11.5, maxWidth: 220 }}>
                All systems quiet. Connected clients, threats and subscriptions will appear here.
              </div>
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => markAdminNotificationRead(n.id)}
                style={{
                  background: n.read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(212, 160, 23, 0.06)',
                  border: n.read
                    ? '1px solid var(--border-subtle)'
                    : '1px solid rgba(212, 160, 23, 0.28)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  display: 'flex',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                {!n.read && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--gold-bright)'
                    }}
                  />
                )}

                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {getCategoryIcon(n)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 2
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: n.read ? 600 : 700,
                        color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)'
                      }}
                    >
                      {n.title}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 11.5,
                      color: n.read ? 'var(--text-muted)' : 'var(--text-secondary)',
                      lineHeight: 1.4,
                      wordBreak: 'break-word'
                    }}
                  >
                    {n.message}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      marginTop: 6
                    }}
                  >
                    <Clock size={10} />
                    <span>{formatRelativeTime(n.timestamp)}</span>
                    <span>•</span>
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {n.category}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
