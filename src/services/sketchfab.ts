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
const SKETCHFAB_BASE = `${API_BASE}/api/sketchfab`;

export const searchModels = async (
  params: SketchfabSearchParams
): Promise<SketchfabSearchResult> => {
  const { keyword, count = 24, cursor, categories } = params;

  const query = new URLSearchParams();
  if (keyword?.trim()) query.set('keyword', keyword.trim());
  if (cursor) query.set('cursor', cursor);
  if (categories) query.set('categories', categories);
  query.set('count', String(count));

  const res = await fetch(`${SKETCHFAB_BASE}/search?${query}`);
  if (!res.ok) throw new Error(`Sketchfab search failed: ${res.status}`);
  return res.json() as Promise<SketchfabSearchResult>;
};

export const getModel = async (uid: string): Promise<SketchfabModel> => {
  const res = await fetch(
    `${SKETCHFAB_BASE}/models/${encodeURIComponent(uid)}`
  );
  if (!res.ok) throw new Error(`Sketchfab model ${uid} failed: ${res.status}`);
  return res.json() as Promise<SketchfabModel>;
};

/**
 * Obtiene la URL de descarga del GLB.
 * Las URLs de descarga de Sketchfab son time-limited — no cachear.
 */
export const getDownloadUrl = async (uid: string): Promise<string> => {
  const res = await fetch(
    `${SKETCHFAB_BASE}/models/${encodeURIComponent(uid)}/download`,
    { cache: 'no-store' }
  );
  if (!res.ok)
    throw new Error(`Sketchfab download ${uid} failed: ${res.status}`);
  const data = (await res.json()) as SketchfabDownload;
  const url = data.glb?.url ?? data.gltf?.url;
  if (!url) throw new Error(`Sin descarga GLB/GLTF disponible para ${uid}`);
  return url;
};
