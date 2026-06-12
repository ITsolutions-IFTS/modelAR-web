import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@phosphor-icons/react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useCampaigns } from '../context/CampaignsContext';
import { useActiveOrg } from '../context/ActiveOrgContext';
import { useAuth } from '../context/AuthContext';
import { useOrganizations } from '../context/OrganizationsContext';
import { enrichOrg, type EnrichedOrg } from '../hooks/useOrgResources';
import { SECTORS, type Sector } from '../types';
import { DynamicBar } from '../components/DynamicBar';
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
        <DynamicBar
          key={i}
          className="org-spark-bar"
          percent={max > 0 ? (v / max) * 100 : 0}
          axis="height"
        />
      ))}
    </div>
  );
}

interface OrgCardProps {
  org: EnrichedOrg;
  campaignCount: number;
  totalViews: number;
  isSuperadmin: boolean;
}

function OrgCardSkeleton() {
  return (
    <div className="org-card">
      <div className="org-card-header">
        <Skeleton
          circle
          width={44}
          height={44}
          baseColor="var(--surface-2)"
          highlightColor="var(--line)"
        />
        <div className="org-header-meta">
          <h3 className="org-name">
            <Skeleton
              width={140}
              height={18}
              baseColor="var(--surface-2)"
              highlightColor="var(--line)"
            />
          </h3>
          <div className="org-header-badges">
            <Skeleton
              width={72}
              height={20}
              borderRadius={999}
              baseColor="var(--surface-2)"
              highlightColor="var(--line)"
            />
          </div>
        </div>
      </div>

      <p className="org-description">
        <Skeleton
          count={2}
          baseColor="var(--surface-2)"
          highlightColor="var(--line)"
        />
      </p>

      <div className="org-stats">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="org-stat">
            <span className="org-stat-value">
              <Skeleton
                width={48}
                height={24}
                baseColor="var(--surface-2)"
                highlightColor="var(--line)"
              />
            </span>
            <span className="org-stat-label">
              <Skeleton
                width={84}
                height={12}
                baseColor="var(--surface-2)"
                highlightColor="var(--line)"
              />
            </span>
          </div>
        ))}
      </div>

      <Skeleton
        height={40}
        borderRadius={12}
        baseColor="var(--surface-2)"
        highlightColor="var(--line)"
      />
    </div>
  );
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

interface NewOrgFormProps {
  onCancel: () => void;
  onSubmit: (data: {
    slug: string;
    name: string;
    description?: string;
    sector: Sector;
  }) => Promise<void>;
}

function NewOrgForm({ onCancel, onSubmit }: NewOrgFormProps) {
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState<Sector | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const slugLooksValid = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!sector) {
      setFormError('Seleccioná un sector.');
      return;
    }
    if (!slugLooksValid) {
      setFormError('El slug debe ser kebab-case: solo a-z, 0-9 y guiones.');
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      await onSubmit({
        slug: slug.trim(),
        name: name.trim(),
        description: description.trim() || undefined,
        sector: sector as Sector,
      });
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="orgs-form" onSubmit={handleSubmit} noValidate>
      <h2 className="orgs-form-title">Nueva organización</h2>
      <div className="orgs-form-grid">
        <label className="orgs-form-field">
          <span>Slug</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="ej: museo-bernal"
            required
            autoFocus
          />
          <small>Identificador único en URLs — minúsculas y guiones.</small>
        </label>
        <label className="orgs-form-field">
          <span>Nombre</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej: Museo Bernal"
            required
          />
        </label>
        <label className="orgs-form-field orgs-form-field--full">
          <span>
            Descripción <small>(opcional)</small>
          </span>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ej: Museo de arte contemporáneo"
          />
        </label>
        <label className="orgs-form-field">
          <span>Sector</span>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value as Sector | '')}
            required
          >
            {SECTORS.map((s) => (
              <option key={s.value || 'placeholder'} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {formError && <p className="orgs-form-error">{formError}</p>}
      <div className="orgs-form-actions">
        <button
          type="button"
          className="org-btn org-btn--ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="org-btn org-btn--primary"
          disabled={submitting}
        >
          {submitting ? 'Creando…' : 'Crear organización'}
        </button>
      </div>
    </form>
  );
}

export function OrganizationsPage() {
  const { campaigns } = useCampaigns();
  const { organizations, loading, error, addOrganization } = useOrganizations();
  const { user } = useAuth();
  const isSuperadmin = user?.role === 'superadmin';
  const [adding, setAdding] = useState(false);

  return (
    <div className="orgs-page">
      <div className="orgs-header">
        <div>
          <h1>Organizaciones</h1>
          <p>Clientes activos y pendientes en la plataforma modelAR.</p>
        </div>
        {isSuperadmin && !adding && (
          <button
            className="org-btn org-btn--primary"
            onClick={() => setAdding(true)}
          >
            <PlusIcon weight="bold" size={14} /> Nueva organización
          </button>
        )}
      </div>

      {adding && (
        <NewOrgForm
          onCancel={() => setAdding(false)}
          onSubmit={async (data) => {
            await addOrganization(data);
            setAdding(false);
          }}
        />
      )}

      {loading && organizations.length === 0 && (
        <div className="orgs-grid" aria-label="Cargando organizaciones">
          {Array.from({ length: 4 }).map((_, index) => (
            <OrgCardSkeleton key={index} />
          ))}
        </div>
      )}
      {error && (
        <p className="orgs-empty orgs-empty--error">
          No pudimos cargar las organizaciones: {error}
        </p>
      )}
      {!loading && !error && organizations.length === 0 && !adding && (
        <p className="orgs-empty">Todavía no hay organizaciones registradas.</p>
      )}

      <div className="orgs-grid">
        {organizations.map((org) => {
          const enriched = enrichOrg(org);
          const orgCampaigns = campaigns.filter((c) => c.orgSlug === org.slug);
          return (
            <OrgCard
              key={org.slug}
              org={enriched}
              campaignCount={orgCampaigns.length}
              totalViews={orgCampaigns.reduce((a, c) => a + (c.views ?? 0), 0)}
              isSuperadmin={isSuperadmin}
            />
          );
        })}
      </div>
    </div>
  );
}
