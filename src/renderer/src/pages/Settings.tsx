import { useAegisStore } from '../store/useAegisStore'
import { HardDrive, Network, ShieldAlert, Zap } from 'lucide-react'

export default function Settings() {
  const { myName, setMyName, autoSwitch, setAutoSwitch } = useAegisStore()

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            System <span>Settings</span>
          </h1>
          <p className="page-desc">Configure The Aegis Protocol parameters</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* General */}
        <div className="settings-card animate-fade-in" style={{ animationDelay: '0ms' }}>
          <div className="settings-card-header">
            <HardDrive size={14} /> Device Configuration
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Device Name</div>
              <div className="settings-row-desc">How this device appears to others in the mesh</div>
            </div>
            <input
              type="text"
              className="settings-input"
              value={myName}
              onChange={(e) => setMyName(e.target.value)}
            />
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Device Type</div>
              <div className="settings-row-desc">Optimize routing for this hardware</div>
            </div>
            <select className="settings-input" style={{ width: 160 }} defaultValue="desktop">
              <option value="desktop">Desktop Workstation</option>
              <option value="laptop">Laptop (Battery Saver)</option>
              <option value="server">Always-on Server</option>
            </select>
          </div>
        </div>

        {/* Network */}
        <div className="settings-card animate-fade-in" style={{ animationDelay: '60ms' }}>
          <div className="settings-card-header">
            <Network size={14} /> Network & Routing
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Smart Auto-Switch</div>
              <div className="settings-row-desc">Automatically switch to the peer with lowest latency</div>
            </div>
            <div className={`toggle ${autoSwitch ? 'on' : ''}`} onClick={() => setAutoSwitch(!autoSwitch)}>
              <div className="toggle-thumb" />
            </div>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Data Caps</div>
              <div className="settings-row-desc">Limit how much data peers can use from this device</div>
            </div>
            <select className="settings-input" style={{ width: 160 }} defaultValue="unlimited">
              <option value="unlimited">Unlimited</option>
              <option value="5gb">5 GB / day</option>
              <option value="1gb">1 GB / day</option>
            </select>
          </div>
        </div>

        {/* Security */}
        <div className="settings-card animate-fade-in" style={{ animationDelay: '120ms' }}>
          <div className="settings-card-header">
            <ShieldAlert size={14} /> Security (Phase 2)
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">End-to-End Encryption</div>
              <div className="settings-row-desc">Noise protocol (ChaCha20-Poly1305)</div>
            </div>
            <div className="status-pill online">Enabled by default</div>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">VPN Tunneling Mode</div>
              <div className="settings-row-desc">Requires wintun.dll (Admin privileges)</div>
            </div>
            <button className="btn btn-outline btn-sm">Install Driver</button>
          </div>
        </div>

        {/* Advanced */}
        <div className="settings-card animate-fade-in" style={{ animationDelay: '180ms' }}>
          <div className="settings-card-header">
            <Zap size={14} /> Advanced Protocol
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">P2P Transport</div>
              <div className="settings-row-desc">Underlying NAT traversal method</div>
            </div>
            <select className="settings-input" style={{ width: 160 }} defaultValue="hyperswarm">
              <option value="hyperswarm">Hyperswarm (DHT)</option>
              <option value="webrtc">WebRTC (TURN fallback)</option>
            </select>
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Local SOCKS5 Port</div>
              <div className="settings-row-desc">Port used for internet gateway proxy</div>
            </div>
            <input type="text" className="settings-input" defaultValue="1080" style={{ width: 80, textAlign: 'center' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
