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

  useEffect(() => {
    if (!uid) {
      setPhase('error');
      setErrorMsg('UID inválido');
      return;
    }

    setPhase('loading');
    setModel(null);
    setDownloadUrl(null);

    // Pedir metadatos y URL de descarga en paralelo
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
      <div
        className="state-loading"
        style={{ height: 'calc(100dvh - var(--header-h))' }}
      >
        Cargando modelo...
      </div>
    );
  }

  if (phase === 'error' || !model || !downloadUrl) {
    return (
      <div
        className="state-error"
        style={{ height: 'calc(100dvh - var(--header-h))' }}
      >
        <p style={{ marginBottom: '1rem' }}>
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
      {/* Viewer — ocupa todo el espacio disponible via flex */}
      <section className="ar-layout__viewer">
        <div className="ar-viewer-wrap" style={{ height: '100%' }}>
          <ARViewer
            modelUrl={downloadUrl}
            modelLabel={model.name}
            description={model.description ?? undefined}
            onStatusChange={setTrackingStatus}
          />
        </div>
      </section>

      {/* Panel lateral / inferior */}
      <aside className="ar-layout__panel">
        <button
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '1rem' }}
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>

        <h1
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            letterSpacing: '-0.015em',
            marginBottom: '0.3rem',
            color: 'var(--text)',
          }}
        >
          {model.name}
        </h1>

        <p
          style={{
            fontSize: '0.775rem',
            color: 'var(--text-3)',
            marginBottom: '0.75rem',
            letterSpacing: '0.01em',
          }}
        >
          @{model.user.username}
          {model.license && (
            <span style={{ opacity: 0.6 }}> · {model.license.label}</span>
          )}
        </p>

        {/* Estado AR */}
        <p
          style={{
            fontSize: '0.775rem',
            color: 'var(--text-3)',
            marginBottom: '1rem',
          }}
        >
          Estado:{' '}
          <strong style={{ color: 'var(--accent)', fontWeight: 600 }}>
            {trackingStatus}
          </strong>
        </p>

        {/* Descripción */}
        {model.description && (
          <p
            style={{
              fontSize: '0.825rem',
              color: 'var(--text-2)',
              lineHeight: 1.65,
              marginBottom: '1rem',
            }}
          >
            {model.description.slice(0, 200)}
            {model.description.length > 200 ? '...' : ''}
          </p>
        )}

        {/* QR para compartir */}
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: '1rem' }}>
          <p
            style={{
              fontSize: '0.775rem',
              color: 'var(--text-3)',
              letterSpacing: '0.01em',
              marginBottom: '0.75rem',
            }}
          >
            Compartir experiencia AR
          </p>
          <div className="share-panel">
            <div className="share-panel__qr">
              <QRCodeSVG value={shareUrl} size={140} />
            </div>
            <p className="share-panel__label">Escaneá para ver en AR</p>
            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem' }}
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
