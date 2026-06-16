import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { getModel } from '@/services/sketchfab';
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

  useEffect(() => {
    if (uids.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all(uids.map((uid) => getModel(uid)))
      .then((results) => setModels(results))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaigns.length]);

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
        {!error && filtered.length === 0 && !loading && (
          <div className="state-empty">Sin resultados</div>
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
