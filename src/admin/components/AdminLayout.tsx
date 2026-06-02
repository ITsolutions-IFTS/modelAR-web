import { useState, useMemo } from 'react';
import {
  Outlet,
  NavLink,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  XIcon,
  CheckIcon,
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
import { useActiveOrg } from '../context/ActiveOrgContext';
import { useCampaigns } from '../context/CampaignsContext';
import { useCollections } from '../context/CollectionsContext';
import { useOrganizations } from '../context/OrganizationsContext';
import { SECTOR_UI } from '../constants/sectorUi';
import { STORAGE_KEYS } from '../constants/storageKeys';
import './AdminLayout.css';

function OrgSearch() {
  const [query, setQuery] = useState('');
  const { activeOrg, setActiveOrg } = useActiveOrg();
  const { campaigns } = useCampaigns();
  const { organizations } = useOrganizations();
  const { user } = useAuth();
  const navigate = useNavigate();

  const visibleOrgs = useMemo(() => {
    const base =
      user?.role === 'client'
        ? organizations.filter((o) => o.slug === (user.orgSlug ?? ''))
        : organizations;
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((o) => o.name.toLowerCase().includes(q));
  }, [query, user, organizations]);

  function handleSelect(slug: string, name: string) {
    setActiveOrg({ slug, name });
    navigate('/admin/dashboard');
  }

  return (
    <div className="admin-org-search">
      <div className="admin-org-search-input-wrap">
        <MagnifyingGlassIcon
          className="admin-org-search-icon"
          weight="bold"
          size={14}
        />
        <input
          className="admin-org-search-input"
          type="text"
          placeholder="Buscar organización..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            className="admin-org-search-clear"
            onClick={() => setQuery('')}
            type="button"
          >
            <XIcon weight="bold" size={12} />
          </button>
        )}
      </div>
      <ul className="admin-org-list">
        {visibleOrgs.map((org) => {
          const isActive = activeOrg?.slug === org.slug;
          const hasData = campaigns.some((c) => c.orgSlug === org.slug);
          return (
            <li key={org.slug}>
              <button
                className={`admin-org-list-item${isActive ? ' admin-org-list-item--active' : ''}`}
                onClick={() => handleSelect(org.slug, org.name)}
                type="button"
              >
                <span
                  className={`admin-org-dot ${hasData ? 'admin-org-dot--ok' : 'admin-org-dot--idle'}`}
                />
                <span className="admin-org-list-name">{org.name}</span>
                {isActive && (
                  <CheckIcon
                    className="admin-org-list-check"
                    weight="bold"
                    size={14}
                  />
                )}
              </button>
            </li>
          );
        })}
        {visibleOrgs.length === 0 && (
          <li className="admin-org-list-empty">Sin resultados</li>
        )}
      </ul>
    </div>
  );
}

function CollectionsSidebar() {
  const { collections } = useCollections();
  const { organizations } = useOrganizations();
  const { activeOrg } = useActiveOrg();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeColId = searchParams.get('col');

  const org = useMemo(() => {
    const match = organizations.find((o) => o.slug === activeOrg?.slug);
    return match ? { ...match, ...SECTOR_UI[match.sector] } : undefined;
  }, [organizations, activeOrg]);
  const orgCollections = useMemo(
    () => collections.filter((c) => c.orgSlug === activeOrg?.slug),
    [collections, activeOrg]
  );

  return (
    <div className="admin-collections-section">
      <button
        className="admin-nav-section-link"
        onClick={() => navigate('/admin/colecciones')}
        type="button"
      >
        <BooksIcon className="admin-nav-icon" weight="regular" size={18} />
        {org?.collectionLabelPlural ?? 'Colecciones'}
      </button>
      {orgCollections.length > 0 && (
        <ul className="admin-collections-list">
          {orgCollections.map((col) => (
            <li key={col.id}>
              <NavLink
                to={`/admin/campanas?col=${col.id}`}
                className={() =>
                  `admin-collection-link${activeColId === col.id ? ' active' : ''}`
                }
              >
                <span className="admin-collection-dot" />
                {col.name}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminLayout() {
  const { logout, user } = useAuth();
  const { activeOrg } = useActiveOrg();
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

          {isSuperadmin && <OrgSearch />}

          {activeOrg && (
            <>
              <div className="admin-nav-org-header">
                <span className="admin-nav-org-name">{activeOrg.name}</span>
              </div>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `admin-nav-link admin-nav-link--sub${isActive ? ' active' : ''}`
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
                  `admin-nav-link admin-nav-link--sub${isActive ? ' active' : ''}`
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
                  `admin-nav-link admin-nav-link--sub${isActive ? ' active' : ''}`
                }
              >
                <MegaphoneIcon
                  className="admin-nav-icon"
                  weight="regular"
                  size={18}
                />
                Campañas
              </NavLink>

              <CollectionsSidebar />
            </>
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
