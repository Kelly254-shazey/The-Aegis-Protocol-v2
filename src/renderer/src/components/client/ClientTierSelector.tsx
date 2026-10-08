import React from 'react'
import { Check, Crown, Clock } from 'lucide-react'
import { useAegisStore, AccessPackage } from '../../store/useAegisStore'

interface ClientTierSelectorProps {
  onSelectPackage?: (pkg: AccessPackage) => void
}

export const ClientTierSelector: React.FC<ClientTierSelectorProps> = ({ onSelectPackage }) => {
  const { packages, activeSession, activatePackage } = useAegisStore()

  const handleActivate = (pkg: AccessPackage) => {
    if (onSelectPackage) {
      onSelectPackage(pkg)
    } else {
      activatePackage(pkg.id)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', margin: 0 }}>
            Decentralized Mesh Access Passes
          </h3>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '2px 0 0' }}>
            Instant high-speed internet. 100% anonymous, zero personal data required.
          </p>
        </div>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            background: 'rgba(52, 199, 89, 0.15)',
            border: '1px solid rgba(52, 199, 89, 0.3)',
            color: 'var(--success)',
            padding: '2px 8px',
            borderRadius: 20
          }}
        >
          ● Cloud Mesh Online
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
        {packages.map((pkg) => {
          const isCurrentActive = activeSession?.packageId === pkg.id && activeSession.status === 'active'
          const isFree = pkg.price === 0

          return (
            <div
              key={pkg.id}
              className="glass-card"
              style={{
                borderRadius: 16,
                padding: 18,
                background: isCurrentActive
                  ? 'linear-gradient(145deg, rgba(52, 199, 89, 0.14) 0%, rgba(20, 26, 40, 0.9) 100%)'
                  : pkg.isPopular
                  ? 'linear-gradient(145deg, rgba(0, 113, 227, 0.14) 0%, rgba(20, 26, 40, 0.85) 100%)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: isCurrentActive
                  ? '1.5px solid var(--success)'
                  : pkg.isPopular
                  ? '1.5px solid var(--blue-bright)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
            >
              {pkg.isPopular && !isCurrentActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 12,
                    fontSize: 9.5,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: 'var(--blue-bright)',
                    color: '#ffffff',
                    letterSpacing: '0.04em'
                  }}
                >
                  Popular
                </div>
              )}

              {isCurrentActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 12,
                    fontSize: 9.5,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: 'var(--success)',
                    color: '#000000',
                    letterSpacing: '0.04em'
                  }}
                >
                  Active Pass
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  {isFree ? <Clock size={15} color="#00D2FF" /> : <Crown size={15} color="#E5A93C" />}
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{pkg.name}</span>
                </div>

                <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>
                  {isFree ? 'FREE' : pkg.priceLabel}
                  <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>
                    / {pkg.durationMinutes >= 1440 ? `${pkg.durationMinutes / 1440}d` : `${pkg.durationMinutes}m`}
                  </span>
                </div>

                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.4, minHeight: 30 }}>
                  {pkg.tagline}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 16 }}>
                  {pkg.features.slice(0, 3).map((feat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: 'var(--text-secondary)' }}>
                      <Check size={11} color="var(--success)" style={{ flexShrink: 0 }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleActivate(pkg)}
                className={`btn btn-sm ${isCurrentActive ? 'btn-secondary' : pkg.isPopular ? 'btn-primary' : 'btn-outline'}`}
                style={{ width: '100%', justifyContent: 'center', fontSize: 11.5, borderRadius: 10 }}
              >
                {isCurrentActive ? 'Extend Pass' : isFree ? 'Activate Free Pass' : 'Unlock Pass'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
