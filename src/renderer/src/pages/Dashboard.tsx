import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Globe,
  Activity,
  ArrowDown,
  ArrowUp,
  Zap,
  Wifi,
  Radio,
  ArrowRight
} from 'lucide-react'
import { useAegisTick, useAegisStore, useFormatBytes } from '../store/useAegisStore'
import PacketLossAlert from '../components/PacketLossAlert'
import { ClientPrivacyShield } from '../components/client/ClientPrivacyShield'
import { ClientSpeedTestWidget } from '../components/client/ClientSpeedTestWidget'

export default function Dashboard() {
  useAegisTick(2500)
  const navigate = useNavigate()

  const {
    connectionStatus,
    toggleConnection,
    uploadKbps,
    downloadKbps,
    networkHealth,
    turboBoostEnabled,
    toggleTurboBoost,
    cloudRoutes,
    signalStrengthDbm,
    activeSession
  } = useAegisStore()

  const [speedUnit, setSpeedUnit] = useState<'mbps' | 'kbps'>('mbps')

  const isConnected = connectionStatus === 'connected'
  const primaryCloudRoute = cloudRoutes.find((r) => r.isPrimary) || cloudRoutes[0]

  const displayDown =
    speedUnit === 'mbps'
      ? (downloadKbps / 1000).toFixed(1)
      : (downloadKbps).toLocaleString()
  const displayUp =
    speedUnit === 'mbps'
      ? (uploadKbps / 1000).toFixed(1)
      : (uploadKbps).toLocaleString()

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Packet Loss Warning Banner (Only fires if genuinely degraded on active session) */}
      <PacketLossAlert />

      {/* 1. TOP TELEMETRY RIBBON (Apple System Bar - Zero IP Visibility) */}
      <div
        className="glass-card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 12,
          padding: '12px 18px',
          background: 'rgba(18, 22, 34, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 16
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(52, 199, 89, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={16} color="var(--success)" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tunnel Latency
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: isConnected ? 'var(--success)' : 'var(--text-muted)' }}>
              {isConnected ? `${networkHealth.latencyMs} ms (${networkHealth.packetLossPercent}% Loss)` : 'Mesh Standby'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(0, 210, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={16} color="#00D2FF" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Egress Relay
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              {primaryCloudRoute?.region || 'EU-Central'} · {primaryCloudRoute?.provider || 'WireGuard'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(229, 169, 60, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={16} color="var(--gold-bright)" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Zero-Leak Shield
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-bright)' }}>
              100% IP & MAC Cloaked
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(0, 210, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wifi size={16} color="#00D2FF" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Wi-Fi Signal Link
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)' }}>
              {signalStrengthDbm} dBm · 1.2 Gbps
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN HERO SECTION: DUAL COLUMN (CONNECTION HUD + LIVE BANDWIDTH) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 20 }}>
        {/* LEFT COLUMN: INTERACTIVE CLIENT CONNECTION HUD */}
        <div
          className="glass-card"
          style={{
            background: 'radial-gradient(circle at 50% 15%, rgba(0, 210, 255, 0.08) 0%, rgba(18, 22, 34, 0.95) 75%)',
            border: isConnected ? '1.5px solid rgba(0, 210, 255, 0.35)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 24,
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'center',
            position: 'relative',
            boxShadow: isConnected ? '0 12px 40px rgba(0, 210, 255, 0.12)' : '0 8px 30px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Top Protocol Security Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 14px',
              borderRadius: 20,
              background: isConnected ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 255, 255, 0.06)',
              border: isConnected ? '1px solid rgba(52, 199, 89, 0.35)' : '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: 11,
              fontWeight: 700,
              color: isConnected ? 'var(--success)' : 'var(--text-muted)',
              marginBottom: 16
            }}
          >
            <Lock size={12} />
            <span>{isConnected ? 'Noise_XX_25519 Active · Encrypted Mesh' : 'Protection Paused · Tap to Connect'}</span>
          </div>

          {/* Interactive Clickable Dial */}
          <div style={{ position: 'relative', margin: '8px 0 16px' }}>
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
            <button
              onClick={toggleConnection}
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                border: isConnected ? '3px solid #00F5D4' : '2px solid rgba(255, 255, 255, 0.15)',
                background: isConnected
                  ? 'linear-gradient(135deg, #0071e3 0%, #00F5D4 100%)'
                  : 'linear-gradient(135deg, rgba(30, 36, 50, 0.9) 0%, rgba(15, 18, 28, 0.95) 100%)',
                boxShadow: isConnected ? '0 0 35px rgba(0, 245, 212, 0.4)' : '0 10px 30px rgba(0, 0, 0, 0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                position: 'relative',
                zIndex: 2
              }}
            >
              {isConnected ? (
                <>
                  <ShieldCheck size={44} color="#ffffff" />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', letterSpacing: '0.08em' }}>PROTECTED</span>
                  <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.7)' }}>TAP TO STOP</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={42} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>CONNECT</span>
                  <span style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>TAP TO START</span>
                </>
              )}
            </button>
          </div>

          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
              {isConnected ? 'Aegis Shield Active' : 'Disconnected from Mesh'}
            </h2>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', maxWidth: 340, margin: '0 0 12px', lineHeight: 1.45 }}>
              {isConnected
                ? 'Your device traffic is securely routed through the cloud mesh. All real IPs and MACs are 100% cloaked.'
                : 'Connect to route your traffic through high-speed encrypted mesh relays.'}
            </p>
          </div>

          {/* Strictly Blinded Ingress Badge */}
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 12
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Masked Ingress:</span>
            <span style={{ color: isConnected ? 'var(--success)' : 'var(--text-muted)', fontWeight: 700 }}>
              {isConnected ? '100.64.12.1 [Router-Cloaked]' : '100.64.••.•• [Standby]'}
            </span>
          </div>

          {/* Turbo 1.2G Switch */}
          <div style={{ width: '100%', maxWidth: 300, paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>1.2 Gbps Turbo Boost</div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>BBR v3 + QUIC low-latency acceleration</div>
            </div>
            <button
              onClick={toggleTurboBoost}
              className={`btn btn-sm ${turboBoostEnabled ? 'btn-gold' : 'btn-outline'}`}
              style={{ fontSize: 10.5, padding: '3px 10px', gap: 4 }}
            >
              <Zap size={11} />
              <span>{turboBoostEnabled ? 'TURBO ON' : 'ENABLE'}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE REAL-TIME THROUGHPUT & ZERO-LEAK PRIVACY SHIELD */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Live Bandwidth Card */}
          <div className="glass-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={15} color="var(--gold-bright)" />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Live Mesh Throughput</span>
              </div>
              <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.3)', padding: 2, borderRadius: 6 }}>
                {(['mbps', 'kbps'] as const).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setSpeedUnit(unit)}
                    style={{
                      padding: '2px 8px',
                      fontSize: 10,
                      borderRadius: 4,
                      border: 'none',
                      background: speedUnit === unit ? 'var(--blue-bright)' : 'transparent',
                      color: speedUnit === unit ? '#fff' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {unit.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Incoming Rx */}
              <div style={{ background: 'rgba(0, 210, 255, 0.06)', border: '1px solid rgba(0, 210, 255, 0.15)', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <ArrowDown size={14} color="#00D2FF" />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Incoming (Rx)</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#00D2FF' }}>
                  {isConnected ? displayDown : '0.0'}
                  <span style={{ fontSize: 10.5, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>
                    {speedUnit}
                  </span>
                </div>
              </div>

              {/* Outgoing Tx */}
              <div style={{ background: 'rgba(52, 199, 89, 0.06)', border: '1px solid rgba(52, 199, 89, 0.15)', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <ArrowUp size={14} color="var(--success)" />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Outgoing (Tx)</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: 'var(--success)' }}>
                  {isConnected ? displayUp : '0.0'}
                  <span style={{ fontSize: 10.5, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>
                    {speedUnit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Shield Component */}
          <ClientPrivacyShield />
        </div>
      </div>

      {/* 3. DIAGNOSTICS & ACCESS PASSES QUICK HUB */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        {/* Real-Time Diagnostics & Speed Test */}
        <ClientSpeedTestWidget />

        {/* Access Passes & Subscriptions Quick Hub (Navigates to /portal) */}
        <div
          className="glass-card"
          style={{
            padding: 22,
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(13, 23, 48, 0.8) 0%, rgba(20, 28, 48, 0.95) 100%)',
            border: '1px solid rgba(0, 113, 227, 0.3)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Radio size={16} style={{ color: 'var(--blue-bright)' }} />
                <span style={{ fontSize: 14, fontWeight: 700 }}>Access Passes & Hotspot Store</span>
              </div>
              <span className={`status-pill ${activeSession?.status === 'active' ? 'online' : 'standby'}`} style={{ fontSize: 10 }}>
                {activeSession?.status === 'active' ? 'PASS ACTIVE' : 'NO ACTIVE PASS'}
              </span>
            </div>

            {activeSession && activeSession.status === 'active' ? (
              <div style={{ background: 'rgba(52, 199, 89, 0.08)', border: '1px solid rgba(52, 199, 89, 0.3)', borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>
                  {activeSession.packageName}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Quota: {activeSession.quotaBytes === 0 ? 'Unlimited' : useFormatBytes(activeSession.quotaBytes)} · Unmetered Zero-Leak Protection
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                Need unmetered speed or extended time? Visit the Access Passes Store to choose a plan or redeem a venue voucher.
              </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 10, color: 'var(--gold-bright)', fontWeight: 800 }}>FREE TIER</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>30 Min Pass</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>$0.00 · Zero Logs</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 10, color: 'var(--blue-bright)', fontWeight: 800 }}>PRO PASS</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>24 Hour Unlimited</div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>$3.50 · High Priority</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/portal')}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', gap: 8, padding: '10px 16px' }}
          >
            <span>{activeSession?.status === 'active' ? 'Manage & Extend Pass in Store' : 'Browse All Passes & Vouchers'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
