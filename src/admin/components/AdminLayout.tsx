import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  BooksIcon,
  BuildingsIcon,
  SquaresFourIcon,
  ChartLineUpIcon,
  MegaphoneIcon,
  MoonIcon,
  SunIcon,
  SignOutIcon,
  List,
  X,
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import { STORAGE_KEYS } from '../constants/storageKeys';
import './AdminLayout.css';

export function AdminLayout() {
  const { logout, user } = useAuth();
  const isSuperadmin = user?.role === 'superadmin';
  const [dark, setDark] = useState(
    () => localStorage.getItem(STORAGE_KEYS.DARK_MODE) === '1'
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, next ? '1' : '0');
      return next;
    });
  };

  return (
    <div
      className={`admin-layout admin-root${dark ? ' dark' : ''}${sidebarOpen ? ' sidebar-open' : ''}`}
    >
      <button
        className="admin-mobile-toggle-btn"
        onClick={toggleSidebar}
        type="button"
        aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
      >
        {sidebarOpen ? (
          <X size={20} weight="bold" />
        ) : (
          <List size={20} weight="bold" />
        )}
      </button>
      <div
        className={`admin-sidebar-backdrop${sidebarOpen ? ' visible' : ''}`}
        onClick={closeSidebar}
      />

      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-sidebar-brand">
          <h2>model.ar</h2>
        </div>

        <nav className="admin-sidebar-nav">
          {isSuperadmin && (
            <NavLink
              to="/admin/organizaciones"
              end
              className={({ isActive }) =>
                `admin-nav-link${isActive ? ' active' : ''}`
              }
              onClick={closeSidebar}
            >
              <BuildingsIcon
                className="admin-nav-icon"
                weight="regular"
                size={18}
              />
              Organizaciones
            </NavLink>
          )}

          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `admin-nav-link${isActive ? ' active' : ''}`
            }
            onClick={closeSidebar}
          >
            <SquaresFourIcon
              className="admin-nav-icon"
              weight="regular"
              size={18}
            />
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/metricas"
            className={({ isActive }) =>
              `admin-nav-link${isActive ? ' active' : ''}`
            }
            onClick={closeSidebar}
          >
            <ChartLineUpIcon
              className="admin-nav-icon"
              weight="regular"
              size={18}
            />
            Métricas
          </NavLink>
          <NavLink
            to="/admin/campanas"
            end
            className={({ isActive }) =>
              `admin-nav-link${isActive ? ' active' : ''}`
            }
            onClick={closeSidebar}
          >
            <MegaphoneIcon
              className="admin-nav-icon"
              weight="regular"
              size={18}
            />
            Campañas
          </NavLink>
          {!isSuperadmin && (
            <NavLink
              to="/admin/colecciones"
              className={({ isActive }) =>
                `admin-nav-link${isActive ? ' active' : ''}`
              }
              onClick={closeSidebar}
            >
              <BooksIcon
                className="admin-nav-icon"
                weight="regular"
                size={18}
              />
              Colecciones
            </NavLink>
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            className="admin-theme-btn"
            onClick={() => {
              toggleDark();
              setSidebarOpen(false);
            }}
            type="button"
          >
            {dark ? (
              <SunIcon className="admin-nav-icon" weight="regular" size={18} />
            ) : (
              <MoonIcon className="admin-nav-icon" weight="regular" size={18} />
            )}
            {dark ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <button
            className="admin-logout-btn"
            onClick={() => {
              logout();
              setSidebarOpen(false);
            }}
          >
            <SignOutIcon
              className="admin-nav-icon"
              weight="regular"
              size={18}
            />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
