/**
 * Servicio Sketchfab — capa de abstracción intercambiable
 *
 * Ahora mismo llama directo a api.sketchfab.com con VITE_SKETCHFAB_API_KEY.
 * Cuando exista un backend propio, seteá VITE_API_BASE_URL con la URL del proxy
 * y el cliente automáticamente deja de enviar la key (el backend la maneja).
 *
 * El contrato de tipos no cambia — las páginas no saben si hablan con
 * Sketchfab directamente o con un proxy.
 */

import type {
  SketchfabModel,
  SketchfabSearchResult,
  SketchfabDownload,
  SketchfabSearchParams,
} from '@/types/sketchfab'

const SKETCHFAB_BASE = 'https://api.sketchfab.com/v3'

// Si VITE_API_BASE_URL está seteada, el cliente habla con el proxy propio.
// En ese caso NO incluye la API key (el backend la pone).
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? SKETCHFAB_BASE
const USE_PROXY = !!import.meta.env.VITE_API_BASE_URL

function getHeaders(): HeadersInit {
  if (USE_PROXY) return {}
  const key = import.meta.env.VITE_SKETCHFAB_API_KEY as string | undefined
  return key ? { Authorization: `Token ${key}` } : {}
}

export async function searchModels(params: SketchfabSearchParams): Promise<SketchfabSearchResult> {
  const { keyword, count = 24, cursor, categories } = params
  const query = new URLSearchParams()
  query.set('downloadable', 'true')
  query.set('count', String(count))
  if (keyword?.trim()) query.set('q', keyword.trim())
  if (cursor)          query.set('cursor', cursor)
  // Sketchfab requiere comas literales en `categories` — URLSearchParams las
  // codifica como %2C y devuelve 400, por eso se append manual
  const qs = categories ? `${query.toString()}&categories=${categories}` : query.toString()

  const res = await fetch(`${API_BASE}/search?type=models&${qs}`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error(`Sketchfab search failed: ${res.status}`)
  return res.json() as Promise<SketchfabSearchResult>
}

export async function getModel(uid: string): Promise<SketchfabModel> {
  const res = await fetch(`${API_BASE}/models/${encodeURIComponent(uid)}`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error(`Sketchfab model ${uid} failed: ${res.status}`)
  return res.json() as Promise<SketchfabModel>
}

/**
 * Obtiene la URL de descarga del GLB.
 * Las URLs de descarga de Sketchfab son time-limited (expiran en minutos),
 * así que NO se cachean — siempre se piden frescas.
 */
export async function getDownloadUrl(uid: string): Promise<string> {
  const res = await fetch(`${API_BASE}/models/${encodeURIComponent(uid)}/download`, {
    headers: getHeaders(),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Sketchfab download ${uid} failed: ${res.status}`)
  const data = (await res.json()) as SketchfabDownload
  const url = data.glb?.url ?? data.gltf?.url
  if (!url) throw new Error(`Sin descarga GLB/GLTF disponible para ${uid}`)
  return url
}
