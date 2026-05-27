import { useMemo } from 'react';
import { useOrgResources } from '../hooks/useOrgResources';
import { aggregateCampaignStats } from '../utils/campaignStats';
import { SECTOR_LABELS } from '../types';
import type { Sector } from '../types';
import { formatNumber } from '../utils/format';
import './MetricsPage.css';

export function MetricsPage() {
  const { org, orgCampaigns, activeOrg } = useOrgResources();

  const totals = useMemo(
    () => aggregateCampaignStats(orgCampaigns),
    [orgCampaigns]
  );

  const subjectTotals = useMemo(() => {
    const map: Partial<Record<Sector, number>> = {};
    orgCampaigns.forEach((c) => {
      map[c.sector] = (map[c.sector] ?? 0) + (c.arActivations ?? 0);
    });
    const max = Math.max(...(Object.values(map).filter(Boolean) as number[]));
    return Object.entries(map)
      .map(([sector, value]) => ({
        subject: sector as Sector,
        label: SECTOR_LABELS[sector as Sector] ?? sector,
        value: value ?? 0,
        pct: max > 0 ? Math.round(((value ?? 0) / max) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [orgCampaigns]);

  const topCampaigns = useMemo(
    () =>
      [...orgCampaigns]
        .filter((c) => (c.views ?? 0) > 0)
        .map((c) => ({
          ...c,
          rate: ((c.arActivations ?? 0) / (c.views ?? 1)) * 100,
        }))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 4),
    [orgCampaigns]
  );

  return (
    <div className="mtr-page">
      <div className="mtr-header">
        <h1>Métricas</h1>
        <p>Últimas 8 semanas · {activeOrg?.name}</p>
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
            {topCampaigns.map((c, i) => (
              <div key={c.id} className="mtr-top-row">
                <span className="mtr-top-rank">#{i + 1}</span>
                <div className="mtr-top-info">
                  <span className="mtr-top-name">{c.title}</span>
                  <div className="mtr-top-bar-wrap">
                    <div
                      className="mtr-top-bar"
                      style={{ width: `${c.rate.toFixed(0)}%` }}
                    />
                  </div>
                </div>
                <span className="mtr-top-rate">{c.rate.toFixed(1)}%</span>
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
            {subjectTotals.map((s) => (
              <div key={s.subject} className="mtr-subject-row">
                <span className={`sector-badge sector-badge--${s.subject}`}>
                  {s.label}
                </span>
                <div className="mtr-subject-bar-wrap">
                  <div
                    className="mtr-subject-bar"
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
                <span className="mtr-subject-value">
                  {formatNumber(s.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mtr-card">
          <h2 className="mtr-card-title">Funnel de conversión</h2>
          <p className="mtr-card-desc">
            Detectá en qué etapa se pierden usuarios: QR escaneado → AR cargado
            → click en CTA.
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
                  <div
                    className={`mtr-funnel-bar ${step.color}`}
                    style={{ width: `${step.pct}%` }}
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
