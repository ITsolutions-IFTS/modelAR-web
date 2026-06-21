import { NavLink, useNavigate } from 'react-router-dom';

export const AppHeader = () => {
  const navigate = useNavigate();

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

      <nav className="app-header__nav">
        <NavLink
          to="/catalogo"
          className={({ isActive }) =>
            isActive
              ? 'app-header__link app-header__link--active'
              : 'app-header__link'
          }
        >
          Catálogo
        </NavLink>
        <NavLink
          to="/scan"
          className={({ isActive }) =>
            isActive
              ? 'app-header__link app-header__link--active'
              : 'app-header__link'
          }
        >
          Escanear
        </NavLink>
        <NavLink to="/admin" className="app-header__link app-header__link--cta">
          Backoffice
        </NavLink>
      </nav>
    </header>
  );
};
