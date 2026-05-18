import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AdminLayout.css'

export function AdminLayout() {
  const { logout } = useAuth()

  return (
    <div className="admin-layout admin-root">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <h2>modelAR Admin</h2>
          <span className="admin-sidebar-client-tag">Cliente: Santillana</span>
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
          >
            <span className="admin-nav-icon">📊</span>
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/campanas/nueva"
            className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
          >
            <span className="admin-nav-icon">➕</span>
            Nueva campaña
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={logout}>
            <span className="admin-nav-icon">🚪</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
