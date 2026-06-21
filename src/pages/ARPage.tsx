import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ARViewer } from '@/lib/ar-viewer';
import type { ARTrackingStatus } from '@/lib/ar-viewer';
import { getModel, getDownloadUrl } from '@/services/sketchfab';
import { apiResolveCampaignByUid, trackEvent } from '@/services/analytics';
import { getAnalyticsSessionId } from '@/services/sessionId';
import type { SketchfabModel } from '@/types/sketchfab';
import { buildArQrUrl } from '@/admin/constants/urls';

type LoadPhase = 'loading' | 'ready' | 'error';

export const ARPage = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<LoadPhase>('loading');
  const [model, setModel] = useState<SketchfabModel | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [trackingStatus, setTrackingStatus] =
    useState<ARTrackingStatus>('idle');
  const [retryKey, setRetryKey] = useState(0);

  // Campaña resuelta (null = curado/catálogo sin campaña → no se trackea).
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [ctaUrl, setCtaUrl] = useState<string | null>(null);
  // Guards anti-doble-conteo (StrictMode dev monta el effect 2 veces).
  const viewTrackedRef = useRef(false);
  const arActivationTrackedRef = useRef(false);

  useEffect(() => {
    if (!uid) {
      setPhase('error');
      setErrorMsg('UID inválido');
      return;
    }

    setPhase('loading');
    setModel(null);
    setDownloadUrl(null);
    setCampaignId(null);
    setCtaUrl(null);
    viewTrackedRef.current = false;
    arActivationTrackedRef.current = false;

    Promise.all([getModel(uid), getDownloadUrl(uid)])
      .then(([meta, dlUrl]) => {
        setModel(meta);
        setDownloadUrl(dlUrl);
        setPhase('ready');

        // Tracking best-effort: si no hay campaña ACTIVE (404) o falla la
        // resolución, NO se emite nada y el visor sigue igual. Curados/'local:'
        // caen acá → 404 → no-op.
        apiResolveCampaignByUid(uid)
          .then((campaign) => {
            setCampaignId(campaign.id);
            setCtaUrl(campaign.ctaUrl);
            if (!viewTrackedRef.current) {
              viewTrackedRef.current = true;
              trackEvent(campaign.id, 'view', getAnalyticsSessionId());
            }
          })
          .catch(() => {
            /* sin campaña: best-effort, no trackear */
          });
      })
      .catch((err: Error) => {
        setErrorMsg(err.message);
        setPhase('error');
      });
  }, [uid]);

  const shareUrl = buildArQrUrl(uid ?? '');

  // 'model-placed' = modelo anclado en superficie real → activación AR efectiva.
  const handleStatusChange = (status: ARTrackingStatus) => {
    setTrackingStatus(status);
    if (
      status === 'model-placed' &&
      campaignId &&
      !arActivationTrackedRef.current
    ) {
      arActivationTrackedRef.current = true;
      trackEvent(campaignId, 'ar_activation', getAnalyticsSessionId());
    }
  };

  if (phase === 'loading') {
    return (
      <div className="state-loading state-full-height">Cargando modelo...</div>
    );
  }

  if (phase === 'error' || !model || !downloadUrl) {
    return (
      <div className="state-error state-full-height">
        <p className="ar-panel__error-message">
          {errorMsg ?? 'No se pudo cargar el modelo'}
        </p>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </div>
    );
  }

  return (
    <div className="ar-layout">
      <section className="ar-layout__viewer">
        <div className="ar-viewer-wrap">
          <ARViewer
            key={retryKey}
            modelUrl={downloadUrl}
            modelLabel={model.name}
            description={model.description ?? undefined}
            onStatusChange={handleStatusChange}
          />
        </div>
      </section>

      <aside className="ar-layout__panel">
        <button
          className="btn btn-ghost btn-sm ar-panel__back"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>

        <h1 className="ar-panel__title">{model.name}</h1>

        <p className="ar-panel__meta">
          @{model.user.username}
          {model.license && (
            <span className="ar-panel__license"> · {model.license.label}</span>
          )}
        </p>

        <p className="ar-panel__status">
          Estado:{' '}
          <strong className="ar-panel__status-value">{trackingStatus}</strong>
        </p>

        {trackingStatus.startsWith('error') && (
          <button
            className="btn btn-primary ar-panel__retry"
            onClick={() => setRetryKey((k) => k + 1)}
          >
            Reintentar
          </button>
        )}

        {model.description && (
          <p className="ar-panel__description">
            {model.description.slice(0, 200)}
            {model.description.length > 200 ? '...' : ''}
          </p>
        )}

        {campaignId && ctaUrl && (
          <a
            className="btn btn-primary ar-panel__cta"
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent(campaignId, 'cta_click', getAnalyticsSessionId())
            }
          >
            Ver más
          </a>
        )}

        <div className="ar-panel__share">
          <p className="ar-panel__share-title">Compartir experiencia AR</p>
          <div className="share-panel">
            <div className="share-panel__qr">
              <QRCodeSVG value={shareUrl} size={140} />
            </div>
            <p className="share-panel__label">Escaneá para ver en AR</p>
            <button
              className="btn btn-ghost ar-panel__copy"
              onClick={() => navigator.clipboard?.writeText(shareUrl)}
            >
              Copiar link
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
