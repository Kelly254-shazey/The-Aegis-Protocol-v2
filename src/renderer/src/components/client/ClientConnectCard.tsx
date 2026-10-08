import React from 'react'
import { ShieldCheck, ShieldAlert, Lock, ArrowDown, ArrowUp } from 'lucide-react'
import { useAegisStore } from '../../store/useAegisStore'

export const ClientConnectCard: React.FC = () => {
  const {
    connectionStatus,
    cloudRoutes,
    downloadKbps,
    uploadKbps
  } = useAegisStore()

  const isConnected = connectionStatus === 'connected'
  const primaryRoute = cloudRoutes.find((r) => r.isPrimary) || cloudRoutes[0]

  // Real speeds in Mbps
  const downMbps = (downloadKbps / 1000).toFixed(1)
  const upMbps = (uploadKbps / 1000).toFixed(1)

  return (
    <div
      className="glass-card"
      style={{
        background: 'radial-gradient(circle at 50% 10%, rgba(0, 210, 255, 0.08) 0%, rgba(18, 22, 34, 0.95) 75%)',
        border: isConnected ? '1.5px solid rgba(0, 210, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 24,
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        boxShadow: isConnected ? '0 12px 40px rgba(0, 210, 255, 0.12)' : '0 8px 30px rgba(0,0,0,0.5)'
      }}
    >
      {/* Top Security Status Pill */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 14px',
          borderRadius: 20,
          background: isConnected ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 69, 58, 0.12)',
          border: isConnected ? '1px solid rgba(52, 199, 89, 0.35)' : '1px solid rgba(255, 69, 58, 0.3)',
          fontSize: 11,
          fontWeight: 700,
          color: isConnected ? 'var(--success)' : '#ff6b6b',
          marginBottom: 24
        }}
      >
        <Lock size={12} />
        <span>{isConnected ? 'Noise_XX_25519 Encrypted (Zero IP / MAC Leak)' : 'Unprotected Network Connection'}</span>
      </div>

      {/* Main Interactive Dial */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        {isConnected && (
          <div
            style={{
              position: 'absolute',
              inset: -14,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 245, 212, 0.35) 0%, transparent 70%)',
              animation: 'pulse-glow 2.5s infinite ease-in-out'
            }}
          />
        )}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            border: isConnected ? '3px solid #00F5D4' : '2px solid rgba(255, 255, 255, 0.15)',
            background: isConnected
              ? 'linear-gradient(135deg, #0071e3 0%, #00F5D4 100%)'
              : 'linear-gradient(135deg, rgba(30, 36, 50, 0.8) 0%, rgba(15, 18, 28, 0.95) 100%)',
            boxShadow: isConnected ? '0 0 35px rgba(0, 245, 212, 0.4)' : '0 10px 30px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            position: 'relative',
            zIndex: 2
          }}
        >
          {isConnected ? (
            <>
              <ShieldCheck size={46} color="#ffffff" />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', letterSpacing: '0.08em' }}>PROTECTED</span>
            </>
          ) : (
            <>
              <ShieldAlert size={44} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>STANDBY</span>
            </>
          )}
        </div>
      </div>

      {/* Connection Egress Node & Strictly Blinded IP */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
          {isConnected ? (primaryRoute?.name || 'Aegis Cloud Mesh Gateway') : 'Aegis Protocol Mesh'}
        </div>
        <div
          style={{
            fontSize: 12,
            color: isConnected ? 'var(--success)' : 'var(--text-muted)',
            fontFamily: "'JetBrains Mono', monospace",
            marginTop: 4
          }}
        >
          {isConnected ? 'Ingress Blinded: 100.64.12.1 [Router-Cloaked]' : 'Real IP & MAC hidden behind zero-trace shield'}
        </div>
      </div>

      {/* Live Bandwidth Counters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
          width: '100%',
          maxWidth: 320,
          padding: '12px 16px',
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: 14,
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0, 210, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowDown size={15} color="#00D2FF" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Incoming (Rx)</div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#00D2FF' }}>
              {isConnected ? `${downMbps} Mbps` : '0.0 Mbps'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(52, 199, 89, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUp size={15} color="var(--success)" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Outgoing (Tx)</div>
            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: 'var(--success)' }}>
              {isConnected ? `${upMbps} Mbps` : '0.0 Mbps'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
