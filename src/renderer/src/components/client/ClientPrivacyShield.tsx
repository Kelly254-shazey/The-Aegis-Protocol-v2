import React from 'react'
import { ShieldCheck, EyeOff, Radio, Cpu, Lock } from 'lucide-react'

export const ClientPrivacyShield: React.FC = () => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '16px 20px',
        borderRadius: 16,
        background: 'rgba(18, 22, 34, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={16} color="var(--success)" />
          <span style={{ fontSize: 13, fontWeight: 700 }}>Zero-Leak Identity Shield</span>
        </div>
        <span
          style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--success)',
            background: 'rgba(52, 199, 89, 0.1)',
            padding: '2px 8px',
            borderRadius: 12,
            border: '1px solid rgba(52, 199, 89, 0.25)'
          }}
        >
          ● 0 IP / MAC Leak
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 8px', borderRadius: 10, textAlign: 'center' }}>
          <EyeOff size={16} color="#00D2FF" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>WAN / Real IP</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>100% Cloaked</div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 8px', borderRadius: 10, textAlign: 'center' }}>
          <Radio size={16} color="#00F5D4" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hardware MAC</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>Stripped (L3)</div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 8px', borderRadius: 10, textAlign: 'center' }}>
          <Cpu size={16} color="#E5A93C" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TTL Fingerprint</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>Normalized (64)</div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 8px', borderRadius: 10, textAlign: 'center' }}>
          <Lock size={16} color="#34C759" style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Anti-MITM Guard</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>Zero-Tolerance</div>
        </div>
      </div>
    </div>
  )
}
