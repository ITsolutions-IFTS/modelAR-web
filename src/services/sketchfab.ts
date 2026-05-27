import type {
  SketchfabModel,
  SketchfabSearchResult,
  SketchfabDownload,
  SketchfabSearchParams,
} from '@/types/sketchfab';

const SKETCHFAB_DIRECT = 'https://api.sketchfab.com/v3';
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';
const USE_PROXY = !!API_BASE;

const getHeaders = (): HeadersInit => {
  if (USE_PROXY) return {};
  const key = import.meta.env.VITE_SKETCHFAB_API_KEY as string | undefined;
  return key ? { Authorization: `Token ${key}` } : {};
};

export const searchModels = async (
  params: SketchfabSearchParams
): Promise<SketchfabSearchResult> => {
  const { keyword, count = 24, cursor, categories } = params;

  if (USE_PROXY) {
    const query = new URLSearchParams();
    if (keyword?.trim()) query.set('keyword', keyword.trim());
    if (cursor) query.set('cursor', cursor);
    if (categories) query.set('categories', categories);
    query.set('count', String(count));
    const res = await fetch(`${API_BASE}/api/sketchfab/search?${query}`);
    if (!res.ok) throw new Error(`Sketchfab search failed: ${res.status}`);
    return res.json() as Promise<SketchfabSearchResult>;
  }

  const query = new URLSearchParams();
  query.set('downloadable', 'true');
  query.set('count', String(count));
  if (keyword?.trim()) query.set('q', keyword.trim());
  if (cursor) query.set('cursor', cursor);
  // Sketchfab requiere comas literales en `categories` — URLSearchParams las
  // codifica como %2C y devuelve 400, por eso se append manual
  const qs = categories
    ? `${query.toString()}&categories=${categories}`
    : query.toString();

  const res = await fetch(`${SKETCHFAB_DIRECT}/search?type=models&${qs}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Sketchfab search failed: ${res.status}`);
  return res.json() as Promise<SketchfabSearchResult>;
};

export const getModel = async (uid: string): Promise<SketchfabModel> => {
  const base = USE_PROXY ? `${API_BASE}/api/sketchfab` : `${SKETCHFAB_DIRECT}`;
  const res = await fetch(`${base}/models/${encodeURIComponent(uid)}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error(`Sketchfab model ${uid} failed: ${res.status}`);
  return res.json() as Promise<SketchfabModel>;
};

/**
 * Obtiene la URL de descarga del GLB.
 * Las URLs de descarga de Sketchfab son time-limited — no cachear.
 */
export const getDownloadUrl = async (uid: string): Promise<string> => {
  const base = USE_PROXY ? `${API_BASE}/api/sketchfab` : `${SKETCHFAB_DIRECT}`;
  const res = await fetch(
    `${base}/models/${encodeURIComponent(uid)}/download`,
    { headers: getHeaders(), cache: 'no-store' }
  );
  if (!res.ok)
    throw new Error(`Sketchfab download ${uid} failed: ${res.status}`);
  const data = (await res.json()) as SketchfabDownload;
  const url = data.glb?.url ?? data.gltf?.url;
  if (!url) throw new Error(`Sin descarga GLB/GLTF disponible para ${uid}`);
  return url;
};
