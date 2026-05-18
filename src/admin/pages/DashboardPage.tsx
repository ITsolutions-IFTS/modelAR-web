import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCampaigns } from '../context/CampaignsContext'
import { SUBJECT_LABELS } from '../constants/subjects'
import type { Subject } from '../constants/subjects'
import { formatNumber, formatPercent } from '../utils/format'
import type { Campaign } from '../types'
import './DashboardPage.css'

function SubjectBadge({ subject }: { subject: string }) {
  const label = SUBJECT_LABELS[subject as Subject] ?? subject
  return <span className={`subject-badge badge-${subject}`}>{label}</span>
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { campaigns, deleteCampaign } = useCampaigns()

  const { totalViews, totalAR } = useMemo(() => ({
    totalViews: campaigns.reduce((acc, c) => acc + c.views, 0),
    totalAR: campaigns.reduce((acc, c) => acc + c.arActivations, 0),
  }), [campaigns])

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-text">
          <h1>Dashboard</h1>
          <p>Campañas de Santillana — modelAR</p>
        </div>
        <a
          className="dashboard-btn-new"
          href="/admin/campanas/nueva"
          onClick={(e) => { e.preventDefault(); navigate('/admin/campanas/nueva') }}
        >
          + Nueva campaña
        </a>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-card-label">Total vistas</div>
          <div className="stat-card-value stat-blue">{formatNumber(totalViews)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total activaciones AR</div>
          <div className="stat-card-value stat-green">{formatNumber(totalAR)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Tasa de conversión AR</div>
          <div className="stat-card-value stat-orange">{formatPercent(totalAR, totalViews)}</div>
        </div>
      </div>

      <div className="dashboard-table-section">
        <h2>Campañas activas</h2>
        <div className="dashboard-table-wrapper">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Materia</th>
                <th className="col-num">Vistas</th>
                <th className="col-num">AR</th>
                <th className="col-num">Clicks</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign: Campaign) => (
                <tr key={campaign.id}>
                  <td className="cell-title">{campaign.title}</td>
                  <td><SubjectBadge subject={campaign.subject} /></td>
                  <td className="cell-num">{formatNumber(campaign.views)}</td>
                  <td className="cell-num">{formatNumber(campaign.arActivations)}</td>
                  <td className="cell-num">{formatNumber(campaign.ctaClicks)}</td>
                  <td className="cell-actions">
                    <button className="btn-qr" onClick={() => navigate(`/admin/campanas/${campaign.id}/qr`)}>
                      Ver QR
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => navigate('/admin/campanas/nueva', { state: { edit: campaign } })}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => { if (confirm(`¿Eliminar "${campaign.title}"?`)) deleteCampaign(campaign.id) }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
