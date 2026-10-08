import { useEffect } from 'react'
import { ShieldAlert, UserCheck, CreditCard, Radio, Info, X } from 'lucide-react'
import { useAegisStore } from '../store/useAegisStore'

export function AdminToastNotification() {
  const { latestAdminToast, dismissAdminToast, appPortalMode } = useAegisStore()

  useEffect(() => {
    if (!latestAdminToast) return
    const timer = setTimeout(() => {
      dismissAdminToast()
    }, 4500)
    return () => clearTimeout(timer)
  }, [latestAdminToast, dismissAdminToast])

  if (!latestAdminToast || appPortalMode !== 'admin') return null

  const getIcon = () => {
    switch (latestAdminToast.type) {
      case 'threat_blocked':
        return <ShieldAlert size={16} style={{ color: 'var(--danger)' }} />
      case 'client_connect':
        return <UserCheck size={16} style={{ color: 'var(--blue-bright)' }} />
      case 'pass_activated':
      case 'voucher_redeemed':
        return <CreditCard size={16} style={{ color: 'var(--success)' }} />
      case 'router_alert':
        return <Radio size={16} style={{ color: 'var(--gold-bright)' }} />
      default:
        return <Info size={16} style={{ color: 'var(--gold)' }} />
    }
  }

  const getBorderColor = () => {
    switch (latestAdminToast.severity) {
      case 'danger':
        return 'rgba(255, 69, 58, 0.45)'
      case 'success':
        return 'rgba(52, 199, 89, 0.45)'
      case 'warning':
        return 'rgba(255, 159, 10, 0.45)'
      default:
        return 'rgba(212, 160, 23, 0.45)'
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 60,
        right: 24,
        zIndex: 9995,
        maxWidth: 380,
        minWidth: 300,
        background: 'rgba(11, 16, 30, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${getBorderColor()}`,
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.65), 0 0 20px rgba(0,0,0,0.4)',
        borderRadius: 12,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 8,
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {getIcon()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>
            {latestAdminToast.title}
          </span>
          <button
            onClick={dismissAdminToast}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 2,
              lineHeight: 1
            }}
          >
            <X size={14} />
          </button>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 11.5,
            color: 'var(--text-secondary)',
            lineHeight: 1.35,
            wordBreak: 'break-word'
          }}
        >
          {latestAdminToast.message}
        </p>
      </div>
    </div>
  )
}
