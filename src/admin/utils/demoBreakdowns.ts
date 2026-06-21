/**
 * ⚠️ DEMO / TEMPORAL — borrar cuando llegue el tracking real.
 *
 * Genera, de forma DETERMINÍSTICA y coherente con los totales, las
 * distribuciones de las 3 cards de Métricas que hoy no tienen tracking:
 *   - vistas por semana (curva de las últimas 8 semanas)
 *   - split de dispositivos (android / ios / web)
 *   - distribución horaria de escaneos (24h)
 *
 * Sembrado por un string estable (el slug de la org seleccionada, o un
 * literal para la vista de client) → mismo input ⇒ mismo output entre renders
 * y recargas. No agrega endpoints: parte de los totales demo que ya llegan en
 * `campaign.views/arActivations/ctaClicks`.
 *
 * Para QUITAR esta feature: borrar este archivo y revertir el bloque de render
 * de las 3 cards en MetricsPage.tsx (buscar "DEMO breakdowns").
 */

// PRNG determinístico (mulberry32) sembrado por hash del seed.
function hashSeed(seed: string): number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface WeeklyPoint {
  label: string;
  views: number;
  ar: number;
}

export interface DeviceSplit {
  label: string;
  className: string;
  pct: number;
}

export interface HourlyPoint {
  hour: number;
  label: string;
  value: number;
  pct: number;
}

export interface DemoBreakdowns {
  weekly: WeeklyPoint[];
  devices: DeviceSplit[];
  hourly: HourlyPoint[];
}

/**
 * @param seed   string estable (slug de org o 'self')
 * @param totals totales demo ya agregados de las campañas visibles
 */
export function buildDemoBreakdowns(
  seed: string,
  totals: { views: number; ar: number; cta: number }
): DemoBreakdowns {
  const rand = mulberry32(hashSeed(seed || 'demo'));

  // ── Vistas por semana (8 semanas, suman ~totals.views; AR ~proporcional) ──
  const WEEKS = 8;
  const arRatio = totals.views > 0 ? totals.ar / totals.views : 0;
  const rawWeekly = Array.from({ length: WEEKS }, (_, i) => {
    const trend = 0.6 + (i / (WEEKS - 1)) * 0.7; // 0.6 → 1.3
    const noise = 0.8 + rand() * 0.45; // 0.8 → 1.25
    return trend * noise;
  });
  const rawSum = rawWeekly.reduce((a, b) => a + b, 0) || 1;
  const weekly: WeeklyPoint[] = rawWeekly.map((w, i) => {
    const views = Math.round((w / rawSum) * totals.views);
    return {
      label: `S${i + 1}`,
      views,
      ar: Math.round(views * arRatio),
    };
  });

  // ── Dispositivos (android / ios / web), suma 100% ──
  const base = [
    { label: 'Android', className: 'mtr-device--android', w: 52 + rand() * 12 },
    { label: 'iOS', className: 'mtr-device--ios', w: 30 + rand() * 10 },
    { label: 'Web', className: 'mtr-device--web', w: 10 + rand() * 6 },
  ];
  const wSum = base.reduce((a, d) => a + d.w, 0);
  let acc = 0;
  const devices: DeviceSplit[] = base.map((d, i) => {
    let pct: number;
    if (i === base.length - 1) {
      pct = 100 - acc; // el último absorbe el redondeo → suma exacta 100
    } else {
      pct = Math.round((d.w / wSum) * 100);
      acc += pct;
    }
    return { label: d.label, className: d.className, pct };
  });

  // ── Distribución horaria (24h), perfil bimodal (mañana + tarde/noche) ──
  const rawHourly = Array.from({ length: 24 }, (_, h) => {
    const morning = Math.exp(-Math.pow(h - 11, 2) / 14);
    const evening = Math.exp(-Math.pow(h - 19, 2) / 10) * 1.15;
    const noise = 0.7 + rand() * 0.6;
    return (morning + evening) * noise;
  });
  const hMax = Math.max(...rawHourly) || 1;
  const hourly: HourlyPoint[] = rawHourly.map((v, h) => ({
    hour: h,
    label: h % 6 === 0 ? `${h}h` : '',
    value: Math.round((v / hMax) * (totals.views / 24)),
    pct: Math.round((v / hMax) * 100),
  }));

  return { weekly, devices, hourly };
}
