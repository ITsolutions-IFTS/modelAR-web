import type {
  SketchfabModel,
  SketchfabSearchResult,
  SketchfabDownload,
  SketchfabSearchParams,
} from '@/types/sketchfab';

// Dev local: API_BASE vacío → rutas relativas /api/... que Vite proxea a modelAR-api:3000
// Prod: API_BASE = 'https://api.modelar.com' → rutas absolutas
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
const MODELS_BASE = `${API_BASE}/api/sketchfab/models`;

// Shape que devuelve el core: PaginatedResult<SketchfabModelEntity>
interface CoreModel {
  uid: string;
  name: string;
  thumbnailUrl: string;
  viewerUrl: string;
  embedUrl: string;
  user: { username: string; displayName: string; profileUrl?: string };
  isCurated: boolean;
}
interface CoreSearchResponse {
  data: CoreModel[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function adaptModel(m: CoreModel): SketchfabModel {
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

export const searchModels = async (
  params: SketchfabSearchParams
): Promise<SketchfabSearchResult> => {
  const { keyword, count = 10 } = params;

  const query = new URLSearchParams();
  if (keyword?.trim()) query.set('keyword', keyword.trim());
  query.set('limit', String(Math.min(count, 50)));

  const res = await fetch(`${MODELS_BASE}?${query}`);
  if (!res.ok) throw new Error(`Sketchfab search failed: ${res.status}`);

  const body = (await res.json()) as CoreSearchResponse;
  return {
    results: body.data.map(adaptModel),
    next: null,
    previous: null,
  };
};

export const getModel = async (uid: string): Promise<SketchfabModel> => {
  const res = await fetch(`${MODELS_BASE}/${encodeURIComponent(uid)}`);
  if (!res.ok) throw new Error(`Sketchfab model ${uid} failed: ${res.status}`);
  return adaptModel((await res.json()) as CoreModel);
};

/**
 * Endpoint @Public en el core — no requiere JWT.
 * El uid debe pertenecer a una campaña ACTIVE.
 * URLs time-limited — no cachear.
 */
export const getDownloadUrl = async (uid: string): Promise<string> => {
  const res = await fetch(
    `${MODELS_BASE}/${encodeURIComponent(uid)}/download`,
    { cache: 'no-store' }
  );
  if (!res.ok)
    throw new Error(`Sketchfab download ${uid} failed: ${res.status}`);
  const data = (await res.json()) as SketchfabDownload;
  const url = data.glb?.url ?? data.gltf?.url;
  if (!url) throw new Error(`Sin descarga GLB/GLTF disponible para ${uid}`);
  return url;
};
