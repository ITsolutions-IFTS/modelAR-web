import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

export const AppHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú al navegar (cambio de ruta)
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Cerrar al click afuera + Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'app-header__link app-header__link--active' : 'app-header__link';

  return (
    <header className="app-header">
      <div className="app-header__left">
        <button
          type="button"
          className="app-header__back"
          onClick={() => navigate(-1)}
          aria-label="Volver atrás"
        >
          ←
        </button>
        <NavLink to="/" className="app-header__logo">
          <span className="app-header__logo-accent">IT</span>Solutions AR
        </NavLink>
      </div>

      <div className="app-header__nav-wrap" ref={navRef}>
        <button
          type="button"
          className="app-header__back app-header__menu-btn"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="app-header-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <nav
          id="app-header-nav"
          className={
            menuOpen
              ? 'app-header__nav app-header__nav--open'
              : 'app-header__nav'
          }
        >
          <NavLink
            to="/catalogo"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            Catálogo
          </NavLink>
          <NavLink
            to="/scan"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            Escanear
          </NavLink>
          <NavLink
            to="/admin"
            className="app-header__link app-header__link--cta"
            onClick={() => setMenuOpen(false)}
          >
            Backoffice
          </NavLink>
        </nav>
      </div>
    </header>
  );
};
