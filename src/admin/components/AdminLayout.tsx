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

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, next ? '1' : '0');
      return next;
    });
  };

  return (
    <div className={`admin-layout admin-root${dark ? ' dark' : ''}`}>
      <aside className="admin-sidebar">
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
            onClick={toggleDark}
            type="button"
          >
            {dark ? (
              <SunIcon className="admin-nav-icon" weight="regular" size={18} />
            ) : (
              <MoonIcon className="admin-nav-icon" weight="regular" size={18} />
            )}
            {dark ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <button className="admin-logout-btn" onClick={logout}>
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
