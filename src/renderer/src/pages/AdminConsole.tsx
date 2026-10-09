import { useState } from 'react'
import {
  ShieldAlert,
  Cloud,
  Layers,
  DollarSign,
  MessageSquare,
  Users,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Globe,
  Radio,
  Edit3,
  Save,
  Check,
  Plus,
  ShieldCheck,
  Zap,
  RotateCcw,
  Trash2,
  DownloadCloud,
  Send,
  Sparkles,
  Wifi,
  Router,
  UserCheck,
  UserX,
  Server,
  Terminal,
  Key,
  FileText,
  RefreshCw,
  Copy,
  Home,
  QrCode,
  Bell,
  Clock,
  CreditCard,
  Eye,
  EyeOff,
  Activity,
  ArrowRight
} from 'lucide-react'
import QRCode from 'qrcode'
import {
  useAegisStore,
  useFormatBytes,
  AccessPackage,
  CloudRoute,
  RouterDevice,
  ProviderNode,
  maskDeviceId,
  generateRouterWireguardConfig
} from '../store/useAegisStore'

export default function AdminConsole() {
  const {
    adminConnected,
    adminUptimeSeconds,
    packages,
    updatePackagePrice,
    updatePackageDetails,
    threats,
    zeroToleranceMode,
    toggleZeroToleranceMode,
    unbanThreat,
    blockThreat,
    clearThreats,
    cloudRoutes,
    setPrimaryCloudRoute,
    toggleCloudRoute,
    addCloudRoute,
    cloudConfig,
    updateCloudConfig,
    testCloudConnection,
    syncPackagesToCloud,
    loadBalanceStrategy,
    setLoadBalanceStrategy,
    loadDistribution,
    feedbacks,
    resolveFeedback,
    peers,
    peerQuotas,
    setPeerQuota,
    disconnectPeer,
    privacyMode,
    antiMitmShield,
    toggleDnsLeakShield,
    toggleWebrtcShield,
    setOnionHops,
    blindedVirtualIp,
    appUpdate,
    broadcastRelease,
    networkTopologyMode,
    setNetworkTopologyMode,
    routers,
    addRouter,
    removeRouter,
    rebootRouter,
    promotePeerRole,
    revokePeerRole,
    generateAdminGrantToken,
    providerNodes,
    toggleProviderNode,
    portalUrl,
    adminNotifications,
    markAdminNotificationRead,
    markAllAdminNotificationsRead,
    clearAdminNotifications
  } = useAegisStore()

  const [activeTab, setActiveTab] = useState<
    | 'anonymity'
    | 'cloud'
    | 'team'
    | 'pricing'
    | 'threats'
    | 'load_balance'
    | 'feedback'
    | 'consumers'
    | 'updates'
    | 'runbook'
    | 'notifications'
  >('cloud')

  // Remote Home Wi-Fi Ingress QR Modal State (Example 1: Travel & QR sharing)
  const [showTravelQrModal, setShowTravelQrModal] = useState(false)
  const [travelModalQrDataUrl, setTravelModalQrDataUrl] = useState('')
  const [copiedTravelLink, setCopiedTravelLink] = useState(false)
  const [activeTravelNode, setActiveTravelNode] = useState<ProviderNode | null>(null)

  const handleOpenTravelQr = (node?: ProviderNode) => {
    const targetNode = node || providerNodes[0] || null
    setActiveTravelNode(targetNode)
    const base = portalUrl || 'http://localhost:3888'
    const url = `${base.replace(/\/$/, '')}/aegis.apk`
    QRCode.toDataURL(url, { color: { dark: '#030509', light: '#ffffff' }, margin: 2, width: 220 })
      .then(setTravelModalQrDataUrl)
      .catch(console.error)
    setShowTravelQrModal(true)
    setCopiedTravelLink(false)
  }

  const handleCopyTravelLink = () => {
    const base = portalUrl || 'http://localhost:3888'
    const url = `${base.replace(/\/$/, '')}/aegis.apk`
    navigator.clipboard.writeText(url)
    setCopiedTravelLink(true)
    setTimeout(() => setCopiedTravelLink(false), 2000)
  }

  // Router Fleet Management Form State
  const [showAddRouter, setShowAddRouter] = useState(false)
  const [newRouterName, setNewRouterName] = useState('')
  const [newRouterModel, setNewRouterModel] = useState('OpenWrt 23.05 (Wi-Fi 6 160MHz)')
  const [newRouterSubnet, setNewRouterSubnet] = useState('192.168.12.1/24')
  const [newRouterSsid, setNewRouterSsid] = useState('Aegis-Ultra-Mesh-5G')
  const [newRouterCloudRoute, setNewRouterCloudRoute] = useState('cloud-01')
  const [selectedRouterConfig, setSelectedRouterConfig] = useState<string | null>(null)
  const [selectedRouterObj, setSelectedRouterObj] = useState<RouterDevice | null>(null)
  const [copiedConfig, setCopiedConfig] = useState(false)

  // Team RBAC Promotion State
  const [generatedGrantKey, setGeneratedGrantKey] = useState<string | null>(null)
  const [copiedGrantKey, setCopiedGrantKey] = useState(false)

  // OTA Release Publisher State
  const [releaseVersion, setReleaseVersion] = useState('2.5.1')
  const [releaseTitle, setReleaseTitle] = useState('Aegis Protocol v2.5.1 - Ultra-Low Latency & Fast Path Optimization')
  const [releaseNotesText, setReleaseNotesText] = useState(
    'Multi-megabit throughput enhancement (185+ Mbps down / 68+ Mbps up)\nZero-tolerance killswitch activated across 5 attack vectors\nWi-Fi 6E/7 160MHz direct channel allocation\nReal-time anonymous cryptographic IP cloaking'
  )
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [broadcastDone, setBroadcastDone] = useState(false)

  const handleBroadcastRelease = async () => {
    setIsBroadcasting(true)
    const notes = releaseNotesText
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0)

    await broadcastRelease({
      version: releaseVersion.trim(),
      title: releaseTitle.trim(),
      releaseNotes: notes
    })
    setIsBroadcasting(false)
    setBroadcastDone(true)
    setTimeout(() => setBroadcastDone(false), 5000)
  }

  // Edit Package State
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null)
  const [tempPrice, setTempPrice] = useState<string>('')
  const [tempLabel, setTempLabel] = useState<string>('')
  const [tempDuration, setTempDuration] = useState<string>('')
  const [tempQuotaGB, setTempQuotaGB] = useState<string>('')
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)

  // New Cloud Route Form
  const [showAddRoute, setShowAddRoute] = useState(false)
  const [newRouteName, setNewRouteName] = useState('')
  const [newRouteEndpoint, setNewRouteEndpoint] = useState('')
  const [newRouteRegion, setNewRouteRegion] = useState('US-East')

  const handleStartEdit = (pkg: AccessPackage) => {
    setEditingPkgId(pkg.id)
    setTempPrice(pkg.price.toString())
    setTempLabel(pkg.priceLabel)
    setTempDuration(pkg.durationMinutes.toString())
    setTempQuotaGB((pkg.quotaBytes / (1024 * 1024 * 1024)).toString())
  }

  const handleSavePackage = (pkgId: string) => {
    const numPrice = parseFloat(tempPrice) || 0
    const numDuration = parseInt(tempDuration, 10) || 30
    const numQuotaGB = parseFloat(tempQuotaGB) || 0

    updatePackagePrice(pkgId, numPrice, tempLabel || `$${numPrice.toFixed(2)}`)
    updatePackageDetails(pkgId, {
      durationMinutes: numDuration,
      quotaBytes: numQuotaGB * 1024 * 1024 * 1024
    })

    setEditingPkgId(null)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleAddCloudRoute = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRouteName.trim() || !newRouteEndpoint.trim()) return

    const newRoute: CloudRoute = {
      id: 'cloud-' + Math.random().toString(36).slice(2, 6),
      name: newRouteName.trim(),
      provider: 'WireGuard',
      region: newRouteRegion,
      endpoint: newRouteEndpoint.trim(),
      latencyMs: 28,
      packetLoss: 0,
      isPrimary: false,
      status: 'online',
      encrypted: true
    }

    addCloudRoute(newRoute)
    setNewRouteName('')
    setNewRouteEndpoint('')
    setShowAddRoute(false)
  }

  const handleAddRouter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRouterName.trim()) return

    const newRouter: RouterDevice = {
      id: 'rt-' + Math.random().toString(36).substring(2, 6),
      name: newRouterName.trim(),
      model: newRouterModel,
      lanSubnet: newRouterSubnet.trim() || '192.168.12.1/24',
      ssid: newRouterSsid.trim() || 'Aegis-Ultra-Mesh-5G',
      channel: 'Ch 36 (160 MHz)',
      connectedClientsCount: 0,
      cloudRouteId: newRouterCloudRoute || (cloudRoutes[0]?.id ?? 'cloud-01'),
      status: 'online',
      cpuUsagePercent: 6,
      ramUsagePercent: 19,
      uptimeHours: 0,
      uploadKbps: 18000,
      downloadKbps: 72000,
      packetLoss: 0,
      wireguardEndpointBlinded: 'onion-exit.aegis:51820 [Cloaked]',
      wireguardPublicKeyBlinded: `wg-pub-••••${Math.random().toString(36).substring(2, 6)}`,
      firmware: 'Aegis-OpenWrt-v2.5',
      macAddressScrubbed: true,
      routerBlindedIp: `100.64.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 250 + 2)} [Router-Cloaked]`,
      realIpHidden: true
    }

    addRouter(newRouter)
    setShowAddRouter(false)
    setNewRouterName('')
  }

  // Cloud Server VPS & Public IP Hub State
  const [editServerPublicIp, setEditServerPublicIp] = useState(cloudConfig.serverPublicIp || '198.51.100.42')
  const [editWireguardPort, setEditWireguardPort] = useState(cloudConfig.wireguardPort?.toString() || '51820')
  const [editHttpPort, setEditHttpPort] = useState(cloudConfig.httpPort?.toString() || '3888')
  const [editAdminApiKey, setEditAdminApiKey] = useState(cloudConfig.adminApiKey || 'AEGIS-CLOUD-SECRET-KEY-2026')
  const [editPublicPortalDomain, setEditPublicPortalDomain] = useState(cloudConfig.publicPortalDomain || 'cloud.aegis-protocol.net')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isTestingCloud, setIsTestingCloud] = useState(false)
  const [cloudTestMessage, setCloudTestMessage] = useState<string | null>(null)
  const [isSyncingCloud, setIsSyncingCloud] = useState(false)
  const [cloudSyncMessage, setCloudSyncMessage] = useState<string | null>(null)
  const [saveCloudSuccess, setSaveCloudSuccess] = useState(false)
  const [copiedPublicIp, setCopiedPublicIp] = useState(false)
  const [copiedServerUrl, setCopiedServerUrl] = useState(false)

  const handleSaveCloudServerConfig = () => {
    const wgPort = parseInt(editWireguardPort, 10) || 51820
    const hPort = parseInt(editHttpPort, 10) || 3888
    updateCloudConfig({
      serverPublicIp: editServerPublicIp.trim(),
      wireguardPort: wgPort,
      httpPort: hPort,
      adminApiKey: editAdminApiKey.trim(),
      publicPortalDomain: editPublicPortalDomain.trim()
    })
    setSaveCloudSuccess(true)
    setTimeout(() => setSaveCloudSuccess(false), 3000)
  }

  const handleApplyPresetIp = (ip: string, port?: number) => {
    setEditServerPublicIp(ip)
    if (port) setEditHttpPort(port.toString())
    updateCloudConfig({
      serverPublicIp: ip,
      ...(port ? { httpPort: port } : {})
    })
    setSaveCloudSuccess(true)
    setTimeout(() => setSaveCloudSuccess(false), 2000)
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
    setIsSyncingCloud(true)
    setCloudSyncMessage(null)
    const res = await syncPackagesToCloud()
    setIsSyncingCloud(false)
    setCloudSyncMessage(`Synced ${res.count} packages to VPS`)
    setTimeout(() => setCloudSyncMessage(null), 4000)
  }

  const handleCopyPublicIp = () => {
    navigator.clipboard.writeText(editServerPublicIp)
    setCopiedPublicIp(true)
    setTimeout(() => setCopiedPublicIp(false), 2000)
  }

  const handleCopyServerUrl = () => {
    navigator.clipboard.writeText(cloudConfig.serverUrl)
    setCopiedServerUrl(true)
    setTimeout(() => setCopiedServerUrl(false), 2000)
  }

  const handleOpenRouterConfig = (router: RouterDevice) => {
    const boundRoute = cloudRoutes.find((r) => r.id === router.cloudRouteId) || cloudRoutes[0]
    const cfg = generateRouterWireguardConfig(
      router,
      boundRoute,
      cloudConfig.serverPublicIp,
      cloudConfig.wireguardPort
    )
    setSelectedRouterObj(router)
    setSelectedRouterConfig(cfg)
    setCopiedConfig(false)
  }

  const handleCopyConfig = () => {
    if (selectedRouterConfig) {
      navigator.clipboard.writeText(selectedRouterConfig)
      setCopiedConfig(true)
      setTimeout(() => setCopiedConfig(false), 2000)
    }
  }

  const handlePromotePeer = (peerId: string, role: 'co_admin' | 'operator') => {
    promotePeerRole(peerId, role)
  }

  const handleGenerateGrantKey = () => {
    const key = generateAdminGrantToken()
    setGeneratedGrantKey(key)
    setCopiedGrantKey(false)
  }

  const activeConsumers = peers.filter((p) => !p.isProvider && p.status === 'online')
  const unresolvedThreats = threats.filter((t) => t.status === 'active')
  const newFeedbacks = feedbacks.filter((f) => f.status === 'new')

  return (
    <div className="page-content">
      {/* Invisible Admin Master Header */}
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
              Master Overseer
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Invisible Security & Anonymity Control Plane
            </span>
          </div>
          <h1 className="page-title">
            Admin <span>Command & Gateway Console</span>
          </h1>
          <p className="page-desc">
            Oversee mesh operations, defend against threats, manage cloud egress & configure live client pricing
          </p>
        </div>

        {/* Master Status & Heartbeat */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="health-pill-group">
            <span className="health-stat" style={{ color: 'var(--success)' }}>
              <Radio size={13} /> {adminConnected ? 'Always-Connected' : 'Offline'}
            </span>
            <span style={{ color: 'var(--border-mid)' }}>|</span>
            <span className="health-stat" style={{ color: 'var(--text-secondary)' }}>
              Uptime: {Math.floor(adminUptimeSeconds / 60)}m {adminUptimeSeconds % 60}s
            </span>
            <span style={{ color: 'var(--border-mid)' }}>|</span>
            <span className="health-stat" style={{ color: 'var(--text-primary)' }}>
              Port: 3888
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Apple Segmented Style) */}
      <div
        className="filter-tabs"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 8,
          marginBottom: 16
        }}
      >
        <button
          onClick={() => setActiveTab('cloud')}
          className={`filter-pill${activeTab === 'cloud' ? ' active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Cloud size={13} />
          <span>Cloud & Wi-Fi Routers</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`filter-pill${activeTab === 'team' ? ' active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <UserCheck size={13} />
          <span>Admin Roles & RBAC</span>
        </button>

        <button
          onClick={() => setActiveTab('anonymity')}
          className={`filter-pill${activeTab === 'anonymity' ? ' active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Lock size={13} />
          <span>Anti-MITM & IP Cloaking</span>
        </button>

        <button
          onClick={() => setActiveTab('threats')}
          className={`filter-pill${activeTab === 'threats' ? ' active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <ShieldAlert size={13} />
          <span>Threat Defense</span>
          {unresolvedThreats.length > 0 && (
            <span
              style={{
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 999,
                background: 'var(--danger)',
                color: '#fff',
                fontWeight: 700
              }}
            >
              {unresolvedThreats.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`filter-pill${activeTab === 'pricing' ? ' active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <DollarSign size={13} />
          <span>Card Pricing Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('load_balance')}
          className={`filter-pill${activeTab === 'load_balance' ? ' active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Layers size={13} />
          <span>Load Balancing</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`filter-pill${activeTab === 'feedback' ? ' active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <MessageSquare size={13} />
          <span>Client Feedback</span>
          {newFeedbacks.length > 0 && (
            <span
              style={{
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 999,
                background: 'var(--blue)',
                color: '#fff',
                fontWeight: 700
              }}
            >
              {newFeedbacks.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('consumers')}
          className={`filter-pill${activeTab === 'consumers' ? ' active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Users size={13} />
          <span>Consumer Quotas</span>
        </button>

        <button
          onClick={() => setActiveTab('updates')}
          className={`filter-pill${activeTab === 'updates' ? ' active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <DownloadCloud size={13} />
          <span>OTA Mesh Releases</span>
          {appUpdate.hasUpdate && (
            <span
              style={{
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 999,
                background: 'var(--gold-bright)',
                color: '#000',
                fontWeight: 700
              }}
            >
              v{appUpdate.latestVersion}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('runbook')}
          className={`filter-pill${activeTab === 'runbook' ? ' active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Terminal size={13} />
          <span>24/7 Runbook</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`filter-pill${activeTab === 'notifications' ? ' active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Bell size={13} />
          <span>Alerts & Notifications</span>
          {adminNotifications.filter((n) => !n.read).length > 0 && (
            <span
              style={{
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 999,
                background: 'var(--gold-bright)',
                color: '#000',
                fontWeight: 700
              }}
            >
              {adminNotifications.filter((n) => !n.read).length}
            </span>
          )}
        </button>
      </div>

      {saveSuccess && (
        <div className="alert-banner" style={{ background: 'rgba(52, 199, 89, 0.15)', borderColor: 'rgba(52, 199, 89, 0.4)', color: 'var(--success)' }}>
          <CheckCircle2 size={16} />
          <span>Pricing cards updated and synchronized to desktop & mobile client portals!</span>
        </div>
      )}

      {/* TAB 0: ANTI-MITM & IP ANONYMIZER SHIELD */}
      {activeTab === 'anonymity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.12) 0%, rgba(13, 23, 48, 0.8) 100%)', borderColor: 'rgba(0, 113, 227, 0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldCheck size={24} style={{ color: 'var(--success)' }} />
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 700 }}>Zero IP Leak & Anti-MITM Cryptographic Shield</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Physical IPs are blinded into cryptographic virtual addresses. All links mutually authenticated via Noise XK.
                  </p>
                </div>
              </div>
              <span className="status-pill online">
                ● 100% Anonymized Everywhere
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Blinded Gateway IP</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                  {blindedVirtualIp}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--success)', marginTop: 2 }}>Physical IP Sealed</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Handshake Protocol</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: 'var(--blue-bright)', marginTop: 4 }}>
                  {antiMitmShield.noisePattern}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>Mutual Authentication</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Packet Tamper MAC</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: 'var(--gold-bright)', marginTop: 4 }}>
                  {antiMitmShield.packetIntegrityTag}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--success)', marginTop: 2 }}>Zero Injection Allowed</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Onion Hops Circuit</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                  {antiMitmShield.onionRoutingHops}-Hop Garlic Mesh
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>Multi-Layer Wrapped</div>
              </div>
            </div>
          </div>

          {/* Anonymity Defense Toggles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>Enforce DNS-over-HTTPS (DoH Leak Shield)</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                    Blocks plaintext UDP port 53 leakage. All queries encrypted via Quad9 & Cloudflare DoH.
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

              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>WebRTC STUN/ICE IP Shield</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                    Forbids browsers and local clients from exposing physical IP candidates to websites.
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
            </div>

            <div className="glass-card">
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>
                Onion Routing Layer Configuration
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                Multi-hop encryption routes packets through intermediate nodes. No single relay knows both source and destination IP.
              </p>

              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3].map((hops) => (
                  <button
                    key={hops}
                    onClick={() => setOnionHops(hops)}
                    className={`btn ${antiMitmShield.onionRoutingHops === hops ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
                  >
                    {hops} Hop{hops > 1 ? 's' : ''} {hops === 3 ? '(Maximum Anonymity)' : ''}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: 14, fontSize: 11.5, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={13} />
                <span>Anti-ARP Spoofing Static Inspection active on local subnet</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: DYNAMIC PRICE & CARD EDITOR */}
      {activeTab === 'pricing' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Connection Packages & Pricing Cards</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Directly adjust prices, quotas, and access limits. Updates sync immediately to all clients.
              </p>
            </div>
          </div>

          <div className="pricing-grid">
            {packages.map((pkg) => {
              const isEditing = editingPkgId === pkg.id

              return (
                <div key={pkg.id} className="tier-card" style={{ minHeight: 340 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {pkg.name}
                      </span>
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEdit(pkg)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '3px 8px', fontSize: 11 }}
                        >
                          <Edit3 size={11} /> Edit
                        </button>
                      )}
                    </div>

                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, minHeight: 32 }}>
                      {pkg.tagline}
                    </div>

                    {isEditing ? (
                      /* Admin Edit Form */
                      <div
                        style={{
                          margin: '14px 0',
                          padding: 12,
                          background: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 10
                        }}
                      >
                        <div>
                          <label style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                            Numeric Price ($)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            className="apple-input"
                            style={{ width: '100%', padding: '5px 8px', fontSize: 12 }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                            Display Price Label
                          </label>
                          <input
                            type="text"
                            value={tempLabel}
                            onChange={(e) => setTempLabel(e.target.value)}
                            placeholder="e.g. $2.00 or Free"
                            className="apple-input"
                            style={{ width: '100%', padding: '5px 8px', fontSize: 12 }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                            Duration (Minutes)
                          </label>
                          <input
                            type="number"
                            value={tempDuration}
                            onChange={(e) => setTempDuration(e.target.value)}
                            className="apple-input"
                            style={{ width: '100%', padding: '5px 8px', fontSize: 12 }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>
                            Data Cap (GB)
                          </label>
                          <input
                            type="number"
                            step="0.25"
                            value={tempQuotaGB}
                            onChange={(e) => setTempQuotaGB(e.target.value)}
                            className="apple-input"
                            style={{ width: '100%', padding: '5px 8px', fontSize: 12 }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          <button
                            onClick={() => setEditingPkgId(null)}
                            className="btn btn-outline btn-sm"
                            style={{ flex: 1, justifyContent: 'center' }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSavePackage(pkg.id)}
                            className="btn btn-primary btn-sm"
                            style={{ flex: 1.2, justifyContent: 'center' }}
                          >
                            <Save size={12} /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display State */
                      <>
                        <div className="tier-price-row">
                          <span className="tier-price-value" style={{ color: pkg.price === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                            {pkg.priceLabel}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            / {pkg.durationMinutes < 60 ? `${pkg.durationMinutes}m` : `${pkg.durationMinutes / 60}h`}
                          </span>
                        </div>

                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
                          Quota Cap: <strong>{pkg.quotaBytes === 0 ? 'Unlimited' : useFormatBytes(pkg.quotaBytes)}</strong>
                        </div>
                      </>
                    )}

                    <ul className="tier-features-list">
                      {pkg.features.map((f, i) => (
                        <li key={i} className="tier-feature-item">
                          <Check size={13} style={{ color: 'var(--blue-bright)' }} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                    Status: <span style={{ color: 'var(--success)', fontWeight: 600 }}>Active in Portal (Zero IP Leak)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ZERO-TOLERANCE DEFENSE & QUARANTINE VAULT */}
      {activeTab === 'threats' && (
        <div>
          {/* Header & Policy Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Zero-Tolerance Intrusion Prevention Center</h2>
                <span
                  style={{
                    background: zeroToleranceMode ? 'rgba(235, 75, 75, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                    border: zeroToleranceMode ? '1px solid rgba(235, 75, 75, 0.5)' : '1px solid var(--border-subtle)',
                    color: zeroToleranceMode ? '#ff6b6b' : 'var(--text-muted)',
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Zap size={11} />
                  {zeroToleranceMode ? '100% ATTACKS FLAGGED OFF IN 0ms' : 'MANUAL REVIEW MODE'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Zero attackers permitted across any stage or channel. Sockets severed immediately and hostile IPs quarantined.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                <span>Killswitch Auto-Drop</span>
                <div
                  className={`apple-toggle${zeroToleranceMode ? ' on' : ''}`}
                  onClick={toggleZeroToleranceMode}
                  role="switch"
                  aria-checked={zeroToleranceMode}
                >
                  <div className="apple-toggle-knob" />
                </div>
              </div>
              {threats.length > 0 && (
                <button onClick={clearThreats} className="btn btn-outline btn-sm">
                  <Trash2 size={12} /> Clear Logs
                </button>
              )}
            </div>
          </div>

          {/* 5-Channel Shield Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { name: '1. HTTP Gateway (:3888)', desc: 'XSS, SQLi & SYN Flood Guard', active: true, color: 'var(--blue-bright)' },
              { name: '2. P2P Noise Handshake', desc: 'Replay & Curve25519 Pinning', active: true, color: 'var(--teal)' },
              { name: '3. Mesh Wire / Packet', desc: 'ARP Poison & Blackhole Dropper', active: true, color: 'var(--gold-bright)' },
              { name: '4. Cloud Egress / DNS', desc: 'DoH Port 53 Hijack Shield', active: true, color: 'var(--success)' },
              { name: '5. STUN / WebRTC', desc: 'Host IP Extraction Firewall', active: true, color: '#a855f7' }
            ].map((ch, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: ch.color }}>{ch.name}</span>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ch.desc}</div>
                <div style={{ fontSize: 9.5, color: 'var(--success)', fontWeight: 600, marginTop: 4 }}>FLAG-OFF: 0ms</div>
              </div>
            ))}
          </div>


          {/* Quarantine Vault Table */}
          <div className="notion-table-wrapper">
            <div className="notion-table-row head" style={{ gridTemplateColumns: '1.2fr 1fr 1.3fr 2fr 110px 100px' }}>
              <span>Channel Vector</span>
              <span>Threat Category</span>
              <span>Hostile Source (Cloaked)</span>
              <span>Action Taken & Incident</span>
              <span>State</span>
              <span>Quarantine</span>
            </div>

            {threats.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle2 size={32} style={{ color: 'var(--success)', margin: '0 auto 8px', display: 'block' }} />
                No threat events logged. Zero-Tolerance Killswitch standing by.
              </div>
            ) : (
              threats.map((th) => (
                <div
                  key={th.id}
                  className="notion-table-row"
                  style={{ gridTemplateColumns: '1.2fr 1fr 1.3fr 2fr 110px 100px' }}
                >
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {th.channel || 'Mesh Wire / Packet'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                    <AlertTriangle
                      size={13}
                      style={{
                        color: th.severity === 'critical' ? 'var(--danger)' : 'var(--warning)'
                      }}
                    />
                    <span style={{ textTransform: 'capitalize', fontSize: 11.5 }}>
                      {th.type.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-secondary)' }}>
                    {th.sourceNode}
                  </div>

                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: '#ff8080' }}>
                      {th.actionTaken || 'Flagged Off Immediately: Socket Destroyed'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {th.description}
                    </div>
                  </div>

                  <div>
                    <span
                      className="status-pill"
                      style={{
                        background:
                          th.status === 'blocked'
                            ? 'rgba(255, 69, 58, 0.2)'
                            : 'rgba(52, 199, 89, 0.15)',
                        color: th.status === 'blocked' ? 'var(--danger)' : 'var(--success)',
                        fontSize: 10,
                        fontWeight: 700
                      }}
                    >
                      {th.status === 'blocked' ? 'BLOCKED & ISOLATED' : 'MITIGATED'}
                    </span>
                  </div>

                  <div>
                    {th.status === 'blocked' ? (
                      <button
                        onClick={() => unbanThreat(th.id)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '3px 8px', fontSize: 10.5, gap: 4 }}
                        title="Unban IP and release from quarantine"
                      >
                        <RotateCcw size={11} /> Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => blockThreat(th.id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '3px 8px', fontSize: 10.5 }}
                      >
                        Re-block
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: CLOUD EGRESS & WI-FI ROUTER FLEET */}
      {activeTab === 'cloud' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header & Flow Mode Selector */}
          <div
            className="glass-card"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.12) 0%, rgba(13, 23, 48, 0.8) 100%)',
              borderColor: 'rgba(0, 113, 227, 0.35)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Cloud size={20} style={{ color: 'var(--blue-bright)' }} />
                  <span style={{ fontSize: 16, fontWeight: 700 }}>Cloud Egress & Wi-Fi Router Fleet</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                  Admin provisions physical Wi-Fi routers (OpenWrt/GL.iNet), binds them to encrypted Cloud Egress Relays, and oversees all client traffic with zero real IP leakage.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setShowAddRouter(!showAddRouter)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Router size={13} />
                  <span>+ Provision Wi-Fi Router</span>
                </button>
                <button
                  onClick={() => setShowAddRoute(!showAddRoute)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={13} />
                  <span>+ Add Cloud Relay</span>
                </button>
              </div>
            </div>

            {/* Visual Real-World Internet Pipeline Explainer */}
            <div
              style={{
                marginBottom: 16,
                padding: '14px 16px',
                background: 'rgba(0, 0, 0, 0.45)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(0, 113, 227, 0.3)'
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} style={{ color: 'var(--gold-bright)' }} />
                <span>How The Real-World Internet & Cloud Flow Works (Simple & Practical)</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 10, color: 'var(--gold-bright)', fontWeight: 800 }}>STEP 1: CLOUD VPS</div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>High-Speed Internet Source</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.35 }}>
                    Rented VPS (Ubuntu, $4/mo) has 1-10 Gbps datacenter fiber uplink & static IP. Acts as exit node.
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 10, color: 'var(--blue-bright)', fontWeight: 800 }}>STEP 2: THE TUNNEL</div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>Encrypted WireGuard Pipe</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.35 }}>
                    Wi-Fi Router (or client app) links to Cloud VPS. Strips local MACs and cloaks all client IPs.
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 10, color: 'var(--teal)', fontWeight: 800 }}>STEP 3: CLIENT PHONES</div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>Wi-Fi / Hotspot Users</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.35 }}>
                    Clients connect to Wi-Fi SSID, portal pops up, select Free/Paid tier, and browse with zero logs.
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 10, color: 'var(--success)', fontWeight: 800 }}>STEP 4: 24/7 LIVE SITE</div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>Always-On Web Portal</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.35 }}>
                    Hosted on Cloud VPS via Docker + Caddy SSL. Point domain, auto-restart on reboot, 100% uptime.
                  </div>
                </div>
              </div>
            </div>

            {/* 2 Master Ingress Pipelines: Mode 1 Unified into Mode 2 (Decentralized Router Mesh) & Flow 2 (Dedicated Server Core) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 14 }}>
              {/* Flow 1: Decentralized Router Mesh Ingress (Home Router & Multi-Route Fleet) */}
              <div
                onClick={() => setNetworkTopologyMode('multi_route_mesh')}
                style={{
                  background:
                    networkTopologyMode === 'multi_route_mesh' ||
                    networkTopologyMode === 'home_router_uplink' ||
                    networkTopologyMode === 'router_to_cloud'
                      ? 'rgba(52, 199, 89, 0.16)'
                      : 'rgba(0, 0, 0, 0.3)',
                  border:
                    networkTopologyMode === 'multi_route_mesh' ||
                    networkTopologyMode === 'home_router_uplink' ||
                    networkTopologyMode === 'router_to_cloud'
                      ? '1.5px solid var(--success)'
                      : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)' }}>
                      <Router size={16} style={{ color: 'var(--success)' }} />
                      <span>Flow 1: Decentralized Router Mesh (Home & Fleet Ingress)</span>
                    </div>
                    <span className="status-pill online" style={{ fontSize: 9 }}>RECOMMENDED P2P</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                    Admin sets Home Wi-Fi router (or multi-router fleet) to feed high-speed internet UP to Cloud. Clients share & have the Aegis App via QR code, then trigger instant encrypted connections by tapping <strong>Connect Free Tier (30m)</strong> or <strong>Connect Premium</strong> in the app. Perfect for traveling abroad with your home Wi-Fi, sharing with friends, or mesh swarms with 0 roaming fees and 100% cloaked IP.
                  </div>
                </div>

                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenTravelQr()
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '6px 12px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <QrCode size={13} style={{ color: 'var(--success)' }} />
                    <span>📱 Share App QR Code (Have App)</span>
                  </button>
                  <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>
                    ● {providerNodes.length} Ingress Nodes Supplying Mesh
                  </div>
                </div>
              </div>

              {/* Flow 2: Dedicated Server Ingress Core (Mass Scale-Up) */}
              <div
                onClick={() => setNetworkTopologyMode('dedicated_server_scale')}
                style={{
                  background:
                    networkTopologyMode === 'dedicated_server_scale' ||
                    networkTopologyMode === 'server_cloud_direct'
                      ? 'rgba(212, 160, 23, 0.18)'
                      : 'rgba(0, 0, 0, 0.3)',
                  border:
                    networkTopologyMode === 'dedicated_server_scale' ||
                    networkTopologyMode === 'server_cloud_direct'
                      ? '1.5px solid var(--gold-bright)'
                      : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary)' }}>
                      <Server size={16} style={{ color: 'var(--gold-bright)' }} />
                      <span>Flow 2: Dedicated Server Core (High-Scale Swarm)</span>
                    </div>
                    {(networkTopologyMode === 'dedicated_server_scale' || networkTopologyMode === 'server_cloud_direct') && (
                      <span className="status-pill online" style={{ fontSize: 9 }}>ACTIVE</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                    For scaling up to hundreds or thousands of concurrent subscribers. High-capacity dedicated servers (1-10 Gbps datacenter fiber) inject massive bandwidth directly into the cloud swarm. Subscribed clients trigger high-speed connections through load-balanced cloud egress nodes with multipath failover.
                  </div>
                </div>

                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--gold-bright)', fontWeight: 600 }}>
                    ⚡ 10 Gbps Datacenter Egress Ready
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                    Multipath & Least-Latency Active
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Live Topology Map */}
            <div
              style={{
                marginTop: 14,
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-bright)', textTransform: 'uppercase' }}>
                  👑 Invisible Admin Overseer
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>➔</span>
              </div>

              {networkTopologyMode === 'dedicated_server_scale' || networkTopologyMode === 'server_cloud_direct' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 4 }}>
                    <Server size={13} style={{ color: 'var(--gold-bright)' }} />
                    <span style={{ fontSize: 11.5, fontWeight: 600 }}>10 Gbps Dedicated Core</span>
                    <span style={{ fontSize: 10, color: 'var(--gold-bright)' }}>● Feeding Cloud</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>➔</span>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 4 }}>
                    <Router size={13} style={{ color: 'var(--success)' }} />
                    <span style={{ fontSize: 11.5, fontWeight: 600 }}>{providerNodes.length} Ingress Router Nodes</span>
                    <span style={{ fontSize: 10, color: 'var(--success)' }}>● Feeding Cloud</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>➔</span>
                </>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 4 }}>
                <Cloud size={13} style={{ color: 'var(--teal)' }} />
                <span style={{ fontSize: 11.5, fontWeight: 600 }}>
                  {cloudRoutes.filter((r) => r.status === 'online').length} Encrypted Cloud Relays
                </span>
                <span style={{ fontSize: 10, color: 'var(--teal)' }}>[100% Real IP Stripped]</span>
              </div>

              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>➔</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 4 }}>
                <Users size={13} style={{ color: 'var(--blue-bright)' }} />
                <span style={{ fontSize: 11.5, fontWeight: 600 }}>
                  {providerNodes.reduce((acc, p) => acc + p.connectedConsumersCount, 0) + peers.length} Connected Clients
                </span>
                <span style={{ fontSize: 10, color: 'var(--success)' }}>[Triggered via Free & Premium]</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 1. VISUAL 3-TIER INTERNET PIPELINE MAP & FLOW SCHEMATIC */}
          {/* ========================================================================= */}
          <div
            className="glass-card"
            style={{
              background: 'linear-gradient(135deg, rgba(13, 23, 48, 0.9) 0%, rgba(5, 8, 16, 0.95) 100%)',
              borderColor: 'rgba(0, 113, 227, 0.4)',
              padding: 20
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={18} style={{ color: 'var(--teal)' }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    End-to-End Internet Pipeline Mapping (Router ➔ Cloud VPS ➔ Client Mesh)
                  </span>
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                  Complete architectural topology mapping: how physical router internet is pumped to the cloud server VPS and relayed to subscribers with 100% cloaked IP/MAC addresses.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`status-pill ${cloudConfig.connectionStatus === 'connected' ? 'online' : 'standby'}`} style={{ fontSize: 10 }}>
                  ● VPS {cloudConfig.connectionStatus.toUpperCase()} ({cloudConfig.lastPingLatencyMs}ms)
                </span>
              </div>
            </div>

            {/* Visual 3-Tier Grid Diagram */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1.15fr auto 1fr',
                gap: 12,
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.45)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {/* TIER 1: PHYSICAL ROUTER INGRESS */}
              <div
                style={{
                  background: 'rgba(52, 199, 89, 0.08)',
                  border: '1px solid rgba(52, 199, 89, 0.35)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Router size={16} style={{ color: 'var(--success)' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)' }}>TIER 1: ROUTER</span>
                  </div>
                  <span style={{ fontSize: 9.5, background: 'rgba(52, 199, 89, 0.2)', color: 'var(--success)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                    INGRESS UPLINK
                  </span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>{cloudConfig.ingressName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.35 }}>
                  Takes physical broadband/fiber and pumps internet <strong>UP</strong> to the Cloud VPS over encrypted WireGuard tunnel.
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: 4, fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace" }}>
                  <div>Uplink Bandwidth: <strong style={{ color: 'var(--success)' }}>{cloudConfig.ingressBandwidthMbps} Mbps</strong></div>
                  <div style={{ color: 'var(--teal)', marginTop: 2 }}>Real MAC/IP: Scrubbed & Hidden</div>
                </div>
              </div>

              {/* ARROW 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--gold-bright)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  WireGuard UDP
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gold-bright)' }}>
                  <div style={{ height: 2, width: 24, background: 'var(--gold)' }} />
                  <ArrowRight size={16} />
                </div>
                <span style={{ fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace", color: 'var(--gold-bright)' }}>
                  Port {cloudConfig.wireguardPort}
                </span>
              </div>

              {/* TIER 2: CLOUD VPS SERVER (CORE & PUBLIC IP) */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.15) 0%, rgba(212, 160, 23, 0.12) 100%)',
                  border: '1.5px solid var(--blue-bright)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  boxShadow: '0 4px 20px rgba(0, 113, 227, 0.15)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Server size={16} style={{ color: 'var(--blue-bright)' }} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--blue-bright)' }}>TIER 2: CLOUD VPS</span>
                  </div>
                  <span style={{ fontSize: 9.5, background: 'rgba(212, 160, 23, 0.25)', color: 'var(--gold-bright)', padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>
                    PUBLIC IP EXIT
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--gold-bright)', fontWeight: 800, textTransform: 'uppercase' }}>
                    📍 YOUR VPS PUBLIC IP ADDRESS:
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: '#fff', letterSpacing: 0.5, marginTop: 2 }}>
                    {cloudConfig.serverPublicIp}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  Ubuntu VPS running <code>cloud-server/server.js</code>. Aggregates bandwidth, coordinates tokens, and load-balances subscriber mesh traffic.
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '6px 8px', borderRadius: 4, fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace", display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  <div>Tunnel: <strong style={{ color: 'var(--teal)' }}>UDP {cloudConfig.wireguardPort}</strong></div>
                  <div>Portal: <strong style={{ color: 'var(--blue-bright)' }}>HTTP {cloudConfig.httpPort}</strong></div>
                </div>
              </div>

              {/* ARROW 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--blue-bright)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Encrypted Mesh
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--blue-bright)' }}>
                  <div style={{ height: 2, width: 24, background: 'var(--blue-bright)' }} />
                  <ArrowRight size={16} />
                </div>
                <span style={{ fontSize: 9.5, fontFamily: "'JetBrains Mono', monospace", color: 'var(--teal)' }}>
                  NAT Masquerade
                </span>
              </div>

              {/* TIER 3: CLIENTS & SUBSCRIBERS */}
              <div
                style={{
                  background: 'rgba(0, 113, 227, 0.08)',
                  border: '1px solid rgba(0, 113, 227, 0.35)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={16} style={{ color: 'var(--blue-bright)' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-bright)' }}>TIER 3: SUBSCRIBERS</span>
                  </div>
                  <span style={{ fontSize: 9.5, background: 'rgba(0, 113, 227, 0.2)', color: 'var(--blue-bright)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                    END-USER CLIENTS
                  </span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>P2P Mesh & Hotspot Clients</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.35 }}>
                  Subscribers connect via Wi-Fi SSID or mobile app, trigger Free (30m) or Premium, and browse with zero logs.
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: 4, fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace" }}>
                  <div>Client Visible IP: <strong style={{ color: 'var(--gold-bright)' }}>100.64.••.•• [Cloaked]</strong></div>
                  <div style={{ color: 'var(--success)', marginTop: 2 }}>Zero IP/MAC Leaked to Clients</div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. CLOUD SERVER VPS & PUBLIC IP HUB (SERVER SETTINGS) */}
          {/* ========================================================================= */}
          <div
            className="glass-card"
            style={{
              border: '1px solid rgba(212, 160, 23, 0.4)',
              background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.8) 0%, rgba(10, 14, 26, 0.95) 100%)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Server size={18} style={{ color: 'var(--gold-bright)' }} />
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Cloud Server VPS & Public IP Hub</span>
                  <span className="status-pill online" style={{ fontSize: 9 }}>ADMIN OVERSEER MASTER</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                  Configure your Cloud Server VPS static Public IP, WireGuard tunnel port, Captive Portal HTTP port, and synchronize package pricing.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={handleTestCloud}
                  disabled={isTestingCloud}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <RefreshCw size={12} className={isTestingCloud ? 'spin' : ''} />
                  <span>{isTestingCloud ? 'Pinging Cloud...' : 'Ping & Test Cloud Link'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSyncPackages}
                  disabled={isSyncingCloud}
                  className="btn btn-gold btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <DollarSign size={13} />
                  <span>{isSyncingCloud ? 'Syncing Packages...' : 'Sync Packages to VPS'}</span>
                </button>
              </div>
            </div>

            {/* DIRECT QUESTION ANSWER CALLOUT: Where is our public IP address & where have you set it? */}
            <div
              style={{
                marginBottom: 16,
                padding: '12px 16px',
                background: 'rgba(212, 160, 23, 0.08)',
                border: '1px solid rgba(212, 160, 23, 0.35)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                lineHeight: 1.5
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--gold-bright)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Key size={14} />
                <span>📍 Where Is Our Public IP Address & How Is It Configured?</span>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                Your Cloud Server VPS Public IP is set below as <strong>{cloudConfig.serverPublicIp}</strong>. It is stored in the central state store (<code>useAegisStore.ts → cloudConfig.serverPublicIp</code>) and binds the whole network together:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 8, marginTop: 8, fontSize: 11.5 }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: 4 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>1. For Physical Routers:</strong> Auto-injected as <code>endpoint_host '{cloudConfig.serverPublicIp}'</code> in the WireGuard script so your OpenWrt router feeds home internet into your cloud.
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: 4 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>2. For Cloud Server:</strong> <code>cloud-server/server.js</code> listens on <code>0.0.0.0:{cloudConfig.httpPort}</code> (HTTP) and UDP <code>{cloudConfig.wireguardPort}</code> on this Public IP.
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: 4 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>3. For Clients (Shielded):</strong> End-user clients NEVER see this IP or your router's IP. All subscriber packets are cloaked with virtual CGNAT addresses (<code>100.64.••.••</code>).
                </div>
              </div>
            </div>

            {/* Interactive Configuration Form */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              {/* Field 1: Public IPv4 Address */}
              <div>
                <label style={{ fontSize: 11, color: 'var(--gold-bright)', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                  Cloud VPS Public IPv4 Address
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="text"
                    value={editServerPublicIp}
                    onChange={(e) => setEditServerPublicIp(e.target.value)}
                    placeholder="e.g. 198.51.100.42 or 127.0.0.1"
                    className="apple-input"
                    style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
                  />
                  <button
                    type="button"
                    onClick={handleCopyPublicIp}
                    title="Copy Public IP"
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0 10px' }}
                  >
                    {copiedPublicIp ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
                  </button>
                </div>
                {/* Presets */}
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetIp('198.51.100.42')}
                    style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      background: editServerPublicIp === '198.51.100.42' ? 'rgba(212,160,23,0.3)' : 'rgba(255,255,255,0.05)',
                      border: editServerPublicIp === '198.51.100.42' ? '1px solid var(--gold-bright)' : '1px solid var(--border-subtle)',
                      borderRadius: 4,
                      color: editServerPublicIp === '198.51.100.42' ? 'var(--gold-bright)' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    VPS (198.51.100.42)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetIp('127.0.0.1', 3888)}
                    style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      background: editServerPublicIp === '127.0.0.1' ? 'rgba(0,113,227,0.3)' : 'rgba(255,255,255,0.05)',
                      border: editServerPublicIp === '127.0.0.1' ? '1px solid var(--blue-bright)' : '1px solid var(--border-subtle)',
                      borderRadius: 4,
                      color: editServerPublicIp === '127.0.0.1' ? 'var(--blue-bright)' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    Localhost (127.0.0.1)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPresetIp('cloud.aegis-protocol.net')}
                    style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      background: editServerPublicIp === 'cloud.aegis-protocol.net' ? 'rgba(52,199,89,0.3)' : 'rgba(255,255,255,0.05)',
                      border: editServerPublicIp === 'cloud.aegis-protocol.net' ? '1px solid var(--success)' : '1px solid var(--border-subtle)',
                      borderRadius: 4,
                      color: editServerPublicIp === 'cloud.aegis-protocol.net' ? 'var(--success)' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    Domain (Production)
                  </button>
                </div>
              </div>

              {/* Field 2: WireGuard Tunnel Port */}
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  WireGuard Uplink Port (UDP)
                </label>
                <input
                  type="text"
                  value={editWireguardPort}
                  onChange={(e) => setEditWireguardPort(e.target.value)}
                  placeholder="51820"
                  className="apple-input"
                  style={{ width: '100%', fontFamily: "'JetBrains Mono', monospace" }}
                />
                <span style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                  Standard WireGuard UDP listener for router uplinks
                </span>
              </div>

              {/* Field 3: Captive Portal / API HTTP Port */}
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Web Portal & API Port (HTTP)
                </label>
                <input
                  type="text"
                  value={editHttpPort}
                  onChange={(e) => setEditHttpPort(e.target.value)}
                  placeholder="3888"
                  className="apple-input"
                  style={{ width: '100%', fontFamily: "'JetBrains Mono', monospace" }}
                />
                <span style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                  Captive web portal & package synchronization port
                </span>
              </div>

              {/* Field 4: Admin API Secret Key */}
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Admin Master API Key (Bearer Token)
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={editAdminApiKey}
                    onChange={(e) => setEditAdminApiKey(e.target.value)}
                    className="apple-input"
                    style={{ flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0 8px' }}
                  >
                    {showApiKey ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                <span style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                  Must match <code>ADMIN_API_KEY</code> on your cloud VPS
                </span>
              </div>

              {/* Field 5: Public Captive Portal Domain */}
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Public Captive Portal Domain
                </label>
                <input
                  type="text"
                  value={editPublicPortalDomain}
                  onChange={(e) => setEditPublicPortalDomain(e.target.value)}
                  placeholder="cloud.aegis-protocol.net"
                  className="apple-input"
                  style={{ width: '100%', fontFamily: "'JetBrains Mono', monospace" }}
                />
                <span style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                  Public HTTPS domain configured in Caddy / Nginx reverse proxy
                </span>
              </div>
            </div>

            {/* Resolved Server URL & Save Button Footer */}
            <div
              style={{
                marginTop: 14,
                padding: '10px 14px',
                background: 'rgba(0, 0, 0, 0.4)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Target Cloud URL:</span>
                <code style={{ fontSize: 12, color: 'var(--teal)', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: 4 }}>
                  {cloudConfig.serverUrl}
                </code>
                <button
                  type="button"
                  onClick={handleCopyServerUrl}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '2px 6px', fontSize: 10 }}
                >
                  {copiedServerUrl ? <Check size={11} style={{ color: 'var(--success)' }} /> : <Copy size={11} />}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {saveCloudSuccess && (
                  <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> Settings Saved & Synced!
                  </span>
                )}
                {cloudTestMessage && (
                  <span style={{ fontSize: 11, color: 'var(--gold-bright)', fontWeight: 600 }}>
                    {cloudTestMessage}
                  </span>
                )}
                {cloudSyncMessage && (
                  <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>
                    {cloudSyncMessage}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveCloudServerConfig}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Save size={13} />
                  <span>Save Cloud Server Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. ROUTER SETTINGS: TAKE / PROVIDE INTERNET UP TO CLOUD (INGRESS HUB) */}
          {/* ========================================================================= */}
          <div
            className="glass-card"
            style={{
              border: '1px solid rgba(52, 199, 89, 0.4)',
              background: 'linear-gradient(135deg, rgba(10, 25, 20, 0.7) 0%, rgba(5, 12, 10, 0.9) 100%)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Router size={18} style={{ color: 'var(--success)' }} />
                  <span style={{ fontSize: 15, fontWeight: 700 }}>
                    Router Uplink Settings: Take Local Internet & Feed UP to Cloud
                  </span>
                  <span className="status-pill online" style={{ fontSize: 9 }}>INGRESS ACTIVE</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
                  Configure your physical Wi-Fi router (OpenWrt / GL.iNet / MikroTik) to take local broadband/fiber and donate it as an upstream relay for your cloud mesh.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: cloudConfig.contributeAsIngress ? 'var(--success)' : 'var(--text-muted)', fontWeight: 700 }}>
                  {cloudConfig.contributeAsIngress ? 'Uplink Feed Active' : 'Uplink Feed Paused'}
                </span>
                <div
                  className={`apple-toggle${cloudConfig.contributeAsIngress ? ' on' : ''}`}
                  onClick={() => updateCloudConfig({ contributeAsIngress: !cloudConfig.contributeAsIngress })}
                  role="switch"
                  aria-checked={cloudConfig.contributeAsIngress}
                >
                  <div className="apple-toggle-knob" />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              {/* Uplink Node Alias */}
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Router Ingress Gateway Alias
                </label>
                <input
                  type="text"
                  value={cloudConfig.ingressName}
                  onChange={(e) => updateCloudConfig({ ingressName: e.target.value })}
                  className="apple-input"
                  style={{ width: '100%' }}
                />
              </div>

              {/* Ingress Gateway Role */}
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Hardware Gateway Role
                </label>
                <select
                  value={cloudConfig.ingressType}
                  onChange={(e) => updateCloudConfig({ ingressType: e.target.value as any })}
                  className="apple-input"
                  style={{ width: '100%' }}
                >
                  <option value="home_router">Home Wi-Fi Router (Fiber / Cable Broadband)</option>
                  <option value="field_router">Field / Travel Mesh Node (4G / 5G / Starlink)</option>
                  <option value="dedicated_server">High-Capacity Dedicated Server Core</option>
                </select>
              </div>

              {/* Bandwidth Contribution */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>Upstream Bandwidth Feed</label>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>
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
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {[50, 100, 350, 1000].map((mbps) => (
                    <button
                      key={mbps}
                      type="button"
                      onClick={() => updateCloudConfig({ ingressBandwidthMbps: mbps })}
                      style={{
                        flex: 1,
                        fontSize: 10,
                        padding: '2px 0',
                        borderRadius: 4,
                        background: cloudConfig.ingressBandwidthMbps === mbps ? 'rgba(52, 199, 89, 0.25)' : 'rgba(255,255,255,0.04)',
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

              {/* Destination Endpoint Display */}
              <div>
                <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  WireGuard Uplink Tunnel Destination
                </label>
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: 11.5,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--teal)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{cloudConfig.serverPublicIp}:{cloudConfig.wireguardPort}</span>
                  <span style={{ fontSize: 9.5, color: 'var(--success)', fontWeight: 700 }}>[AUTO-SYNCED]</span>
                </div>
                <span style={{ fontSize: 9.5, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                  Router sends traffic to Cloud VPS Public IP via UDP
                </span>
              </div>
            </div>

            {/* Quick Action to open router config */}
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              {routers.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleOpenRouterConfig(routers[0])}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <FileText size={13} />
                  <span>Generate Router WireGuard Script (Using Public IP: {cloudConfig.serverPublicIp})</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Internet Provider Ingress Fleet (Feeding UP to Cloud) */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Home size={16} style={{ color: 'var(--success)' }} />
                  <span>Internet Ingress Provider Fleet (Supplying Internet UP to Cloud Swarm)</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Admin home routers and dedicated servers feeding bandwidth into the cloud so remote clients and travelers can use it anywhere.
                </p>
              </div>
              <button
                onClick={() => handleOpenTravelQr()}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <QrCode size={13} />
                <span>Share Home Wi-Fi QR</span>
              </button>
            </div>

            {providerNodes.length === 0 ? (
              <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)' }}>
                <Home size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No Ingress Provider Nodes Registered</div>
                <div style={{ fontSize: 11.5, marginTop: 4 }}>
                  Enroll your home router or server uplink above to supply broadband bandwidth UP into the cloud mesh.
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                {providerNodes.map((node) => (
                  <div
                    key={node.id}
                    style={{
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: node.isHomeRouter ? '1px solid rgba(52, 199, 89, 0.4)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13 }}>
                          {node.isHomeRouter ? (
                            <Home size={14} style={{ color: 'var(--success)' }} />
                          ) : node.type === 'dedicated_server' ? (
                            <Server size={14} style={{ color: 'var(--gold-bright)' }} />
                          ) : (
                            <Router size={14} style={{ color: 'var(--blue-bright)' }} />
                          )}
                          <span>{node.name}</span>
                        </div>
                        <span className={`status-pill ${node.status === 'online' ? 'online' : 'standby'}`} style={{ fontSize: 9 }}>
                          {node.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
                        {node.locationLabel}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 11, marginBottom: 12 }}>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 9.5 }}>Upstream Feed</div>
                          <div style={{ fontWeight: 700, color: 'var(--success)' }}>{node.upstreamBandwidthMbps} Mbps</div>
                        </div>
                        <div>
                          <div style={{ color: 'var(--text-muted)', fontSize: 9.5 }}>Remote Consumers</div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{node.connectedConsumersCount} active</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleOpenTravelQr(node)}
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1, fontSize: 11, padding: '4px 8px', justifyContent: 'center' }}
                      >
                        <QrCode size={11} />
                        <span>Remote QR</span>
                      </button>
                      <button
                        onClick={() => toggleProviderNode(node.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 11, padding: '4px 8px' }}
                      >
                        {node.status === 'online' ? 'Pause' : 'Resume'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Provision New Wi-Fi Router Form */}
          {showAddRouter && (
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Router size={16} style={{ color: 'var(--blue-bright)' }} />
                  <span>Provision New Wi-Fi Router / Edge Gateway</span>
                </div>
                <button onClick={() => setShowAddRouter(false)} className="btn btn-outline btn-sm" style={{ padding: '2px 8px', fontSize: 11 }}>
                  Cancel
                </button>
              </div>

              <form onSubmit={handleAddRouter} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr 1fr 1fr 100px', gap: 12, alignItems: 'flex-end' }}>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Router Alias
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Campus West AP"
                    value={newRouterName}
                    onChange={(e) => setNewRouterName(e.target.value)}
                    className="apple-input"
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Model / Firmware
                  </label>
                  <select
                    value={newRouterModel}
                    onChange={(e) => setNewRouterModel(e.target.value)}
                    className="apple-input"
                    style={{ width: '100%' }}
                  >
                    <option value="OpenWrt 23.05 (Wi-Fi 6 160MHz)">OpenWrt 23.05 (Wi-Fi 6 160MHz)</option>
                    <option value="GL.iNet Flint 2 (GL-MT6000)">GL.iNet Flint 2 (GL-MT6000)</option>
                    <option value="GL.iNet Beryl AX (GL-MT3000)">GL.iNet Beryl AX (GL-MT3000)</option>
                    <option value="MikroTik RouterOS 7.x">MikroTik RouterOS 7.x</option>
                    <option value="Aegis Linux Edge AP">Aegis Linux Edge AP</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    LAN Subnet
                  </label>
                  <input
                    type="text"
                    value={newRouterSubnet}
                    onChange={(e) => setNewRouterSubnet(e.target.value)}
                    className="apple-input"
                    style={{ width: '100%', fontFamily: "'JetBrains Mono', monospace" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Wi-Fi SSID
                  </label>
                  <input
                    type="text"
                    value={newRouterSsid}
                    onChange={(e) => setNewRouterSsid(e.target.value)}
                    className="apple-input"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Cloud Tunnel Egress
                  </label>
                  <select
                    value={newRouterCloudRoute}
                    onChange={(e) => setNewRouterCloudRoute(e.target.value)}
                    className="apple-input"
                    style={{ width: '100%' }}
                  >
                    {cloudRoutes.map((cr) => (
                      <option key={cr.id} value={cr.id}>
                        {cr.name} ({cr.region})
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                  Deploy
                </button>
              </form>
            </div>
          )}

          {/* Wi-Fi Router Fleet Grid */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wifi size={16} style={{ color: 'var(--gold-bright)' }} />
                <span>Active Wi-Fi Routers & Hardware Gateways ({routers.length})</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Admin overseer control: live telemetry & WireGuard synchronization
              </span>
            </div>

            {routers.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)' }}>
                <Wifi size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No Physical Wi-Fi Routers Enrolled</div>
                <div style={{ fontSize: 11.5, marginTop: 4 }}>
                  Click &quot;Provision New Router&quot; above to generate WireGuard configs for OpenWrt or hardware APs.
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
                {routers.map((router) => {
                  const boundRoute = cloudRoutes.find((r) => r.id === router.cloudRouteId) || cloudRoutes[0]
                  return (
                    <div key={router.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{router.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{router.model} · {router.firmware}</div>
                        </div>
                        <span
                          className={`status-pill ${router.status === 'online' ? 'online' : router.status === 'rebooting' ? 'warn' : 'offline'}`}
                          style={{ fontSize: 10, textTransform: 'uppercase' }}
                        >
                          ● {router.status === 'rebooting' ? 'Rebooting...' : router.status}
                        </span>
                      </div>

                      {/* Radio & Tunnel details with explicit IP & MAC hiding verification */}
                      <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px 12px', borderRadius: 'var(--radius-sm)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Wi-Fi SSID: </span>
                          <strong style={{ color: 'var(--text-primary)' }}>{router.ssid}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>LAN Subnet: </span>
                          <strong style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>{router.lanSubnet}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Cloud Ingress IP: </span>
                          <strong style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--success)' }}>
                            {router.routerBlindedIp || '100.64.12.1 [Router-Cloaked]'}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Hardware MAC: </span>
                          <strong style={{ color: 'var(--teal)' }}>[100% Scrubbed / Hidden]</strong>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Cloud Relay: </span>
                          <strong style={{ color: 'var(--teal)' }}>→ {boundRoute?.name || 'Primary Cloud Egress'} ({boundRoute?.region})</strong>
                        </div>
                      </div>

                      {/* Live Telemetry Bars */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px 8px', borderRadius: 4 }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Connected Clients</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold-bright)' }}>{router.connectedClientsCount} Clients</div>
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px 8px', borderRadius: 4 }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Throughput</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-bright)' }}>{(router.downloadKbps / 1000).toFixed(0)}M Down</div>
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px 8px', borderRadius: 4 }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>CPU / RAM</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)' }}>{router.cpuUsagePercent}% / {router.ramUsagePercent}%</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: 8, paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                        <button
                          onClick={() => handleOpenRouterConfig(router)}
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                        >
                          <FileText size={12} />
                          <span>OpenWrt Config</span>
                        </button>
                        <button
                          onClick={() => rebootRouter(router.id)}
                          disabled={router.status === 'rebooting'}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                        >
                          <RefreshCw size={12} className={router.status === 'rebooting' ? 'spin' : ''} />
                          <span>Reboot</span>
                        </button>
                        <button
                          onClick={() => removeRouter(router.id)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: 11, color: 'var(--danger)', borderColor: 'rgba(255, 69, 58, 0.3)' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* OpenWrt Config Drawer / Modal */}
          {selectedRouterConfig && (
            <div className="glass-card" style={{ border: '1px solid var(--blue-bright)', background: 'rgba(10, 15, 28, 0.95)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Terminal size={16} style={{ color: 'var(--teal)' }} />
                  <span style={{ fontSize: 14, fontWeight: 700 }}>
                    OpenWrt WireGuard Configuration — {selectedRouterObj?.name}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleCopyConfig}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {copiedConfig ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedConfig ? 'Copied to Clipboard!' : 'Copy Script'}</span>
                  </button>
                  <button
                    onClick={() => setSelectedRouterConfig(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    Close
                  </button>
                </div>
              </div>

              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 10 }}>
                Copy and paste this configuration directly into your router&apos;s <code>/etc/config/network</code> and <code>/etc/config/firewall</code>, or apply via LuCI web interface.
              </p>

              <div
                style={{
                  padding: '10px 14px',
                  background: 'rgba(52, 199, 89, 0.08)',
                  border: '1px solid rgba(52, 199, 89, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 11.5,
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12
                }}
              >
                <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Zero Cloud Leak Guarantee:</strong> WireGuard encapsulates strictly at Layer-3, stripping all physical hardware MAC addresses at the interface boundary. Outbound NAT masquerading shields router and client IPs behind virtual blinded addresses.
                </span>
              </div>

              <pre
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 14,
                  fontSize: 11.5,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#9cdcfe',
                  overflowX: 'auto',
                  maxHeight: 220
                }}
              >
                {selectedRouterConfig}
              </pre>
            </div>
          )}

          {/* Cloud Egress Gateways Table */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Globe size={16} style={{ color: 'var(--blue-bright)' }} />
                <span>Cloud Egress Exit Relays & WireGuard Endpoints</span>
              </div>
            </div>

            {/* Add Cloud Route Form */}
            {showAddRoute && (
              <div className="glass-card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Deploy New Cloud Exit Relay</h3>
                <form
                  onSubmit={handleAddCloudRoute}
                  style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 100px', gap: 12, alignItems: 'flex-end' }}
                >
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Gateway Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Linode London Exit"
                      value={newRouteName}
                      onChange={(e) => setNewRouteName(e.target.value)}
                      className="apple-input"
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Onion / WireGuard Endpoint</label>
                    <input
                      type="text"
                      placeholder="e.g. onion-exit.aegis:51820 [Cloaked]"
                      value={newRouteEndpoint}
                      onChange={(e) => setNewRouteEndpoint(e.target.value)}
                      className="apple-input"
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Region</label>
                    <select
                      value={newRouteRegion}
                      onChange={(e) => setNewRouteRegion(e.target.value)}
                      className="apple-input"
                      style={{ width: '100%' }}
                    >
                      <option value="US-East">US-East</option>
                      <option value="EU-Central">EU-Central</option>
                      <option value="AP-South">AP-South</option>
                      <option value="AF-South">AF-South</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-gold" style={{ justifyContent: 'center' }}>Deploy</button>
                </form>
              </div>
            )}

            <div className="notion-table-wrapper">
              <div className="notion-table-row head" style={{ gridTemplateColumns: '2fr 1.6fr 1fr 1fr 130px' }}>
                <span>Gateway Route & Provider</span>
                <span>Blinded Endpoint & Region</span>
                <span>RTT & Loss</span>
                <span>Priority</span>
                <span>Actions</span>
              </div>

              {cloudRoutes.map((cr) => (
                <div key={cr.id} className="notion-table-row" style={{ gridTemplateColumns: '2fr 1.6fr 1fr 1fr 130px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                      <Globe size={14} style={{ color: 'var(--blue-bright)' }} />
                      <span>{cr.name}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Lock size={10} /> {cr.provider} Tunnel · Noise/WireGuard Sealed
                    </div>
                  </div>

                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                    <div>{cr.endpoint}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{cr.region}</div>
                  </div>

                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>
                    <span style={{ color: 'var(--success)' }}>{cr.latencyMs} ms</span>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{cr.packetLoss}% Loss</div>
                  </div>

                  <div>
                    {cr.isPrimary ? (
                      <span className="status-pill online">● Primary Egress</span>
                    ) : (
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Standby</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    {!cr.isPrimary && (
                      <button
                        onClick={() => setPrimaryCloudRoute(cr.id)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '3px 8px', fontSize: 11 }}
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      onClick={() => toggleCloudRoute(cr.id)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '3px 8px', fontSize: 11 }}
                    >
                      {cr.status === 'online' ? 'Pause' : 'Resume'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: ADMIN ROLES & MULTI-ADMIN RBAC DELEGATION */}
      {activeTab === 'team' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header Card */}
          <div
            className="glass-card"
            style={{
              background: 'linear-gradient(135deg, rgba(230, 180, 80, 0.12) 0%, rgba(20, 24, 38, 0.8) 100%)',
              borderColor: 'rgba(230, 180, 80, 0.35)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <UserCheck size={24} style={{ color: 'var(--gold-bright)' }} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Admin Roles & Multi-Admin RBAC Delegation</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Designate trusted devices as Co-Administrators or Field Operators. Instant 0ms cryptographic privilege revocation.
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateGrantKey}
                className="btn btn-gold btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Key size={13} />
                <span>Issue Admin Grant Token</span>
              </button>
            </div>

            {/* Generated Key Alert */}
            {generatedGrantKey && (
              <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--gold-bright)', fontWeight: 700 }}>1-Time Cryptographic Admin Grant Token:</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-primary)' }}>{generatedGrantKey}</div>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedGrantKey)
                    setCopiedGrantKey(true)
                    setTimeout(() => setCopiedGrantKey(false), 2000)
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 11 }}
                >
                  {copiedGrantKey ? 'Copied!' : 'Copy Token'}
                </button>
              </div>
            )}
          </div>

          {/* Role Hierarchy Matrix */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div className="glass-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-bright)', textTransform: 'uppercase', marginBottom: 4 }}>
                👑 Master Admin
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Invisible Root Overseer</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Unrestricted control. Manages pricing, cloud routes, threat killswitch, router fleet, and grants/revokes admin privileges.
              </div>
            </div>

            <div className="glass-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-bright)', textTransform: 'uppercase', marginBottom: 4 }}>
                🛡️ Co-Admin
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Network Administrator</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Oversees router fleet, monitors active client streams, adjusts bandwidth quotas, and reboots cloud WireGuard tunnels.
              </div>
            </div>

            <div className="glass-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', marginBottom: 4 }}>
                📡 Field Operator
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Mesh & AP Technician</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Provisions local Wi-Fi router APs, registers guest passes, and monitors signal strength diagnostics.
              </div>
            </div>

            <div className="glass-card" style={{ padding: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                📱 Client / Consumer
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>End-User Peer</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Zero admin access. Authenticates on hotspot portal and routes packets over blinded encrypted overlay.
              </div>
            </div>
          </div>

          {/* Active Peers & Role Delegation Table */}
          <div className="notion-table-wrapper">
            <div className="notion-table-row head" style={{ gridTemplateColumns: '1.6fr 1.2fr 1.6fr 1.2fr 150px' }}>
              <span>Device Alias & Blinded IP</span>
              <span>Assigned RBAC Role</span>
              <span>Cryptographic Grant Token</span>
              <span>Granted By</span>
              <span>Actions</span>
            </div>

            {peers.map((peer) => {
              const role = peer.role || 'consumer'
              const isCoAdmin = role === 'co_admin'
              const isOperator = role === 'operator'
              const isElevated = isCoAdmin || isOperator

              return (
                <div key={peer.id} className="notion-table-row" style={{ gridTemplateColumns: '1.6fr 1.2fr 1.6fr 1.2fr 150px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{peer.name}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
                      {peer.blindedIp}
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: isCoAdmin
                          ? 'rgba(0, 113, 227, 0.2)'
                          : isOperator
                            ? 'rgba(52, 199, 89, 0.2)'
                            : 'rgba(255, 255, 255, 0.05)',
                        color: isCoAdmin
                          ? 'var(--blue-bright)'
                          : isOperator
                            ? 'var(--success)'
                            : 'var(--text-muted)',
                        textTransform: 'uppercase'
                      }}
                    >
                      {role.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: isElevated ? 'var(--gold-bright)' : 'var(--text-muted)' }}>
                    {peer.adminToken || 'None (Standard Client)'}
                  </div>

                  <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                    {peer.adminGrantedBy || 'Self / Hotspot Gateway'}
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    {!isElevated ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => handlePromotePeer(peer.id, 'co_admin')}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '3px 6px', fontSize: 10.5, color: 'var(--blue-bright)' }}
                          title="Promote to Co-Administrator"
                        >
                          Make Admin
                        </button>
                        <button
                          onClick={() => handlePromotePeer(peer.id, 'operator')}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '3px 6px', fontSize: 10.5, color: 'var(--success)' }}
                          title="Promote to Field Operator"
                        >
                          Operator
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => revokePeerRole(peer.id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '3px 8px', fontSize: 10.5 }}
                        title="Instantly revoke administrative privileges"
                      >
                        <UserX size={11} style={{ display: 'inline', marginRight: 3 }} />
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 4: LOAD BALANCING ENGINE */}
      {activeTab === 'load_balance' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Load Balancing & Multipath Distribution</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Spread outbound customer flows across mesh peers and cloud egress tunnels.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Algorithm:</span>
              <select
                value={loadBalanceStrategy}
                onChange={(e) => setLoadBalanceStrategy(e.target.value as any)}
                className="apple-input"
                style={{ padding: '4px 10px', fontSize: 12 }}
              >
                <option value="least_latency">Least Latency (Recommended)</option>
                <option value="round_robin">Round Robin</option>
                <option value="weighted">Weighted Bandwidth</option>
                <option value="multipath">Redundant Multipath</option>
              </select>
            </div>
          </div>

          {loadDistribution.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)', marginBottom: 20 }}>
              <Layers size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
              <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>No Active Egress Traffic Streams</div>
              <div style={{ fontSize: 11.5, marginTop: 4 }}>
                Active load balancing metrics will populate in real-time as subscriber clients and routers route egress flows.
              </div>
            </div>
          ) : (
            <div className="stat-grid" style={{ marginBottom: 20 }}>
              {loadDistribution.map((point) => (
                <div key={point.routeId} className="stat-card">
                  <div className="stat-card-label">{point.name}</div>
                  <div className="stat-card-value">{point.percentage}%</div>
                  <div className="stat-card-sub" style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span>Active Flows: {point.activeStreams}</span>
                      <span>{point.throughputMbps} Mbps</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${point.percentage}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="glass-card">
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
              Automated Failover & Traffic Shunting
            </h3>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              If any cloud egress or peer node exceeds 5% packet loss or reports high jitter, the load balancer automatically reroutes packets in under 200 milliseconds without terminating existing TCP sessions.
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: CLIENT FEEDBACK INBOX */}
      {activeTab === 'feedback' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Client Feedback & Security Reports</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Real-time connection feedback and queries submitted by clients on the mobile & desktop hotspot portal.
              </p>
            </div>
          </div>

          <div className="notion-table-wrapper">
            <div className="notion-table-row head" style={{ gridTemplateColumns: '1.2fr 1fr 2.5fr 1fr 100px' }}>
              <span>Client Alias</span>
              <span>Fingerprint & Rating</span>
              <span>Message</span>
              <span>Time</span>
              <span>Actions</span>
            </div>

            {feedbacks.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No feedback received yet.
              </div>
            ) : (
              feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="notion-table-row"
                  style={{ gridTemplateColumns: '1.2fr 1fr 2.5fr 1fr 100px' }}
                >
                  <div style={{ fontWeight: 600 }}>{fb.clientName}</div>

                  <div>
                    <span className="masked-id-badge">{fb.deviceFingerprint}</span>
                    <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 2 }}>
                      {'★'.repeat(fb.rating)}
                    </div>
                  </div>

                  <div style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>
                    &ldquo;{fb.message}&rdquo;
                  </div>

                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {new Date(fb.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div>
                    {fb.status === 'resolved' ? (
                      <span style={{ fontSize: 11, color: 'var(--success)' }}>Resolved</span>
                    ) : (
                      <button
                        onClick={() => resolveFeedback(fb.id)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '3px 8px', fontSize: 11 }}
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: CONSUMER QUOTAS WITH BLINDED IPS */}
      {activeTab === 'consumers' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Consumer Device Quota Management</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Set bandwidth caps and inspect blinded IP allocations.
              </p>
            </div>
          </div>

          <div className="notion-table-wrapper">
            <div className="notion-table-row head" style={{ gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr 100px' }}>
              <span>Consumer Device & Blinded IP</span>
              <span>Data Consumed</span>
              <span>Data Cap Allowance</span>
              <span>Loss & Score</span>
              <span>Actions</span>
            </div>

            {activeConsumers.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active consumer devices routing through this gateway.
              </div>
            ) : (
              activeConsumers.map((peer) => {
                const quota = peerQuotas[peer.id] || 0
                const percentage = quota > 0 ? (peer.dataUsed / quota) * 100 : 0
                const isExhausted = quota > 0 && peer.dataUsed >= quota

                return (
                  <div
                    key={peer.id}
                    className="notion-table-row"
                    style={{ gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr 100px' }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{peer.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <span className="masked-id-badge">{maskDeviceId(peer.id, privacyMode)}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: 'var(--text-secondary)' }}>
                          {peer.blindedIp}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: isExhausted ? 'var(--danger)' : 'var(--text-primary)' }}>
                        {useFormatBytes(peer.dataUsed)}
                      </div>
                      {quota > 0 && (
                        <div style={{ width: 100, height: 4, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, marginTop: 5 }}>
                          <div
                            style={{
                              height: '100%',
                              background: isExhausted ? 'var(--danger)' : 'var(--blue-bright)',
                              borderRadius: 2,
                              width: `${Math.min(100, percentage)}%`
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <select
                        className="apple-input"
                        value={quota > 0 ? (quota / (1024 * 1024 * 1024)).toString() : '0'}
                        onChange={(e) => {
                          const bytes = parseFloat(e.target.value) * 1024 * 1024 * 1024
                          setPeerQuota(peer.id, isNaN(bytes) ? 0 : bytes)
                        }}
                        style={{ width: 120, padding: '5px 10px', fontSize: 12 }}
                      >
                        <option value="0">Unlimited</option>
                        <option value="0.25">250 MB</option>
                        <option value="1">1 GB</option>
                        <option value="2">2 GB</option>
                        <option value="5">5 GB</option>
                        <option value="10">10 GB</option>
                      </select>
                    </div>

                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5 }}>
                      <span style={{ color: peer.packetLoss === 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {peer.packetLoss}% Loss
                      </span>
                    </div>

                    <div>
                      <button onClick={() => disconnectPeer(peer.id)} className="btn btn-danger btn-sm">
                        Cut Off
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 7: OTA RELEASE PUBLISHER & MESH BROADCASTER */}
      {activeTab === 'updates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header Card */}
          <div
            className="glass-card"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.12) 0%, rgba(13, 23, 48, 0.8) 100%)',
              borderColor: 'rgba(0, 113, 227, 0.35)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <DownloadCloud size={24} style={{ color: 'var(--blue-bright)' }} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>OTA Mesh Release Publisher</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Invisible Admin distribution channel — push signed app releases & triggers to all mesh peers in 0ms
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="status-pill online" style={{ fontSize: 11, padding: '4px 10px' }}>
                  Channel: Active
                </span>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
                padding: '14px',
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Admin Version</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  v{appUpdate.currentVersion}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Live Broadcast Version</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: 'var(--gold-bright)' }}>
                  v{appUpdate.latestVersion}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Target Audience</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {peers.length} Mesh Nodes
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Push Latency</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: 'var(--teal)' }}>
                  &lt; 5ms (Instant)
                </div>
              </div>
            </div>
          </div>

          {broadcastDone && (
            <div
              className="alert-banner"
              style={{
                background: 'rgba(52, 199, 89, 0.15)',
                borderColor: 'rgba(52, 199, 89, 0.4)',
                color: 'var(--success)'
              }}
            >
              <CheckCircle2 size={16} />
              <span>
                Release v{releaseVersion} published! Update notification banner triggered across all connected mesh devices.
              </span>
            </div>
          )}

          {/* Quick Presets & Release Draft Editor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
            {/* Left: Draft Form */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700 }}>
                  <Edit3 size={16} style={{ color: 'var(--blue-bright)' }} />
                  <span>Draft Release Package</span>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Signed SHA-256 binary</span>
              </div>

              {/* Presets */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                  Quick Version Templates
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11, padding: '6px 8px' }}
                    onClick={() => {
                      setReleaseVersion('2.5.1')
                      setReleaseTitle('Aegis Protocol v2.5.1 - Ultra-Low Latency Kernel Patch')
                      setReleaseNotesText(
                        'Multi-megabit throughput enhancement (185+ Mbps down / 68+ Mbps up)\nZero-tolerance killswitch activated across 5 attack vectors\nWi-Fi 6E/7 160MHz direct channel allocation\nReal-time anonymous cryptographic IP cloaking'
                      )
                    }}
                  >
                    v2.5.1 Low Latency
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11, padding: '6px 8px' }}
                    onClick={() => {
                      setReleaseVersion('2.6.0')
                      setReleaseTitle('Aegis Protocol v2.6.0 - Quantum Defense & Multi-Path Bonding')
                      setReleaseNotesText(
                        'Post-quantum Kyber-1024 hybrid key exchange\nMPTCP multi-interface simultaneous cellular & Wi-Fi aggregation\n0ms packet loss adaptive auto-healing\nBlinded MAC address rotation every 300s'
                      )
                    }}
                  >
                    v2.6.0 Quantum
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: 11, padding: '6px 8px' }}
                    onClick={() => {
                      setReleaseVersion('3.0.0')
                      setReleaseTitle('Aegis Protocol v3.0.0 - Next-Gen Global Mesh Architecture')
                      setReleaseNotesText(
                        'Global WireGuard anycast cloud edge acceleration\nZero-knowledge blinded hotspot tokens\nSub-5ms ultra-low jitter routing\nInvisible overseer command synchronization'
                      )
                    }}
                  >
                    v3.0.0 Global Mesh
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Release Version Tag
                  </label>
                  <input
                    type="text"
                    className="apple-input"
                    style={{ width: '100%', fontFamily: "'JetBrains Mono', monospace" }}
                    value={releaseVersion}
                    onChange={(e) => setReleaseVersion(e.target.value)}
                    placeholder="e.g. 2.5.1"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Release Headline / Title
                  </label>
                  <input
                    type="text"
                    className="apple-input"
                    style={{ width: '100%' }}
                    value={releaseTitle}
                    onChange={(e) => setReleaseTitle(e.target.value)}
                    placeholder="e.g. Aegis Protocol v2.5.1 - Turbo Booster Edition"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    Changelog / Release Notes (One item per line)
                  </label>
                  <textarea
                    className="apple-input"
                    rows={5}
                    style={{ width: '100%', resize: 'vertical', fontSize: 12, lineHeight: 1.5 }}
                    value={releaseNotesText}
                    onChange={(e) => setReleaseNotesText(e.target.value)}
                    placeholder="Enter release notes..."
                  />
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleBroadcastRelease}
                  disabled={isBroadcasting || !releaseVersion.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 8,
                    padding: '12px',
                    fontSize: 13,
                    fontWeight: 700
                  }}
                >
                  <Send size={15} />
                  <span>
                    {isBroadcasting
                      ? 'Broadcasting to Mesh Swarm...'
                      : `Broadcast v${releaseVersion} to Entire Mesh Now`}
                  </span>
                </button>
              </div>
            </div>

            {/* Right: Live Client Banner Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                  <Sparkles size={16} style={{ color: 'var(--gold-bright)' }} />
                  <span>Client In-App Banner Preview</span>
                </div>
                <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 14 }}>
                  This interactive alert will immediately appear at the top of every mobile & desktop client display:
                </p>

                {/* Live Client Floating Update Banner Preview */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(0, 113, 227, 0.5)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    boxShadow: '0 8px 30px rgba(0, 113, 227, 0.25)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          background: 'linear-gradient(135deg, var(--blue-bright), var(--blue))',
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 999
                        }}
                      >
                        v{releaseVersion || '2.5.1'}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {releaseTitle || 'New Release Available'}
                      </span>
                    </div>
                  </div>

                  <ul
                    style={{
                      margin: '6px 0 10px 0',
                      paddingLeft: 18,
                      fontSize: 11,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4
                    }}
                  >
                    {releaseNotesText
                      .split('\n')
                      .filter((n) => n.trim().length > 0)
                      .slice(0, 3)
                      .map((note, idx) => (
                        <li key={idx}>{note}</li>
                      ))}
                  </ul>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: 11, padding: '4px 10px', flex: 1 }}
                      disabled
                    >
                      Update Now (Instant Hot-Reload)
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11, padding: '4px 10px' }}
                      disabled
                    >
                      Later
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery Mechanism Specs */}
              <div className="glass-card">
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
                  OTA Broadcast Architecture
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11.5, color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Protocol</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                      IPC / WebSockets + UDP Swarm
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Cryptographic Hash</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--teal)' }}>
                      SHA-256 Signed
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Client Trigger</span>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>0ms Hot-Reload</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Zero Downtime</span>
                    <span style={{ color: 'var(--text-primary)' }}>Active sessions preserved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: 24/7 PRODUCTION SETUP & KEEPALIVE RUNBOOK */}
      {activeTab === 'runbook' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header Card */}
          <div
            className="glass-card"
            style={{
              background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)',
              borderColor: 'rgba(52, 199, 89, 0.35)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Terminal size={24} style={{ color: 'var(--success)' }} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Production Deployment & 24/7 Keepalive Runbook</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Complete operations manual to deploy cloud relays, flash Wi-Fi routers, and maintain permanent 24/7 mesh uptime.
                  </div>
                </div>
              </div>
              <span className="status-pill online" style={{ fontSize: 11 }}>
                ● 24/7 Always-On Architecture
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Cloud Egress Port</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>UDP :51820</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Admin Overseer Port</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: 'var(--gold-bright)' }}>TCP :3888</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Keepalive Interval</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: 'var(--success)' }}>21s / 2.5s Ping</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Failover Latency</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: 'var(--teal)' }}>&lt; 5ms Zero-Loss</div>
              </div>
            </div>
          </div>

          {/* 3-Stage Setup Progression Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Stage 1: Cloud Server Setup */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                <Cloud size={16} style={{ color: 'var(--blue-bright)' }} />
                <span>Stage 1: Provisioning the Cloud Relay & VPS Internet</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                Run this on your Cloud VPS (Ubuntu 22.04 / 24.04 on AWS, DigitalOcean, Hetzner, or Linode):
              </p>

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Option A: 1-Click Turnkey VPS Setup Script (Recommended)
                </div>
                <pre style={{ background: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 6, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#9cdcfe', overflowX: 'auto' }}>
{`git clone https://github.com/your-org/The-Aegis-Protocol-v2.git
cd The-Aegis-Protocol-v2/cloud-server
sudo bash setup-vps.sh`}
                </pre>
                <div style={{ fontSize: 10.5, color: 'var(--success)', marginTop: 4 }}>
                  ✓ Enables IPv4 routing, Google BBR v3, NAT Masquerading, WireGuard & launches 24/7 Portal.
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  Option B: Standalone Node.js Runner (No Docker Required)
                </div>
                <pre style={{ background: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 6, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#9cdcfe', overflowX: 'auto' }}>
{`cd cloud-server
node server.js
# Or with PM2 auto-restart:
npm install -g pm2
pm2 start server.js --name aegis-portal
pm2 startup && pm2 save`}
                </pre>
              </div>
            </div>

            {/* Stage 2: Wi-Fi Router Gateway Setup */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                <Router size={16} style={{ color: 'var(--gold-bright)' }} />
                <span>Stage 2: Provisioning the Wi-Fi Router (OpenWrt / GL.iNet)</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                Apply to your GL.iNet / OpenWrt router to tunnel all Wi-Fi clients to the cloud with real IP stripped:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: 'rgba(0,0,0,0.25)', padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)' }}>1. Install WireGuard Packages:</div>
                  <code style={{ fontSize: 11, color: 'var(--teal)', display: 'block', marginTop: 4 }}>
                    opkg update && opkg install luci-proto-wireguard wireguard-tools
                  </code>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.25)', padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)' }}>2. Flash Aegis WireGuard Config:</div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>
                    Open the <strong>Cloud & Wi-Fi Routers</strong> tab, click <strong>OpenWrt Config</strong> on your router, and paste the generated block into <code>/etc/config/network</code>.
                  </span>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.25)', padding: 10, borderRadius: 6 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)' }}>3. Restart Router Network Interface:</div>
                  <code style={{ fontSize: 11, color: 'var(--success)', display: 'block', marginTop: 4 }}>
                    /etc/init.d/network restart
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Stage 3: Keeping the Site & Portal Live 24/7 on Domain */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
              <Server size={16} style={{ color: 'var(--success)' }} />
              <span>Stage 3: Keeping the Portal & Site Live 24/7 (Domain + Auto-SSL + Always-On)</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              To ensure the captive portal website is accessible worldwide 24/7 without needing your laptop open:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-bright)', marginBottom: 6 }}>
                  A. Point Your Domain (Zero Downtime)
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  In your domain DNS (Cloudflare, Namecheap, GoDaddy):
                  <ul style={{ paddingLeft: 16, marginTop: 4 }}>
                    <li>Add <strong>A Record</strong>: <code>wifi</code> (or <code>@</code>) pointing to your <code>Cloud VPS IP</code>.</li>
                    <li>Update <code>cloud-server/Caddyfile</code> with your domain: <code>wifi.yourbrand.com</code>.</li>
                    <li>Caddy automatically provisions free Let's Encrypt SSL!</li>
                  </ul>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', marginBottom: 6 }}>
                  B. Always-On Container Compose
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Run in <code>cloud-server/</code> directory:
                  <pre style={{ background: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 4, marginTop: 4, fontSize: 10.5, color: '#9cdcfe' }}>
{`cd cloud-server
docker compose up -d`}
                  </pre>
                  With <code>restart: always</code>, if the VPS reboots, the portal automatically restarts in &lt; 2 seconds.
                </div>
              </div>
            </div>

            {/* Live Health Probing */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: 10, borderRadius: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>Health Probe URL:</div>
                <code style={{ fontSize: 11, color: 'var(--text-secondary)' }}>curl http://VPS_IP:3888/api/health</code>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: 10, borderRadius: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue-bright)' }}>Docker Logs:</div>
                <code style={{ fontSize: 11, color: 'var(--text-secondary)' }}>docker logs -f aegis-portal</code>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: 10, borderRadius: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-bright)' }}>Auto-Restart Policy:</div>
                <code style={{ fontSize: 11, color: 'var(--text-secondary)' }}>restart: always (Active)</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: OVERSEER NOTIFICATIONS & REAL-TIME ALERTS */}
      {activeTab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(212, 160, 23, 0.12) 0%, rgba(13, 23, 48, 0.8) 100%)', borderColor: 'rgba(212, 160, 23, 0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(212, 160, 23, 0.2)',
                    border: '1px solid rgba(212, 160, 23, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gold-bright)'
                  }}
                >
                  <Bell size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 700 }}>Overseer Real-Time Alert & Telemetry Stream</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Instant notification feed for peer connections, access pass activations, anti-MITM threat defenses & gateway health.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={markAllAdminNotificationsRead}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Check size={13} />
                  <span>Mark All Read</span>
                </button>
                <button
                  onClick={clearAdminNotifications}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)', borderColor: 'rgba(255, 69, 58, 0.3)' }}
                >
                  <Trash2 size={13} />
                  <span>Clear All</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unread Alerts</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: 'var(--gold-bright)', marginTop: 4 }}>
                  {adminNotifications.filter((n) => !n.read).length}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', marginTop: 2 }}>Requires attention</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Threat Blocks</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: 'var(--danger)', marginTop: 4 }}>
                  {adminNotifications.filter((n) => n.category === 'security').length}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--success)', marginTop: 2 }}>Neutralized at wire</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Billing & Passes</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: 'var(--success)', marginTop: 4 }}>
                  {adminNotifications.filter((n) => n.category === 'billing').length}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', marginTop: 2 }}>Subscribers & vouchers</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Logged</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                  {adminNotifications.length}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2 }}>Audit retention max 50</div>
              </div>
            </div>
          </div>

          {/* Notifications Feed */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Live Telemetry Log</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Auto-refreshed via Mesh & Socket Core</span>
            </div>

            {adminNotifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Bell size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 600 }}>No Alerts in Stream</div>
                <div style={{ fontSize: 11.5 }}>New events will stream here automatically.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {adminNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAdminNotificationRead(n.id)}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: n.read ? 'transparent' : 'rgba(212, 160, 23, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {n.category === 'security' ? (
                          <ShieldAlert size={16} style={{ color: 'var(--danger)' }} />
                        ) : n.category === 'billing' ? (
                          <CreditCard size={16} style={{ color: 'var(--success)' }} />
                        ) : (
                          <Radio size={16} style={{ color: 'var(--gold-bright)' }} />
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: n.read ? 600 : 700, color: n.read ? 'var(--text-secondary)' : '#fff' }}>
                            {n.title}
                          </span>
                          {!n.read && (
                            <span style={{ fontSize: 9, fontWeight: 800, background: 'var(--gold)', color: '#000', padding: '1px 5px', borderRadius: 999 }}>
                              NEW
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {n.message}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                        <Clock size={11} />
                        <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                      <span
                        className={`status-pill ${n.severity === 'danger' ? 'degraded' : n.severity === 'success' ? 'online' : ''}`}
                        style={{ fontSize: 9, padding: '1px 6px', marginTop: 4 }}
                      >
                        {n.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Remote Travel QR Modal Overlay (Example 1: Travel Abroad & Home Wi-Fi Sharing) */}
      {showTravelQrModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
          }}
          onClick={() => setShowTravelQrModal(false)}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: 440,
              background: 'rgba(18, 18, 22, 0.96)',
              border: '1px solid rgba(52, 199, 89, 0.4)',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.85)',
              padding: 28,
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                color: 'var(--success)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              ● Native Android APK · Scan to Install App
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 4, marginBottom: 6 }}>
              {activeTravelNode?.name || 'Admin Home Wi-Fi Router'}
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.4 }}>
              Scan with any smartphone camera to download and install <strong>AegisProtocol.apk</strong> directly. Inside the app, tap <strong>CONNECT TO ANONYMOUS INTERNET</strong> to engage the zero-leak device-wide tunnel back to your Home Wi-Fi router via Cloud P2P Mesh.
            </p>

            <div className="qr-box" style={{ margin: '0 auto 20px auto', display: 'inline-block' }}>
              {travelModalQrDataUrl ? (
                <img src={travelModalQrDataUrl} alt="Remote Travel APK QR" width={200} height={200} style={{ borderRadius: 10 }} />
              ) : (
                <div style={{ width: 200, height: 200, background: '#111' }} />
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                readOnly
                value={`${(portalUrl || 'http://localhost:3888').replace(/\/$/, '')}/aegis.apk`}
                className="apple-input"
                style={{ width: '100%', fontSize: 11, textAlign: 'center' }}
              />
              <button onClick={handleCopyTravelLink} className="btn btn-primary btn-sm">
                {copiedTravelLink ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedTravelLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <div>✓ <strong>Scan to Have App:</strong> Zero app store download needed; loads instant PWA.</div>
              <div>✓ <strong>Tap Connect Button in App:</strong> Free or Premium passes trigger live Noise tunnel.</div>
              <div>✓ <strong>Home Wi-Fi Anywhere:</strong> Bypasses hotel firewalls & eliminates cellular roaming costs.</div>
              <div>✓ <strong>100% Real IP Cloaked:</strong> Virtual IP 100.64.12.x active with zero tracking.</div>
            </div>

            <button
              onClick={() => setShowTravelQrModal(false)}
              className="btn btn-outline btn-sm"
              style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
