import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ARViewer } from '@/lib/ar-viewer';
import type { ARTrackingStatus } from '@/lib/ar-viewer';
import { getModel, getDownloadUrl } from '@/services/sketchfab';
import type { SketchfabModel } from '@/types/sketchfab';

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

  useEffect(() => {
    if (!uid) {
      setPhase('error');
      setErrorMsg('UID inválido');
      return;
    }

    setPhase('loading');
    setModel(null);
    setDownloadUrl(null);

    Promise.all([getModel(uid), getDownloadUrl(uid)])
      .then(([meta, dlUrl]) => {
        setModel(meta);
        setDownloadUrl(dlUrl);
        setPhase('ready');
      })
      .catch((err: Error) => {
        setErrorMsg(err.message);
        setPhase('error');
      });
  }, [uid]);

  const shareUrl = `${window.location.origin}${window.location.pathname}#/ar/${uid}`;

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
            onStatusChange={setTrackingStatus}
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
