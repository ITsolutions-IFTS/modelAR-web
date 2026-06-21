import { useEffect, useMemo, useState } from 'react';
import { useOrganizations } from '../context/OrganizationsContext';
import { useOrgResources } from '../hooks/useOrgResources';
import { aggregateCampaignStats } from '../utils/campaignStats';
// DEMO breakdowns — temporal, quitar con el tracking real (ver demoBreakdowns.ts)
import { buildDemoBreakdowns } from '../utils/demoBreakdowns';
import { SECTOR_LABELS } from '../types';
import type { Sector } from '../types';
import { formatNumber } from '../utils/format';
import { useCountUp } from '../hooks/useCountUp';
import { DynamicBar } from '../components/DynamicBar';
import { useCampaignAnalytics } from '../hooks/useCampaignAnalytics';
import './MetricsPage.css';

interface KpiValueProps {
  value: number;
  formatter: (val: number) => React.ReactNode;
}

function KpiValue({ value, formatter }: KpiValueProps) {
  // Consumimos el hook que creamos en el Paso 1
  const animatedValue = useCountUp(value, 800);

  return <>{formatter(animatedValue)}</>;
}

export function MetricsPage() {
  const { organizations } = useOrganizations();
  const { org, orgCampaigns, isSuperadmin } = useOrgResources();
  const [selectedOrg, setSelectedOrg] = useState('');

  const sortedOrganizations = useMemo(
    () => [...organizations].sort((a, b) => a.name.localeCompare(b.name)),
    [organizations]
  );

  const organizationOptions = useMemo(() => {
    // El filtro se deriva EXCLUSIVAMENTE de la lista real de organizaciones
    // (misma fuente que OrganizationsPage: GET /api/organizations, que excluye
    // las soft-deleted). Antes se agregaba un fallback con los orgSlug de las
    // campañas; como el orgSlug está denormalizado y sobrevive al borrado de la
    // org, eso reinyectaba orgs ya borradas SOLO en este select.
    const baseOptions = sortedOrganizations.map((organization) => ({
      slug: organization.slug,
      label: organization.name,
    }));
    const nameCounts = baseOptions.reduce<Record<string, number>>(
      (acc, organization) => {
        acc[organization.label] = (acc[organization.label] ?? 0) + 1;
        return acc;
      },
      {}
    );
    return baseOptions
      .map((organization) => ({
        ...organization,
        label:
          nameCounts[organization.label] > 1
            ? `${organization.label} (${organization.slug})`
            : organization.label,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [sortedOrganizations]);

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

  // ── Capa de tracking REAL (con fallback a demo) ──
  const visibleIds = useMemo(
    () => visibleCampaigns.map((c) => c.id),
    [visibleCampaigns]
  );
  const { analytics } = useCampaignAnalytics(visibleIds);
  // Campañas visibles que TIENEN analytics real. Si hay ≥1, la capa real
  // gobierna totals/sector/top/weekly (las sin respuesta cuentan 0, para no
  // sumar demo+real). Si no hay ninguna → demo puro.
  const realRows = useMemo(
    () => visibleCampaigns.map((c) => analytics[c.id]).filter(Boolean),
    [visibleCampaigns, analytics]
  );
  const hasReal = realRows.length > 0;

  const totals = useMemo(() => {
    if (hasReal) {
      return realRows.reduce(
        (acc, r) => ({
          views: acc.views + r.stats.views,
          ar: acc.ar + r.stats.arActivations,
          cta: acc.cta + r.stats.ctaClicks,
        }),
        { views: 0, ar: 0, cta: 0 }
      );
    }
    return aggregateCampaignStats(visibleCampaigns);
  }, [hasReal, realRows, visibleCampaigns]);

  // DEMO breakdowns (Vistas por semana / Dispositivos / Horarios pico).
  // Determinístico a partir de los totales demo ya presentes. Sembrado por la
  // org seleccionada (o 'self' para client) para que sea estable entre renders.
  // TEMPORAL: quitar cuando exista tracking real.
  const demo = useMemo(
    () =>
      buildDemoBreakdowns(
        isSuperadmin ? selectedOrg || 'demo' : (org?.slug ?? 'self'),
        totals
      ),
    [isSuperadmin, selectedOrg, org?.slug, totals]
  );
  const hasData = totals.views > 0;

  // Vistas por semana desde el timeline REAL (agrega 30 días en buckets de 7).
  // Si no hay real → demo.weekly. Dispositivos/Horarios no tienen tracking real.
  const realWeekly = useMemo(() => {
    if (!hasReal) return null;
    const byDate = new Map<string, { views: number; ar: number }>();
    realRows.forEach((r) =>
      r.timeline.forEach((p) => {
        const cur = byDate.get(p.date) ?? { views: 0, ar: 0 };
        cur.views += p.views;
        cur.ar += p.ar;
        byDate.set(p.date, cur);
      })
    );
    if (byDate.size === 0) return null;
    const WEEKS = 8;
    const MS_DAY = 86_400_000;
    const now = new Date();
    const todayUTC = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    );
    const buckets = Array.from({ length: WEEKS }, () => ({ views: 0, ar: 0 }));
    byDate.forEach((v, date) => {
      const t = Date.parse(`${date}T00:00:00Z`);
      if (Number.isNaN(t)) return;
      const daysAgo = Math.floor((todayUTC - t) / MS_DAY);
      if (daysAgo < 0 || daysAgo >= WEEKS * 7) return;
      const idx = WEEKS - 1 - Math.floor(daysAgo / 7); // semana vieja → S1
      buckets[idx].views += v.views;
      buckets[idx].ar += v.ar;
    });
    return buckets.map((b, i) => ({
      label: `S${i + 1}`,
      views: b.views,
      ar: b.ar,
    }));
  }, [hasReal, realRows]);

  const weekly = realWeekly ?? demo.weekly;
  const weeklyMax = useMemo(
    () => Math.max(1, ...weekly.map((w) => w.views)),
    [weekly]
  );

  const sectorTotals = useMemo(() => {
    const map: Partial<Record<Sector, number>> = {};
    if (hasReal) {
      realRows.forEach((r) => {
        map[r.campaign.sector] =
          (map[r.campaign.sector] ?? 0) + r.stats.arActivations;
      });
    } else {
      visibleCampaigns.forEach((campaign) => {
        map[campaign.sector] =
          (map[campaign.sector] ?? 0) + (campaign.arActivations ?? 0);
      });
    }
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
  }, [hasReal, realRows, visibleCampaigns]);

  const topCampaigns = useMemo(() => {
    if (hasReal) {
      return realRows
        .filter((r) => r.stats.views > 0)
        .map((r) => ({
          id: r.campaign.id,
          title: r.campaign.title,
          rate: (r.stats.arActivations / r.stats.views) * 100,
        }))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 4);
    }
    return [...visibleCampaigns]
      .filter((campaign) => (campaign.views ?? 0) > 0)
      .map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        rate: ((campaign.arActivations ?? 0) / (campaign.views ?? 1)) * 100,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 4);
  }, [hasReal, realRows, visibleCampaigns]);

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
            <KpiValue
              value={totals.views}
              formatter={(v) => formatNumber(Math.round(v))}
            />
          </span>
          <span className="mtr-kpi-label">Vistas totales</span>
        </div>
        <div className="mtr-kpi">
          <span className="mtr-kpi-value mtr-green">
            <KpiValue
              value={totals.ar}
              formatter={(v) => formatNumber(Math.round(v))}
            />
          </span>
          <span className="mtr-kpi-label">Activaciones AR</span>
        </div>
        <div className="mtr-kpi">
          <span className="mtr-kpi-value mtr-orange">
            <KpiValue
              value={totals.cta}
              formatter={(v) => formatNumber(Math.round(v))}
            />
          </span>
          <span className="mtr-kpi-label">
            {org?.ctaLabel ?? 'Clicks al CTA'}
          </span>
        </div>
        <div className="mtr-kpi">
          <span className="mtr-kpi-value mtr-purple">
            <KpiValue
              value={totals.views > 0 ? (totals.ar / totals.views) * 100 : 0}
              formatter={(v) => `${v.toFixed(1)}%`}
            />
          </span>
          <span className="mtr-kpi-label">Tasa AR</span>
        </div>
      </div>

      <div className="mtr-grid">
        <div className="mtr-card mtr-card--wide">
          <h2 className="mtr-card-title">Vistas por semana</h2>
          {hasData ? (
            <div className="mtr-bar-chart">
              <div className="mtr-bars">
                {weekly.map((w) => (
                  <div key={w.label} className="mtr-bar-col">
                    <div className="mtr-bar-wrap">
                      <div
                        className="mtr-bar mtr-bar--views"
                        style={{
                          height: `${Math.round((w.views / weeklyMax) * 100)}%`,
                        }}
                        title={`${formatNumber(w.views)} vistas`}
                      />
                      <div
                        className="mtr-bar mtr-bar--ar"
                        style={{
                          height: `${Math.round((w.ar / weeklyMax) * 100)}%`,
                        }}
                        title={`${formatNumber(w.ar)} activaciones AR`}
                      />
                    </div>
                    <span className="mtr-bar-label">{w.label}</span>
                  </div>
                ))}
              </div>
              <div className="mtr-chart-legend">
                <span className="mtr-legend-item mtr-legend--views">
                  Vistas
                </span>
                <span className="mtr-legend-item mtr-legend--ar">
                  Activaciones AR
                </span>
              </div>
            </div>
          ) : (
            <div className="mtr-chart-empty">Sin datos disponibles aún.</div>
          )}
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
          {hasData ? (
            <div className="mtr-devices">
              {demo.devices.map((device) => (
                <div key={device.label} className="mtr-device-row">
                  <span className="mtr-device-label">{device.label}</span>
                  <div className="mtr-device-bar-wrap">
                    <DynamicBar
                      className={`mtr-device-bar ${device.className}`}
                      percent={device.pct}
                    />
                  </div>
                  <span className="mtr-device-pct">{device.pct}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mtr-chart-empty">Sin datos disponibles aún.</div>
          )}
        </div>

        <div className="mtr-card mtr-card--wide">
          <h2 className="mtr-card-title">Horarios pico de escaneo</h2>
          <p className="mtr-card-desc">
            Programá notificaciones y activaciones en los horarios donde tus
            usuarios están más activos.
          </p>
          {hasData ? (
            <div className="mtr-hourly">
              {demo.hourly.map((point) => (
                <div key={point.hour} className="mtr-hourly-col">
                  <div className="mtr-hourly-bar-wrap">
                    <div
                      className="mtr-hourly-bar"
                      style={{ height: `${point.pct}%` }}
                      title={`${point.hour}:00 · ${formatNumber(point.value)} escaneos`}
                    />
                  </div>
                  <span className="mtr-hourly-label">{point.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mtr-chart-empty">Sin datos disponibles aún.</div>
          )}
        </div>
      </div>
    </div>
  );
}
