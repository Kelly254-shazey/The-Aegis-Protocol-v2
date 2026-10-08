import { NavLink } from 'react-router-dom'
import { Shield, Radio, ShieldAlert, QrCode, Settings } from 'lucide-react'
import { useAegisStore } from '../store/useAegisStore'

export default function MobileBottomNav() {
  const { appPortalMode } = useAegisStore()

  if (appPortalMode === 'admin') {
    return (
      <nav className="mobile-bottom-nav">
        <NavLink to="/admin" end className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
          <ShieldAlert size={18} />
          <span>Admin</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>
        <NavLink to="/pair" className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
          <QrCode size={18} />
          <span>Fleet QR</span>
        </NavLink>
        <NavLink to="/" className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
          <Shield size={18} />
          <span>Client View</span>
        </NavLink>
      </nav>
    )
  }

  return (
    <nav className="mobile-bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
        <Shield size={18} />
        <span>Connect &amp; Shield</span>
      </NavLink>
      <NavLink to="/portal" className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
        <Radio size={18} />
        <span>Access Passes</span>
      </NavLink>
      <NavLink to="/pair" className={({ isActive }) => `mobile-nav-item${isActive ? ' active' : ''}`}>
        <QrCode size={18} />
        <span>Share App</span>
      </NavLink>
    </nav>
  )
}
