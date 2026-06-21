import { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import {
  BooksIcon,
  BuildingsIcon,
  SquaresFourIcon,
  ChartLineUpIcon,
  MegaphoneIcon,
  MoonIcon,
  SunIcon,
  SignOutIcon,
  ListIcon,
  XIcon,
  ArrowLeftIcon,
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
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, next ? '1' : '0');
      return next;
    });
  };

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  return (
    <div className={`admin-layout admin-root${dark ? ' dark' : ''}`}>
      {/* Barra superior — SOLO mobile (≤860px) */}
      <header className="admin-topbar">
        <Link
          to="/"
          className="admin-topbar-brand"
          aria-label="Volver al inicio"
        >
          <ArrowLeftIcon weight="bold" size={18} />
          <h2>model.ar</h2>
        </Link>
        <button
          type="button"
          className="admin-hamburger"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="admin-sidebar"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? (
            <XIcon weight="bold" size={22} />
          ) : (
            <ListIcon weight="bold" size={22} />
          )}
        </button>
      </header>

      {/* Backdrop — SOLO mobile, cierra al tocar fuera */}
      {menuOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      <aside
        id="admin-sidebar"
        className={`admin-sidebar${menuOpen ? ' admin-sidebar--open' : ''}`}
      >
        <Link
          to="/"
          className="admin-sidebar-brand"
          aria-label="Volver al inicio"
        >
          <ArrowLeftIcon weight="bold" size={16} />
          <h2>model.ar</h2>
        </Link>

        <nav className="admin-sidebar-nav">
          {isSuperadmin && (
            <NavLink
              to="/admin/organizaciones"
              end
              onClick={closeMenu}
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
            onClick={closeMenu}
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
            onClick={closeMenu}
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
            onClick={closeMenu}
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
              onClick={closeMenu}
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
            aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
          >
            {dark ? (
              <SunIcon className="admin-nav-icon" weight="regular" size={18} />
            ) : (
              <MoonIcon className="admin-nav-icon" weight="regular" size={18} />
            )}
            <span className="admin-btn-label">
              {dark ? 'Modo claro' : 'Modo oscuro'}
            </span>
          </button>
          <button
            className="admin-logout-btn"
            onClick={handleLogout}
            type="button"
            aria-label="Cerrar sesión"
          >
            <SignOutIcon
              className="admin-nav-icon"
              weight="regular"
              size={18}
            />
            <span className="admin-btn-label">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
