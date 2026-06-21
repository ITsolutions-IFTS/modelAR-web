import type { SketchfabModel } from '@/types/sketchfab';

// Mismo criterio que sketchfab.ts: dev → '' (rutas relativas proxeadas), prod → base absoluta
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
const FEATURED_URL = `${API_BASE}/api/catalog/featured`;

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
  isCurated: boolean;
}

interface CoreFeaturedResponse {
  data: CoreFeaturedModel[];
}

/**
 * Adapta el item flat del core al SketchfabModel del front (mismo mapeo que
 * adaptModel() de sketchfab.ts), para que campañas y destacados rendericen
 * idénticos en el catálogo.
 */
function adaptFeatured(m: CoreFeaturedModel): SketchfabModel {
  return {
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
export const getFeaturedModels = async (): Promise<SketchfabModel[]> => {
  try {
    const res = await fetch(FEATURED_URL);
    if (!res.ok) return [];
    const body = (await res.json()) as CoreFeaturedResponse;
    if (!Array.isArray(body?.data)) return [];
    return body.data.map(adaptFeatured);
  } catch {
    return [];
  }
};
