import { useState, useEffect } from 'react'
import { Copy, Link, QrCode, ShieldCheck } from 'lucide-react'
import QRCode from 'qrcode'
import { useAegisStore } from '../store/useAegisStore'
import { useNavigate } from 'react-router-dom'

export default function PairDevice() {
  const { inviteCode, inviteLink, generateInvite, clearInvite, addMockPeer } = useAegisStore()
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [joinCode, setJoinCode] = useState('')
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    generateInvite()
    return () => clearInvite()
  }, [])

  useEffect(() => {
    if (inviteLink) {
      QRCode.toDataURL(inviteLink, {
        color: { dark: '#080c18', light: '#ffffff' },
        margin: 2,
        width: 240,
      }).then(setQrDataUrl)
    }
  }, [inviteLink])

  const handleCopy = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (joinCode.length === 6) {
      // Simulate pairing
      addMockPeer({
        id: `peer-${joinCode}`,
        name: 'New Device',
        platform: 'android',
        status: 'online',
        hasInternet: false,
        isProvider: false,
        uploadKbps: 0,
        downloadKbps: 0,
        latency: 45,
        dataUsed: 0,
        connectedSince: Date.now(),
      })
      navigate('/')
    }
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Pair <span>New Device</span>
          </h1>
          <p className="page-desc">Connect devices securely to The Aegis Protocol mesh network</p>
        </div>
      </div>

      <div className="pair-layout">
        {/* Host Side */}
        <div className="pair-card animate-fade-in" style={{ animationDelay: '0ms' }}>
          <h2>Share Your Connection</h2>
          <p>Other devices can scan this QR code or enter the invite code to connect to your mesh.</p>

          <div className="qr-wrapper">
            <div className="qr-frame">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" width={200} height={200} />
              ) : (
                <div style={{ width: 200, height: 200, background: '#eee' }} />
              )}
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Secure Invite Code
              </div>
              <div className="invite-code-display">{inviteCode}</div>
            </div>
          </div>

          <div className="divider">OR SHARE LINK VIA SOCIAL</div>

          <div className="invite-link-row">
            <input type="text" className="invite-link-input" readOnly value={inviteLink || ''} />
            <button className="btn btn-outline" onClick={handleCopy} style={{ minWidth: 90, justifyContent: 'center' }}>
              {copied ? <ShieldCheck size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Join Side */}
        <div className="pair-card animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h2>Connect to a Device</h2>
          <p>Enter a 6-character secure invite code to join an existing Aegis network.</p>

          <form onSubmit={handleJoin} style={{ marginTop: 40 }}>
            <input
              type="text"
              className="code-input"
              placeholder="000000"
              maxLength={6}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            />
            
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 14 }}
              disabled={joinCode.length !== 6}
            >
              <Link size={16} />
              Establish Secure Connection
            </button>
          </form>

          <div style={{ marginTop: 40, padding: '20px', background: 'rgba(77, 159, 255, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(77, 159, 255, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, color: 'var(--blue)' }}>
              <QrCode size={18} />
              <div style={{ fontWeight: 600, fontSize: 13 }}>Scan QR with Mobile App</div>
            </div>
            <p style={{ margin: 0, fontSize: 12 }}>
              Open The Aegis Protocol app on Android or iOS and use the camera to scan the QR code to connect instantly without typing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
