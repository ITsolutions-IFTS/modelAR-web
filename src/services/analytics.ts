// Tracking de campañas para el visor AR.
// Endpoints PÚBLICOS del core: no se envía JWT (a diferencia de services/api.ts).
// Mismo patrón de API_BASE que services/sketchfab.ts.

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export type AnalyticsEventType = 'view' | 'ar_activation' | 'cta_click';

export interface ResolvedCampaign {
  id: string;
  title: string;
  ctaUrl: string | null;
}

/**
 * Resuelve la campaña ACTIVE asociada a un sketchfab uid.
 * 404 → no hay campaña (modelo curado/catálogo): rechaza; el caller lo trata
 * como best-effort (no trackea, no rompe el visor).
 */
export const apiResolveCampaignByUid = async (
  uid: string
): Promise<ResolvedCampaign> => {
  const res = await fetch(
    `${API_BASE}/api/campaigns/by-uid/${encodeURIComponent(uid)}`
  );
  if (!res.ok) {
    throw new Error(`resolveCampaignByUid ${uid} failed: ${res.status}`);
  }
  return (await res.json()) as ResolvedCampaign;
};

/**
 * Emite un evento de analytics. FIRE-AND-FORGET:
 *  - nunca propaga error (no rompe la UI ni la navegación del CTA).
 *  - keepalive:true → sobrevive a la navegación al abrir el ctaUrl.
 * Público: no manda token.
 */
export const trackEvent = (
  campaignId: string,
  eventType: AnalyticsEventType,
  sessionId?: string
): void => {
  try {
    void fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId,
        eventType,
        ...(sessionId ? { sessionId } : {}),
      }),
    }).catch(() => {
      /* swallow: best-effort */
    });
  } catch {
    /* swallow: fetch synchronous throw (rare) */
  }
};
