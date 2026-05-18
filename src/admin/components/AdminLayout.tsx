import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './AdminLayout.css'

export function AdminLayout() {
  const { logout, user } = useAuth()
  const [orgsOpen, setOrgsOpen] = useState(false)

  return (
    <div className="admin-layout admin-root">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <h2>model.ar</h2>
          {user && (
            <span className="admin-sidebar-org-tag">Org — {user.org}</span>
          )}
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

          <NavLink
            to="/admin/metricas"
            className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}
          >
            <span className="admin-nav-icon">📈</span>
            Métricas
          </NavLink>

          {user?.role === 'superadmin' && (
            <div className="admin-orgs-section">
              <button
                className="admin-orgs-toggle"
                onClick={() => setOrgsOpen(prev => !prev)}
                type="button"
              >
                <span className="admin-nav-icon">🏢</span>
                Organizaciones
                <span className={`admin-orgs-toggle-chevron${orgsOpen ? ' admin-orgs-toggle-chevron--open' : ''}`}>
                  ▶
                </span>
              </button>
              {orgsOpen && (
                <div className="admin-orgs-list">
                  <NavLink
                    to="/admin/organizaciones/santillana"
                    className={({ isActive }) => `admin-org-link${isActive ? ' active' : ''}`}
                  >
                    Santillana
                  </NavLink>
                  <NavLink
                    to="/admin/organizaciones/garbarino"
                    className={({ isActive }) => `admin-org-link${isActive ? ' active' : ''}`}
                  >
                    Garbarino
                  </NavLink>
                  <NavLink
                    to="/admin/organizaciones/museo-mar"
                    className={({ isActive }) => `admin-org-link${isActive ? ' active' : ''}`}
                  >
                    Museo Mar
                  </NavLink>
                </div>
              )}
            </div>
          )}
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
