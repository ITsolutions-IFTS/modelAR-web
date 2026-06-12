import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  QrCodeIcon,
  PencilSimpleIcon,
  TrashIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import { useCampaigns } from '../context/CampaignsContext';
import { useOrganizations } from '../context/OrganizationsContext';
import { useOrgResources } from '../hooks/useOrgResources';
import { SECTOR_LABELS } from '../types';
import { formatNumber } from '../utils/format';
import { useConfirm } from '@/components/ConfirmDialog';
import type { Campaign } from '../types';
import './CampaignsPage.css';

export function CampaignsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orgFilter, setOrgFilter] = useState('');
  const activeColId = searchParams.get('col');

  const { deleteCampaign } = useCampaigns();
  const { organizations } = useOrganizations();
  const { org, orgCampaigns, orgCollections, isSuperadmin } = useOrgResources();
  const confirm = useConfirm();

  const sortedOrganizations = useMemo(
    () => [...organizations].sort((a, b) => a.name.localeCompare(b.name)),
    [organizations]
  );

  const organizationNames = useMemo(
    () =>
      Object.fromEntries(
        sortedOrganizations.map((organization) => [
          organization.slug,
          organization.name,
        ])
      ),
    [sortedOrganizations]
  );

  const organizationOptions = useMemo(() => {
    const uniqueOrgSlugs = [
      ...new Set(orgCampaigns.map((campaign) => campaign.orgSlug)),
    ];
    return uniqueOrgSlugs
      .map((slug) => ({
        slug,
        label: organizationNames[slug] ?? slug,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [orgCampaigns, organizationNames]);

  const filteredByOrg = useMemo(
    () =>
      isSuperadmin && orgFilter
        ? orgCampaigns.filter((campaign) => campaign.orgSlug === orgFilter)
        : orgCampaigns,
    [orgCampaigns, isSuperadmin, orgFilter]
  );

  const visibleCampaigns = useMemo(
    () =>
      !isSuperadmin && activeColId
        ? filteredByOrg.filter(
            (campaign) => campaign.collectionId === activeColId
          )
        : filteredByOrg,
    [filteredByOrg, isSuperadmin, activeColId]
  );

  const activeCol = orgCollections.find(
    (collection) => collection.id === activeColId
  );
  const label = org?.collectionLabelPlural ?? 'Colecciones';
  const subtitle = isSuperadmin ? 'Todas las organizaciones' : org?.name;

  function getOrganizationLabel(orgSlug: string) {
    return organizationNames[orgSlug] ?? orgSlug;
  }

  function selectCol(id: string | null) {
    if (id) setSearchParams({ col: id });
    else setSearchParams({});
  }

  return (
    <div className="camps-page admin-page">
      <div className="camps-header admin-page-header">
        <div className="camps-header-text admin-page-header-text">
          <h1>Campañas</h1>
          <p>
            {subtitle}
            {!isSuperadmin && activeCol ? ` · ${activeCol.name}` : ''}
          </p>
        </div>
        <button
          className="camps-btn-new admin-btn-primary"
          onClick={() => navigate('/admin/campanas/nueva')}
        >
          <PlusIcon weight="bold" size={14} /> Nueva campaña
        </button>
      </div>

      {isSuperadmin && (
        <div className="camps-filter-tabs">
          <label className="camps-filter-label" htmlFor="camps-org-filter">
            Organización
          </label>
          <select
            id="camps-org-filter"
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value)}
          >
            <option value="">Todas</option>
            {organizationOptions.map((organization) => (
              <option key={organization.slug} value={organization.slug}>
                {organization.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {!isSuperadmin && orgCollections.length > 0 && (
        <div className="camps-filter-tabs">
          <button
            className={`camps-filter-tab${!activeColId ? ' active' : ''}`}
            onClick={() => selectCol(null)}
          >
            Todas{' '}
            <span className="camps-filter-count">{filteredByOrg.length}</span>
          </button>
          {orgCollections.map((col) => {
            const count = filteredByOrg.filter(
              (campaign) => campaign.collectionId === col.id
            ).length;
            return (
              <button
                key={col.id}
                className={`camps-filter-tab${
                  activeColId === col.id ? ' active' : ''
                }`}
                onClick={() => selectCol(col.id)}
              >
                {col.name}
                <span className="camps-filter-count">{count}</span>
              </button>
            );
          })}
          <span className="camps-filter-label">{label}</span>
        </div>
      )}

      <div className="camps-table-wrapper admin-table-wrapper">
        {visibleCampaigns.length === 0 ? (
          <div className="camps-empty">
            <p>
              {!isSuperadmin && activeColId
                ? `No hay campañas en esta ${
                    org?.collectionLabel?.toLowerCase() ?? 'colección'
                  }.`
                : isSuperadmin
                  ? 'No hay campañas activas para el filtro seleccionado.'
                  : 'No hay campañas activas para esta organización.'}
            </p>
            <button
              className="camps-btn-new"
              onClick={() => navigate('/admin/campanas/nueva')}
            >
              <PlusIcon weight="bold" size={14} /> Crear primera campaña
            </button>
          </div>
        ) : (
          <table className="camps-table admin-table">
            <thead>
              <tr>
                {isSuperadmin && <th>Organización</th>}
                <th>Título</th>
                <th>Creada por</th>
                <th>Materia</th>
                {!isSuperadmin && <th>{label}</th>}
                <th className="col-num">Vistas</th>
                <th className="col-num">AR</th>
                <th className="col-num">Clicks</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibleCampaigns.map((campaign: Campaign) => {
                const col = orgCollections.find(
                  (collection) => collection.id === campaign.collectionId
                );
                return (
                  <tr key={campaign.id}>
                    {isSuperadmin && (
                      <td>{getOrganizationLabel(campaign.orgSlug)}</td>
                    )}
                    <td className="cell-title">{campaign.title}</td>
                    <td>{campaign.createdBy?.name ?? '—'}</td>
                    <td>
                      <span
                        className={`sector-badge sector-badge--${campaign.sector}`}
                      >
                        {SECTOR_LABELS[campaign.sector]}
                      </span>
                    </td>
                    {!isSuperadmin && (
                      <td className="cell-collection">
                        {col ? (
                          <span className="camps-col-badge">{col.name}</span>
                        ) : (
                          <span className="camps-col-empty">—</span>
                        )}
                      </td>
                    )}
                    <td className="cell-num">
                      {formatNumber(campaign.views ?? 0)}
                    </td>
                    <td className="cell-num">
                      {formatNumber(campaign.arActivations ?? 0)}
                    </td>
                    <td className="cell-num">
                      {formatNumber(campaign.ctaClicks ?? 0)}
                    </td>
                    <td className="cell-actions">
                      <button
                        className="btn-qr"
                        onClick={() =>
                          navigate(`/admin/campanas/${campaign.id}/qr`)
                        }
                      >
                        <QrCodeIcon weight="regular" size={15} /> QR
                      </button>
                      <button
                        className="btn-edit"
                        onClick={() =>
                          navigate('/admin/campanas/nueva', {
                            state: { edit: campaign },
                          })
                        }
                      >
                        <PencilSimpleIcon weight="regular" size={15} /> Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={async () => {
                          const ok = await confirm({
                            title: 'Eliminar campaña',
                            message: `Vas a eliminar "${campaign.title}". Esta accion no se puede deshacer.`,
                            confirmLabel: 'Eliminar',
                            variant: 'danger',
                          });
                          if (ok) await deleteCampaign(campaign.id);
                        }}
                      >
                        <TrashIcon weight="regular" size={15} /> Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
