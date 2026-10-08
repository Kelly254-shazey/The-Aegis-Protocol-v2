import React, { useState, useEffect } from 'react'
import { Shield, Lock, Eye, EyeOff, AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { useAegisStore } from '../store/useAegisStore'
import { useNavigate } from 'react-router-dom'

interface AdminAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AdminAuthModal({ isOpen, onClose, onSuccess }: AdminAuthModalProps) {
  const { unlockAdminPortal } = useAegisStore()
  const navigate = useNavigate()

  const [passcode, setPasscode] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutSeconds, setLockoutSeconds] = useState(0)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (lockoutSeconds <= 0) return
    const timer = setInterval(() => {
      setLockoutSeconds((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [lockoutSeconds])

  useEffect(() => {
    if (isOpen) {
      setPasscode('')
      setErrorMsg(null)
      setIsSuccess(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    if (lockoutSeconds > 0) return

    if (!passcode.trim()) {
      setErrorMsg('Please enter the Admin Master Passcode or Secret Key.')
      triggerShake()
      return
    }

    const res = unlockAdminPortal(passcode.trim())
    if (res.success) {
      setIsSuccess(true)
      setErrorMsg(null)
      setFailedAttempts(0)
      setTimeout(() => {
        onClose()
        if (onSuccess) onSuccess()
        navigate('/admin')
      }, 700)
    } else {
      const nextFail = failedAttempts + 1
      setFailedAttempts(nextFail)
      triggerShake()
      if (nextFail >= 4) {
        setLockoutSeconds(30)
        setErrorMsg('Security Lockout: 4 failed attempts. Locked for 30s.')
      } else {
        setErrorMsg(res.message + ` (${4 - nextFail} attempts remaining)`)
      }
    }
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(3, 5, 9, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
    >
      <div
        className={`glass-card ${shake ? 'auth-modal-shake' : ''}`}
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'linear-gradient(145deg, rgba(20, 27, 45, 0.95), rgba(7, 10, 20, 0.98))',
          border: '1px solid rgba(212, 160, 23, 0.35)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 160, 23, 0.15)',
          borderRadius: 20,
          padding: 28,
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSuccess}
          title="Return to Client View"
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <X size={16} />
        </button>

        {/* Header Icon */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: isSuccess
                ? 'rgba(52, 199, 89, 0.15)'
                : 'linear-gradient(135deg, rgba(212, 160, 23, 0.25), rgba(0, 113, 227, 0.15))',
              border: isSuccess
                ? '1px solid var(--success)'
                : '1px solid rgba(212, 160, 23, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: isSuccess
                ? '0 0 24px rgba(52, 199, 89, 0.3)'
                : '0 0 24px rgba(212, 160, 23, 0.25)'
            }}
          >
            {isSuccess ? (
              <CheckCircle2 size={28} style={{ color: 'var(--success)' }} />
            ) : (
              <Shield size={28} style={{ color: 'var(--gold-bright)' }} />
            )}
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(212, 160, 23, 0.12)',
              border: '1px solid rgba(212, 160, 23, 0.3)',
              padding: '2px 10px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--gold-bright)',
              marginBottom: 8
            }}
          >
            <Lock size={10} />
            <span>Authorized Overseer Access Only</span>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Admin Portal Authorization
          </h2>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 6 }}>
            Enter Master Admin Passcode or Secret Key to access infrastructure control.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleUnlock}>
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-secondary)',
                marginBottom: 6
              }}
            >
              Master Overseer Passcode / Key
            </label>

            <div style={{ position: 'relative' }}>
              <input
                type={showSecret ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                disabled={lockoutSeconds > 0 || isSuccess}
                autoFocus
                placeholder="Enter passcode (e.g. admin2026)"
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.45)',
                  border: errorMsg
                    ? '1px solid var(--danger)'
                    : '1px solid var(--border-bright)',
                  borderRadius: 10,
                  padding: '11px 44px 11px 14px',
                  color: '#fff',
                  fontSize: 14,
                  fontFamily: showSecret ? "'JetBrains Mono', monospace" : 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease'
                }}
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 6,
                fontSize: 11,
                color: 'var(--text-muted)'
              }}
            >
              <span>Default key: <code style={{ color: 'var(--gold-bright)' }}>admin2026</code></span>
              {lockoutSeconds > 0 && (
                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>
                  Locked: {lockoutSeconds}s
                </span>
              )}
            </div>
          </div>

          {/* Feedback message */}
          {errorMsg && (
            <div
              style={{
                background: 'rgba(255, 69, 58, 0.12)',
                border: '1px solid rgba(255, 69, 58, 0.35)',
                color: 'var(--danger)',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 11.5,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16
              }}
            >
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSuccess && (
            <div
              style={{
                background: 'rgba(52, 199, 89, 0.15)',
                border: '1px solid rgba(52, 199, 89, 0.4)',
                color: 'var(--success)',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 11.5,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16
              }}
            >
              <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
              <span>Identity verified. Unlocking Master Overseer...</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSuccess}
              className="btn btn-outline"
              style={{ flex: 1, padding: '10px 14px', fontSize: 12.5 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={lockoutSeconds > 0 || isSuccess}
              className="btn btn-gold"
              style={{
                flex: 2,
                padding: '10px 16px',
                fontSize: 12.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Lock size={14} />
              <span>{isSuccess ? 'Access Granted' : 'Unlock Admin Portal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
