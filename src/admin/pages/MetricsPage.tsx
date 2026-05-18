import { useMemo } from 'react'
import { useCampaigns } from '../context/CampaignsContext'
import { SUBJECT_LABELS } from '../constants/subjects'
import type { Subject } from '../constants/subjects'
import { formatNumber } from '../utils/format'
import './MetricsPage.css'

const WEEKLY_DATA = [
  { week: 'Sem 1', views: 420, ar: 210 },
  { week: 'Sem 2', views: 580, ar: 310 },
  { week: 'Sem 3', views: 520, ar: 280 },
  { week: 'Sem 4', views: 710, ar: 390 },
  { week: 'Sem 5', views: 650, ar: 360 },
  { week: 'Sem 6', views: 890, ar: 510 },
  { week: 'Sem 7', views: 820, ar: 470 },
  { week: 'Sem 8', views: 950, ar: 550 },
]

export function MetricsPage() {
  const { campaigns } = useCampaigns()

  const totals = useMemo(() => ({
    views: campaigns.reduce((a, c) => a + c.views, 0),
    ar: campaigns.reduce((a, c) => a + c.arActivations, 0),
    cta: campaigns.reduce((a, c) => a + c.ctaClicks, 0),
  }), [campaigns])

  const maxViews = Math.max(...WEEKLY_DATA.map(d => d.views))

  // Subject totals
  const subjectTotals = useMemo(() => {
    const map: Partial<Record<Subject, number>> = {}
    campaigns.forEach(c => { map[c.subject] = (map[c.subject] ?? 0) + c.arActivations })
    const max = Math.max(...Object.values(map).filter(Boolean) as number[])
    return Object.entries(map).map(([subject, value]) => ({
      subject: subject as Subject,
      label: SUBJECT_LABELS[subject as Subject] ?? subject,
      value: value ?? 0,
      pct: max > 0 ? Math.round(((value ?? 0) / max) * 100) : 0,
    })).sort((a, b) => b.value - a.value)
  }, [campaigns])

  // Top campaigns by conversion
  const topCampaigns = useMemo(() =>
    [...campaigns]
      .filter(c => c.views > 0)
      .map(c => ({ ...c, rate: (c.arActivations / c.views) * 100 }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 4)
  , [campaigns])

  return (
    <div className="mtr-page">
      <div className="mtr-header">
        <h1>Métricas</h1>
        <p>Últimas 8 semanas · Organización activa</p>
      </div>

      {/* KPIs */}
      <div className="mtr-kpis">
        <div className="mtr-kpi">
          <span className="mtr-kpi-value mtr-blue">{formatNumber(totals.views)}</span>
          <span className="mtr-kpi-label">Vistas totales</span>
        </div>
        <div className="mtr-kpi">
          <span className="mtr-kpi-value mtr-green">{formatNumber(totals.ar)}</span>
          <span className="mtr-kpi-label">Activaciones AR</span>
        </div>
        <div className="mtr-kpi">
          <span className="mtr-kpi-value mtr-orange">{formatNumber(totals.cta)}</span>
          <span className="mtr-kpi-label">Clicks al CTA</span>
        </div>
        <div className="mtr-kpi">
          <span className="mtr-kpi-value mtr-purple">
            {totals.views > 0 ? `${((totals.ar / totals.views) * 100).toFixed(1)}%` : '0%'}
          </span>
          <span className="mtr-kpi-label">Tasa AR</span>
        </div>
      </div>

      <div className="mtr-grid">
        {/* Weekly chart */}
        <div className="mtr-card mtr-card--wide">
          <h2 className="mtr-card-title">Vistas por semana</h2>
          <div className="mtr-bar-chart">
            <div className="mtr-bars">
              {WEEKLY_DATA.map(d => (
                <div key={d.week} className="mtr-bar-col">
                  <div className="mtr-bar-wrap">
                    <div
                      className="mtr-bar mtr-bar--ar"
                      style={{ height: `${Math.round((d.ar / maxViews) * 100)}%` }}
                      title={`AR: ${d.ar}`}
                    />
                    <div
                      className="mtr-bar mtr-bar--views"
                      style={{ height: `${Math.round((d.views / maxViews) * 100)}%` }}
                      title={`Vistas: ${d.views}`}
                    />
                  </div>
                  <span className="mtr-bar-label">{d.week}</span>
                </div>
              ))}
            </div>
            <div className="mtr-chart-legend">
              <span className="mtr-legend-item mtr-legend--views">Vistas</span>
              <span className="mtr-legend-item mtr-legend--ar">Activaciones AR</span>
            </div>
          </div>
        </div>

        {/* Top campaigns */}
        <div className="mtr-card">
          <h2 className="mtr-card-title">Top campañas por conversión</h2>
          <div className="mtr-top-list">
            {topCampaigns.map((c, i) => (
              <div key={c.id} className="mtr-top-row">
                <span className="mtr-top-rank">#{i + 1}</span>
                <div className="mtr-top-info">
                  <span className="mtr-top-name">{c.title}</span>
                  <div className="mtr-top-bar-wrap">
                    <div className="mtr-top-bar" style={{ width: `${c.rate.toFixed(0)}%` }} />
                  </div>
                </div>
                <span className="mtr-top-rate">{c.rate.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject distribution */}
        <div className="mtr-card">
          <h2 className="mtr-card-title">Activaciones por materia</h2>
          <div className="mtr-subject-list">
            {subjectTotals.map(s => (
              <div key={s.subject} className="mtr-subject-row">
                <span className={`subject-badge badge-${s.subject}`}>{s.label}</span>
                <div className="mtr-subject-bar-wrap">
                  <div className="mtr-subject-bar" style={{ width: `${s.pct}%` }} />
                </div>
                <span className="mtr-subject-value">{formatNumber(s.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
