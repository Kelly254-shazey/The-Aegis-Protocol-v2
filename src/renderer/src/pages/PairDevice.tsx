import { useState, useEffect } from 'react'
import {
  Copy,
  Check,
  Smartphone,
  Link2,
  Sparkles,
  ShieldCheck,
  Home
} from 'lucide-react'
import QRCode from 'qrcode'
import { useAegisStore } from '../store/useAegisStore'
import { useNavigate } from 'react-router-dom'

export default function PairDevice() {
  const {
    inviteCode,
    inviteLink,
    generateInvite,
    clearInvite,
    portalUrl,
    addPeer,
    generateHomeRouterShareUrl
  } = useAegisStore()

  const [activeTab, setActiveTab] = useState<'share_app' | 'mesh_pair'>('share_app')
  const [appQrDataUrl, setAppQrDataUrl] = useState<string>('')
  const [meshQrDataUrl, setMeshQrDataUrl] = useState<string>('')
  const [joinCode, setJoinCode] = useState('')
  const [copiedApp, setCopiedApp] = useState(false)
  const [copiedMesh, setCopiedMesh] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    generateInvite()
    return () => clearInvite()
  }, [generateInvite, clearInvite])

  // Generate QR code for Sharing the App & Mobile Portal (Scan to Have App)
  useEffect(() => {
    const targetUrl = portalUrl || generateHomeRouterShareUrl()
    if (targetUrl) {
      QRCode.toDataURL(targetUrl, {
        color: { dark: '#030509', light: '#ffffff' },
        margin: 2,
        width: 240
      })
        .then(setAppQrDataUrl)
        .catch(console.error)
    }
  }, [portalUrl, generateHomeRouterShareUrl])

  // Generate QR code for Mesh Device Pairing
  useEffect(() => {
    if (inviteLink) {
      QRCode.toDataURL(inviteLink, {
        color: { dark: '#030509', light: '#ffffff' },
        margin: 2,
        width: 240
      })
        .then(setMeshQrDataUrl)
        .catch(console.error)
    }
  }, [inviteLink])

  const handleCopyApp = () => {
    const targetUrl = portalUrl || generateHomeRouterShareUrl()
    if (targetUrl) {
      navigator.clipboard.writeText(targetUrl)
      setCopiedApp(true)
      setTimeout(() => setCopiedApp(false), 2000)
    }
  }

  const handleCopyMesh = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      setCopiedMesh(true)
      setTimeout(() => setCopiedMesh(false), 2000)
    }
  }

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (joinCode.length === 6) {
      addPeer({
        id: `dev-${joinCode.toLowerCase()}`,
        name: 'Paired Companion Phone',
        blindedIp: `100.64.${Math.floor(Math.random() * 200 + 10)}.${Math.floor(Math.random() * 200 + 10)} [Cloaked/Onion]`,
        platform: 'android',
        status: 'online',
        hasInternet: false,
        isProvider: false,
        uploadKbps: 0,
        downloadKbps: 0,
        latency: 0,
        packetLoss: 0,
        jitter: 0,
        dataUsed: 0,
        connectedSince: Date.now(),
        score: 100
      })
      navigate('/')
    }
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Share & Pair <span>Aegis App</span>
          </h1>
          <p className="page-desc">
            Share the Aegis App via QR code so clients have the app, then trigger connections using Free or Premium passes
          </p>
        </div>

        {/* Tab Toggle (Apple Segmented Control) */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: 3,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            gap: 4
          }}
        >
          <button
            onClick={() => setActiveTab('share_app')}
            className={`filter-pill${activeTab === 'share_app' ? ' active' : ''}`}
            style={{ borderRadius: 6, padding: '6px 16px' }}
          >
            <span>📱 Scan to Have App (QR Code)</span>
          </button>
          <button
            onClick={() => setActiveTab('mesh_pair')}
            className={`filter-pill${activeTab === 'mesh_pair' ? ' active' : ''}`}
            style={{ borderRadius: 6, padding: '6px 16px' }}
          >
            Direct Node Pairing
          </button>
        </div>
      </div>

      {/* Tab 1: Share App Among Clients (QR Code = Have App, Buttons = Trigger Connection) */}
      {activeTab === 'share_app' && (
        <div className="pair-grid">
          {/* QR Code Presentation (Apple Visual Polish) */}
          <div className="glass-card" style={{ textAlign: 'center', padding: '36px 24px' }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--blue-bright)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              Instant App Onboarding · Universal PWA
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 4, marginBottom: 8 }}>
              Scan to Have the Aegis App
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto 24px' }}>
              Point any smartphone camera (iPhone or Android) to instantly open and have the Aegis App on mobile. No app store installation required.
            </p>

            <div className="qr-box">
              {appQrDataUrl ? (
                <img src={appQrDataUrl} alt="Aegis App QR Code" width={200} height={200} />
              ) : (
                <div style={{ width: 200, height: 200, background: '#eee' }} />
              )}
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 10 }}>
              <input
                type="text"
                readOnly
                value={portalUrl || generateHomeRouterShareUrl()}
                className="apple-input"
                style={{ width: 240, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}
              />
              <button onClick={handleCopyApp} className="btn btn-outline">
                {copiedApp ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                <span>{copiedApp ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div
              style={{
                marginTop: 18,
                padding: '8px 12px',
                background: 'rgba(52, 199, 89, 0.08)',
                border: '1px solid rgba(52, 199, 89, 0.25)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 11.5,
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <ShieldCheck size={14} />
              <span>100% Real IP Cloaked · Noise Handshake Pinning</span>
            </div>
          </div>

          {/* Instructions & Unified Connection Architecture */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 3-Step Connection Flow */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(0, 113, 227, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--blue-bright)'
                  }}
                >
                  <Smartphone size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>How Clients Connect (3-Step Flow)</h3>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Scan to have app ➔ Buttons trigger connection</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ background: 'var(--blue-bright)', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>1</span>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Scan QR to Have App:</strong> Phone camera scans QR code, loading the Aegis PWA instantly in Safari or Chrome without any app store download.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ background: 'var(--gold-bright)', color: '#000', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>2</span>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Tap Connect in App:</strong> Inside the app, the client taps <em>&quot;Connect Free Tier (30m)&quot;</em> or <em>&quot;Connect Premium&quot;</em> to trigger an encrypted P2P tunnel.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ background: 'var(--success)', color: '#000', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>3</span>
                  <div>
                    <strong style={{ color: 'var(--text-primary)' }}>Surf Cloaked & Fast:</strong> Traffic routes through the Home Router / Cloud Swarm with 100% cloaked IP (<code style={{ color: 'var(--success)' }}>100.64.12.x [Cloaked]</code>) and zero ISP eavesdropping.
                  </div>
                </div>
              </div>
            </div>

            {/* Mode 1 Mapped in Mode 2: Home Wi-Fi & Travel Freedom */}
            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)', borderColor: 'rgba(52, 199, 89, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(52, 199, 89, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--success)'
                  }}
                >
                  <Home size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>Decentralized Router Mesh (Home & Fleet Ingress)</h3>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Travel overseas & use Home Wi-Fi anywhere</div>
                </div>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Admin home router (or a fleet of distributed routers) donates high-speed internet UP to the Cloud Mesh. When you or your friends travel abroad, scanning this QR code gives them the app, and tapping Connect bridges all traffic back to your home Wi-Fi with <strong>0 roaming fees</strong>, <strong>0 hotel Wi-Fi blocks</strong>, and <strong>100% anonymous IP</strong>.
              </p>
            </div>

            {/* Local Gateway & AirDrop */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(212, 160, 23, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gold-bright)'
                  }}
                >
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600 }}>Universal Local Gateway & AirDrop</h3>
                  <div style={{ fontSize: 11.5, color: 'var(--success)', fontFamily: "'JetBrains Mono', monospace" }}>
                    Gateway Ingress: 100.64.12.1 [Router-Cloaked] · Port 3888
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Share the URL directly via AirDrop, WhatsApp, or Bluetooth. In Safari, tap &quot;Add to Home Screen&quot; to run Aegis as a native full-screen app.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Direct Mesh Pairing */}
      {activeTab === 'mesh_pair' && (
        <div className="pair-grid">
          {/* Host Side */}
          <div className="glass-card" style={{ textAlign: 'center', padding: '36px 24px' }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--gold-bright)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              Mesh Node Pairing
            </span>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 4, marginBottom: 8 }}>
              Peer-to-Peer Link
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', maxWidth: 360, margin: '0 auto 24px' }}>
              Connect another Aegis desktop or mobile node to share bandwidth and participate in decentralized routing.
            </p>

            <div className="qr-box">
              {meshQrDataUrl ? (
                <img src={meshQrDataUrl} alt="Mesh Pairing QR Code" width={200} height={200} />
              ) : (
                <div style={{ width: 200, height: 200, background: '#eee' }} />
              )}
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                One-Time Pairing Code
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 28, fontWeight: 800, letterSpacing: '0.15em', color: 'var(--gold-bright)' }}>
                {inviteCode}
              </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button onClick={handleCopyMesh} className="btn btn-outline btn-sm">
                {copiedMesh ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
                <span>{copiedMesh ? 'Link Copied' : 'Copy Invite Link'}</span>
              </button>
            </div>
          </div>

          {/* Join Form Side */}
          <div className="glass-card" style={{ padding: '36px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--blue-bright)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}
              >
                Join an Existing Mesh
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 4, marginBottom: 8 }}>
                Enter Pairing Code
              </h2>
              <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Enter the 6-character code provided by another Aegis host node to establish an authenticated, encrypted peer tunnel.
              </p>

              <form onSubmit={handleJoin} style={{ marginTop: 28 }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 7X9K2B"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="apple-input"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: 24,
                    textAlign: 'center',
                    fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '0.25em',
                    fontWeight: 700,
                    marginBottom: 16
                  }}
                />

                <button
                  type="submit"
                  disabled={joinCode.length !== 6}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 14 }}
                >
                  <Link2 size={16} />
                  <span>Establish Secure Peer Tunnel</span>
                </button>
              </form>
            </div>

            <div
              style={{
                marginTop: 24,
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >
              <ShieldCheck size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                Protected with Noise XK end-to-end encryption. Device fingerprints are masked for privacy.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
