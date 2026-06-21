import type { SketchfabModel } from '@/types/sketchfab';

// Mismo criterio que sketchfab.ts: dev → '' (rutas relativas proxeadas), prod → base absoluta
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
const FEATURED_URL = `${API_BASE}/api/catalog/featured`;

// El core trunca a DEFAULT_FEATURED_LIMIT=12 si no se pide límite, lo que dejaba
// fuera categorías enteras (solo se veía la de mayor prioridad). Pedimos el
// máximo que admite el core (MAX_FEATURED_LIMIT=50) para que el HOME agrupe
// TODAS las categorías, no solo el top-12.
const FEATURED_LIMIT = 50;

/**
 * Shape FLAT que devuelve el core en /api/catalog/featured.
 * Es el MISMO shape de /api/sketchfab/models/:uid, con dos campos opcionales
 * que el endpoint featured incluye. Los modelos locales traen uid con prefijo
 * "local:<id>".
 */
interface CoreFeaturedModel {
  uid: string;
  name: string;
  thumbnailUrl: string;
  viewerUrl: string;
  embedUrl: string;
  user: { username: string; displayName: string; profileUrl?: string };
  sector?: string;
  category?: string;
  isCurated: boolean;
}

/** SketchfabModel + la categoría temática del catálogo (null si no viene). */
export type FeaturedModel = SketchfabModel & { category: string | null };

interface CoreFeaturedResponse {
  data: CoreFeaturedModel[];
}

/**
 * Adapta el item flat del core al SketchfabModel del front (mismo mapeo que
 * adaptModel() de sketchfab.ts), para que campañas y destacados rendericen
 * idénticos en el catálogo.
 */
function adaptFeatured(m: CoreFeaturedModel): FeaturedModel {
  return {
    category: m.category ?? null,
    uid: m.uid,
    name: m.name,
    description: null,
    viewerUrl: m.viewerUrl,
    embedUrl: m.embedUrl,
    faceCount: 0,
    vertexCount: 0,
    animationCount: 0,
    isDownloadable: true,
    thumbnails: {
      images: m.thumbnailUrl
        ? [
            {
              uid: m.uid,
              url: m.thumbnailUrl,
              width: 300,
              height: 300,
              size: 0,
            },
          ]
        : [],
    },
    user: {
      uid: '',
      username: m.user.username,
      displayName: m.user.displayName,
      profileUrl: m.user.profileUrl ?? '',
    },
    license: null,
    categories: [],
    tags: [],
    publishedAt: '',
  };
}

/**
 * Catálogo resiliente del core (curados Sketchfab + locales). NUNCA lanza:
 * ante cualquier error (red, status !=2xx, JSON inválido, body sin .data)
 * devuelve [] para que el HOME no se vacíe por un fallo del endpoint.
 */
export const getFeaturedModels = async (): Promise<FeaturedModel[]> => {
  try {
    const res = await fetch(`${FEATURED_URL}?limit=${FEATURED_LIMIT}`);
    if (!res.ok) return [];
    const body = (await res.json()) as CoreFeaturedResponse;
    if (!Array.isArray(body?.data)) return [];
    return body.data.map(adaptFeatured);
  } catch {
    return [];
  }
};
