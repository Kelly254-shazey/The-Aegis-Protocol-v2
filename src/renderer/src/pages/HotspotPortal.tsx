import { useState, useEffect } from 'react'
import {
  CheckCircle,
  Wifi,
  Sparkles,
  MessageSquare,
  Star,
  ShieldCheck,
  X,
  Radio,
  Zap
} from 'lucide-react'
import { useAegisStore, useFormatBytes, AccessPackage, maskDeviceId } from '../store/useAegisStore'
import { ClientTierSelector } from '../components/client/ClientTierSelector'
import { ClientVoucherRedeem } from '../components/client/ClientVoucherRedeem'

export default function HotspotPortal() {
  const {
    packages,
    activeSession,
    activatePackage,
    terminateSession,
    networkHealth,
    submitFeedback,
    flagOffThreatImmediately,
    myId,
    privacyMode
  } = useAegisStore()

  const [selectedPkg, setSelectedPkg] = useState<AccessPackage | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [countdown, setCountdown] = useState<string>('00:00:00')

  // Client Feedback State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [feedbackSent, setFeedbackSent] = useState(false)

  // Real-time ticking countdown for active session
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'active') {
      setCountdown('00:00:00')
      return
    }

    const updateTimer = () => {
      const remainingMs = Math.max(0, activeSession.expiresAt - Date.now())
      const totalSeconds = Math.floor(remainingMs / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      setCountdown(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }

    updateTimer()
    const id = setInterval(updateTimer, 1000)
    return () => clearInterval(id)
  }, [activeSession])

  const handleOpenCheckout = (pkg: AccessPackage) => {
    setSelectedPkg(pkg)
    setIsCheckoutOpen(true)
  }

  const handleConfirmActivation = (pkgToActivate?: AccessPackage) => {
    const target = pkgToActivate || selectedPkg
    if (target) {
      activatePackage(target.id)
      setIsCheckoutOpen(false)
    }
  }

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackMsg.trim()) return

    if (/<script|union\s+select|'|\.\.\/|%00/i.test(feedbackMsg)) {
      flagOffThreatImmediately({
        type: 'tampering',
        channel: 'HTTP / Hotspot Gateway',
        sourceNode: '100.64.12.99 [Hostile Input]',
        description: 'Exploit payload detected in portal feedback form. Terminated in 0ms.'
      })
      alert('403 Forbidden: Zero-Tolerance Defense Engaged. Hostile payload quarantined.')
      setFeedbackMsg('')
      setIsFeedbackOpen(false)
      return
    }

    submitFeedback({
      clientName: 'Client Device',
      deviceFingerprint: maskDeviceId(myId, privacyMode),
      rating: feedbackRating,
      message: feedbackMsg.trim()
    })

    setFeedbackSent(true)
    setTimeout(() => {
      setFeedbackSent(false)
      setIsFeedbackOpen(false)
      setFeedbackMsg('')
    }, 2000)
  }

  const usedBytes = activeSession ? activeSession.bytesUsed : 0
  const quotaBytes = activeSession ? activeSession.quotaBytes : 1
  const usedPercent = quotaBytes > 0 ? Math.min(100, Math.round((usedBytes / quotaBytes) * 100)) : 0

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Access Passes &amp; <span>Subscriptions</span>
          </h1>
          <p className="page-desc">
            Anonymous decentralized mesh internet passes. Zero IP visibility, instant crypto/card passes &amp; venue vouchers.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setIsFeedbackOpen(true)}
            className="btn btn-outline btn-sm"
            style={{ gap: 6 }}
          >
            <MessageSquare size={13} />
            <span>Send Feedback</span>
          </button>

          <div className="health-pill-group">
            <span className="health-stat loss-clean">
              <Wifi size={13} /> Mesh Online
            </span>
            <span style={{ color: 'var(--border-mid)' }}>|</span>
            <span className="health-stat" style={{ color: 'var(--text-primary)' }}>
              {networkHealth.latencyMs}ms RTT
            </span>
          </div>
        </div>
      </div>

      {/* Top Hero Section: Active Session Countdown OR Welcome Pass Activation */}
      {activeSession && activeSession.status === 'active' ? (
        <div
          className="session-active-card animate-fade-in"
          style={{
            padding: 24,
            borderRadius: 20,
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: 20,
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  background: 'var(--success)',
                  color: '#000',
                  fontSize: 10,
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: 999,
                  textTransform: 'uppercase'
                }}
              >
                ACTIVE PASS
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {activeSession.packageName}
              </span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
              Quota: {activeSession.quotaBytes === 0 ? 'Unlimited Unmetered' : useFormatBytes(activeSession.quotaBytes)} · Noise_XX_25519 Encrypted
            </div>

            {/* Quota Progress Bar */}
            {activeSession.quotaBytes > 0 && (
              <div style={{ width: '100%', maxWidth: 360, marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>Used: {useFormatBytes(usedBytes)}</span>
                  <span>{usedPercent}%</span>
                </div>
                <div className="progress-bar-bg" style={{ marginTop: 4 }}>
                  <div className="progress-bar-fill" style={{ width: `${usedPercent}%` }} />
                </div>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: 16, borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 10.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
              Time Remaining
            </div>
            <div className="countdown-clock" style={{ fontSize: 32, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: 'var(--gold-bright)' }}>
              {countdown}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
              <button
                onClick={() => {
                  setSelectedPkg(packages[2] || packages[0])
                  setIsCheckoutOpen(true)
                }}
                className="btn btn-outline btn-sm"
              >
                <Sparkles size={12} /> Extend Time
              </button>
              <button onClick={terminateSession} className="btn btn-danger btn-sm">
                Disconnect Pass
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="glass-card"
          style={{
            padding: '24px 24px',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.1) 0%, rgba(18, 22, 34, 0.95) 100%)',
            border: '1px solid rgba(0, 113, 227, 0.25)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'rgba(0, 113, 227, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--blue-bright)',
                flexShrink: 0
              }}
            >
              <Radio size={24} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Choose Your Access Pass</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, maxWidth: 500, lineHeight: 1.4 }}>
                Instant anonymous mesh connection. Select the Free 30-min pass to browse immediately or choose a Pro tier for high-speed unmetered streaming with zero logs.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => handleConfirmActivation(packages[0])}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Zap size={14} />
              <span>Instant Free Pass (30m)</span>
            </button>
          </div>
        </div>
      )}

      {/* Package Selector (Modular ClientTierSelector) */}
      <ClientTierSelector onSelectPackage={handleOpenCheckout} />

      {/* Bottom Grid: Voucher Redemption & Store Guarantees */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
        <ClientVoucherRedeem />

        {/* Store Guarantees Card */}
        <div
          className="glass-card"
          style={{
            padding: 22,
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'rgba(18, 22, 34, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <ShieldCheck size={18} style={{ color: 'var(--gold-bright)' }} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>Aegis Store Guarantees</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(52, 199, 89, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={15} color="var(--success)" />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>100% Zero-Log Privacy</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.35 }}>Sessions are completely anonymous. No IP, browsing data, or traffic logs are ever recorded.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0, 210, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={15} color="#00D2FF" />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Multi-Megabit Priority Routing</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.35 }}>Paid passes receive dedicated BBR v3 bandwidth lanes with sub-20ms gaming &amp; streaming optimization.</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(229, 169, 60, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={15} color="var(--gold-bright)" />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Instant Multi-Device Roaming</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.35 }}>Roam seamlessly across any Aegis Wi-Fi AP or mesh provider node without reconnecting.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Activation Modal (Stripe Style) */}
      {isCheckoutOpen && selectedPkg && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(16px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setIsCheckoutOpen(false)}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: 440,
              padding: 24,
              borderColor: 'var(--border-bright)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Activate Access Pass</div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: 14, borderRadius: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{selectedPkg.name}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--success)', fontFamily: "'JetBrains Mono', monospace" }}>
                  {selectedPkg.priceLabel}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>
                {selectedPkg.tagline}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(52, 199, 89, 0.08)', border: '1px solid rgba(52, 199, 89, 0.25)', borderRadius: 8, fontSize: 11.5, color: 'var(--success)', marginBottom: 20 }}>
              <ShieldCheck size={16} style={{ flexShrink: 0 }} />
              <span>Zero-leak Noise_XX protocol. Real IP and MAC address will be 100% cloaked.</span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmActivation()}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Confirm &amp; Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Feedback Modal */}
      {isFeedbackOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(16px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setIsFeedbackOpen(false)}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: 440,
              padding: 24,
              borderColor: 'var(--border-bright)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Report Issue or Feedback</h3>
              <button
                onClick={() => setIsFeedbackOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Your feedback is routed directly to the Master Admin in real-time.
            </p>

            {feedbackSent ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--success)' }}>
                <CheckCircle size={36} style={{ margin: '0 auto 8px', display: 'block' }} />
                <div style={{ fontWeight: 700, fontSize: 15 }}>Feedback Delivered!</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  The Admin Overseer has received your report.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    Connection Experience Rating
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setFeedbackRating(stars)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 2
                        }}
                      >
                        <Star
                          size={20}
                          fill={stars <= feedbackRating ? 'var(--gold-bright)' : 'none'}
                          color={stars <= feedbackRating ? 'var(--gold-bright)' : 'var(--border-bright)'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                    Message / Bug Report
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackMsg}
                    onChange={(e) => setFeedbackMsg(e.target.value)}
                    placeholder="Describe your speed, connection quality, or any bug..."
                    className="apple-input"
                    style={{ width: '100%', resize: 'none', fontSize: 12 }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setIsFeedbackOpen(false)}
                    className="btn btn-secondary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Send Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
