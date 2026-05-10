import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchModels } from '@/services/sketchfab';
import {
  SECTOR_META,
  sectorCategories,
  getBestThumbnail,
} from '@/types/sketchfab';
import type { SketchfabModel, ITSector } from '@/types/sketchfab';

type Tab = 'all' | ITSector;

const TABS: { id: Tab; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'ecommerce', label: 'Ecommerce' },
  { id: 'turismo', label: 'Turismo' },
  { id: 'educacion', label: 'Educación' },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('all');
  const [category, setCategory] = useState<string>('');
  const [keyword, setKeyword] = useState('');
  const [models, setModels] = useState<SketchfabModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Categorías disponibles según tab activa
  const categories =
    tab === 'all' ? [] : SECTOR_META[tab as ITSector].categories;

  const buildSearchParams = () => {
    return {
      keyword: keyword.trim() || undefined,
      categories:
        category ||
        (tab !== 'all' ? sectorCategories(tab as ITSector) : undefined),
      count: 24,
    };
  };

  // Cargar modelos cuando cambia tab, category o keyword (con debounce en keyword)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const delay = keyword ? 400 : 0;
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      setError(null);
      setNextCursor(null);
      searchModels(buildSearchParams())
        .then((res) => {
          setModels(res.results);
          setNextCursor(res.next ?? null);
        })
        .catch((err: Error) => setError(err.message))
        .finally(() => setLoading(false));
    }, delay);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, category, keyword]);

  // Resetear categoría al cambiar tab
  const handleTabChange = (id: Tab) => {
    setTab(id);
    setCategory('');
  };

  const loadMore = () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    searchModels({ ...buildSearchParams(), cursor: nextCursor })
      .then((res) => {
        setModels((prev) => [...prev, ...res.results]);
        setNextCursor(res.next ?? null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <main className="page">
      <div className="container">
        {/* Búsqueda */}
        <div className="search-bar">
          <input
            className="search-bar__input"
            type="search"
            placeholder="Buscar modelos 3D..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {/* Tabs de sector */}
        <div className="sector-tabs">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              className={`sector-tab sector-tab--${id} ${tab === id ? 'sector-tab--active' : ''}`}
              onClick={() => handleTabChange(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filtro por categoría (solo cuando hay sector seleccionado) */}
        {categories.length > 0 && (
          <select
            className="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        )}

        {/* Grid de resultados */}
        {error && <div className="state-error">{error}</div>}
        {!error && models.length === 0 && !loading && (
          <div className="state-empty">Sin resultados para esta búsqueda</div>
        )}

        <div className="catalog-grid">
          {models.map((model) => {
            const thumb = getBestThumbnail(model);
            return (
              <article
                key={model.uid}
                className="model-card"
                onClick={() => navigate(`/ar/${model.uid}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === 'Enter' && navigate(`/ar/${model.uid}`)
                }
              >
                <div className="model-card__thumb">
                  {thumb ? (
                    <img src={thumb} alt={model.name} loading="lazy" />
                  ) : (
                    <div className="model-card__thumb-placeholder">📦</div>
                  )}
                </div>
                <div className="model-card__body">
                  <p className="model-card__name" title={model.name}>
                    {model.name}
                  </p>
                  <p className="model-card__meta">@{model.user.username}</p>
                  {model.animationCount > 0 && (
                    <span className="sector-badge sector-badge--educacion">
                      Animado
                    </span>
                  )}
                  <div className="model-card__action">
                    <span
                      className="btn btn-primary"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    >
                      Ver en AR
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Cargar más */}
        {nextCursor && !loading && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button className="btn btn-ghost" onClick={loadMore}>
              Cargar más
            </button>
          </div>
        )}

        {loading && <div className="state-loading">Cargando modelos...</div>}
      </div>
    </main>
  );
};
