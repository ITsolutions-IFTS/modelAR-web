import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrgResources } from '../hooks/useOrgResources';
import { SubjectBadge } from '../components/SubjectBadge';
import { aggregateCampaignStats } from '../utils/campaignStats';
import { formatNumber, formatPercent, formatDate } from '../utils/format';
import type { Campaign } from '../types';
import '../admin-theme.css';
import './DashboardPage.css';

function ConvBar({ rate }: { rate: number }) {
  return (
    <div className="dash-conv-wrap">
      <div
        className="dash-conv-bar"
        style={{ width: `${Math.min(rate, 100).toFixed(0)}%` }}
      />
      <span className="dash-conv-label">{rate.toFixed(1)}%</span>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { orgCampaigns, activeOrg } = useOrgResources();

  const sortedCampaigns = useMemo(
    () => [...orgCampaigns].sort((a, b) => b.views - a.views),
    [orgCampaigns]
  );

  const {
    views: totalViews,
    ar: totalAR,
    cta: totalCta,
  } = useMemo(() => aggregateCampaignStats(sortedCampaigns), [sortedCampaigns]);

  return (
    <div className="dashboard-page admin-page">
      <div className="dashboard-header admin-page-header">
        <div className="dashboard-header-text admin-page-header-text">
          <h1>Dashboard</h1>
          <p>{activeOrg?.name}</p>
        </div>
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
                  c.views > 0 ? (c.arActivations / c.views) * 100 : 0;
                return (
                  <tr key={c.id}>
                    <td className="cell-title">{c.title}</td>
                    <td>
                      <SubjectBadge subject={c.subject} />
                    </td>
                    <td className="cell-num">{formatNumber(c.views)}</td>
                    <td className="cell-num">
                      {formatNumber(c.arActivations)}
                    </td>
                    <td className="cell-num">{formatNumber(c.ctaClicks)}</td>
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
