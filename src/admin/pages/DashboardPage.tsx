import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOrganizations } from '../context/OrganizationsContext';
import { useOrgResources } from '../hooks/useOrgResources';
import { SECTOR_LABELS } from '../types';
import { aggregateCampaignStats } from '../utils/campaignStats';
import { formatNumber, formatPercent, formatDate } from '../utils/format';
import type { Campaign } from '../types';
import { DynamicBar } from '../components/DynamicBar';
import '../admin-theme.css';
import './DashboardPage.css';

function ConvBar({ rate }: { rate: number }) {
  return (
    <div className="dash-conv-wrap">
      <DynamicBar className="dash-conv-bar" percent={rate} />
      <span className="dash-conv-label">{rate.toFixed(1)}%</span>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { organizations } = useOrganizations();
  const { org, orgCampaigns, isSuperadmin } = useOrgResources();
  const [selectedOrg, setSelectedOrg] = useState('');
  const requestedOrgSlug = searchParams.get('orgSlug') ?? '';

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
    const hasRequestedOrg = organizationOptions.some(
      (organization) => organization.slug === requestedOrgSlug
    );
    const nextOrg = hasRequestedOrg
      ? requestedOrgSlug
      : hasSelectedOrg
        ? selectedOrg
        : firstOrg;
    if (nextOrg !== selectedOrg) {
      setSelectedOrg(nextOrg);
    }
    if (nextOrg && nextOrg !== requestedOrgSlug) {
      setSearchParams({ orgSlug: nextOrg }, { replace: true });
    }
  }, [
    isSuperadmin,
    organizationOptions,
    requestedOrgSlug,
    selectedOrg,
    setSearchParams,
  ]);

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

  const sortedCampaigns = useMemo(
    () => [...visibleCampaigns].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)),
    [visibleCampaigns]
  );

  const {
    views: totalViews,
    ar: totalAR,
    cta: totalCta,
  } = useMemo(() => aggregateCampaignStats(sortedCampaigns), [sortedCampaigns]);

  const subtitle = isSuperadmin
    ? (selectedOrganization?.label ?? 'Sin organizaciones')
    : org?.name;

  function handleOrgChange(nextOrg: string) {
    setSelectedOrg(nextOrg);
    setSearchParams({ orgSlug: nextOrg }, { replace: true });
  }

  return (
    <div className="dashboard-page admin-page">
      <div className="dashboard-header admin-page-header">
        <div className="dashboard-header-text admin-page-header-text">
          <h1>Dashboard</h1>
          <p>{subtitle}</p>
        </div>
        {isSuperadmin && (
          <label className="admin-page-select">
            <span>Organización</span>
            <select
              value={selectedOrg}
              onChange={(e) => handleOrgChange(e.target.value)}
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

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-card-label">Total vistas</div>
          <div className="stat-card-value stat-blue">
            {formatNumber(totalViews)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Activaciones AR</div>
          <div className="stat-card-value stat-green">
            {formatNumber(totalAR)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Clicks al CTA</div>
          <div className="stat-card-value stat-orange">
            {formatNumber(totalCta)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Tasa conversión AR</div>
          <div className="stat-card-value stat-purple">
            {formatPercent(totalAR, totalViews)}
          </div>
        </div>
      </div>

      <div className="dashboard-table-section">
        <div className="dashboard-table-header">
          <h2>Rendimiento por campaña</h2>
          <button
            className="dashboard-btn-new"
            onClick={() => navigate('/admin/campanas')}
          >
            Ver todas las campañas
          </button>
        </div>
        <div className="dashboard-table-wrapper admin-table-wrapper">
          <table className="dashboard-table admin-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Materia</th>
                <th className="col-num">Vistas</th>
                <th className="col-num">AR</th>
                <th className="col-num">Clicks</th>
                <th className="col-conv">Conversión AR</th>
                <th>Creada</th>
              </tr>
            </thead>
            <tbody>
              {sortedCampaigns.map((c: Campaign) => {
                const rate =
                  (c.views ?? 0) > 0
                    ? ((c.arActivations ?? 0) / (c.views ?? 1)) * 100
                    : 0;
                return (
                  <tr key={c.id}>
                    <td className="cell-title">{c.title}</td>
                    <td>
                      <span
                        className={`sector-badge sector-badge--${c.sector}`}
                      >
                        {SECTOR_LABELS[c.sector]}
                      </span>
                    </td>
                    <td className="cell-num">{formatNumber(c.views ?? 0)}</td>
                    <td className="cell-num">
                      {formatNumber(c.arActivations ?? 0)}
                    </td>
                    <td className="cell-num">
                      {formatNumber(c.ctaClicks ?? 0)}
                    </td>
                    <td className="cell-conv">
                      <ConvBar rate={rate} />
                    </td>
                    <td className="cell-date">{formatDate(c.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
