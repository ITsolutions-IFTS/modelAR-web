import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { getModel } from '@/services/sketchfab';
import { getFeaturedModels } from '@/services/catalog';
import { getBestThumbnail } from '@/types/sketchfab';
import type { SketchfabModel } from '@/types/sketchfab';
import { useCampaigns } from '@/admin/context/CampaignsContext';

type CatalogModel = SketchfabModel & { category: string | null };

// Sección fallback para modelos sin categoría (campañas + curados sin keyword).
const FALLBACK_CATEGORY = 'Otros';

export const HomePage = () => {
  const navigate = useNavigate();
  const { campaigns } = useCampaigns();
  const [models, setModels] = useState<CatalogModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');

  const uids = [...new Set(campaigns.map((c) => c.sketchfabUid))];
  const uidsKey = uids.join(',');

  useEffect(() => {
    setLoading(true);
    setError(null);

    let cancelled = false;

    Promise.all([
      Promise.allSettled(uids.map((uid) => getModel(uid))),
      getFeaturedModels(),
    ])
      .then(([campaignResults, featured]) => {
        if (cancelled) return;

        // Campañas no traen category → null (caen en "Otros").
        const campaignModels: CatalogModel[] = campaignResults
          .filter(
            (r): r is PromiseFulfilledResult<SketchfabModel> =>
              r.status === 'fulfilled'
          )
          .map((r) => ({ ...r.value, category: null }));

        const byUid = new Map<string, CatalogModel>();
        for (const m of campaignModels) byUid.set(m.uid, m);
        // Featured con category. Si un uid ya vino de campaña (sin category)
        // pero el featured SÍ tiene category, preferimos la del featured.
        for (const m of featured) {
          const existing = byUid.get(m.uid);
          if (!existing) byUid.set(m.uid, m);
          else if (existing.category == null && m.category != null) {
            byUid.set(m.uid, { ...existing, category: m.category });
          }
        }

        const merged = [...byUid.values()];
        setModels(merged);

        if (
          merged.length === 0 &&
          uids.length > 0 &&
          campaignModels.length === 0
        ) {
          setError('No se pudieron cargar los modelos.');
        }
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar los modelos.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uidsKey]);

  // 1) Filtrar PRIMERO (el search funciona across categorías).
  const filtered = keyword.trim()
    ? models.filter((m) => m.name.toLowerCase().includes(keyword.toLowerCase()))
    : models;

  // 2) Agrupar DESPUÉS. Secciones vacías tras el filtro no se renderizan.
  const sections = useMemo(() => {
    const groups = new Map<string, CatalogModel[]>();
    for (const m of filtered) {
      const key = m.category?.trim() || FALLBACK_CATEGORY;
      const arr = groups.get(key);
      if (arr) arr.push(m);
      else groups.set(key, [m]);
    }
    // Orden: categorías alfabético, "Otros" siempre al final.
    return [...groups.entries()].sort(([a], [b]) => {
      if (a === FALLBACK_CATEGORY) return 1;
      if (b === FALLBACK_CATEGORY) return -1;
      return a.localeCompare(b, 'es', { sensitivity: 'base' });
    });
  }, [filtered]);

  const showSkeleton = loading && models.length === 0;

  return (
    <main className="page">
      <div className="container">
        <div className="search-bar">
          <input
            className="search-bar__input"
            type="search"
            placeholder="Buscar modelos 3D..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {error && <div className="state-error">{error}</div>}
        {!error && !loading && filtered.length === 0 && (
          <div className="state-empty">
            {keyword.trim()
              ? `Sin resultados para "${keyword.trim()}"`
              : models.length > 0
                ? 'Sin resultados'
                : 'Todavía no hay modelos en el catálogo'}
          </div>
        )}

        {showSkeleton && (
          <div className="catalog-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <article key={i} className="model-card">
                <div className="model-card__thumb">
                  <Skeleton
                    baseColor="var(--surface-2)"
                    highlightColor="var(--line)"
                    height="100%"
                    width="100%"
                    inline
                  />
                </div>
                <div className="model-card__body">
                  <p className="model-card__name">
                    <Skeleton
                      baseColor="var(--surface-2)"
                      highlightColor="var(--line)"
                      width="82%"
                      height={16}
                    />
                  </p>
                  <p className="model-card__meta">
                    <Skeleton
                      baseColor="var(--surface-2)"
                      highlightColor="var(--line)"
                      width="56%"
                      height={13}
                    />
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        {!showSkeleton &&
          sections.map(([category, items]) => (
            <section key={category} className="catalog-section">
              <h2 className="catalog-section__title">{category}</h2>
              <div className="catalog-grid">
                {items.map((model) => {
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
                          <div className="model-card__thumb-placeholder">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="model-card__body">
                        <p className="model-card__name" title={model.name}>
                          {model.name}
                        </p>
                        <p className="model-card__meta">
                          @{model.user.username}
                        </p>
                        <div className="model-card__action">
                          <span className="btn btn-primary model-card__button">
                            Ver en AR
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
      </div>
    </main>
  );
};
