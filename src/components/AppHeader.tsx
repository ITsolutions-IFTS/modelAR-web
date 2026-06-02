import { NavLink } from 'react-router-dom';

export const AppHeader = () => {
  return (
    <header className="app-header">
      <NavLink to="/" className="app-header__logo">
        <span className="app-header__logo-accent">IT</span>Solutions AR
      </NavLink>

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
      </nav>
    </header>
  );
};
