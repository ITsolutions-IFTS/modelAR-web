import { useNavigate } from 'react-router-dom';
import { useCampaigns } from '../context/CampaignsContext';
import { useActiveOrg } from '../context/ActiveOrgContext';
import { useAuth } from '../context/AuthContext';
import { ORGS } from '../constants/orgs';
import type { Org } from '../constants/orgs';
import './OrganizationsPage.css';

interface OrgObservability {
  uptime: number;
  lastSeenLabel: string;
  weekViews: number;
  weekTrend: number;
  topCampaign: string;
  spark: number[];
}

const ORG_OBS: Record<string, OrgObservability> = {
  santillana: {
    uptime: 99.8,
    lastSeenLabel: 'hace 2 min',
    weekViews: 2840,
    weekTrend: 12,
    topCampaign: 'Poliedros 5° grado',
    spark: [65, 72, 58, 88, 95, 78, 92, 100],
  },
  vega: {
    uptime: 99.6,
    lastSeenLabel: 'hace 4 min',
    weekViews: 2380,
    weekTrend: 18,
    topCampaign: 'Reserva Norte — Unidad tipo A',
    spark: [55, 68, 72, 80, 74, 91, 88, 100],
  },
  garbarino: {
    uptime: 98.2,
    lastSeenLabel: 'hace 1h',
    weekViews: 1120,
    weekTrend: 3,
    topCampaign: 'Smart TV 55" AR Demo',
    spark: [40, 35, 50, 45, 38, 55, 48, 52],
  },
  'museo-mar': {
    uptime: 97.5,
    lastSeenLabel: 'hace 3 días',
    weekViews: 340,
    weekTrend: -5,
    topCampaign: 'Escultura Digital',
    spark: [30, 28, 20, 35, 22, 18, 25, 30],
  },
};

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="org-spark">
      {data.map((v, i) => (
        <div
          key={i}
          className="org-spark-bar"
          style={{ height: `${Math.round((v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

interface OrgCardProps {
  org: Org;
  campaignCount: number;
  totalViews: number;
  isSuperadmin: boolean;
}

function OrgCard({
  org,
  campaignCount,
  totalViews,
  isSuperadmin,
}: OrgCardProps) {
  const { setActiveOrg } = useActiveOrg();
  const navigate = useNavigate();
  const obs = ORG_OBS[org.slug];

  function handleSelect() {
    setActiveOrg({ slug: org.slug, name: org.name });
    navigate('/admin/dashboard');
  }

  const uptimeOk = obs && obs.uptime >= 99;
  const uptimeDegraded = obs && obs.uptime >= 97 && obs.uptime < 99;

  return (
    <div className={`org-card ${org.color}`}>
      <div className="org-card-header">
        <div className="org-avatar">{org.name[0]}</div>
        <div className="org-header-meta">
          <h3 className="org-name">{org.name}</h3>
          <div className="org-header-badges">
            {campaignCount > 0 ? (
              <span className="org-status org-status--active">Activa</span>
            ) : (
              <span className="org-status org-status--pending">Pendiente</span>
            )}
            {isSuperadmin && obs && (
              <span
                className={`org-uptime-badge ${uptimeOk ? 'org-uptime--ok' : uptimeDegraded ? 'org-uptime--warn' : 'org-uptime--down'}`}
              >
                <span className="org-uptime-dot" />
                {obs.uptime}% uptime
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="org-description">{org.description}</p>

      <div className="org-stats">
        <div className="org-stat">
          <span className="org-stat-value">{campaignCount}</span>
          <span className="org-stat-label">Campañas</span>
        </div>
        <div className="org-stat">
          <span className="org-stat-value">
            {totalViews.toLocaleString('es-AR')}
          </span>
          <span className="org-stat-label">Vistas totales</span>
        </div>
        {isSuperadmin && obs && (
          <div className="org-stat">
            <span className="org-stat-value">
              {obs.weekViews.toLocaleString('es-AR')}
              <span
                className={`org-trend ${obs.weekTrend >= 0 ? 'org-trend--up' : 'org-trend--down'}`}
              >
                {obs.weekTrend >= 0 ? '↑' : '↓'}
                {Math.abs(obs.weekTrend)}%
              </span>
            </span>
            <span className="org-stat-label">Esta semana</span>
          </div>
        )}
      </div>

      {isSuperadmin && obs && (
        <div className="org-observability">
          <div className="org-obs-row">
            <div className="org-obs-item">
              <span className="org-obs-label">Top campaña</span>
              <span className="org-obs-value org-obs-campaign">
                {obs.topCampaign}
              </span>
            </div>
            <div className="org-obs-item org-obs-item--right">
              <span className="org-obs-label">Último scan</span>
              <span className="org-obs-value">{obs.lastSeenLabel}</span>
            </div>
          </div>
          <div className="org-obs-spark-row">
            <span className="org-obs-label">Actividad últimos 7 días</span>
            <Sparkline data={obs.spark} />
          </div>
        </div>
      )}

      <button className="org-btn org-btn--primary" onClick={handleSelect}>
        Entrar
      </button>
    </div>
  );
}

export function OrganizationsPage() {
  const { campaigns } = useCampaigns();
  const { user } = useAuth();
  const isSuperadmin = user?.role === 'superadmin';

  return (
    <div className="orgs-page">
      <div className="orgs-header">
        <h1>Organizaciones</h1>
        <p>Clientes activos y pendientes en la plataforma modelAR.</p>
      </div>
      <div className="orgs-grid">
        {ORGS.map((org) => {
          const orgCampaigns = campaigns.filter((c) => c.orgSlug === org.slug);
          return (
            <OrgCard
              key={org.slug}
              org={org}
              campaignCount={orgCampaigns.length}
              totalViews={orgCampaigns.reduce((a, c) => a + c.views, 0)}
              isSuperadmin={isSuperadmin}
            />
          );
        })}
      </div>
    </div>
  );
}
