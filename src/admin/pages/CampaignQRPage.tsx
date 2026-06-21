import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useCampaigns } from '../context/CampaignsContext';
import { SECTOR_LABELS } from '../types';
import { buildArQrUrl } from '../constants/urls';
import { formatDate, formatNumber } from '../utils/format';
import type { Campaign } from '../types';
import './CampaignQRPage.css';

const FALLBACK_CAMPAIGN: Campaign = {
  id: 'nueva',
  title: 'Geometría 5° grado — Poliedros',
  description: 'Escaneá el QR y explorá figuras 3D en tu living.',
  sector: 'educacion',
  status: 'active',
  sketchfabUid: 'fe85107a4491481f8b176f85df856365',
  ctaUrl: 'https://santillana.com.ar/libro/matematica-5',
  views: 0,
  arActivations: 0,
  ctaClicks: 0,
  createdAt: new Date().toISOString(),
  qrValue: buildArQrUrl('fe85107a4491481f8b176f85df856365'),
  orgSlug: 'demo',
};

export function CampaignQRPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const stateUid = (location.state as { uid?: string } | null)?.uid;
  const { campaigns } = useCampaigns();

  const baseCampaign = campaigns.find((c) => c.id === id) ?? FALLBACK_CAMPAIGN;

  const campaign: Campaign =
    stateUid && id === 'nueva'
      ? {
          ...baseCampaign,
          sketchfabUid: stateUid,
          qrValue: buildArQrUrl(stateUid),
        }
      : baseCampaign;

  const views = campaign.views ?? 0;
  const arActivations = campaign.arActivations ?? 0;
  const ctaClicks = campaign.ctaClicks ?? 0;
  const hasStats = views > 0 || arActivations > 0 || ctaClicks > 0;

  // La URL del QR se deriva en vivo del front (VITE_PUBLIC_WEB_URL u origin
  // actual) en lugar de usar campaign.qrValue, que puede traer una base vieja
  // (localhost) guardada por el core al crear la campaña.
  const qrUrl = buildArQrUrl(campaign.sketchfabUid);

  return (
    <div className="qrp-page">
      <div className="qrp-back-row">
        <button
          type="button"
          className="qrp-btn qrp-btn-ghost"
          onClick={() => navigate('/admin/dashboard')}
        >
          ← Volver al dashboard
        </button>
      </div>

      <div className="qrp-content">
        <div className="qrp-card qrp-card--main">
          <div className="qrp-campaign-meta">
            <span className={`sector-badge sector-badge--${campaign.sector}`}>
              {SECTOR_LABELS[campaign.sector] ?? campaign.sector}
            </span>
            <p className="qrp-created">
              Creada el {formatDate(campaign.createdAt)}
            </p>
          </div>

          <h1 className="qrp-title">{campaign.title}</h1>
          <p className="qrp-description">{campaign.description}</p>

          <div className="qrp-qr-wrapper">
            <QRCodeSVG
              value={qrUrl}
              size={240}
              level="H"
              includeMargin
              className="qrp-qr"
            />
          </div>

          <a
            href={qrUrl}
            className="qrp-qr-url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {qrUrl}
          </a>

          <div className="qrp-actions">
            <button type="button" className="qrp-btn qrp-btn-primary">
              Descargar QR
            </button>
            <button
              type="button"
              className="qrp-btn qrp-btn-secondary"
              onClick={() => navigate(`/ar/${campaign.sketchfabUid}`)}
            >
              Ver experiencia AR
            </button>
          </div>
        </div>

        {hasStats && (
          <div className="qrp-card qrp-card--stats">
            <h2 className="qrp-stats-title">Estadísticas de la campaña</h2>
            <div className="qrp-stats-grid">
              <div className="qrp-stat">
                <span className="qrp-stat-value qrp-stat-blue">
                  {formatNumber(views)}
                </span>
                <span className="qrp-stat-label">Vistas totales</span>
              </div>
              <div className="qrp-stat">
                <span className="qrp-stat-value qrp-stat-green">
                  {formatNumber(arActivations)}
                </span>
                <span className="qrp-stat-label">Activaciones AR</span>
              </div>
              <div className="qrp-stat">
                <span className="qrp-stat-value qrp-stat-orange">
                  {formatNumber(ctaClicks)}
                </span>
                <span className="qrp-stat-label">Clicks al CTA</span>
              </div>
            </div>
            {views > 0 && (
              <p className="qrp-conversion">
                Tasa de activación AR:{' '}
                <strong>{((arActivations / views) * 100).toFixed(1)}%</strong>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
