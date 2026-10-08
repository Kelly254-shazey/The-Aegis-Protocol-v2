import React, { useState } from 'react'
import { Ticket, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { useAegisStore } from '../../store/useAegisStore'

export const ClientVoucherRedeem: React.FC = () => {
  const { redeemVoucher, flagOffThreatImmediately } = useAegisStore()
  const [voucherCode, setVoucherCode] = useState('')
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null)

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!voucherCode.trim()) return

    // Zero-Tolerance check on malicious input signatures
    if (/<script|union\s+select|'|\.\.\/|%00/i.test(voucherCode)) {
      flagOffThreatImmediately({
        type: 'tampering',
        channel: 'HTTP / Hotspot Gateway',
        sourceNode: '100.64.12.99 [Hostile Input]',
        description: 'Injection payload intercepted in voucher redemption. Session terminated in 0ms.'
      })
      setFeedback({
        success: false,
        message: '🚨 ZERO-TOLERANCE: Malicious input intercepted and blocked.'
      })
      return
    }

    const res = redeemVoucher(voucherCode.trim())
    setFeedback(res)
    if (res.success) {
      setVoucherCode('')
      setTimeout(() => setFeedback(null), 4000)
    }
  }

  return (
    <div
      className="glass-card"
      style={{
        padding: '18px 22px',
        borderRadius: 16,
        background: 'rgba(18, 22, 34, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Ticket size={16} color="var(--gold-bright)" />
        <span style={{ fontSize: 13, fontWeight: 700 }}>Redeem Voucher / Crypto Pass Token</span>
      </div>
      <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 12 }}>
        Have a printed voucher token or pre-purchased Aegis access pass? Enter it below for instant activation.
      </p>

      <form onSubmit={handleRedeem} style={{ display: 'flex', gap: 10 }}>
        <input
          type="text"
          value={voucherCode}
          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
          placeholder="e.g. AEGIS-VIP-9921"
          className="apple-input"
          style={{
            flex: 1,
            fontSize: 12.5,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.05em'
          }}
        />
        <button
          type="submit"
          className="btn btn-gold btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 18px' }}
        >
          <span>Redeem</span>
          <ArrowRight size={13} />
        </button>
      </form>

      {feedback && (
        <div
          style={{
            marginTop: 12,
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 11.5,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: feedback.success ? 'rgba(52, 199, 89, 0.12)' : 'rgba(255, 69, 58, 0.12)',
            border: feedback.success ? '1px solid rgba(52, 199, 89, 0.3)' : '1px solid rgba(255, 69, 58, 0.3)',
            color: feedback.success ? 'var(--success)' : '#ff6b6b'
          }}
        >
          {feedback.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  )
}
