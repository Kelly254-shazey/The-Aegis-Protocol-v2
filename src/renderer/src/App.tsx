import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import PairDevice from './pages/PairDevice'
import Settings from './pages/Settings'
import ProviderDashboard from './pages/ProviderDashboard'
import './assets/main.css'
import { Wifi } from 'lucide-react'
import { useAegisStore } from './store/useAegisStore'

function TopBar() {
  const { connectionStatus, myName } = useAegisStore()

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-title">THE AEGIS PROTOCOL</div>
        <div className="topbar-subtitle">Secure P2P Mesh Network</div>
      </div>
      <div className="topbar-right">
        <div className={`connection-status-pill ${connectionStatus}`}>
          <Wifi size={14} />
          {connectionStatus === 'connected' ? 'MESH ACTIVE' : 'DISCONNECTED'}
        </div>
        <div style={{ paddingLeft: 12, borderLeft: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Local Device</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{myName}</div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <HashRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <TopBar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pair" element={<PairDevice />} />
            <Route path="/provider" element={<ProviderDashboard />} />
            <Route path="/devices" element={<Navigate to="/" replace />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}

export default App
