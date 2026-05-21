import { useMemo } from 'react';
import { useOrgResources } from '../hooks/useOrgResources';
import { aggregateCampaignStats } from '../utils/campaignStats';
import { SUBJECT_LABELS } from '../constants/subjects';
import type { Subject } from '../constants/subjects';
import { formatNumber } from '../utils/format';
import './MetricsPage.css';

const WEEKLY_DATA = [
  { week: 'Sem 1', views: 380, ar: 175 },
  { week: 'Sem 2', views: 540, ar: 330 },
  { week: 'Sem 3', views: 680, ar: 295 },
  { week: 'Sem 4', views: 590, ar: 400 },
  { week: 'Sem 5', views: 830, ar: 355 },
  { week: 'Sem 6', views: 760, ar: 510 },
  { week: 'Sem 7', views: 910, ar: 445 },
  { week: 'Sem 8', views: 980, ar: 640 },
];

const HOURLY_DATA = [
  { h: '6h', v: 12 },
  { h: '7h', v: 38 },
  { h: '8h', v: 95 },
  { h: '9h', v: 184 },
  { h: '10h', v: 210 },
  { h: '11h', v: 196 },
  { h: '12h', v: 142 },
  { h: '13h', v: 88 },
  { h: '14h', v: 120 },
  { h: '15h', v: 168 },
  { h: '16h', v: 178 },
  { h: '17h', v: 145 },
  { h: '18h', v: 96 },
  { h: '19h', v: 62 },
  { h: '20h', v: 34 },
  { h: '21h', v: 18 },
  { h: '22h', v: 8 },
];

const DEVICE_DATA = [
  { label: 'Android', pct: 54, color: 'mtr-device--android' },
  { label: 'iOS', pct: 32, color: 'mtr-device--ios' },
  { label: 'Web (desktop)', pct: 14, color: 'mtr-device--web' },
];

const maxHourly = Math.max(...HOURLY_DATA.map((x) => x.v));
const maxWeekly = Math.max(...WEEKLY_DATA.map((d) => d.views));

export function MetricsPage() {
  const { org, orgCampaigns, activeOrg } = useOrgResources();

  const totals = useMemo(
    () => aggregateCampaignStats(orgCampaigns),
    [orgCampaigns]
  );

  const subjectTotals = useMemo(() => {
    const map: Partial<Record<Subject, number>> = {};
    orgCampaigns.forEach((c) => {
      map[c.subject] = (map[c.subject] ?? 0) + c.arActivations;
    });
    const max = Math.max(...(Object.values(map).filter(Boolean) as number[]));
    return Object.entries(map)
      .map(([subject, value]) => ({
        subject: subject as Subject,
        label: SUBJECT_LABELS[subject as Subject] ?? subject,
        value: value ?? 0,
        pct: max > 0 ? Math.round(((value ?? 0) / max) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [orgCampaigns]);

  const topCampaigns = useMemo(
    () =>
      [...orgCampaigns]
        .filter((c) => c.views > 0)
        .map((c) => ({ ...c, rate: (c.arActivations / c.views) * 100 }))
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
          <div className="mtr-bar-chart">
            <div className="mtr-bars">
              {WEEKLY_DATA.map((d) => (
                <div key={d.week} className="mtr-bar-col">
                  <div className="mtr-bar-wrap">
                    <div
                      className="mtr-bar mtr-bar--ar"
                      style={{
                        height: `${Math.round((d.ar / maxWeekly) * 100)}%`,
                      }}
                      title={`AR: ${d.ar}`}
                    />
                    <div
                      className="mtr-bar mtr-bar--views"
                      style={{
                        height: `${Math.round((d.views / maxWeekly) * 100)}%`,
                      }}
                      title={`Vistas: ${d.views}`}
                    />
                  </div>
                  <span className="mtr-bar-label">{d.week}</span>
                </div>
              ))}
            </div>
            <div className="mtr-chart-legend">
              <span className="mtr-legend-item mtr-legend--views">Vistas</span>
              <span className="mtr-legend-item mtr-legend--ar">
                Activaciones AR
              </span>
            </div>
          </div>
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
                <span className={`subject-badge badge-${s.subject}`}>
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
          <div className="mtr-devices">
            {DEVICE_DATA.map((d) => (
              <div key={d.label} className="mtr-device-row">
                <span className="mtr-device-label">{d.label}</span>
                <div className="mtr-device-bar-wrap">
                  <div
                    className={`mtr-device-bar ${d.color}`}
                    style={{ width: `${d.pct}%` }}
                  />
                </div>
                <span className="mtr-device-pct">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mtr-card mtr-card--wide">
          <h2 className="mtr-card-title">Horarios pico de escaneo</h2>
          <p className="mtr-card-desc">
            Programá notificaciones y activaciones en los horarios donde tus
            usuarios están más activos. Los picos coinciden con el horario
            escolar (9h–11h) y la tarde (15h–17h).
          </p>
          <div className="mtr-hourly">
            {HOURLY_DATA.map((d) => (
              <div key={d.h} className="mtr-hourly-col">
                <div className="mtr-hourly-bar-wrap">
                  <div
                    className="mtr-hourly-bar"
                    style={{
                      height: `${Math.round((d.v / maxHourly) * 100)}%`,
                    }}
                    title={`${d.v} scans`}
                  />
                </div>
                <span className="mtr-hourly-label">{d.h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
