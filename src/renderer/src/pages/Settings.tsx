import {
  HardDrive,
  Network,
  ShieldAlert,
  Radio,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Layers,
  Copy,
  Check,
  DownloadCloud,
  RefreshCw,
  Sparkles,
  Zap,
  Cloud,
  Globe,
  Router,
  Eye,
  EyeOff,
  Activity
} from 'lucide-react'
import { useState } from 'react'
import { useAegisStore, maskDeviceId } from '../store/useAegisStore'

export default function Settings() {
  const {
    myName,
    setMyName,
    myId,
    autoSwitch,
    setAutoSwitch,
    privacyMode,
    togglePrivacyMode,
    portalUrl,
    antiMitmShield,
    toggleDnsLeakShield,
    toggleWebrtcShield,
    setOnionHops,
    appUpdate,
    checkForUpdates,
    triggerUpdateDownload,
    installUpdate,
    turboBoostEnabled,
    toggleTurboBoost,
    linkSpeedMbps,
    signalStrengthDbm,
    channelSpectrum,
    mimoConfig,
    congestionControl,
    // Cloud Settings & State
    cloudConfig,
    updateCloudConfig,
    testCloudConnection,
    syncPackagesToCloud,
    registerIngressNodeWithCloud,
    cloudRoutes,
    setPrimaryCloudRoute,
    cloudAnonymity,
    toggleCloudAnonymityFeature,
    adminPasscode,
    setAdminPasscode,
    addAdminNotification
  } = useAegisStore()

  // Navigation tab state: purely for Overseer Admin
  const [activeTab, setActiveTab] = useState<'cloud' | 'security' | 'turbo' | 'device' | 'updates' | 'admin_auth'>('cloud')

  // Overseer Passcode management state
  const [newPasscode, setNewPasscode] = useState('')
  const [confirmPasscode, setConfirmPasscode] = useState('')
  const [passcodeSuccess, setPasscodeSuccess] = useState<string | null>(null)
  const [passcodeError, setPasscodeError] = useState<string | null>(null)

  // Cloud UI state
  const [showApiKey, setShowApiKey] = useState(false)
  const [copiedIp, setCopiedIp] = useState(false)
  const [copiedApiKey, setCopiedApiKey] = useState(false)
  const [copiedPortalUrl, setCopiedPortalUrl] = useState(false)
  const [isTestingCloud, setIsTestingCloud] = useState(false)
  const [cloudTestMessage, setCloudTestMessage] = useState<string | null>(null)
  const [isSyncingPackages, setIsSyncingPackages] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [isRegisteringUplink, setIsRegisteringUplink] = useState(false)
  const [uplinkMessage, setUplinkMessage] = useState<string | null>(null)

  const handleCopyBlindedIp = () => {
    navigator.clipboard.writeText(antiMitmShield.blindedVirtualIp)
    setCopiedIp(true)
    setTimeout(() => setCopiedIp(false), 2000)
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(cloudConfig.adminApiKey)
    setCopiedApiKey(true)
    setTimeout(() => setCopiedApiKey(false), 2000)
  }

  const handleCopyPortalDomain = () => {
    const url = `https://${cloudConfig.publicPortalDomain}/?mesh=true`
    navigator.clipboard.writeText(url)
    setCopiedPortalUrl(true)
    setTimeout(() => setCopiedPortalUrl(false), 2000)
  }

  const handleTestCloud = async () => {
    setIsTestingCloud(true)
    setCloudTestMessage(null)
    const res = await testCloudConnection()
    setIsTestingCloud(false)
    setCloudTestMessage(res.message)
    setTimeout(() => setCloudTestMessage(null), 5000)
  }

  const handleSyncPackages = async () => {
    setIsSyncingPackages(true)
    setSyncMessage(null)
    const res = await syncPackagesToCloud()
    setIsSyncingPackages(false)
    setSyncMessage(`✓ Synced ${res.count} pricing passes to Cloud Server`)
    setTimeout(() => setSyncMessage(null), 4000)
  }

  const handleRegisterUplink = async () => {
    setIsRegisteringUplink(true)
    setUplinkMessage(null)
    const res = await registerIngressNodeWithCloud()
    setIsRegisteringUplink(false)
    setUplinkMessage(`✓ ${res.message}`)
    setTimeout(() => setUplinkMessage(null), 4000)
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span
              style={{
                background: 'linear-gradient(135deg, var(--gold), #8a6400)',
                color: '#000',
                fontSize: 10,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 999,
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}
            >
              Overseer Restricted
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Core Infrastructure & Cloud Security Settings
            </span>
          </div>
          <h1 className="page-title">
            Admin <span>System Settings & Cloud Relay</span>
          </h1>
          <p className="page-desc">
            Configure 24/7 cloud server endpoints, router ingress uplinks, anti-MITM protection & master security credentials
          </p>
        </div>
      </div>

      {/* Navigation Tabs (Apple Segmented Style) */}
      <div className="filter-tabs" style={{ marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab('cloud')}
          className={`filter-pill${activeTab === 'cloud' ? ' active' : ''}`}
        >
          <Cloud size={14} />
          <span>Cloud & Uplink Relay</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`filter-pill${activeTab === 'security' ? ' active' : ''}`}
        >
          <ShieldAlert size={14} />
          <span>Security & Anti-MITM</span>
        </button>

        <button
          onClick={() => setActiveTab('turbo')}
          className={`filter-pill${activeTab === 'turbo' ? ' active' : ''}`}
        >
          <Zap size={14} />
          <span>Speed & Radio Turbo</span>
        </button>

        <button
          onClick={() => setActiveTab('device')}
          className={`filter-pill${activeTab === 'device' ? ' active' : ''}`}
        >
          <HardDrive size={14} />
          <span>Device & Hotspot</span>
        </button>

        <button
          onClick={() => setActiveTab('admin_auth')}
          className={`filter-pill${activeTab === 'admin_auth' ? ' active' : ''}`}
        >
          <Lock size={14} />
          <span>Admin Security & Passcode</span>
        </button>

        <button
          onClick={() => setActiveTab('updates')}
          className={`filter-pill${activeTab === 'updates' ? ' active' : ''}`}
        >
          <DownloadCloud size={14} />
          <span>Software Releases</span>
          {appUpdate.hasUpdate && (
            <span className="status-pill warn" style={{ fontSize: 9, padding: '1px 5px' }}>
              NEW
            </span>
          )}
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: CLOUD & UPLINK RELAY SETTINGS                          */}
      {/* ============================================================== */}
      {activeTab === 'cloud' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
          {/* Card 1: Cloud Server & VPS Relay Connection */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700 }}>
                <Cloud size={16} style={{ color: 'var(--blue-bright)' }} />
                <span>Cloud Server & Relay Endpoint</span>
              </div>
              <span className={`status-pill ${cloudConfig.connectionStatus === 'connected' ? 'online' : 'standby'}`} style={{ fontSize: 10 }}>
                {cloudConfig.connectionStatus === 'connected'
                  ? `● CONNECTED (${cloudConfig.lastPingLatencyMs}ms)`
                  : '● CONNECTING...'}
              </span>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.45 }}>
              Your always-on cloud server running Docker + Caddy SSL. Receives router feeds and delivers anonymous cloaked internet to clients 24/7.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Endpoint URL Input */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Cloud VPS Gateway URL
                </label>
                <input
                  type="text"
                  className="apple-input"
                  style={{ width: '100%', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
                  value={cloudConfig.serverUrl}
                  onChange={(e) => updateCloudConfig({ serverUrl: e.target.value })}
                  placeholder="e.g. http://142.93.120.45:3888 or https://cloud.aegis.net"
                />

                {/* URL Quick Presets */}
                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => updateCloudConfig({ serverUrl: 'http://localhost:3888' })}
                    style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    Local VPS (:3888)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCloudConfig({ serverUrl: 'https://cloud.aegis-protocol.net' })}
                    style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    Production Cluster
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCloudConfig({ serverUrl: 'http://127.0.0.1:8080' })}
                    style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  >
                    Docker Bridge (:8080)
                  </button>
                </div>
              </div>

              {/* Admin Secret API Key */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Admin Authorization Secret Key
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      className="apple-input"
                      style={{ width: '100%', fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, letterSpacing: showApiKey ? 'normal' : '0.15em', paddingRight: 36 }}
                      value={cloudConfig.adminApiKey}
                      onChange={(e) => updateCloudConfig({ adminApiKey: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                      title={showApiKey ? 'Hide Key' : 'Reveal Key'}
                    >
                      {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <button onClick={handleCopyApiKey} className="btn btn-outline btn-sm">
                    {copiedApiKey ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
                    <span>{copiedApiKey ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Authenticates live pricing updates, security telemetry, and remote node control.
                </span>
              </div>

              {/* Test & Sync Triggers */}
              <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
                <button
                  onClick={handleTestCloud}
                  disabled={isTestingCloud}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <RefreshCw size={13} className={isTestingCloud ? 'spin' : ''} />
                  <span>{isTestingCloud ? 'Testing RTT...' : '⚡ Ping & Test Cloud Link'}</span>
                </button>

                <button
                  onClick={handleSyncPackages}
                  disabled={isSyncingPackages}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <RefreshCw size={13} className={isSyncingPackages ? 'spin' : ''} />
                  <span>{isSyncingPackages ? 'Syncing...' : '🔄 Sync Prices to Cloud'}</span>
                </button>
              </div>

              {/* Feedback Notifications */}
              {cloudTestMessage && (
                <div style={{ padding: '8px 12px', background: 'rgba(52, 199, 89, 0.12)', border: '1px solid rgba(52, 199, 89, 0.3)', borderRadius: 6, fontSize: 11.5, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={13} />
                  <span>{cloudTestMessage}</span>
                </div>
              )}

              {syncMessage && (
                <div style={{ padding: '8px 12px', background: 'rgba(0, 113, 227, 0.12)', border: '1px solid rgba(0, 113, 227, 0.3)', borderRadius: 6, fontSize: 11.5, color: 'var(--blue-bright)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={13} />
                  <span>{syncMessage}</span>
                </div>
              )}

              {/* Auto-Sync Polling Interval */}
              <div style={{ paddingTop: 10, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>Auto-Sync Telemetry Frequency</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Background polling for peers & threats</div>
                </div>
                <select
                  className="apple-input"
                  style={{ width: 150, fontSize: 11.5 }}
                  value={cloudConfig.syncIntervalSeconds}
                  onChange={(e) => updateCloudConfig({ syncIntervalSeconds: Number(e.target.value) })}
                >
                  <option value={5}>Every 5s (Real-time)</option>
                  <option value={10}>Every 10s (Optimal)</option>
                  <option value={30}>Every 30s (Low Data)</option>
                  <option value={0}>Manual Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Router Ingress Uplink Configuration (Mode 1 & Mode 2) */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700 }}>
                <Router size={16} style={{ color: 'var(--success)' }} />
                <span>Router Ingress Uplink (Feed UP to Cloud)</span>
              </div>
              <div
                className={`apple-toggle${cloudConfig.contributeAsIngress ? ' on' : ''}`}
                onClick={() => updateCloudConfig({ contributeAsIngress: !cloudConfig.contributeAsIngress })}
                role="switch"
                aria-checked={cloudConfig.contributeAsIngress}
              >
                <div className="apple-toggle-knob" />
              </div>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.45 }}>
              Donate this node or connected home/field router&apos;s connection UP to the cloud mesh so clients and travelers can use it from anywhere in the world.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Ingress Node Role Type */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Ingress Uplink Architecture Role
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { id: 'home_router', label: 'Home Wi-Fi Router', sub: 'Travel & Family Pass', icon: '🏠' },
                    { id: 'field_router', label: 'Field / Office AP', sub: 'Multi-Route Mesh', icon: '🏢' },
                    { id: 'dedicated_server', label: 'Dedicated Server', sub: '1-10 Gbps Scale-Up', icon: '🖥️' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => updateCloudConfig({ ingressType: t.id as any })}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: cloudConfig.ingressType === t.id ? '1.5px solid var(--success)' : '1px solid var(--border-subtle)',
                        background: cloudConfig.ingressType === t.id ? 'rgba(52, 199, 89, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        color: cloudConfig.ingressType === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{t.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{t.label}</span>
                      <span style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>{t.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingress Node Name */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Ingress Node Identifier
                </label>
                <input
                  type="text"
                  className="apple-input"
                  style={{ width: '100%', fontSize: 12 }}
                  value={cloudConfig.ingressName}
                  onChange={(e) => updateCloudConfig({ ingressName: e.target.value })}
                />
              </div>

              {/* Donated Bandwidth Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Donated Upstream Bandwidth Cap
                  </label>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 700, color: 'var(--success)' }}>
                    {cloudConfig.ingressBandwidthMbps} Mbps
                  </span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={1000}
                  step={10}
                  value={cloudConfig.ingressBandwidthMbps}
                  onChange={(e) => updateCloudConfig({ ingressBandwidthMbps: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--success)' }}
                />
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {[50, 100, 350, 1000].map((mbps) => (
                    <button
                      key={mbps}
                      type="button"
                      onClick={() => updateCloudConfig({ ingressBandwidthMbps: mbps })}
                      style={{
                        flex: 1,
                        fontSize: 10,
                        padding: '3px 0',
                        borderRadius: 4,
                        background: cloudConfig.ingressBandwidthMbps === mbps ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255,255,255,0.04)',
                        border: cloudConfig.ingressBandwidthMbps === mbps ? '1px solid var(--success)' : '1px solid var(--border-subtle)',
                        color: cloudConfig.ingressBandwidthMbps === mbps ? 'var(--success)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {mbps === 1000 ? '1 Gbps' : `${mbps}M`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tunnel MTU & Keepalive (Zero Packet Loss) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingTop: 6 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                    WireGuard MTU (Clamped)
                  </label>
                  <input
                    type="number"
                    className="apple-input"
                    style={{ width: '100%', fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace" }}
                    value={cloudConfig.wireguardMtu}
                    onChange={(e) => updateCloudConfig({ wireguardMtu: Number(e.target.value) })}
                  />
                  <span style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                    1420 prevents fragmentation
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Persistent Keepalive
                  </label>
                  <input
                    type="number"
                    className="apple-input"
                    style={{ width: '100%', fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace" }}
                    value={cloudConfig.persistentKeepaliveSeconds}
                    onChange={(e) => updateCloudConfig({ persistentKeepaliveSeconds: Number(e.target.value) })}
                  />
                  <span style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                    21s traverses CGNAT
                  </span>
                </div>
              </div>

              {/* Register Uplink Button */}
              <button
                onClick={handleRegisterUplink}
                disabled={isRegisteringUplink}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              >
                <Activity size={13} className={isRegisteringUplink ? 'spin' : ''} />
                <span>{isRegisteringUplink ? 'Registering with Cloud...' : 'Register Ingress Node with Cloud Swarm'}</span>
              </button>

              {uplinkMessage && (
                <div style={{ padding: '8px 12px', background: 'rgba(52, 199, 89, 0.12)', border: '1px solid rgba(52, 199, 89, 0.3)', borderRadius: 6, fontSize: 11.5, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={13} />
                  <span>{uplinkMessage}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Cloud Egress Routing & Blinded Masquerade */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700 }}>
                <Globe size={16} style={{ color: 'var(--gold-bright)' }} />
                <span>Cloud Egress Routing & Masquerade</span>
              </div>
              <span className="status-pill online" style={{ fontSize: 10 }}>
                100% Real IP Stripped
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Primary Cloud Route Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Primary Cloud Egress Relay
                </label>
                <select
                  className="apple-input"
                  style={{ width: '100%', fontSize: 12 }}
                  value={cloudRoutes.find((r) => r.isPrimary)?.id || 'cloud-01'}
                  onChange={(e) => setPrimaryCloudRoute(e.target.value)}
                >
                  {cloudRoutes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.region} · {r.latencyMs}ms)
                    </option>
                  ))}
                </select>
              </div>

              {/* Masquerade NAT Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>Zero-Trace Masquerade NAT</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Scrubs client MACs and replaces real IPs with anonymous onion endpoints
                  </div>
                </div>
                <div
                  className={`apple-toggle${cloudConfig.masqueradeZeroIpLeak ? ' on' : ''}`}
                  onClick={() => updateCloudConfig({ masqueradeZeroIpLeak: !cloudConfig.masqueradeZeroIpLeak })}
                  role="switch"
                  aria-checked={cloudConfig.masqueradeZeroIpLeak}
                >
                  <div className="apple-toggle-knob" />
                </div>
              </div>

              {/* Cloud DoH Provider */}
              <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Cloud Encrypted DNS (DoH) Upstream
                </label>
                <select
                  className="apple-input"
                  style={{ width: '100%', fontSize: 12 }}
                  value={cloudConfig.dohProvider}
                  onChange={(e) => updateCloudConfig({ dohProvider: e.target.value as any })}
                >
                  <option value="cloudflare">Cloudflare (1.1.1.1 · Fastest Anonymized)</option>
                  <option value="quad9">Quad9 (9.9.9.9 · Zero-Log Threat Filter)</option>
                  <option value="adguard">AdGuard DNS (Ad &amp; Malicious Tracker Blocker)</option>
                </select>
              </div>

              {/* Encrypted SNI (ECH) Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}>Encrypted Client Hello (ECH / SNI)</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Hides requested domain names from ISP eavesdropping
                  </div>
                </div>
                <div
                  className={`apple-toggle${cloudAnonymity.sniEncryptedECH ? ' on' : ''}`}
                  onClick={() => toggleCloudAnonymityFeature('sniEncryptedECH')}
                  role="switch"
                  aria-checked={cloudAnonymity.sniEncryptedECH}
                >
                  <div className="apple-toggle-knob" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Cloud Captive Portal & Custom Domain */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700 }}>
                <Radio size={16} style={{ color: 'var(--blue-bright)' }} />
                <span>Cloud Captive Portal & Domain</span>
              </div>
              <span className="status-pill online" style={{ fontSize: 10 }}>
                TLS 1.3 Active
              </span>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.45 }}>
              Public Web Portal served directly to mobile devices. Protected by automated Caddy Let&apos;s Encrypt SSL certificates.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Public Portal Domain
                </label>
                <input
                  type="text"
                  className="apple-input"
                  style={{ width: '100%', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
                  value={cloudConfig.publicPortalDomain}
                  onChange={(e) => updateCloudConfig({ publicPortalDomain: e.target.value })}
                  placeholder="e.g. wifi.myvenue.com or cloud.aegis-protocol.net"
                />
              </div>

              {/* Resolved Portal Link with Copy */}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Active Cloud Portal URL
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    readOnly
                    value={`https://${cloudConfig.publicPortalDomain}/?mesh=true`}
                    className="apple-input"
                    style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
                  />
                  <button onClick={handleCopyPortalDomain} className="btn btn-outline btn-sm">
                    {copiedPortalUrl ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
                    <span>{copiedPortalUrl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Server Stack Health Details */}
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Reverse Proxy</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Caddy 2 (Auto-HTTPS)</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Container Stack</div>
                  <div style={{ fontWeight: 700, color: 'var(--success)' }}>Docker Compose v2</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Tunnel Protocol</div>
                  <div style={{ fontWeight: 700, color: 'var(--blue-bright)' }}>Noise_IKpsk2 / WireGuard</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Uptime</div>
                  <div style={{ fontWeight: 700, color: 'var(--teal)' }}>99.98% 24/7 Live</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SECURITY & ANTI-MITM                                   */}
      {/* ============================================================== */}
      {activeTab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
          {/* Anti-MITM & Cryptographic Cloaking */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700 }}>
                <ShieldAlert size={16} style={{ color: 'var(--gold-bright)' }} />
                <span>Anti-MITM &amp; IP Anonymity Shield</span>
              </div>
              <span className="status-pill online" style={{ fontSize: 10 }}>100% Blinded</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Blinded Virtual IP Display */}
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cryptographic Virtual IP</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: 'var(--teal)' }}>
                    {antiMitmShield.blindedVirtualIp}
                  </div>
                </div>
                <button
                  className="btn-icon"
                  onClick={handleCopyBlindedIp}
                  title="Copy Blinded IP"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copiedIp ? 'var(--success)' : 'var(--text-secondary)' }}
                >
                  {copiedIp ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              {/* DNS Leak Shield Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={14} style={{ color: 'var(--teal)' }} />
                    DNS-over-HTTPS (DoH) Leak Shield
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Forces DNS queries through encrypted HTTPS tunnels, preventing ISP/hotspot sniffing
                  </div>
                </div>
                <div
                  className={`apple-toggle${antiMitmShield.dnsLeakShield ? ' on' : ''}`}
                  onClick={toggleDnsLeakShield}
                  role="switch"
                  aria-checked={antiMitmShield.dnsLeakShield}
                >
                  <div className="apple-toggle-knob" />
                </div>
              </div>

              {/* WebRTC STUN Leak Blocker Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={14} style={{ color: 'var(--blue-bright)' }} />
                    WebRTC STUN Leak Blocker
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Drops unauthorized STUN/TURN candidate discovery that could expose host IP
                  </div>
                </div>
                <div
                  className={`apple-toggle${antiMitmShield.webrtcShield ? ' on' : ''}`}
                  onClick={toggleWebrtcShield}
                  role="switch"
                  aria-checked={antiMitmShield.webrtcShield}
                >
                  <div className="apple-toggle-knob" />
                </div>
              </div>

              {/* Onion Routing Hops Selector */}
              <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Layers size={14} style={{ color: 'var(--gold-bright)' }} />
                    Multi-Hop Circuit Cascading
                  </div>
                  <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: 'var(--gold-bright)', fontWeight: 600 }}>
                    {antiMitmShield.onionRoutingHops} {antiMitmShield.onionRoutingHops === 1 ? 'Hop' : 'Hops'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[1, 2, 3].map((hops) => (
                    <button
                      key={hops}
                      onClick={() => setOnionHops(hops)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: antiMitmShield.onionRoutingHops === hops ? '1px solid var(--gold-bright)' : '1px solid var(--border-subtle)',
                        background: antiMitmShield.onionRoutingHops === hops ? 'rgba(230, 180, 80, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        color: antiMitmShield.onionRoutingHops === hops ? 'var(--gold-bright)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: 11.5,
                        fontWeight: 600,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{hops} {hops === 1 ? 'Hop' : 'Hops'}</span>
                      <span style={{ fontSize: 9.5, opacity: 0.7 }}>
                        {hops === 1 ? 'Fastest' : hops === 2 ? 'Balanced' : 'Max Onion'}
                      </span>
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 6, display: 'block' }}>
                  Multi-hop cascading wraps outbound packets in successive layers of encryption across mesh relay nodes.
                </span>
              </div>

              {/* Cipher & Key Exchange Specs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-subtle)', fontSize: 11.5 }}>
                <span style={{ color: 'var(--text-muted)' }}>Authenticated Cipher</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)', fontWeight: 600 }}>
                  {antiMitmShield.noisePattern}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SPEED & RADIO TURBO                                    */}
      {/* ============================================================== */}
      {activeTab === 'turbo' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
          {/* Turbo Speed & Wi-Fi Radio Engine */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700 }}>
                <Zap size={16} style={{ color: 'var(--gold-bright)' }} />
                <span>Outstanding Speed &amp; Radio Turbo Engine</span>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: turboBoostEnabled ? 'rgba(230, 180, 80, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  color: turboBoostEnabled ? 'var(--gold-bright)' : 'var(--text-muted)'
                }}
              >
                {turboBoostEnabled ? '⚡ TURBO ACTIVE' : 'STANDARD'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Turbo Mode Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Turbo Speed Acceleration</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    Activates Google BBR v3 congestion control &amp; QUIC 0-RTT fast path
                  </div>
                </div>
                <div
                  className={`apple-toggle${turboBoostEnabled ? ' on' : ''}`}
                  onClick={toggleTurboBoost}
                  role="switch"
                  aria-checked={turboBoostEnabled}
                >
                  <div className="apple-toggle-knob" />
                </div>
              </div>

              {/* Radio Diagnostics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Phy Link Rate</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: 'var(--blue-bright)' }}>
                    {linkSpeedMbps.toLocaleString()} Mbps (1.2 Gbps)
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Signal Strength</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>
                    {signalStrengthDbm} dBm (5/5 Outstanding)
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Channel Spectrum</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {channelSpectrum}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Beamforming / MIMO</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: 'var(--gold-bright)' }}>
                    {mimoConfig}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-subtle)', fontSize: 11.5 }}>
                <span style={{ color: 'var(--text-muted)' }}>Kernel Congestion Algo</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)', fontWeight: 600 }}>
                  {congestionControl}
                </span>
              </div>
            </div>
          </div>

          {/* Network & Packet Loss Routing */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
              <Network size={16} style={{ color: 'var(--gold-bright)' }} />
              <span>Routing &amp; Packet Loss Mitigation</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Smart Auto-Switch</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    Automatically switch to lowest latency &amp; zero-loss peer
                  </div>
                </div>
                <div
                  className={`apple-toggle${autoSwitch ? ' on' : ''}`}
                  onClick={() => setAutoSwitch(!autoSwitch)}
                  role="switch"
                  aria-checked={autoSwitch}
                >
                  <div className="apple-toggle-knob" />
                </div>
              </div>

              <div style={{ paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Packet Loss Sensitivity Threshold
                </label>
                <select className="apple-input" style={{ width: '100%' }} defaultValue="5">
                  <option value="3">Strict (Failover at &gt;3% loss)</option>
                  <option value="5">Balanced (Failover at &gt;5% loss)</option>
                  <option value="10">Tolerant (Failover at &gt;10% loss)</option>
                </select>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  When dropped packets exceed this threshold, the node immediately reroutes.
                </span>
              </div>

              <div style={{ paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Adaptive Jitter Buffering active (RFC 3550 compliance)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: DEVICE & LOCAL HOTSPOT                                 */}
      {/* ============================================================== */}
      {activeTab === 'device' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
          {/* Device & Privacy Configuration (Apple Style) */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
              <HardDrive size={16} style={{ color: 'var(--blue-bright)' }} />
              <span>Device Identity &amp; UI Privacy</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Friendly Device Name
                </label>
                <input
                  type="text"
                  className="apple-input"
                  style={{ width: '100%' }}
                  value={myName}
                  onChange={(e) => setMyName(e.target.value)}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  How this node is displayed to peers and in hotspot connection receipts.
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Mask Hardware Identifiers</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    Conceal raw device IDs in client &amp; admin UI with privacy fingerprints
                  </div>
                </div>
                <div
                  className={`apple-toggle${privacyMode ? ' on' : ''}`}
                  onClick={togglePrivacyMode}
                  role="switch"
                  aria-checked={privacyMode}
                >
                  <div className="apple-toggle-knob" />
                </div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>Current Display Fingerprint</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {maskDeviceId(myId, privacyMode)}
                </span>
              </div>
            </div>
          </div>

          {/* Hotspot & Mobile Web Portal Configuration */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, marginBottom: 16 }}>
              <Radio size={16} style={{ color: 'var(--blue-bright)' }} />
              <span>Embedded Mobile Hotspot Server</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Gateway Portal URL
                </label>
                <input
                  type="text"
                  readOnly
                  value={portalUrl}
                  className="apple-input"
                  style={{ width: '100%', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  Mobile clients scanning your QR code open this address on the local Wi-Fi.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Bound Local Socket
                </label>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--success)' }}>
                  100.64.12.1 [Router-Cloaked] : 3888
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: SOFTWARE RELEASES                                       */}
      {/* ============================================================== */}
      {activeTab === 'updates' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
          {/* Software Updates & Version Releases (Apple Style) */}
          <div className="glass-card" style={{ border: appUpdate.hasUpdate ? '1px solid rgba(0, 113, 227, 0.4)' : '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700 }}>
                <DownloadCloud size={16} style={{ color: 'var(--blue-bright)' }} />
                <span>Software Updates &amp; Releases</span>
              </div>
              {appUpdate.hasUpdate ? (
                <span className="status-pill warn" style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={10} /> Update Available
                </span>
              ) : (
                <span className="status-pill online" style={{ fontSize: 10 }}>Up to date</span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px 14px', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Installed Version</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    v{appUpdate.currentVersion}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Latest Mesh Channel</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: appUpdate.hasUpdate ? 'var(--gold-bright)' : 'var(--success)' }}>
                    v{appUpdate.latestVersion}
                  </div>
                </div>
              </div>

              {appUpdate.hasUpdate && (
                <div style={{ background: 'rgba(0, 113, 227, 0.08)', border: '1px solid rgba(0, 113, 227, 0.25)', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--blue-bright)', marginBottom: 6 }}>
                    {appUpdate.releaseTitle}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {appUpdate.releaseNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Live Download Progress */}
              {appUpdate.status === 'downloading' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Downloading signed release binary...</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'var(--blue-bright)' }}>
                      {appUpdate.downloadProgress}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${appUpdate.downloadProgress}%`,
                        background: 'linear-gradient(90deg, var(--blue-bright), var(--success))',
                        transition: 'width 0.2s ease'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Action Triggers */}
              <div style={{ display: 'flex', gap: 10, paddingTop: 6 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => checkForUpdates()}
                  disabled={appUpdate.status === 'checking' || appUpdate.status === 'downloading'}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <RefreshCw size={13} className={appUpdate.status === 'checking' ? 'spin' : ''} />
                  <span>{appUpdate.status === 'checking' ? 'Checking OTA...' : 'Check for Updates'}</span>
                </button>

                {appUpdate.hasUpdate && appUpdate.status !== 'ready' && appUpdate.status !== 'downloading' && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => triggerUpdateDownload()}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <DownloadCloud size={13} />
                    <span>Download v{appUpdate.latestVersion}</span>
                  </button>
                )}

                {(appUpdate.status === 'ready' || (appUpdate.hasUpdate && appUpdate.downloadProgress === 100)) && (
                  <button
                    className="btn btn-sm"
                    onClick={() => installUpdate()}
                    style={{
                      flex: 1,
                      background: 'var(--success)',
                      color: '#000',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Sparkles size={13} />
                    <span>Restart &amp; Apply Update</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: ADMIN PASSCODE & ZERO-TRUST AUTH CONTROL               */}
      {/* ============================================================== */}
      {activeTab === 'admin_auth' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 20 }}>
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(212, 160, 23, 0.15)',
                  border: '1px solid rgba(212, 160, 23, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold-bright)'
                }}
              >
                <Lock size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                  Master Admin Overseer Credentials
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                  Only verified administrators can enter or configure the Overseer Console.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Active Master Passcode
                </label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div
                    style={{
                      flex: 1,
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      padding: '9px 12px',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                      color: 'var(--gold-bright)'
                    }}
                  >
                    •••••••• ({adminPasscode.slice(0, 2)}••{adminPasscode.slice(-2)})
                  </div>
                  <span className="status-pill online" style={{ fontSize: 10 }}>Active</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Update Overseer Passcode</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      New Passcode (min 4 characters)
                    </label>
                    <input
                      type="password"
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      placeholder="Enter new master passcode"
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid var(--border-bright)',
                        borderRadius: 8,
                        padding: '9px 12px',
                        color: '#fff',
                        fontSize: 13,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                      Confirm New Passcode
                    </label>
                    <input
                      type="password"
                      value={confirmPasscode}
                      onChange={(e) => setConfirmPasscode(e.target.value)}
                      placeholder="Confirm new master passcode"
                      style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.35)',
                        border: '1px solid var(--border-bright)',
                        borderRadius: 8,
                        padding: '9px 12px',
                        color: '#fff',
                        fontSize: 13,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {passcodeError && (
                    <div style={{ color: 'var(--danger)', fontSize: 11.5 }}>{passcodeError}</div>
                  )}
                  {passcodeSuccess && (
                    <div style={{ color: 'var(--success)', fontSize: 11.5 }}>{passcodeSuccess}</div>
                  )}

                  <button
                    onClick={() => {
                      if (newPasscode.trim().length < 4) {
                        setPasscodeError('Passcode must be at least 4 characters long.')
                        return
                      }
                      if (newPasscode.trim() !== confirmPasscode.trim()) {
                        setPasscodeError('Passcodes do not match.')
                        return
                      }
                      setAdminPasscode(newPasscode.trim())
                      setPasscodeError(null)
                      setPasscodeSuccess('Master Overseer Passcode successfully updated!')
                      setNewPasscode('')
                      setConfirmPasscode('')
                      addAdminNotification({
                        type: 'system',
                        category: 'security',
                        title: 'Master Passcode Changed',
                        message: 'Admin authorization passcode updated successfully.',
                        severity: 'success'
                      })
                      setTimeout(() => setPasscodeSuccess(null), 4000)
                    }}
                    className="btn btn-gold btn-sm"
                    style={{ alignSelf: 'flex-start', marginTop: 4 }}
                  >
                    Save New Passcode
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
              Zero-Trust Administration Protocol
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              The Aegis Protocol enforces strict cryptographic role separation:
            </p>
            <ul style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, paddingLeft: 18, margin: 0 }}>
              <li><strong>Zero Client Visibility:</strong> Clients have no route, link, or access to system settings or network fleet topologies.</li>
              <li><strong>Intrusion Isolation:</strong> Multiple failed passcode attempts trigger automated temporary lockouts and log a security threat event.</li>
              <li><strong>Instant Lock:</strong> The topbar LOCK button terminates the admin session immediately with one click.</li>
              <li><strong>Automatic Fallback:</strong> Any non-authorized attempt to load settings redirects immediately to the client dashboard.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
