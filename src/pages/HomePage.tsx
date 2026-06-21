import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { getModel } from '@/services/sketchfab';
import { getFeaturedModels } from '@/services/catalog';
import { getBestThumbnail } from '@/types/sketchfab';
import type { SketchfabModel } from '@/types/sketchfab';
import { useCampaigns } from '@/admin/context/CampaignsContext';

export const HomePage = () => {
  const navigate = useNavigate();
  const { campaigns } = useCampaigns();
  const [models, setModels] = useState<SketchfabModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');

  // Derive unique UIDs from all campaigns
  const uids = [...new Set(campaigns.map((c) => c.sketchfabUid))];
  // Clave estable para el efecto: cambia si cambia el SET de uids, no el length
  const uidsKey = uids.join(',');

  useEffect(() => {
    setLoading(true);
    setError(null);

    let cancelled = false;

    Promise.all([
      // Campañas: tolerante a fallos individuales (un uid roto NO vacía el resto)
      Promise.allSettled(uids.map((uid) => getModel(uid))),
      // Destacados del core: nunca lanza, devuelve [] ante error
      getFeaturedModels(),
    ])
      .then(([campaignResults, featured]) => {
        if (cancelled) return;

        const campaignModels = campaignResults
          .filter(
            (r): r is PromiseFulfilledResult<SketchfabModel> =>
              r.status === 'fulfilled'
          )
          .map((r) => r.value);

        // Merge + dedupe por uid: campañas primero, luego destacados nuevos
        const byUid = new Map<string, SketchfabModel>();
        for (const m of campaignModels) byUid.set(m.uid, m);
        for (const m of featured) if (!byUid.has(m.uid)) byUid.set(m.uid, m);

        const merged = [...byUid.values()];
        setModels(merged);

        // Solo es error si NO hay absolutamente nada que mostrar y además
        // había campañas que se esperaba resolver.
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

  const filtered = keyword.trim()
    ? models.filter((m) => m.name.toLowerCase().includes(keyword.toLowerCase()))
    : models;

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

        <div className="catalog-grid">
          {loading &&
            models.length === 0 &&
            Array.from({ length: 6 }).map((_, i) => (
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
          {filtered.map((model) => {
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
      </div>
    </main>
  );
};
