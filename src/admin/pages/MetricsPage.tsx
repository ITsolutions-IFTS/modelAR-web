import { useEffect, useMemo, useState } from 'react';
import { useOrganizations } from '../context/OrganizationsContext';
import { useOrgResources } from '../hooks/useOrgResources';
import { aggregateCampaignStats } from '../utils/campaignStats';
import { SECTOR_LABELS } from '../types';
import type { Sector } from '../types';
import { formatNumber } from '../utils/format';
import { DynamicBar } from '../components/DynamicBar';
import './MetricsPage.css';

export function MetricsPage() {
  const { organizations } = useOrganizations();
  const { org, orgCampaigns, isSuperadmin } = useOrgResources();
  const [selectedOrg, setSelectedOrg] = useState('');

  const sortedOrganizations = useMemo(
    () => [...organizations].sort((a, b) => a.name.localeCompare(b.name)),
    [organizations]
  );

  const organizationOptions = useMemo(() => {
    const baseOptions = sortedOrganizations.map((organization) => ({
      slug: organization.slug,
      label: organization.name,
    }));
    const knownSlugs = new Set(
      baseOptions.map((organization) => organization.slug)
    );
    const fallbackOptions = [
      ...new Set(orgCampaigns.map((campaign) => campaign.orgSlug)),
    ]
      .filter((slug) => !knownSlugs.has(slug))
      .map((slug) => ({ slug, label: slug }));
    const combinedOptions = [...baseOptions, ...fallbackOptions];
    const nameCounts = combinedOptions.reduce<Record<string, number>>(
      (acc, organization) => {
        acc[organization.label] = (acc[organization.label] ?? 0) + 1;
        return acc;
      },
      {}
    );
    return combinedOptions
      .map((organization) => ({
        ...organization,
        label:
          nameCounts[organization.label] > 1
            ? `${organization.label} (${organization.slug})`
            : organization.label,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [sortedOrganizations, orgCampaigns]);

  useEffect(() => {
    if (!isSuperadmin) return;
    const firstOrg = organizationOptions[0]?.slug ?? '';
    const hasSelectedOrg = organizationOptions.some(
      (organization) => organization.slug === selectedOrg
    );
    if (!selectedOrg || !hasSelectedOrg) {
      setSelectedOrg(firstOrg);
    }
  }, [isSuperadmin, organizationOptions, selectedOrg]);

  const selectedOrganization = useMemo(
    () =>
      isSuperadmin
        ? organizationOptions.find(
            (organization) => organization.slug === selectedOrg
          )
        : undefined,
    [isSuperadmin, organizationOptions, selectedOrg]
  );

  const visibleCampaigns = useMemo(
    () =>
      isSuperadmin
        ? orgCampaigns.filter((campaign) => campaign.orgSlug === selectedOrg)
        : orgCampaigns,
    [orgCampaigns, isSuperadmin, selectedOrg]
  );

  const totals = useMemo(
    () => aggregateCampaignStats(visibleCampaigns),
    [visibleCampaigns]
  );

  const sectorTotals = useMemo(() => {
    const map: Partial<Record<Sector, number>> = {};
    visibleCampaigns.forEach((campaign) => {
      map[campaign.sector] =
        (map[campaign.sector] ?? 0) + (campaign.arActivations ?? 0);
    });
    const values = Object.values(map).filter(
      (value): value is number => typeof value === 'number' && value > 0
    );
    const max = values.length > 0 ? Math.max(...values) : 0;
    return Object.entries(map)
      .map(([sector, value]) => ({
        subject: sector as Sector,
        label: SECTOR_LABELS[sector as Sector] ?? sector,
        value: value ?? 0,
        pct: max > 0 ? Math.round(((value ?? 0) / max) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [visibleCampaigns]);

  const topCampaigns = useMemo(
    () =>
      [...visibleCampaigns]
        .filter((campaign) => (campaign.views ?? 0) > 0)
        .map((campaign) => ({
          ...campaign,
          rate: ((campaign.arActivations ?? 0) / (campaign.views ?? 1)) * 100,
        }))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 4),
    [visibleCampaigns]
  );

  const subtitle = isSuperadmin
    ? (selectedOrganization?.label ?? 'Sin organizaciones')
    : org?.name;

  return (
    <div className="mtr-page">
      <div className="mtr-header">
        <div>
          <h1>Métricas</h1>
          <p>
            {isSuperadmin ? subtitle : `Últimas 8 semanas · ${subtitle ?? ''}`}
          </p>
        </div>
        {isSuperadmin && (
          <label className="mtr-org-select">
            <span>Organización</span>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              disabled={organizationOptions.length === 0}
            >
              {organizationOptions.length === 0 ? (
                <option value="">Sin organizaciones</option>
              ) : (
                organizationOptions.map((organization) => (
                  <option key={organization.slug} value={organization.slug}>
                    {organization.label}
                  </option>
                ))
              )}
            </select>
          </label>
        )}
      </div>

      <div className="mtr-kpis">
        <div className="mtr-kpi">
          <span className="mtr-kpi-value mtr-blue">
            {formatNumber(totals.views)}
          </span>
          <span className="mtr-kpi-label">Vistas totales</span>
        </div>
        <div className="mtr-kpi">
          <span className="mtr-kpi-value mtr-green">
            {formatNumber(totals.ar)}
          </span>
          <span className="mtr-kpi-label">Activaciones AR</span>
        </div>
        <div className="mtr-kpi">
          <span className="mtr-kpi-value mtr-orange">
            {formatNumber(totals.cta)}
          </span>
          <span className="mtr-kpi-label">
            {org?.ctaLabel ?? 'Clicks al CTA'}
          </span>
        </div>
        <div className="mtr-kpi">
          <span className="mtr-kpi-value mtr-purple">
            {totals.views > 0
              ? `${((totals.ar / totals.views) * 100).toFixed(1)}%`
              : '0%'}
          </span>
          <span className="mtr-kpi-label">Tasa AR</span>
        </div>
      </div>

      <div className="mtr-grid">
        <div className="mtr-card mtr-card--wide">
          <h2 className="mtr-card-title">Vistas por semana</h2>
          <div className="mtr-chart-empty">Sin datos disponibles aún.</div>
        </div>

        <div className="mtr-card">
          <h2 className="mtr-card-title">Top campañas por conversión</h2>
          <div className="mtr-top-list">
            {topCampaigns.map((campaign, index) => (
              <div key={campaign.id} className="mtr-top-row">
                <span className="mtr-top-rank">#{index + 1}</span>
                <div className="mtr-top-info">
                  <span className="mtr-top-name">{campaign.title}</span>
                  <div className="mtr-top-bar-wrap">
                    <DynamicBar
                      className="mtr-top-bar"
                      percent={campaign.rate}
                    />
                  </div>
                </div>
                <span className="mtr-top-rate">
                  {campaign.rate.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mtr-card">
          <h2 className="mtr-card-title">Activaciones por materia</h2>
          <p className="mtr-card-desc">
            Identificá qué áreas curriculares generan mayor engagement con AR.
          </p>
          <div className="mtr-subject-list">
            {sectorTotals.map((sector) => (
              <div key={sector.subject} className="mtr-subject-row">
                <span
                  className={`sector-badge sector-badge--${sector.subject}`}
                >
                  {sector.label}
                </span>
                <div className="mtr-subject-bar-wrap">
                  <DynamicBar
                    className="mtr-subject-bar"
                    percent={sector.pct}
                  />
                </div>
                <span className="mtr-subject-value">
                  {formatNumber(sector.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mtr-card">
          <h2 className="mtr-card-title">Funnel de conversión</h2>
          <p className="mtr-card-desc">
            Detectá en qué etapa se pierden usuarios: QR escaneado {'->'} AR
            cargado {'->'} click en CTA.
          </p>
          <div className="mtr-funnel">
            {[
              {
                label: 'QR escaneados',
                value: totals.views,
                pct: 100,
                color: 'mtr-funnel--views',
              },
              {
                label: 'AR activado',
                value: totals.ar,
                pct:
                  totals.views > 0
                    ? Math.round((totals.ar / totals.views) * 100)
                    : 0,
                color: 'mtr-funnel--ar',
              },
              {
                label: org?.ctaLabel ?? 'Click al CTA',
                value: totals.cta,
                pct:
                  totals.views > 0
                    ? Math.round((totals.cta / totals.views) * 100)
                    : 0,
                color: 'mtr-funnel--cta',
              },
            ].map((step) => (
              <div key={step.label} className="mtr-funnel-row">
                <span className="mtr-funnel-label">{step.label}</span>
                <div className="mtr-funnel-bar-wrap">
                  <DynamicBar
                    className={`mtr-funnel-bar ${step.color}`}
                    percent={step.pct}
                  />
                </div>
                <span className="mtr-funnel-val">
                  {formatNumber(step.value)}
                </span>
                <span className="mtr-funnel-pct">{step.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mtr-card">
          <h2 className="mtr-card-title">Dispositivos</h2>
          <p className="mtr-card-desc">
            Optimizá la experiencia según el dispositivo más frecuente de tus
            usuarios.
          </p>
          <div className="mtr-chart-empty">Sin datos disponibles aún.</div>
        </div>

        <div className="mtr-card mtr-card--wide">
          <h2 className="mtr-card-title">Horarios pico de escaneo</h2>
          <p className="mtr-card-desc">
            Programá notificaciones y activaciones en los horarios donde tus
            usuarios están más activos.
          </p>
          <div className="mtr-chart-empty">Sin datos disponibles aún.</div>
        </div>
      </div>
    </div>
  );
}
