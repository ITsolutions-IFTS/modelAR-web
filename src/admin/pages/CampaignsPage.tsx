import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  QrCodeIcon,
  PencilSimpleIcon,
  TrashIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import { useCampaigns } from '../context/CampaignsContext';
import { useOrgResources } from '../hooks/useOrgResources';
import { SubjectBadge } from '../components/SubjectBadge';
import { formatNumber } from '../utils/format';
import type { Campaign } from '../types';
import './CampaignsPage.css';

export function CampaignsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeColId = searchParams.get('col');

  const { deleteCampaign } = useCampaigns();
  const { org, orgCampaigns, orgCollections, activeOrg } = useOrgResources();

  const visibleCampaigns = useMemo(
    () =>
      activeColId
        ? orgCampaigns.filter((c) => c.collectionId === activeColId)
        : orgCampaigns,
    [orgCampaigns, activeColId]
  );

  const activeCol = orgCollections.find((c) => c.id === activeColId);
  const label = org?.collectionLabelPlural ?? 'Colecciones';

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
            {activeOrg?.name}
            {activeCol ? ` · ${activeCol.name}` : ''}
          </p>
        </div>
        <button
          className="camps-btn-new admin-btn-primary"
          onClick={() => navigate('/admin/campanas/nueva')}
        >
          <PlusIcon weight="bold" size={14} /> Nueva campaña
        </button>
      </div>

      {orgCollections.length > 0 && (
        <div className="camps-filter-tabs">
          <button
            className={`camps-filter-tab${!activeColId ? ' active' : ''}`}
            onClick={() => selectCol(null)}
          >
            Todas{' '}
            <span className="camps-filter-count">{orgCampaigns.length}</span>
          </button>
          {orgCollections.map((col) => {
            const count = orgCampaigns.filter(
              (c) => c.collectionId === col.id
            ).length;
            return (
              <button
                key={col.id}
                className={`camps-filter-tab${activeColId === col.id ? ' active' : ''}`}
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
              {activeColId
                ? `No hay campañas en esta ${org?.collectionLabel?.toLowerCase() ?? 'colección'}.`
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
                <th>Título</th>
                <th>Materia</th>
                <th>{label}</th>
                <th className="col-num">Vistas</th>
                <th className="col-num">AR</th>
                <th className="col-num">Clicks</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibleCampaigns.map((campaign: Campaign) => {
                const col = orgCollections.find(
                  (c) => c.id === campaign.collectionId
                );
                return (
                  <tr key={campaign.id}>
                    <td className="cell-title">{campaign.title}</td>
                    <td>
                      <SubjectBadge subject={campaign.subject} />
                    </td>
                    <td className="cell-collection">
                      {col ? (
                        <span className="camps-col-badge">{col.name}</span>
                      ) : (
                        <span className="camps-col-empty">—</span>
                      )}
                    </td>
                    <td className="cell-num">{formatNumber(campaign.views)}</td>
                    <td className="cell-num">
                      {formatNumber(campaign.arActivations)}
                    </td>
                    <td className="cell-num">
                      {formatNumber(campaign.ctaClicks)}
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
                        onClick={() => {
                          if (confirm(`¿Eliminar "${campaign.title}"?`))
                            deleteCampaign(campaign.id);
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
