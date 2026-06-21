import { useEffect, useRef, useState } from 'react';
import {
  apiGetCampaignAnalytics,
  type CampaignAnalyticsResponse,
} from '@/services/api';

export interface UseCampaignAnalyticsResult {
  /** Map id→respuesta. Solo contiene las campañas que respondieron OK. */
  analytics: Record<string, CampaignAnalyticsResponse>;
  loading: boolean;
}

/**
 * Dado un array de campaignIds, hace N requests a
 * `GET /api/campaigns/:id/analytics` (cacheados 60s server-side) y expone el
 * map id→respuesta. Re-fetch SOLO cuando cambia el conjunto de ids (key estable
 * ordenada), no en cada render. Las campañas que fallan (403/404/red) se omiten
 * en silencio: MetricsPage cae al demo para esas.
 */
export function useCampaignAnalytics(
  campaignIds: string[]
): UseCampaignAnalyticsResult {
  const [analytics, setAnalytics] = useState<
    Record<string, CampaignAnalyticsResponse>
  >({});
  const [loading, setLoading] = useState(false);

  // Key estable: ids ordenados. Cambia solo si el CONJUNTO cambia.
  const key = [...campaignIds].sort().join(',');
  const latestKey = useRef(key);

  useEffect(() => {
    latestKey.current = key;

    if (key === '') {
      setAnalytics({});
      setLoading(false);
      return;
    }

    let cancelled = false;
    const ids = key.split(',');
    setLoading(true);
    setAnalytics({}); // limpiar al cambiar de set (evita mostrar org anterior)

    Promise.allSettled(ids.map((id) => apiGetCampaignAnalytics(id))).then(
      (results) => {
        // Descartar si el set de ids cambió mientras resolvíamos.
        if (cancelled || latestKey.current !== key) return;
        const next: Record<string, CampaignAnalyticsResponse> = {};
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') next[ids[i]] = r.value;
        });
        setAnalytics(next);
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [key]);

  return { analytics, loading };
}
